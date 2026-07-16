# Project context

## Product intent

사람들이 투표하기 전에 "그래서 이 밈의 원본이 무엇인가"를 빠르게 확인하게 한다. 확인된 원본, 판단 근거, 확산 타임라인, 대표 영상 순서로 정보를 제공한다.

## Current architecture

- Next.js App Router, React, TypeScript, Tailwind CSS
- 저장소의 정적 샘플 데이터로 생성하는 페이지
- GitHub Pages에 배포 가능한 static export
- 클라이언트 상태는 검색과 가벼운 탐색에만 사용

## Deployment mode

현재는 백엔드 없이 GitHub Pages에 배포한다. 제보 버튼은 GitHub Issue 생성 화면으로 연결한다. 향후 API와 PostgreSQL을 붙여도 도메인 모델과 기능 경계를 유지한다.

## Major decisions

- 소비형 정보 화면을 기본으로 하고 투표 UI는 두지 않는다.
- 영상 임베드는 보조 수단이며 원본 링크를 항상 제공한다.
- 플랫폼 장애, 삭제, 로그인 요구를 정상적인 fallback 상태로 취급한다.
- 기능별 폴더는 독립적인 `CONTEXT.md`로 책임과 한계를 설명한다.

## Current milestone

검색 가능한 홈, 정적 밈 상세 페이지, 원본 근거, 타임라인, 대표 영상, 제보 CTA를 포함한 프로토타입.

## Open questions

- 제품명과 공개 도메인
- 샘플 데이터 검증 절차와 편집 정책
- GitHub Issue 이후의 제보 저장 및 운영자 승인 흐름

