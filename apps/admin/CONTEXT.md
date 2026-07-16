# Admin app context

- `iftype.store/viral`에서 제공하는 독립 정적 Next.js 앱이다.
- `basePath`는 `/viral`이며 기존 iftype.store 앱과 정적 자산 경로가 겹치지 않는다.
- 브라우저는 같은 출처의 `/viral/api/v1/admin/*`만 호출하고 Nginx가 ViralOrigin API로 전달한다.
- 인증 비밀이나 운영 데이터는 번들에 포함하지 않는다.
- 운영 서버에서는 정적 파일만 제공하므로 별도 Node 프로세스와 상시 메모리가 필요 없다.
- 사전 관리 탭은 draft/published/archived 항목을 API로 작성·수정하며 공개 저장 즉시 클라이언트에 반영한다.
- 카테고리 탭은 서버 category의 표시 이름, slug, 설명, 정렬 순서와 활성 상태를 관리한다. 사전 항목은 category ID를 복수 선택한다.
