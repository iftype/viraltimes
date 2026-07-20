# Web app context

- 목표: 밈 사전 탐색, 원본 근거, 확산 영상, 타임라인과 참여 제안 UI를 제공한다.
- 빌드: Next.js static export이며 GitHub Pages와 Nginx 정적 호스팅을 모두 지원한다.
- 배포: `develop`은 Vercel 브랜치 Preview, `main`은 Vercel Production과 GitHub Pages로 나간다.
- API 경계: 운영 클라이언트는 서버 호스트가 아니라 상대 경로 `/api`만 사용한다.
- 공개 사전 목록·동적 상세·댓글·수정 제안은 API를 사용한다.
- 홈은 확인 상태 → 최신/연도 → thumbnail feed 순서이며, category 데이터와 관리자 기능은 유지하되 공개 홈의 category tabs는 피드백 반영으로 숨긴다. 헤더 검색은 API 제안 dropdown을 제공한다.
- desktop 헤더는 검색을 피드백·제보보다 왼쪽에 두고, mobile은 스크롤 뒤 검색을 상단 중앙 compact 형태로 유지한다.
- `/feedback`은 사이트 피드백만 받는다. `/submit`은 영상 URL 필수, 밈·챌린지 이름과 알고 있는 원본 URL 선택, 기본 닉네임을 제공하는 단일 제보 폼이다.
- 상세 canonical URL은 `/memes/:slug`이며 Vercel rewrite로 동적 사전 shell을 사용한다. client SEO layer가 API 데이터로 metadata와 JSON-LD를 갱신한다.
- 댓글과 수정 제안은 별도 section/API 타입이다. 상세 본문은 댓글만 compact하게 표시하고 수정 제안과 토론은 `/proposals?meme=:slug` 전용 화면에서 처리한다.
- 코리아 마이너 밈은 단일 원본이 없어도 커뮤니티 링크와 사용 맥락을 먼저 보여준다. 설명이 비어 있으면 사용자 제안을 유도한다.
- 상세 흐름은 제목 → 원본 영상·게시글 → 뜻 설명 → 대표 사용 영상·자료 TOP3 → 접힌 주요 확산 과정 → compact 댓글 → 명시적 연결 밈 → 신규 밈 요청이다.
- 최근 사용 신호, 근거 목록, 참여 영상 rail은 컴포넌트와 데이터 계약을 보존하되 현재 상세에서 렌더링하지 않는다.
- `/quiz`는 관리자가 구성한 최대 5개 카드의 인지도를 익명 실행 단위로 측정한다. 실제 상세 페이지를 iframe modal로 열고 완료 화면에서 다른 참여자 통계와 상세·서비스 CTA를 제공한다.
