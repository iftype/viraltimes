# ViralOrigin agent guide

이 문서는 Codex 외 다른 AI·개발자가 같은 기준으로 작업하기 위한 저장소 운영 계약이다.

## Before editing

1. 루트 `CONTEXT.md`를 읽는다.
2. 수정 파일과 가장 가까운 `CONTEXT.md`를 읽는다.
3. UI 변경은 `docs/DESIGN_SYSTEM.md`, 로드맵 변경은 `PLAN.md`를 확인한다.
4. `git status -sb`로 사용자 변경과 작업 범위를 구분한다.

## Ownership boundaries

- `apps/web/src/app`: route와 feature 조립만 담당한다.
- `apps/web/src/features`: 도메인별 UI·브라우저 상태를 담당한다.
- `apps/web/src/components/layout`: 사이트 전역 layout만 담당한다.
- `packages/ui`: 디자인 토큰과 도메인을 모르는 표현 컴포넌트만 둔다.
- `apps/api/src/routes`: HTTP 검증·응답 경계다.
- `apps/api/src/*-store.ts`: 저장과 동시성·원자적 쓰기를 담당한다.
- `apps/admin`: 공개 콘텐츠 확정과 운영자 inbox를 담당한다.

페이지 파일이나 API `index.ts`가 다시 비대해지면 기능을 추가하기 전에 먼저 소유 컴포넌트·route로 분리한다.

## Data rules

- 새 사전 항목은 코드에 하드코딩하지 않고 관리자 API로 등록한다.
- 카테고리는 서버의 category ID 관계로 저장하고, 태그는 작은 검색 키워드로만 사용한다.
- 공개 사전은 `published`만 반환한다.
- URL은 `http/https`만 허용하고 사용자 본문은 React 기본 escaping을 유지한다.
- 이미지 바이너리를 Oracle 로컬 디스크나 Git에 추가하지 않는다. 현재는 외부 HTTPS URL을 브라우저가 직접 읽는다.
- 향후 댓글과 회원 데이터는 `PLAN.md`의 actor 모델을 따른다.

## UI rules

- 공통 UI는 먼저 `@origin/ui`에서 찾는다.
- 임의의 색·radius·shadow를 복제하지 말고 토큰 또는 variant를 추가한다.
- 카테고리, status, 플랫폼처럼 도메인 의미가 있는 mapping은 feature가 소유한다.
- 모바일 360px, desktop 1280px에서 정보 순서와 horizontal overflow를 확인한다.
- 이미지에는 alt, 아이콘 버튼에는 accessible name, form에는 label을 제공한다.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm build
```

API 변경은 최소한 health, 성공 응답, validation 실패, 인증 실패를 확인한다. UI 변경은 Dev Vercel에서 홈·상세·제보·관리자 영향 범위를 확인한다.

## Delivery

- 기능 작업은 `develop`에 올린다.
- Dev Vercel 확인 후 `develop → main` PR을 만든다.
- `main` merge 전 운영 데이터 migration과 rollback 영향을 적는다.
- 비밀값, 서버 IP, 개인키는 커밋하지 않는다.
