# Video embed feature

- 목표: 가능한 플랫폼은 안전하게 재생하고, 불가능하면 명확한 링크 카드로 대체한다.
- 흐름: URL/플랫폼 확인 → 바이럴 1위만 YouTube/Instagram/TikTok iframe → 나머지는 lazy thumbnail → fallback과 원본 링크.
- 데이터: `Video` 객체.
- 경계: 플랫폼 URL 처리와 영상 표현을 소유한다.
- 한계: TikTok과 Instagram은 삭제, 비공개, 지역, 로그인 및 작성자의 임베드 설정에 따라 재생이 제한될 수 있다. X와 알 수 없는 플랫폼은 링크 카드로 표시한다.
- 바이럴 목록은 최대 10개를 desktop 세로 목록/mobile 가로 rail로 탐색하며 선택된 영상 하나만 embed한다.
- 참여·관련 영상은 embed하지 않고 2행 horizontal grid의 외부 링크 카드로 렌더링해 개수가 늘어도 iframe 비용이 증가하지 않게 한다.
