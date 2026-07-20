# Meme detail feature

- 목표: 긴 설명보다 현재 확인된 원본 영상·게시글을 가장 먼저 보여준다.
- 흐름: 제목·상태 → 원본 → 뜻 설명 → 사용 영상·자료 TOP3 → 접힌 주요 확산 → compact 댓글 → 명시적 연결 밈 → 신규 밈 요청.
- 데이터: 공개 사전 API에서 slug로 조회한 `Meme` 객체. API 장애 때만 빌드 내 기본 항목을 사용한다.
- 경계: 상세 화면의 섹션 조합을 소유하고 임베드 자체는 `video-embed`에 위임한다.
- 구성: header, origin, description, usage materials, timeline, comment, related dictionary, request CTA를 개별 컴포넌트로 유지하고 `MemeDetail`은 순서만 조립한다.
- 헤더의 수정 제안 버튼은 `/proposals?meme=:slug`로 이동한다. 근거·본문 토론·개별 정정 버튼은 현재 상세에서 숨긴다.
- `relatedMemeIds`가 있을 때만 연결 밈을 보여주며 임의 추천으로 채우지 않는다. 모바일은 작은 가로 swipe rail이다.
- `MemePulseCard`와 참여 영상 rail은 삭제하지 않고 현재 조립에서만 제외한다.
