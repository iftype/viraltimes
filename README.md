# Meme Origin Timeline

밈, 챌린지, 바이럴 영상의 현재까지 확인된 원본과 확산 과정을 빠르게 살펴보는 참여형 타임라인 서비스입니다.

## Getting started

```bash
pnpm install
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

## Commands

```bash
pnpm lint
pnpm build
```

현재 프로토타입은 정적 샘플 데이터를 사용하며 GitHub Pages용 static export를 목표로 합니다.

## Prototype scope

- 제목, 별칭, 태그 기반 홈 검색
- 현재 확인된 원본과 검토 상태
- 출처 판단 근거와 확산 타임라인
- YouTube privacy-enhanced embed 및 외부 플랫폼 fallback
- GitHub Issue 기반 수정 제보
- GitHub Pages static export 및 Actions 배포

> 샘플 콘텐츠는 UI 검증용입니다. 공개 운영 전 각 출처와 날짜를 다시 검토해야 합니다.

## GitHub Pages

`main` 브랜치에 push하면 `.github/workflows/deploy-pages.yml`이 정적 export를 빌드하고 Pages에 배포합니다. 저장소 설정의 **Pages → Source**가 **GitHub Actions**로 지정되어 있어야 합니다.
