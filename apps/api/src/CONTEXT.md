# API source context

- 공개 등록은 `POST /api/v1/intake`로 작은 JSON 문서에 저장한다.
- 관리자 세션은 서버 메모리에 보관하지 않고 HMAC 서명 HttpOnly 쿠키로 검증한다.
- 관리자 비밀번호 해시와 세션 키는 운영 서버의 `shared/api.env`에만 둔다.
- 관리자 목록 상태 변경은 임시 파일 작성 후 rename하는 원자적 저장을 사용한다.
- 공개 사전은 `GET /api/v1/memes`와 `GET /api/v1/memes/:slug`로 `published` 항목만 노출한다.
- 관리자 사전 API는 draft/published/archived 상태와 slug 중복을 관리하고 `MEME_DATA_FILE`에 원자적으로 저장한다.
