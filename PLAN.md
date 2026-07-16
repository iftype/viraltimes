# ViralOrigin product and engineering plan

마지막 갱신: 2026-07-16

## Product direction

ViralOrigin은 단순 링크 모음이 아니라 원본 주장, 근거, 확산 과정, 반론과 수정 이력을 함께 보여주는 밈 사전이다. 로그인 없이도 읽고 가볍게 참여할 수 있어야 하지만, 공개 데이터 품질은 운영자 검토와 단계적 abuse 방어로 지킨다.

## Current baseline

- Oracle JSON 기반 공개 사전과 운영자 inbox
- draft/published/archived 사전 상태
- 공개 목록 페이지네이션 파라미터와 kind/tag/query 필터
- Vercel web, Oracle API, iftype.store 정적 admin 분리 배포
- 공통 `@origin/ui` 디자인 토큰·primitive
- 헤더 검색, 카테고리 탭, 썸네일 피드
- 서버 카테고리 API와 관리자 생성·수정·활성화·정렬 UI
- 밈 요청, 원본 제보, 사이트 피드백, 개인정보처리방침

## P0 — data safety before participation scale

### 1. SQLite migration

현재 Oracle 메모리가 작고 단일 API 인스턴스이므로 1차 DB는 SQLite WAL을 권장한다. Postgres는 다중 인스턴스·복잡한 검색·운영 인력이 필요해질 때 전환한다.

테이블 초안:

- `memes`, `meme_aliases`, `categories`, `meme_categories`
- `origin_claims`, `evidence`, `timeline_events`, `videos`
- `submissions`, `moderation_events`
- `comments`, `comment_reports`, `actors`

완료 조건:

- JSON → SQLite idempotent migration
- daily encrypted backup와 restore rehearsal
- migration 실패 시 기존 JSON read-only fallback
- transaction 안에서 사전 항목과 하위 데이터를 함께 저장

### 2. Canonical categories — JSON baseline shipped

자유 태그와 탐색 카테고리를 분리한다.

초기 category 제안:

- 인터넷 방송
- 리그 오브 레전드
- 챌린지
- 커뮤니티 밈
- 영상 밈
- 음악·댄스
- 게임

관리자는 category를 복수 선택하고 사용자는 category tab과 API query로 필터링한다. category ID는 관계 키, slug는 영문 URL/API 키, label은 변경 가능한 표시 데이터로 둔다. 현재 JSON 저장소와 관리자 UI에 적용됐으며 SQLite migration 때 같은 계약을 보존한다.

### 3. Image and thumbnail policy

Oracle에는 이미지 바이너리를 저장하지 않는다.

단계:

1. 현재: 원 게시물의 HTTPS thumbnail URL을 브라우저가 직접 읽음
2. 다음: YouTube oEmbed·Open Graph에서 thumbnail 후보 자동 추출
3. 운영: Cloudflare R2 같은 object storage + CDN에 허용된 thumbnail만 저장
4. DB에는 URL, source URL, width/height, rights note, checksum만 저장

제한:

- 업로드 2MB, WebP/AVIF 변환, 긴 변 1280px
- EXIF 제거, MIME signature 검사, SVG 금지
- orphan object 정리 job과 월별 storage budget alert
- hotlink 실패 시 gradient placeholder와 원문 링크 제공

## P1 — easier editorial workflow

### 4. Simple entry registration

- URL 붙여넣기 → platform 판별 → title/creator/date/thumbnail 자동 제안
- title·category·summary·origin URL만 먼저 받는 quick draft
- 근거·timeline·related video는 접힌 advanced editor
- slug 자동 생성과 중복 항목 실시간 검색
- autosave draft, preview, publish checklist
- inbox 제보를 새 draft로 한 번에 전환

### 5. Anonymous comments with future login compatibility

로그인을 먼저 만들지 않고 actor 경계를 먼저 둔다.

```text
actors
  id
  type: guest | user | moderator
  user_id: nullable
  guest_session_hash: nullable

comments
  id, meme_id, actor_id, parent_id
  body, status, created_at, updated_at
```

비회원 1차 정책:

- HttpOnly guest session cookie, 닉네임 선택
- 500자 제한, 링크 개수 제한, honeypot
- IP 원문 미저장; abuse용 keyed hash를 최대 7일 보관
- 10분당 작성 제한, 신고 누적 시 자동 숨김
- status: visible/pending/hidden/deleted
- 관리자 moderation log는 append-only

회원 도입 시 `actor.user_id`만 연결하고 comment FK와 UI 계약을 바꾸지 않는다.

완료 조건:

- 댓글 목록 cursor pagination
- 비회원 작성·답글·신고
- 관리자 숨김·복구·차단
- 개인정보처리방침에 cookie, abuse hash, 보관 기간 반영
- spam load test와 XSS/URL validation test

## P2 — discovery and scale

### 6. Pagination and search evolution

현재 `page/pageSize` offset pagination은 작은 사전에 충분하다. 5,000개 또는 동시 편집이 늘면 `(updated_at, id)` cursor로 바꾼다.

응답 계약은 계속 다음 metadata를 제공한다.

```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "pageSize": 24,
    "total": 0,
    "totalPages": 1,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

- category/query filter를 서버로 이동
- 검색어 debounce, URL query 동기화
- 초성·별칭 검색과 typo tolerance 검토
- popular/recent/verified 정렬

### 7. Accounts — deferred

댓글과 제안이 안정화되기 전에는 로그인 기능을 출시하지 않는다. 도입 시 passkey 또는 OAuth를 우선하고 자체 비밀번호 저장을 피한다.

계정 기능 후보:

- 내 제안·댓글 보기
- 신뢰도와 편집 기여 기록
- 알림 구독
- moderator role

로그인 여부가 공개 읽기, 비회원 댓글, 제보 흐름을 막지 않아야 한다.

## P3 — operations and legal

- privacy/terms 정식 법률 검토
- copyright takedown workflow와 처리 이력
- structured logs, uptime check, error budget
- 저장 용량·메모리·CDN 비용 dashboard
- accessibility audit와 다국어 metadata
- API OpenAPI schema와 contract test

## Explicit non-goals for now

- 영상 원본 파일 저장·재호스팅
- Oracle 서버에 대용량 이미지 업로드
- 검토 없는 사용자 사전 직접 공개
- 댓글 기능보다 먼저 복잡한 회원·등급 시스템 구축
