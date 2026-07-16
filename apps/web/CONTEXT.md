# Web app context

- 목표: 밈 사전 탐색, 원본 근거, 확산 영상, 타임라인과 참여 제안 UI를 제공한다.
- 빌드: Next.js static export이며 GitHub Pages와 Nginx 정적 호스팅을 모두 지원한다.
- 배포: `develop`은 Vercel 브랜치 Preview, `main`은 Vercel Production과 GitHub Pages로 나간다.
- API 경계: 운영 클라이언트는 서버 호스트가 아니라 상대 경로 `/api`만 사용한다.
- 공개 사전 목록과 동적 상세는 API를 사용하며, 토론·투표만 아직 브라우저 저장소에 남는다.
