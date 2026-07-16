# API source context

- 공개 등록은 `POST /api/v1/intake`로 작은 JSON 문서에 저장한다.
- 관리자 세션은 서버 메모리에 보관하지 않고 HMAC 서명 HttpOnly 쿠키로 검증한다.
- 관리자 비밀번호 해시와 세션 키는 운영 서버의 `shared/api.env`에만 둔다.
- 관리자 목록 상태 변경은 임시 파일 작성 후 rename하는 원자적 저장을 사용한다.
- `index.ts`는 설정과 조립만 담당하고 공개 사전, intake, 관리자, health 라우트는 `routes/`가 소유한다.
- 공개 카테고리는 `GET /api/v1/categories`, 사전은 `GET /api/v1/memes?page=&pageSize=&category=&tag=&query=&year=&fromYear=&toYear=&sort=`와 `GET /api/v1/memes/:slug`로 제공한다. pageSize 최대값은 48이며 목록 응답은 year facet을 포함한다.
- 카테고리는 `CATEGORY_DATA_FILE`에서 관리하고 meme은 `categoryIds`로 연결한다. 기존 데이터는 읽을 때 legacy kind/tag를 초기 category ID로 변환한다.
- 관리자 카테고리 API는 생성·수정·활성화·정렬을 제공하며 hard delete 대신 비활성화를 사용한다.
- 댓글과 수정 제안은 `PARTICIPATION_DATA_FILE`에 분리 저장하며 공개 API에서 페이지네이션한다. 제안은 section/action이 필수이고 관리자 `proposal` inbox도 함께 만든다.
- participation POST는 IP 원문을 저장하지 않고 프로세스 메모리 기반 단기 rate limit, honeypot, 길이·링크 검증을 적용한다.
- `GET /api/v1/sitemap.xml`은 published 사전의 `/memes/:slug` URL을 동적으로 만든다.
- 관리자 사전 API는 draft/published/archived 상태와 slug 중복을 관리하고 `MEME_DATA_FILE`에 원자적으로 저장한다.
- 밈의 `lifecycle.originYear/firstSeenAt/lastObservedAt`은 연도 탐색과 수명 표시의 기준이다. 기존 데이터는 origin timeline과 업로드 날짜에서 originYear를 보완한다.
- 트렌드 시계열은 `TREND_DATA_FILE`에 밈·날짜·source·metric 조합으로 upsert한다. 공개 GET은 읽기 전용이고 internal batch POST만 `TREND_INGEST_TOKEN`을 요구한다.
