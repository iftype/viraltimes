# Contributions feature

- 목표: 일반 댓글과 정보 수정 제안을 분리하고, 제안은 바로 반영하지 않고 토론 중 상태로 모은다.
- 흐름: 상세 우측 상단 수정 제안 → `/proposals?meme=:slug` → 섹션별 action 선택 → 근거 등록 → 공개 제안 게시판 → 운영 검토 후 확정.
- 등록 폼: 알고 싶은 밈·챌린지와 원본을 아는 밈·챌린지를 구분한다.
- 댓글과 제안은 공용 participation API에 저장한다. 제안 section은 description/origin/trending/related/timeline이며 현재 trending은 사용 영상·자료, related는 연결된 밈 관계를 뜻한다.
