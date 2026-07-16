import type { Meme } from "@/types/meme";

export const sampleMemes: Meme[] = [
  {
    id: "kkungsit-kkungsit",
    slug: "kkungsit-kkungsit",
    title: "꿍싯꿍싯",
    kind: "challenge",
    thumbnailUrl: "/thumbnails/kkungsit.jpg",
    aliases: ["다이죠부이데쇼", "료 행진곡", "Otsukare Summer challenge"],
    summary:
      "NCT WISH 료의 안무에 HALCALI의 Otsukare SUMMER를 붙인 팬 편집 영상에서 시작된 귀여운 숏폼 챌린지.",
    accent: "#fe2c55",
    origin: {
      status: "verified",
      video: {
        id: "kkungsit-origin",
        platform: "instagram",
        url: "https://www.instagram.com/reel/DXynhceJVBC/",
        title: "꿍싯꿍싯 파트",
        creator: "ryo.cuteeeeee",
        uploadedAt: "2026-05-01",
        viewCountLabel: "좋아요 8.7만",
      },
      summary:
        "팬이 NCT WISH의 Ode to Love 속 료 안무에 HALCALI의 Otsukare SUMMER를 입힌 편집 릴스가 현재 확인된 챌린지의 출발점입니다.",
      evidence: [
        {
          title: "가장 이른 확인 게시물",
          detail:
            "@ryo.cuteeeeee가 2026년 5월 1일 ‘꿍싯꿍싯 파트’라는 캡션으로 올린 릴스입니다.",
          url: "https://www.instagram.com/reel/DXynhceJVBC/",
        },
        {
          title: "팬이 만든 역챌린지",
          detail:
            "Ode to Love의 료 안무를 떼어내 Otsukare SUMMER 일부 구간에 합성한 팬 편집에서 유행이 시작됐다고 보도됐습니다.",
          url: "https://v.daum.net/v/20260624144803751",
        },
        {
          title: "아티스트의 공식 응답",
          detail:
            "NCT 공식 TikTok이 5월 8일 료의 ‘꿍싯꿍싯’ 영상을 게시하며 팬 유행에 직접 합류했습니다.",
          url: "https://www.tiktok.com/@official_nct/video/7637412498311777543",
        },
      ],
      lastReviewedAt: "2026-07-16",
    },
    timeline: [
      {
        id: "kkungsit-1",
        dateLabel: "2025 봄",
        title: "Otsukare SUMMER 재발견",
        description:
          "2003년 발표된 HALCALI의 곡이 영국과 미국 숏폼을 중심으로 다시 쓰이기 시작합니다.",
        sourceUrl: "https://v.daum.net/v/20260624144803751",
        sourceLabel: "확산 배경 기사",
        kind: "spread",
      },
      {
        id: "kkungsit-2",
        dateLabel: "2026. 05. 01",
        title: "팬 편집 릴스 공개",
        description:
          "료의 Ode to Love 안무와 Otsukare SUMMER를 결합한 ‘꿍싯꿍싯 파트’가 Instagram에 올라옵니다.",
        sourceUrl: "https://www.instagram.com/reel/DXynhceJVBC/",
        sourceLabel: "원본 릴스",
        kind: "origin",
      },
      {
        id: "kkungsit-3",
        dateLabel: "2026. 05. 08",
        title: "NCT 공식 계정이 탑승",
        description:
          "NCT 공식 TikTok이 료 버전을 직접 게시하면서 팬 편집이 공식 챌린지처럼 확장됩니다.",
        sourceUrl:
          "https://www.tiktok.com/@official_nct/video/7637412498311777543",
        sourceLabel: "공식 TikTok",
        kind: "mainstream",
      },
      {
        id: "kkungsit-4",
        dateLabel: "2026. 05–06",
        title: "아이돌 전반으로 확산",
        description:
          "NCT WISH 멤버들의 변형 영상에 이어 카리나, 레이, 사쿠라 등 여러 아이돌이 참여하며 플랫폼 밖까지 알려집니다.",
        sourceUrl:
          "https://www.tiktok.com/@official_nct/video/7645885334546304264",
        sourceLabel: "멤버 변형 영상",
        kind: "spread",
      },
    ],
    trendingVideos: [
      {
        id: "kkungsit-tiktok-ryo",
        platform: "tiktok",
        url: "https://www.tiktok.com/@official_nct/video/7637412498311777543",
        title: "꿍싯꿍싯 #RYO #NCTWISH",
        creator: "official_nct",
        uploadedAt: "2026-05-08",
        viewCountLabel: "350만 조회",
      },
    ],
    relatedVideos: [
      {
        id: "kkungsit-tiktok-cheeseball",
        platform: "tiktok",
        url: "https://www.tiktok.com/@official_nct/video/7645885334546304264",
        title: "치즈볼도 꿍싯꿍싯 #YUSHI #RYO #SAKUYA",
        creator: "official_nct",
        uploadedAt: "2026-05-31",
        viewCountLabel: "460만 조회",
      },
    ],
    tags: ["댄스", "역챌린지", "NCT WISH", "2026"],
  },
  {
    id: "harlem-shake",
    slug: "harlem-shake",
    title: "Harlem Shake",
    kind: "challenge",
    thumbnailUrl: "/thumbnails/harlem-shake.jpg",
    aliases: ["할렘 쉐이크", "Harlem Shake meme"],
    summary:
      "한 사람이 춤추던 조용한 장면이 비트 드롭과 함께 집단 난장판으로 바뀌는 짧은 영상 포맷.",
    accent: "#ff6b35",
    origin: {
      status: "likely",
      video: {
        id: "harlem-origin",
        platform: "youtube",
        url: "https://www.youtube.com/watch?v=8vJiSSAMNWw",
        title: "DO THE HARLEM SHAKE (ORIGINAL)",
        creator: "DizastaMusic",
        uploadedAt: "2013-01-30",
      },
      summary:
        "현재 샘플은 짧은 오프닝 개그를 이후 집단 댄스 포맷에 영향을 준 초기 영상으로 표시합니다.",
      evidence: [
        {
          title: "업로드 시점",
          detail: "유행 포맷이 폭발적으로 확산되기 직전 공개된 초기 영상입니다.",
          url: "https://www.youtube.com/watch?v=8vJiSSAMNWw",
        },
        {
          title: "포맷 연결",
          detail:
            "후속 영상들이 같은 음악 구간과 장면 전환 구조를 반복했습니다. 운영 데이터 전환 전 추가 검토가 필요합니다.",
        },
      ],
      lastReviewedAt: "2026-07-16",
    },
    timeline: [
      {
        id: "harlem-1",
        dateLabel: "2013. 01. 30",
        title: "초기 개그 영상 공개",
        description: "음악과 짧은 춤 동작을 결합한 영상이 공개됩니다.",
        kind: "origin",
        sourceUrl: "https://www.youtube.com/watch?v=8vJiSSAMNWw",
        sourceLabel: "초기 영상",
      },
      {
        id: "harlem-2",
        dateLabel: "2013. 02",
        title: "집단 변신 포맷 등장",
        description:
          "평범한 장면에서 비트 드롭과 함께 모두가 춤추는 30초 안팎의 구조가 복제됩니다.",
        kind: "variation",
        sourceUrl: "https://www.youtube.com/watch?v=ygr5AHufBN4",
        sourceLabel: "대표 확산 영상",
      },
      {
        id: "harlem-3",
        dateLabel: "2013. 02–03",
        title: "글로벌 챌린지로 확산",
        description: "학교, 회사, 스포츠팀이 각자의 버전을 제작합니다.",
        kind: "mainstream",
        sourceUrl: "https://www.youtube.com/watch?v=ygr5AHufBN4",
        sourceLabel: "대표 확산 영상",
      },
    ],
    trendingVideos: [
      {
        id: "harlem-top-2",
        platform: "youtube",
        url: "https://www.youtube.com/watch?v=ygr5AHufBN4",
        title: "Harlem Shake — 대표 확산 버전",
        creator: "샘플 큐레이션",
      },
    ],
    relatedVideos: [
      {
        id: "harlem-top-1",
        platform: "youtube",
        url: "https://www.youtube.com/watch?v=8vJiSSAMNWw",
        title: "DO THE HARLEM SHAKE (ORIGINAL)",
        creator: "DizastaMusic",
      },
    ],
    tags: ["댄스", "챌린지", "2010s", "유튜브"],
  },
  {
    id: "nyan-cat",
    slug: "nyan-cat",
    title: "Nyan Cat",
    kind: "video-meme",
    thumbnailUrl: "/thumbnails/nyan-cat.gif",
    thumbnailFit: "contain",
    aliases: ["냥캣", "Pop Tart Cat"],
    summary:
      "팝타르트 몸을 가진 고양이가 무지개를 남기며 우주를 날아가는 루프 애니메이션과 음악.",
    accent: "#6c63ff",
    origin: {
      status: "verified",
      video: {
        id: "nyan-origin",
        platform: "youtube",
        url: "https://www.youtube.com/watch?v=QH2-TGUlwu4",
        title: "Nyan Cat [original]",
        creator: "saraj00n",
        uploadedAt: "2011-04-05",
      },
      summary:
        "원본 픽셀 아트와 일본 보컬 합성 음악이 결합된 영상이 Nyan Cat이라는 이름으로 널리 확산됐습니다.",
      evidence: [
        {
          title: "원본 영상 링크",
          detail: "현재도 접근 가능한 대표 원본 업로드입니다.",
          url: "https://www.youtube.com/watch?v=QH2-TGUlwu4",
        },
        {
          title: "창작 요소 구분",
          detail:
            "픽셀 아트, 음악, 합성 영상의 제작자가 다를 수 있어 운영 단계에서는 각각의 출처를 분리 기록해야 합니다.",
        },
      ],
      lastReviewedAt: "2026-07-16",
    },
    timeline: [
      {
        id: "nyan-1",
        dateLabel: "2011. 04",
        title: "픽셀 아트 공개",
        description: "Pop Tart Cat GIF가 먼저 공개됩니다.",
        kind: "origin",
        sourceUrl: "https://www.nyan.cat/",
        sourceLabel: "Nyan Cat 아카이브",
      },
      {
        id: "nyan-2",
        dateLabel: "2011. 04. 05",
        title: "음악 합성 영상 업로드",
        description: "반복 애니메이션과 Nyanyanyanyanyanyanya!가 결합됩니다.",
        kind: "remix",
        sourceUrl: "https://www.youtube.com/watch?v=QH2-TGUlwu4",
        sourceLabel: "대표 원본 영상",
      },
      {
        id: "nyan-3",
        dateLabel: "2011–2012",
        title: "리믹스와 게임으로 확산",
        description: "장시간 버전, 캐릭터 변형, 팬 게임이 이어집니다.",
        kind: "spread",
        sourceUrl: "https://www.nyan.cat/",
        sourceLabel: "인터랙티브 아카이브",
      },
    ],
    trendingVideos: [
      {
        id: "nyan-top-1",
        platform: "youtube",
        url: "https://www.youtube.com/watch?v=QH2-TGUlwu4",
        title: "Nyan Cat [original]",
        creator: "saraj00n",
      },
    ],
    relatedVideos: [
      {
        id: "nyan-top-2",
        platform: "unknown",
        url: "https://www.nyan.cat/",
        title: "Nyan Cat 인터랙티브 아카이브",
        creator: "nyan.cat",
      },
    ],
    tags: ["고양이", "픽셀아트", "2010s", "리믹스"],
  },
  {
    id: "rickroll",
    slug: "rickroll",
    title: "Rickroll",
    kind: "community-meme",
    thumbnailUrl: "/thumbnails/rickroll.jpg",
    aliases: ["릭롤", "Never Gonna Give You Up"],
    summary:
      "궁금한 링크인 척 유도한 뒤 Rick Astley의 뮤직비디오로 보내는 인터넷식 장난.",
    accent: "#2f80ed",
    origin: {
      status: "needs-review",
      video: {
        id: "rickroll-origin",
        platform: "youtube",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        title: "Never Gonna Give You Up (Official Video)",
        creator: "Rick Astley",
        uploadedAt: "2009-10-25",
      },
      summary:
        "뮤직비디오는 장난에 사용된 대상이며, 최초의 rickroll 게시물을 특정하려면 당시 포럼 기록을 별도로 검토해야 합니다.",
      evidence: [
        {
          title: "대표 대상 영상",
          detail: "릭롤 링크가 최종적으로 보여주는 가장 널리 알려진 영상입니다.",
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        },
        {
          title: "최초 게시물 미확정",
          detail:
            "노래의 발표, 유튜브 업로드, 링크 장난의 시작은 서로 다른 사건이므로 추가 자료가 필요합니다.",
        },
      ],
      lastReviewedAt: "2026-07-16",
    },
    timeline: [
      {
        id: "rick-1",
        dateLabel: "1987",
        title: "곡과 뮤직비디오 발표",
        description: "Rick Astley의 Never Gonna Give You Up이 공개됩니다.",
        kind: "origin",
        sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        sourceLabel: "공식 뮤직비디오",
      },
      {
        id: "rick-2",
        dateLabel: "2007",
        title: "링크 장난으로 확산",
        description: "예상치 못한 뮤직비디오로 연결하는 bait-and-switch가 퍼집니다.",
        kind: "variation",
        sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        sourceLabel: "릭롤 대상 영상",
      },
      {
        id: "rick-3",
        dateLabel: "2008 이후",
        title: "주류 문화에 정착",
        description: "방송, 행사, 브랜드 캠페인에서 반복적으로 재현됩니다.",
        kind: "mainstream",
        sourceUrl: "https://x.com/rickastley",
        sourceLabel: "관련 계정",
      },
    ],
    trendingVideos: [
      {
        id: "rick-top-1",
        platform: "youtube",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        title: "Never Gonna Give You Up (Official Video)",
        creator: "Rick Astley",
      },
    ],
    relatedVideos: [
      {
        id: "rick-top-2",
        platform: "x",
        url: "https://x.com/rickastley",
        title: "플랫폼 외부 자료 예시",
        creator: "Rick Astley",
      },
    ],
    tags: ["링크", "장난", "2000s", "뮤직비디오"],
  },
  {
    id: "eojjeol-tv",
    slug: "eojjeol-tv",
    title: "어쩔티비",
    kind: "community-meme",
    thumbnailUrl: "/thumbnails/eojjeol-tv.png",
    aliases: ["저쩔티비", "어쩔냉장고", "어쩔TV"],
    summary:
      "상대의 말에 장난스럽게 응수할 때 쓰이는 말장난형 커뮤니티 유행어. 변형 표현과 초기 사용례를 함께 수집 중입니다.",
    accent: "#6d28d9",
    origin: {
      status: "needs-review",
      video: {
        id: "eojjeol-tv-origin",
        platform: "unknown",
        url: "https://www.memeki.co.kr/memes/f3209c50-5fc3-49c9-8b21-eeb48dfcd870",
        title: "어쩔티비 커뮤니티 유행어",
        creator: "커뮤니티 사용례",
        uploadedAt: "2021 무렵",
        thumbnailUrl: "/thumbnails/eojjeol-tv.png",
      },
      summary:
        "특정 단일 영상보다 온라인 대화와 말장난을 통해 퍼진 표현으로, 가장 이른 공개 사용례는 아직 토론이 필요합니다.",
      evidence: [
        {
          title: "커뮤니티형 유행어",
          detail:
            "‘어쩌라고’에 가전제품 이름을 붙이는 방식으로 여러 변형이 만들어졌다고 정리돼 있습니다.",
          url: "https://www.memeki.co.kr/memes/f3209c50-5fc3-49c9-8b21-eeb48dfcd870",
        },
        {
          title: "최초 사용례 미확정",
          detail:
            "단일 창작자나 원본 게시물보다 구전·댓글 사용이 먼저였을 가능성이 있어 커뮤니티 설명과 초기 캡처 제안이 필요합니다.",
        },
      ],
      lastReviewedAt: "2026-07-16",
    },
    timeline: [
      {
        id: "eojjeol-1",
        dateLabel: "2021 무렵",
        title: "온라인 말장난으로 확산",
        description:
          "‘어쩔티비·저쩔티비’처럼 상대의 말을 받아치는 표현이 커뮤니티와 또래 대화에서 쓰입니다.",
        kind: "origin",
        sourceUrl: "https://www.memeki.co.kr/memes/f3209c50-5fc3-49c9-8b21-eeb48dfcd870",
        sourceLabel: "정리된 사용례",
      },
      {
        id: "eojjeol-2",
        dateLabel: "2021–2022",
        title: "가전제품 변형이 대중화",
        description:
          "저쩔냉장고, 어쩔에어컨처럼 끝말을 바꾸는 파생형이 방송과 소셜 미디어로 넓어집니다.",
        kind: "variation",
        sourceUrl: "https://www.memeki.co.kr/memes/f3209c50-5fc3-49c9-8b21-eeb48dfcd870",
        sourceLabel: "변형 예시",
      },
    ],
    trendingVideos: [],
    relatedVideos: [],
    tags: ["유행어", "커뮤니티", "2020s", "텍스트밈"],
  },
  {
    id: "jung-kkeok-ma",
    slug: "jung-kkeok-ma",
    title: "중꺾마",
    kind: "community-meme",
    thumbnailUrl: "/thumbnails/jung-kkeok-ma.jpg",
    aliases: ["중요한 건 꺾이지 않는 마음", "중요한 것은 꺾이지 않는 마음"],
    summary:
      "불리한 상황에서도 포기하지 않는 태도를 뜻하는 문구형 밈. e스포츠에서 시작해 스포츠와 일상 표현으로 확산됐습니다.",
    accent: "#fb8500",
    origin: {
      status: "likely",
      video: {
        id: "jung-kkeok-ma-origin",
        platform: "unknown",
        url: "https://news.nate.com/view/20221211n01413",
        title: "중요한 건 꺾이지 않는 마음",
        creator: "인터뷰 기사 제목",
        uploadedAt: "2022-10",
        thumbnailUrl: "/thumbnails/jung-kkeok-ma.jpg",
      },
      summary:
        "DRX 데프트의 인터뷰 답변을 요약한 기사·영상 제목에서 문구가 만들어졌다는 기록이 유력하며, 직접 발언과 제목을 구분해 기록합니다.",
      evidence: [
        {
          title: "인터뷰 제목에서 만들어진 문구",
          detail:
            "데프트의 답변을 바탕으로 기자가 ‘중요한 건 꺾이지 않는 마음’이라는 제목을 붙였다는 설명이 남아 있습니다.",
          url: "https://news.nate.com/view/20221211n01413",
        },
        {
          title: "월드컵을 통한 대중화",
          detail:
            "2022 카타르 월드컵에서 한국 대표팀이 문구가 적힌 태극기를 들면서 게임 팬 밖으로 크게 확산됐습니다.",
          url: "https://www.hankyung.com/article/2022120956807",
        },
      ],
      lastReviewedAt: "2026-07-16",
    },
    timeline: [
      {
        id: "jung-1",
        dateLabel: "2022. 10",
        title: "인터뷰 제목 등장",
        description:
          "경기 패배 뒤에도 팀이 무너지지 않으면 이길 수 있다는 데프트의 답변이 문구형 제목으로 정리됩니다.",
        kind: "origin",
        sourceUrl: "https://news.nate.com/view/20221211n01413",
        sourceLabel: "유래 설명",
      },
      {
        id: "jung-2",
        dateLabel: "2022. 11",
        title: "DRX 우승 서사와 결합",
        description:
          "DRX가 월드 챔피언십에서 우승하며 문구가 포기하지 않는 마음을 상징하는 밈으로 굳어집니다.",
        kind: "spread",
        sourceUrl: "https://www.hankyung.com/article/202212068022Y",
        sourceLabel: "확산 배경",
      },
      {
        id: "jung-3",
        dateLabel: "2022. 12",
        title: "월드컵과 일상 표현으로 대중화",
        description:
          "한국 축구 대표팀의 태극기 장면을 계기로 스포츠, 방송, 일상 응원 문구로 널리 사용됩니다.",
        kind: "mainstream",
        sourceUrl: "https://www.hankyung.com/article/2022120956807",
        sourceLabel: "월드컵 확산 기사",
      },
    ],
    trendingVideos: [],
    relatedVideos: [],
    tags: ["커뮤니티", "문구", "e스포츠", "2020s"],
  },
];

export function getMemeBySlug(slug: string) {
  return sampleMemes.find((meme) => meme.slug === slug);
}
