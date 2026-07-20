# ViralOrigin product and engineering plan

마지막 갱신: 2026-07-20

## Product direction

ViralOrigin은 단순 링크 모음이 아니라 원본 주장, 근거, 확산 과정, 반론과 수정 이력을 함께 보여주는 밈 사전이다. 로그인 없이도 읽고 가볍게 참여할 수 있어야 하지만, 공개 데이터 품질은 운영자 검토와 단계적 abuse 방어로 지킨다.

## Current baseline

- Oracle JSON 기반 공개 사전과 운영자 inbox
- draft/published/archived 사전 상태
- 공개 목록 페이지네이션 파라미터와 kind/tag/query 필터
- Vercel web, Oracle API, iftype.store 정적 admin 분리 배포
- 공통 `@origin/ui` 디자인 토큰·primitive
- 헤더 검색, 공개 홈의 compact 상태·연도 필터와 썸네일 피드 (category tabs는 임시 숨김)
- 서버 카테고리 API와 관리자 생성·수정·활성화·정렬 UI
- `/memes/:slug` canonical URL, API sitemap과 client metadata·JSON-LD
- 공용 비회원 댓글과 section/action 기반 수정 제안 게시판
- lifecycle 연도 필드, 최신/연도별 탐색과 API year facet
- Vercel Web Analytics 방문 집계
- 트렌드 일별 스냅샷 저장소와 token 기반 500개 batch ingest API
- 원본 우선 상세와 대표 1개만 embed하는 사용 영상·게시글 자료 TOP3
- 관리자 사전 수정·검색·필터, 공개 항목 보호 확인, 즉시 개별·선택 삭제와 최대 100개 일괄 상태/카테고리 관리
- 코리아 마이너 밈 kind/category, 선택형 설명·원본·타임라인과 복수 커뮤니티 링크
- oEmbed/Open Graph 썸네일 후보와 선택형 Gemma 설명 초안
- 인지도·실제 상세 modal·완료 후 서비스 유입을 분리하는 모바일 한 화면 5카드 퀴즈와 실행별 퍼널 로그
- 관리자 고정 퀴즈 deck·분야 관리, 사람별 실행 시간·완료 여부·삭제와 간단 통계
- 영상 URL 중심의 간단 제보와 선택형 원본 URL, 원본 제보, 사이트 피드백, 개인정보처리방침
- 밈 간 명시적 파생·연결 관계와 전용 수정 제안 페이지

## P0 — data safety before participation scale

### 1. SQLite migration

현재 Oracle 메모리가 작고 단일 API 인스턴스이므로 1차 DB는 SQLite WAL을 권장한다. Postgres는 다중 인스턴스·복잡한 검색·운영 인력이 필요해질 때 전환한다.

테이블 초안:

- `memes` (`origin_year`, `first_seen_at`, `last_observed_at` 포함), `meme_aliases`, `categories`, `meme_categories`
- `origin_claims`, `evidence`, `timeline_events`, `videos`
- `submissions`, `moderation_events`
- `comments`, `comment_reports`, `actors`
- `trend_snapshots`

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

### 4. Simple entry registration — JSON baseline shipped

- URL 붙여넣기 → 허용 호스트의 oEmbed/Open Graph에서 title/description/thumbnail 자동 제안
- `GEMMA_API_KEY`가 있으면 공개 메타데이터만 보내 중립적인 한 줄 설명 초안 생성
- title·category·summary·origin URL만 먼저 받는 quick draft
- 근거·timeline·related video는 접힌 advanced editor
- slug 자동 생성과 중복 항목 실시간 검색
- autosave draft, preview, publish checklist
- inbox 제보를 새 draft로 한 번에 전환

현재 완료: 선택형 설명·원본·타임라인, 복수 커뮤니티 링크, 관리자 CRUD, 100개 일괄 작업, 링크 메타데이터 미리보기. 남은 작업은 inbox→draft 전환, autosave와 object storage다.

### 5. Quiz effectiveness measurement — JSON baseline shipped

- 카드별 `know`/`dont_know`로 인지도를 측정하고 같은 익명 세션·카드에서는 마지막 판단만 통계에 반영한다.
- 상세 설명 열람을 `view_detail`, 열람 후 `helpful`/`not_helpful`로 별도 기록한다.
- 인지도 분모에는 상세 열람 이벤트를 섞지 않고, 설명 도움률은 feedback 응답만 분모로 사용한다.
- 무작위 브라우저 세션 ID만 사용하고 로그인·이메일·IP를 퀴즈 데이터에 연결하지 않는다.
- 운영자는 참여자별·카드별 인지도, 중복을 뺀 상세 수요, 설명 도움률과 원시 CSV를 확인한다.
- 운영자는 공개 밈 최대 5개와 분야·순서를 고정하고 참여자 기록 하나 또는 전체 로그를 삭제할 수 있다.
- 모바일 완료 화면은 방금 진행한 항목을 canonical 상세 링크와 함께 보여준다.

### 6. Anonymous comments with future login compatibility — JSON baseline shipped

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

현재 JSON baseline:

- 댓글과 수정 제안을 participation type으로 분리
- 댓글은 공개, 수정 제안은 pending 토론 상태로 저장
- IP 원문 비저장, 프로세스 메모리 단기 rate limit
- honeypot, 본문 길이와 링크 수 검증
- 수정 제안은 관리자 proposal inbox에도 기록

SQLite/actor migration에서 이어서 적용할 정책:

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

### 7. Trend collection and graph

초기 수집기는 GitHub Actions의 하루 1회 cron으로 충분하다. 스케줄러는 데이터를 만드는 주체가 아니라 Oracle API에 정규화된 일별 스냅샷을 배치 전송하는 얇은 실행기로 둔다.

권장 주기:

- 공개 후 30일 이내 또는 최근 급상승 밈: 하루 1회
- 31~180일: 주 2회
- 180일 초과: 주 1회 또는 월 2회
- 이미 같은 날짜·source·metric이 있으면 upsert하여 재실행을 안전하게 유지

한 workflow에서 플랫폼별 ID를 모아 가능한 batch API로 조회하고, 최대 500개 snapshot을 한 번의 internal POST로 저장한다. 실패한 source만 재시도하고 다른 source의 성공 데이터는 버리지 않는다. GitHub Actions cron은 몇 분 이상 늦을 수 있으므로 정확한 시각에 의존하지 않는다. 수집량이 커지거나 서버와 같은 네트워크에서 처리하는 편이 저렴해지면 Oracle `systemd timer`로 옮기되 ingest 계약은 유지한다.

SQLite 전환 시 테이블 계약:

```text
trend_snapshots
  meme_id, observed_on, source, metric, value, sample_size, collected_at
  unique(meme_id, observed_on, source, metric)
```

그래프는 플랫폼 간 절대값을 직접 합치지 않고 source별 선 또는 0~100 정규화 점수로 표시한다. YouTube 조회수처럼 공식 batch API가 있는 값부터 시작하고, TikTok·Instagram은 허용된 API/수동 제보 범위만 사용한다. 무차별 HTML scraping은 차단·약관·유지보수 비용 때문에 기본 수집 경로로 두지 않는다.

### 8. Pagination and search evolution

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

### 9. Accounts — deferred

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
