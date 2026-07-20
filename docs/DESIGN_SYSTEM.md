# ViralOrigin design system

## Product tone

가볍고 빠른 숏폼 피드의 감각을 유지하되, 원본 근거와 검토 상태가 장식보다 먼저 읽혀야 한다. 긴 랜딩 히어로보다 콘텐츠 썸네일을 우선하고 한 화면에서 다음 행동을 예측할 수 있게 한다.

## Foundations

토큰 위치: `packages/ui/src/tokens.css`.

| Token group | 용도 |
| --- | --- |
| `--vo-color-*` | canvas, surface, ink, muted, brand, signal, 상태색 |
| `--vo-radius-*` | 입력, 카드, 큰 surface의 일관된 모서리 |
| `--vo-shadow-*` | 기본 카드와 떠오르는 interaction |
| `--vo-content-width` | web 기본 content 폭 |

브랜드 색은 출처·CTA 강조에 제한한다. 정보 상태는 초록(확인), 노랑(유력), 보라(검토) 의미를 유지한다.

## Components

`@origin/ui` 공개 API:

- `BrandMark`: 로고 심볼
- `Button`, `buttonClassName`: button과 Link가 공유하는 variant
- `Badge`: status·category·작은 metadata
- `Card`: surface·border·shadow 기본값
- `Field`: label·hint·control layout
- `EmptyState`: 빈 목록과 다음 행동
- `cn`: 조건부 class 조합

공통 컴포넌트는 API 호출, Next.js router, Meme 타입을 import하지 않는다.

## Layout

- 헤더: 브랜드 → 검색 → 문의/제보 행동. mobile은 첫 화면에서 검색을 둘째 줄에 두고 스크롤 시 상단 중앙 compact 검색으로 전환한다.
- 데스크톱 검색은 헤더 오른쪽에 두고, 모바일 입력은 iOS 확대 방지를 위해 실제 글자 크기 16px을 유지한 채 padding과 높이로 시각 크기를 조절한다.
- 홈: 짧은 feed title → 단일 filter button → 원본/대표 사용 자료 embed feed. 모바일 카드는 Instagram처럼 viewport 좌우에 붙고 desktop에서는 중앙 단일 열을 유지한다.
- 상세: 제목 → 원본 영상·게시글 → 뜻 설명 → 사용 영상·자료 TOP3 → 접힌 주요 확산 → compact 댓글 → 연결 밈 → 신규 밈 요청
- 관리자: 전역 상태 → tabs → 한 가지 작업 surface. 사전 탭 안에서는 검색/필터 → 일괄 도구 → 항목 카드 순서를 유지한다.
- 모바일 퀴즈처럼 한 화면에서 판단이 끝나는 도구는 `100dvh` 안에 조작부를 모두 배치하고 전역 header/footer를 숨겨 문서 스크롤을 만들지 않는다. 카드는 수평 drag만 허용하며 완료 목록도 같은 화면 안에 맞춘다. 데스크톱에서는 일반 page shell로 복귀한다.
- 퀴즈의 핵심 판단과 영상 CTA는 불투명한 고대비 button을 사용하고 실제 상세 페이지 modal도 `100dvh` 안에서 닫기·전체 열기 행동을 유지한다.
- 한글 제목·버튼·label은 `word-break: keep-all`을 기본으로 하되 긴 단일 토큰만 `overflow-wrap`으로 안전하게 줄바꿈한다.

## Content cards

- 썸네일은 실제 게시물 캡처나 영상 제공 thumbnail URL을 우선한다.
- 카드 overlay에는 status, kind, title, summary까지만 둔다.
- 태그는 최대 3개만 미리 보이고 상세에서 전체를 표시한다.
- 카테고리는 큰 탐색 영역이므로 강조 badge로, 태그는 작은 검색 키워드이므로 보조 텍스트로 구분한다.
- 커뮤니티 밈도 가능하면 원문 캡처·공식 기사·대표 게시물 thumbnail을 사용한다.
- 다른 사전 항목도 텍스트 박스가 아니라 실제 thumbnail, 검토 상태와 제안 수를 함께 미리 본다.
- 여러 사용 자료는 대표 1개만 재생하고 최대 3개의 thumbnail selector를 둔다. 게시글은 screenshot thumbnail과 원문 링크를 사용한다.
- 홈 피드 iframe은 viewport 근처에서만 생성한다. cross-origin Instagram은 기본적으로 페이지 scroll을 우선하고 사용자가 조작 모드를 켜며, 조작 중에는 피드로 빠져나오는 명시적 버튼과 scroll rail을 둔다.

## Forms

- 기본 필드는 한 화면에서 완료 가능한 최소 항목만 노출한다.
- 원본 근거·타임라인·관련 영상은 `고급 편집`으로 접을 예정이다.
- paste URL 자동완성은 YouTube oEmbed 등 공개 metadata만 사용하고 저장 전 사용자가 확인한다.
- 설명·원본이 없는 마이너 밈은 비어 있는 상태 자체를 오류로 취급하지 않고 설명 제안 행동을 보여준다.
- 성공·실패·loading 상태를 button과 인접한 문장으로 표현한다.

## Accessibility and QA

- text contrast, keyboard focus, label, alt, icon accessible name을 확인한다.
- horizontal tab list는 keyboard와 touch scroll을 모두 허용한다.
- button, tab, select처럼 클릭 가능한 요소는 pointer cursor를 제공한다.
- reduced motion 환경에서도 의미가 유지되어야 한다.
- breakpoint 기준 QA: 360px, 768px, 1280px.

## Adding to the system

1. 기존 variant로 해결 가능한지 확인한다.
2. 두 앱 또는 세 군데 이상에서 반복될 때 shared component로 승격한다.
3. 토큰·컴포넌트 API를 이 문서와 `packages/ui/CONTEXT.md`에 갱신한다.
4. 도메인 로직은 feature에 남긴다.
