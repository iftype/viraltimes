# Project context

## Product intent

사람들이 밈·챌린지의 원본, 근거, 확산 과정을 빠르게 확인하고 수정 제안과 토론으로 기록을 함께 검증하게 한다.

## Current architecture

- pnpm workspace monorepo
- `apps/web`: Next.js App Router, React, TypeScript, Tailwind CSS
- `apps/admin`: `/viral` basePath의 정적 Next.js 관리자 화면
- `apps/api`: Fastify, TypeScript, Node.js 22
- `packages/ui`: web/admin 공용 디자인 토큰과 도메인 비의존 UI primitive
- `infra`: Nginx reverse proxy와 systemd API 서비스 예시
- 공개 사전·카테고리·비회원 댓글·수정 제안·퀴즈 응답과 운영자 큐는 Oracle API의 파일 저장소를 사용한다.

## Network boundary

- 클라이언트는 상대 경로 `/api`만 사용한다.
- 공개 요청은 Nginx가 `127.0.0.1:4000`의 API로 프록시한다.
- Oracle VM 호스트, SSH 사용자·키·배포 경로는 GitHub Actions Secret으로만 관리한다.
- 실제 API 및 데이터베이스 자격 증명은 VM의 `/opt/origin/shared/api.env`에 둔다.
- `iftype.store/viral`은 기존 서비스와 분리된 정적 파일이며 `/viral/api`만 ViralOrigin API로 프록시한다.

## Delivery model

- `develop`: 통합 개발, CI, Vercel 고정 브랜치 Preview 배포
- `main`: 보호된 릴리스 브랜치
- Vercel은 `develop`과 `main`만 빌드하고 그 외 브랜치 배포는 건너뛴다.
- `main` 업데이트: semantic-release 버전 태그와 GitHub Release 생성
- GitHub Pages: 전환기 웹 프리뷰
- Oracle VM: 저장소 변수로 명시적으로 활성화하는 조건부 API 배포. 같은 workflow가 `apps/admin/out`도 독립 경로에 동기화한다.

## Next milestone

`PLAN.md`의 P0 순서대로 JSON을 SQLite로 이전하고 외부 object storage thumbnail 경계를 구현한다. 관리자 CRUD·일괄관리, 코리아 마이너 밈, 링크 metadata/Gemma 설명 초안, 고정 퀴즈 deck·효과 측정, 최근 사용 신호는 JSON 저장소 기준으로 먼저 적용했다.
