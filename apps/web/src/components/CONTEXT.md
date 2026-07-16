# Shared components

사이트 전역에서 재사용하는 레이아웃과 작은 UI 요소를 둔다. 특정 기능의 데이터 조회나 도메인 판단 로직은 이 폴더에 두지 않고 해당 `features` 폴더가 소유한다.

디자인 토큰과 범용 Button/Badge/Card/Field는 이 폴더가 아니라 `packages/ui`의 `@origin/ui`를 사용한다.

전역 헤더는 desktop에서 `브랜드 → 검색 → 피드백·제보` 순서를 지킨다. mobile에서는 검색이 둘째 줄에 있고 72px 이상 스크롤하면 브랜드 아이콘과 제보 버튼 사이 상단 중앙의 compact sticky 검색으로 전환한다.
