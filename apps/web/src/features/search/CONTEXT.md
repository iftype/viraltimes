# Search feature

- 목표: 제목, 별칭, 태그로 밈을 빠르게 찾고 서버 카테고리로 큰 탐색 영역을 전환한다.
- 흐름: 헤더 검색 → 단일 필터 버튼 → 확인 상태·복수 category·복수 tag·연도 범위 modal → 원본/대표 자료 embed 피드 → 상세 페이지 이동.
- 데이터: 공개 사전 API의 `published` `Meme[]`; 연결 실패 때만 기본 샘플을 사용한다.
- 경계: 검색 입력과 결과 목록을 소유하며 상세 콘텐츠는 소유하지 않는다.
- 검색 dropdown은 API query를 사용한다. 홈은 12개 단위로 페이지네이션하며 `categories`, `tags`, `fromYear`, `toYear`, `verification`을 API에 전달한다.
- 모바일 feed card는 viewport 전체 폭을 쓰고 desktop은 2xl 단일 열이다. 두 번째 카드 뒤 퀴즈 CTA를 feed item처럼 배치한다.
