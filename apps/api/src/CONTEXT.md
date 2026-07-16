# API source context

- 공개 등록은 `POST /api/v1/intake`로 작은 JSON 문서에 저장한다.
- 관리자 세션은 서버 메모리에 보관하지 않고 HMAC 서명 HttpOnly 쿠키로 검증한다.
- 관리자 비밀번호 해시와 세션 키는 운영 서버의 `shared/api.env`에만 둔다.
- 관리자 목록 상태 변경은 임시 파일 작성 후 rename하는 원자적 저장을 사용한다.
- `index.ts`는 설정과 조립만 담당하고 공개 사전, intake, 관리자, health 라우트는 `routes/`가 소유한다.
- 공개 카테고리는 `GET /api/v1/categories`, 사전은 `GET /api/v1/memes?page=&pageSize=&category=&tag=&query=`와 `GET /api/v1/memes/:slug`로 제공한다. pageSize 최대값은 48이다.
- 카테고리는 `CATEGORY_DATA_FILE`에서 관리하고 meme은 `categoryIds`로 연결한다. 기존 데이터는 읽을 때 legacy kind/tag를 초기 category ID로 변환한다.
- 관리자 카테고리 API는 생성·수정·활성화·정렬을 제공하며 hard delete 대신 비활성화를 사용한다.
- 관리자 사전 API는 draft/published/archived 상태와 slug 중복을 관리하고 `MEME_DATA_FILE`에 원자적으로 저장한다.
