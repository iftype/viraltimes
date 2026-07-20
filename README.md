# ViralOrigin

밈·챌린지·인터넷 유행어의 원본 근거와 확산 과정을 함께 검증하는 참여형 사전입니다. 사전 데이터는 Oracle API가 소유하므로 관리자가 항목을 공개한 뒤 클라이언트를 다시 배포하지 않아도 즉시 반영됩니다.

## Service URLs

| 용도 | 주소 | 배포 기준 |
| --- | --- | --- |
| 운영 클라이언트 | https://viralorigin.vercel.app | `main` |
| 개발 클라이언트 | https://viralorigin-git-develop-iftypes-projects.vercel.app | `develop` |
| 관리자 | https://iftype.store/viral/ | `main` 정적 배포 |
| API | https://meme.iftype.store/api/v1 | `main` Oracle 배포 |

## Architecture

```text
apps/
  web/        Next.js 정적 클라이언트: 홈, 검색, 상세, 제보, 정책
  admin/      Next.js 정적 관리자: inbox, 사전 작성·검토·공개
  api/        Fastify API: 공개 사전, 제보, 관리자 인증·CRUD
packages/
  ui/         웹·관리자 공용 디자인 토큰과 표현 컴포넌트
infra/
  nginx/      정적 파일과 API reverse proxy 예시
  systemd/    API user service 예시
scripts/
  seed-catalog.ts  기본 사전 마이그레이션 도구
docs/
  DESIGN_SYSTEM.md 디자인 원칙과 컴포넌트 사용법
  BRANCHING.md     브랜치·버전 전략
  DEPLOYMENT.md    Oracle 준비 절차
PLAN.md            우선순위와 다음 구현 계약
```

데이터 흐름:

```text
Browser ── /api ──▶ Vercel rewrite / Nginx ──▶ Fastify ──▶ shared JSON
Admin   ── /viral/api ────────────────────────▶ Fastify
```

- 브라우저 코드에는 서버 IP, SSH 키, 관리자 비밀번호를 넣지 않습니다.
- 운영 비밀은 Oracle의 `/opt/origin/shared/api.env`와 GitHub Actions Secret에만 둡니다.
- 현재 사전과 관리자 inbox는 작은 JSON 파일을 원자적으로 교체해 저장합니다.
- 데이터베이스·댓글·회원 전환 설계는 [PLAN.md](PLAN.md)를 따릅니다.

## Local development

요구사항: Node.js 22, pnpm 11.1.0.

```bash
pnpm install
pnpm dev           # web :3000 + api :4000
pnpm dev:web       # client only
pnpm dev:api       # API only
pnpm dev:admin     # admin :3100
```

```bash
pnpm lint
pnpm typecheck
pnpm build
```

환경값은 [apps/api/.env.example](apps/api/.env.example)과 [apps/web/.env.example](apps/web/.env.example)을 참고하되 실제 값은 추적되지 않는 `.env` 또는 서버 환경 파일에 둡니다.

## Public API

| Method | Path | 설명 |
| --- | --- | --- |
| `GET` | `/api/v1/health` | 서비스 상태·버전 |
| `GET` | `/api/v1/categories` | 서버에서 관리하는 활성 카테고리 목록 |
| `GET` | `/api/v1/memes?page=1&pageSize=24&categories=&tags=&fromYear=&toYear=&verification=&sort=latest` | 공개 사전 목록·복수 필터·연도/tag facet, 최대 48개 |
| `GET` | `/api/v1/memes/:slug` | 공개된 사전 상세와 댓글·제안 수 |
| `GET` | `/api/v1/memes/:slug/trends?from=&to=&source=&metric=&limit=400` | 일별 트렌드 스냅샷, 최대 1,000개 |
| `GET/POST` | `/api/v1/memes/:id/participation?type=comment|proposal` | 비회원 댓글과 수정 제안 |
| `GET` | `/api/v1/sitemap.xml` | 운영 사전 데이터 기반 검색엔진 sitemap |
| `POST` | `/api/v1/intake` | 밈 요청·원본 제보·피드백·신고 접수 |
| `GET/POST` | `/api/v1/quiz/cards`, `/api/v1/quiz/log` | 밈 인지도와 설명 도움 여부 측정 |

트렌드 수집기는 `Authorization: Bearer $TREND_INGEST_TOKEN`으로 보호된 `POST /api/v1/internal/trends/snapshots`에 최대 500개를 한 번에 저장한다. 브라우저에서는 이 토큰이나 수집 API를 호출하지 않는다.

관리자 API는 서명된 HttpOnly 쿠키가 필요합니다. 사전 CRUD 외에 `PATCH /api/v1/admin/memes/bulk`로 최대 100개 항목의 상태·카테고리·삭제를 한 번에 처리하고, `POST /api/v1/admin/metadata/preview`로 허용된 외부 링크의 oEmbed/Open Graph 정보를 미리 봅니다. 상세 계약은 [apps/api/src/CONTEXT.md](apps/api/src/CONTEXT.md)에 유지합니다.

## Adding dictionary entries

1. `https://iftype.store/viral/`에서 로그인합니다.
2. `카테고리` 탭에서 큰 탐색 영역의 이름·순서·노출 여부를 관리합니다.
3. `사전 관리` 탭에서 카테고리를 선택하고 작은 검색 키워드는 태그로 입력합니다. 코리아 마이너 밈은 원본 영상과 설명 없이 초안으로 시작할 수 있습니다.
4. 커뮤니티 링크를 `제목 | URL` 형식으로 붙이고 필요할 때 링크 자동 채우기로 썸네일·설명 후보를 받습니다.
5. 원본·근거·타임라인은 필요한 항목에서만 고급 편집을 펼쳐 검토합니다.
6. `공개`로 바꾸면 운영·개발 클라이언트가 API에서 즉시 읽습니다.

목록의 체크박스와 일괄 작업을 사용하면 공개/작성 중/보관, 카테고리 추가·제거, 완전 삭제를 최대 100개까지 한 번에 처리할 수 있습니다. 완전 삭제는 되돌릴 수 있으므로 먼저 보관 상태를 권장합니다.

### Gemma와 썸네일 자동화

- 썸네일: AI보다 저렴하고 정확한 YouTube oEmbed 또는 페이지 Open Graph 이미지를 우선 사용합니다.
- 설명: 서버에 `GEMMA_API_KEY`가 있을 때 Gemma가 공개 메타데이터를 120자 이내 한국어 초안으로 정리합니다.
- 이미지 생성: Gemma는 이미지 이해·텍스트 생성 모델이므로 썸네일 이미지를 직접 생성하지 않습니다. 생성 이미지가 꼭 필요할 때만 별도 Gemini Image 모델과 object storage/CDN을 검토합니다.
- 안전: 관리자 전용, 허용 호스트만 서버가 읽으며 AI 결과는 자동 공개하지 않습니다.

항목 추가만으로 web을 커밋하거나 Vercel을 재배포하지 않습니다. 코드 변경이 아닌 콘텐츠 변경은 관리자 API가 정답입니다.

## Design system

공통 토큰과 작은 UI는 `@origin/ui`에서 가져옵니다.

```tsx
import { Badge, Button, Card, Field, buttonClassName } from "@origin/ui";
```

- 도메인 판단과 API 호출은 `packages/ui`에 넣지 않습니다.
- 페이지는 feature 컴포넌트를 조립하고, 긴 섹션 구현을 직접 소유하지 않습니다.
- 새 색상·radius·shadow는 임의 hex보다 토큰 추가를 먼저 검토합니다.

자세한 규칙은 [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)를 읽어주세요.

## Branches and deployment

- `develop`: 통합 개발, CI, 고정 Vercel Preview 자동배포
- `main`: 보호된 릴리스, Vercel Production, Oracle API, 관리자 자동배포
- 그 외 브랜치: Vercel 빌드 생략
- `develop → main`: PR 체크 통과 후 merge, semantic-release 버전 생성

## Copyright and privacy

외부 게시물·영상·음원·이미지의 권리는 각 원저작자와 권리자에게 있습니다. ViralOrigin은 출처와 확산 맥락을 기록하며 권리 침해·삭제 요청은 사이트 문의 폼 또는 `iftype@naver.com`으로 받습니다.

개인정보처리방침은 `/privacy`에 공개되어 있습니다. 운영 클라이언트는 Vercel Web Analytics로 페이지 방문의 집계 정보만 확인하며 댓글·제보 본문이나 이메일을 분석 이벤트로 전송하지 않습니다.

### Microsoft Clarity 준비

1. Clarity에서 프로젝트를 만든 뒤 Settings → Setup에서 Project ID를 확인합니다.
2. Clarity 프로젝트의 Consent Mode를 켜고 strict masking 설정을 확인합니다.
3. Vercel의 `viralorigin` 프로젝트에 `NEXT_PUBLIC_CLARITY_PROJECT_ID`를 등록합니다. 운영만 먼저 보려면 Production 환경에만 넣습니다.
4. 재배포 뒤 동의 전에는 Clarity 스크립트와 `_clck`·`_clsk` 쿠키가 없고, 동의 뒤에만 `clarity.ms/tag/:id`가 로드되는지 확인합니다.

환경값이 비어 있으면 관련 배너와 스크립트는 모두 빠집니다. Clarity 공식 정책상 18세 미만을 대상으로 하는 서비스에는 사용하면 안 되므로 실제 활성화 전에 서비스 대상 연령을 확인해야 합니다. 사용자 이름·이메일·퀴즈 session ID를 Clarity Identify API로 보내지 않습니다.

## Search indexing

- 공개 상세 canonical URL은 `/memes/:slug`다. Vercel이 정적 `/meme` shell로 rewrite한다.
- 상세를 불러온 뒤 제목·별칭의 `원본`, `원조`, `챌린지 원조` 조합을 문서 title, description, canonical, Open Graph와 JSON-LD에 반영한다.
- `/sitemap.xml`은 Oracle API의 현재 published 사전을 사용하므로 새 항목 공개 뒤 web 재배포가 필요 없다.
- `/robots.txt`는 제보·피드백 폼을 제외하고 공개 사전의 수집을 허용한다.

## Documentation order for contributors and AI agents

1. [AGENTS.md](AGENTS.md)
2. 루트 [CONTEXT.md](CONTEXT.md)
3. 수정 대상에서 가장 가까운 `CONTEXT.md`
4. [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)
5. [PLAN.md](PLAN.md)

코드와 문서가 다르면 실제 동작을 확인하고 같은 PR에서 문서를 함께 고칩니다.
