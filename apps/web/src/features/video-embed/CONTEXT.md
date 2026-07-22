# Video embed feature

- 목표: 가능한 플랫폼은 안전하게 재생하고, 불가능하면 명확한 링크 카드로 대체한다.
- 흐름: URL/플랫폼 확인 → Instagram은 API의 외부 임베드 가능 여부 확인 → 선택된 YouTube/Instagram/TikTok iframe → 나머지는 lazy thumbnail → fallback과 원본 링크.
- 데이터: `Video` 객체.
- 경계: 플랫폼 URL 처리와 영상 표현을 소유한다.
- 한계: TikTok과 Instagram은 삭제, 비공개, 지역, 로그인 및 작성자의 임베드 설정에 따라 재생이 제한될 수 있다. Instagram 사전 확인은 정상·명시적 삭제·확인 불가를 구분하며 서버 IP 제한이나 timeout인 확인 불가 상태에서는 브라우저 임베드를 그대로 시도한다. 명시적 삭제 또는 플레이어 오류 때는 원문 링크 fallback을 표시하고 feed에서는 해당 영상 항목을 건너뛴다. X와 알 수 없는 플랫폼은 링크 카드로 표시한다.
- 바이럴 목록은 최대 10개를 desktop 세로 목록/mobile 가로 rail로 탐색하며 선택된 영상 하나만 embed한다.
- 참여·관련 영상은 embed하지 않고 2행 horizontal grid의 외부 링크 카드로 렌더링해 개수가 늘어도 iframe 비용이 증가하지 않게 한다.
- 홈 feed는 관리자에서 노출한 챌린지 원본과 바이럴 영상을 각각 독립 카드로 구성한다. 화면 점유율이 가장 큰 카드 하나만 활성화하며 그 카드만 iframe을 만든다. 위·아래 이웃 카드는 placeholder로 유지해 플랫폼 autoplay가 동시에 실행되지 않게 한다.
- Instagram iframe 내부의 scroll 끝은 cross-origin 경계 때문에 부모가 감지할 수 없다. Instagram/TikTok iframe 중앙은 플랫폼의 재생·소리 UI를 직접 조작하고 양쪽 touch rail은 피드 세로 swipe를 유지한다. TikTok은 공식 player postMessage로 active 재생과 mute/unMute를 동기화한다.
