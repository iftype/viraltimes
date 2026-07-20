# Feed, quiz, catalog update — 2026-07-20

## UI changes

- 퀴즈 첫 카드에 `왼쪽=몰라요`, `오른쪽=알아요` swipe 안내를 추가했다. 첫 drag나 버튼 판단 뒤 사라진다.
- 퀴즈 상세 iframe modal을 mobile `84dvh`, desktop `82vh`로 줄였다.
- 홈을 4열 thumbnail grid에서 12개 단위 단일 열 media feed로 바꿨다.
- mobile feed card는 360px viewport 좌우를 꽉 채우고 desktop은 중앙 `max-w-2xl`을 유지한다.
- 원본 영상이 있으면 우선 재생하고, 없으면 대표 사용 자료와 thumbnail/원문 link를 사용한다.
- iframe은 viewport 800px 안쪽에 들어올 때만 만들어 초기 메모리와 network 사용을 제한한다.
- filter는 하나의 modal에서 확인 상태, 복수 category, 복수 tag, 시작·끝 연도를 조합한다.

### Instagram scroll boundary

Instagram embed는 cross-origin iframe이므로 내부 문서의 scroll 끝을 부모 페이지에서 읽을 수 없다. 홈 feed에서는 기본 상태의 세로 gesture를 부모 페이지가 받고, 사용자가 `탭해서 재생·조작`을 선택한 뒤에만 iframe pointer interaction을 켠다. 조작 상태에서도 좌우·하단에 부모 scroll rail을 남기고 `피드 스크롤` 버튼으로 즉시 빠져나오게 했다.

## Catalog operations

관리자 API로 다음 published 항목을 추가했다.

- 맘보 (Mambo)
- 가짜사랑 고양이 밈
- 스쿠바 댄스
- 갤럭시 브레인
- 하버드에서 연락 옴
- Wait 챌린지
- 이머전시 챌린지
- 골반통신
- 나니가스키
- 힙사사돈

`어쩔티비`, `중꺾마`, `Rickroll`, `Harlem Shake`는 삭제했다. 스쿠바 댄스와 가짜사랑 고양이 밈은 `relatedMemeIds`를 양방향으로 저장했다. 퀴즈 deck은 맘보, 가짜사랑, 스쿠바 댄스, 하버드에서 연락 옴, 갤럭시 브레인으로 교체했다.

조사 기준 링크는 각 항목의 `origin.evidence`와 `sourceLinks`에 저장했다. 특정 플랫폼의 최초 게시물이 삭제되거나 검색되지 않는 경우 `likely`로 두고, 확인된 곡·대표 영상과 최초 주장 사이를 구분했다.

## Clarity readiness

- `NEXT_PUBLIC_CLARITY_PROJECT_ID`가 유효할 때만 동의 UI가 나타난다.
- 사용자가 동의한 뒤에만 Clarity script를 삽입하고 consent 신호를 queue에 넣는다.
- 거절하면 script를 불러오지 않는다. 선택은 `viralorigin-clarity-consent` localStorage key에 저장한다.
- 댓글·제보 본문, 이메일, 퀴즈 익명 ID를 Clarity custom property/Identify API로 보내지 않는다.
- 실제 활성화 전 Clarity dashboard에서 Consent Mode와 strict masking을 켜고 대상 연령 정책을 확인한다.

## Verification checklist

- 360px: document horizontal overflow 없음, feed card width 360px
- quiz: document height 100dvh, first swipe hint visible, modal height 84dvh
- API: comma-separated category/tag OR filter, verification, date range, tag/year facets
- production catalog: 13 published, 신규 10개 노출, 삭제 4개 미노출, 스쿠바↔가짜사랑 양방향 연결
