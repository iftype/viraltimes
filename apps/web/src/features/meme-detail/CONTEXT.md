# Meme detail feature

- 목표: 현재 확인된 원본과 판단 근거를 가장 먼저 보여준다.
- 흐름: 요약 → 원본·세로 근거·이의제기 → 트렌딩 영상 → 관련 영상 → 링크 타임라인 → 다른 사전 항목.
- 데이터: 공개 사전 API에서 slug로 조회한 `Meme` 객체. API 장애 때만 빌드 내 기본 항목을 사용한다.
- 경계: 상세 화면의 섹션 조합을 소유하고 임베드 자체는 `video-embed`에 위임한다.
- 구성: header, origin, video collection, timeline, comment, proposal board, thumbnail related dictionary 섹션을 개별 컴포넌트로 유지하고 `MemeDetail`은 순서만 조립한다.
- 참여: 설명·원본·트렌딩·관련 영상·타임라인마다 수정 제안을 열고 토론 목록으로 연결한다.
- 헤더의 수정 제안 토론 탭은 proposal board anchor와 서버 count를 표시한다. 확정 편집 이력은 아직 제공하지 않는다.
