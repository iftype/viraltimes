# Web app context

- 목표: 밈 사전 탐색, 원본 근거, 확산 영상, 타임라인과 참여 제안 UI를 제공한다.
- 빌드: Next.js static export이며 GitHub Pages와 Nginx 정적 호스팅을 모두 지원한다.
- 배포: `develop`은 Vercel 브랜치 Preview, `main`은 Vercel Production과 GitHub Pages로 나간다.
- API 경계: 운영 클라이언트는 서버 호스트가 아니라 상대 경로 `/api`만 사용한다.
- 공개 사전 목록·동적 상세·댓글·수정 제안은 API를 사용한다.
- 홈은 확인 상태 → 최신/연도 → category tabs와 thumbnail feed 순서이며, 헤더 검색은 API 제안 dropdown을 제공한다.
- desktop 헤더는 검색을 피드백·제보보다 왼쪽에 두고, mobile은 스크롤 뒤 검색을 상단 중앙 compact 형태로 유지한다.
- `/feedback`은 사이트 피드백만 받고, 없는 밈 요청과 원본 제보는 `/submit`에서 분리한다.
- 상세 canonical URL은 `/memes/:slug`이며 Vercel rewrite로 동적 사전 shell을 사용한다. client SEO layer가 API 데이터로 metadata와 JSON-LD를 갱신한다.
- 댓글과 수정 제안은 별도 section/API 타입이다. 댓글은 타임라인 다음, 수정 제안 게시판은 그 다음에 배치한다.
