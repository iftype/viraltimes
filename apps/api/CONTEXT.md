# API context

- 목표: 참여 제안, 토론, 투표, 사전 항목과 운영자 확정 상태를 제공할 서버 경계다.
- 현재: Fastify 상태 확인, 공개 사전 조회, 제보 수신, 운영자 인증·큐·사전 CRUD/일괄관리, 퀴즈 효과 로그와 링크 metadata/Gemma 설명 후보 엔드포인트를 제공한다.
- 네트워크: 로컬은 `127.0.0.1:4000`, 운영은 Nginx 뒤에서만 수신한다.
- 환경값: 앱의 실제 `.env`와 VM의 `shared/api.env`는 Git에 포함하지 않는다.
- 다음 단계: JSON 파일 저장소를 공용 데이터베이스로 옮기고 토론·투표 API를 연결한다.
- `metadata-suggestion.ts`는 허용 호스트만 가져오며 oEmbed/OG를 우선하고 Gemma는 설명 초안만 생성한다.
- 새 기본 카테고리는 startup에서 id/slug가 없을 때만 추가하는 add-only migration이다.
