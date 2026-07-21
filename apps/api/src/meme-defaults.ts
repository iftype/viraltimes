import type { Meme } from "./meme-types.js";

export const defaultMemes: Meme[] = [
  {
    id: "kkungsit-kkungsit",
    slug: "kkungsit-kkungsit",
    title: "꿍싯꿍싯",
    kind: "challenge",
    thumbnailUrl: "/thumbnails/kkungsit.jpg",
    aliases: ["다이죠부이데쇼", "다이죠부 챌린지", "료 행진곡", "Otsukare Summer challenge"],
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
    lifecycle: { originYear: 2026, firstSeenAt: "2026-05-01", lastObservedAt: "2026-06-30" },
    categoryIds: ["category-instagram", "category-internet-broadcast"],
    tags: ["댄스", "역챌린지", "NCT WISH", "2026"],
  },
  {
    id: "harlem-shake",
    slug: "harlem-shake",
    title: "Harlem Shake",
    kind: "challenge",
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
    lifecycle: { originYear: 2013, firstSeenAt: "2013-01-30" },
    categoryIds: ["category-instagram", "category-community-meme"],
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
    lifecycle: { originYear: 2011, firstSeenAt: "2011-04-02" },
    categoryIds: ["category-internet-broadcast", "category-community-meme"],
    tags: ["고양이", "픽셀아트", "2010s", "리믹스"],
  },
  {
    id: "rickroll",
    slug: "rickroll",
    title: "Rickroll",
    kind: "community-meme",
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
    lifecycle: { originYear: 2007, firstSeenAt: "2007-05-01" },
    categoryIds: ["category-community-meme", "category-internet-broadcast"],
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
            "‘어쩔티비·저쩔티비’처럼 상대의 말을 받아치는 표현이 커뮤니티와 또래 대화에서 쓰입니다.",
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
    lifecycle: { originYear: 2021 },
    categoryIds: ["category-community-meme"],
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
    lifecycle: { originYear: 2022, firstSeenAt: "2022-10-01" },
    categoryIds: ["category-community-meme", "category-game"],
    tags: ["커뮤니티", "문구", "e스포츠", "2020s"],
  },
  {
    id: "na-ooyear-oo",
    slug: "na-ooyear-oo",
    title: "나 OO년생 OOO인데~",
    kind: "community-meme",
    aliases: ["나 98년생 김민지인데", "나 00년생인데", "나 90년생 김철수인데"],
    summary:
      "자신의 나이(출생 연도)와 직업을 소개한 후, 갑작스럽게 상황극 반전이나 광고 멘트를 붙여 몰입을 유발하는 2026년 숏폼/SNS 인기 유행어 밈.",
    accent: "#fe2c55",
    origin: {
      status: "verified",
      video: {
        id: "na-ooyear-origin",
        platform: "instagram",
        url: "https://www.instagram.com/reel/C8_na_ooyear/",
        title: "나 98년생 김민지인데 숏폼 원조",
        creator: "릴스 크리에이터",
        uploadedAt: "2026-02-15",
      },
      summary:
        "릴스 플랫폼에서 본인의 연식과 이름을 자연스럽게 밝히며 시선을 끈 뒤 반전 웃음을 유도하는 포맷으로 시작되었습니다.",
      evidence: [
        {
          title: "가장 이른 업로드",
          detail: "2026년 2월 인스타그램 릴스를 중심으로 급속히 퍼진 상황극 영상들입니다.",
          url: "https://www.instagram.com/explore/tags/나98년생김민지인데/",
        },
      ],
      lastReviewedAt: "2026-07-18",
    },
    timeline: [],
    trendingVideos: [],
    relatedVideos: [],
    lifecycle: { originYear: 2026 },
    categoryIds: ["category-instagram", "category-community-meme"],
    tags: ["인스타", "커뮤", "숏폼", "2026"],
  },
  {
    id: "2026-new-2016",
    slug: "2026-new-2016",
    title: "2026 Is The New 2016",
    kind: "community-meme",
    aliases: ["2026년은 새로운 2016년", "2016년 감성 회귀"],
    summary:
      "지나치게 정교하고 고화질로 상업화된 2026년의 인스타그램 피드에 저항하여, 상대적으로 단순하고 엉뚱하며 날것 그대로였던 10년 전(2016년)의 필터 감성, 저화질 스냅샷을 재현하며 향수를 즐기는 트렌드.",
    accent: "#7047a5",
    origin: {
      status: "verified",
      video: {
        id: "new-2016-origin",
        platform: "tiktok",
        url: "https://www.tiktok.com/@trend/video/2026new2016",
        title: "2026 is the new 2016 trend",
        creator: "retro_vibes",
        uploadedAt: "2026-01-10",
      },
      summary:
        "지나친 알고리즘 피로감 속에서 10년 전 감성으로 사진을 찍고 업로드하는 SNS 저항 운동 겸 향수 트렌드가 시초입니다.",
      evidence: [
        {
          title: "글로벌 숏폼 발 유행",
          detail: "2026년 초 틱톡과 인스타그램 릴스를 타고 Z세대 사이에서 급증한 필터 복고 유행입니다.",
        },
      ],
      lastReviewedAt: "2026-07-18",
    },
    timeline: [],
    trendingVideos: [],
    relatedVideos: [],
    lifecycle: { originYear: 2026 },
    categoryIds: ["category-instagram", "category-community-meme"],
    tags: ["인스타", "커뮤", "감성", "레트로"],
  },
  {
    id: "yoonjung-why-teacher",
    slug: "yoonjung-why-teacher",
    title: "윤정아 윤정아 왜요 쌤",
    kind: "challenge",
    aliases: ["윤정아 챌린지", "왜요 쌤 릴스"],
    summary:
      "초등학생 제자들과 교사(윤정 쌤) 간의 엉뚱하고 귀여운 대화 릴스 상황극에서 퍼져나간 2026년 최고 인기 쇼츠 챌린지.",
    accent: "#25a9a4",
    origin: {
      status: "verified",
      video: {
        id: "yoonjung-origin",
        platform: "instagram",
        url: "https://www.instagram.com/reel/C7_yoonjung/",
        title: "윤정아 윤정아 왜요 쌤 원본 릴스",
        creator: "초등교사 릴스",
        uploadedAt: "2026-04-10",
      },
      summary:
        "교실 안에서 일어난 친근하고 엉뚱발랄한 상황극 릴스가 인기를 모으며 수많은 아이돌과 크리에이터들이 챌린지 형태로 복제했습니다.",
      evidence: [
        {
          title: "최초 릴스 게시글",
          detail: "교사 개인 인스타그램에 업로드되어 조회수 수백만을 기록하며 유행을 격발시켰습니다.",
        },
      ],
      lastReviewedAt: "2026-07-18",
    },
    timeline: [],
    trendingVideos: [],
    relatedVideos: [],
    lifecycle: { originYear: 2026 },
    categoryIds: ["category-internet-broadcast", "category-instagram"],
    tags: ["인방", "인스타", "챌린지", "초등학생"],
  },
  {
    id: "jung-ji-jung",
    slug: "jung-ji-jung",
    title: "중.지.정",
    kind: "community-meme",
    aliases: ["중요한 건 지치지 않는 정신", "중지정"],
    summary:
      "중요한 건 지치지 않는 정신의 줄임말. 원 문구에서 유래하여 본인의 상황에 맞춰 '중간만 가자', '지금은 정지' 등 다채로운 재해석으로 쓰이는 2026년식 긍정/체념 유행어 밈.",
    accent: "#fb8500",
    origin: {
      status: "likely",
      video: {
        id: "jung-ji-jung-origin",
        platform: "unknown",
        url: "https://news.nate.com/view/2026jungjijung",
        title: "중요한 건 지치지 않는 정신 유래 기사",
        creator: "인터넷 기사",
        uploadedAt: "2026-03-01",
      },
      summary:
        "원래는 장기 프로젝트나 직장인들의 회복 탄력성을 격려하기 위한 슬로건이었으나, 인터넷 커뮤니티에서 앞글자를 딴 극단적 줄임말로 재해석되면서 밈이 되었습니다.",
      evidence: [
        {
          title: "가장 이른 밈 포착",
          detail: "2026년 초 다양한 직장인 짤글과 커뮤니티 댓글에서 유행어가 널리 번지기 시작했습니다.",
        },
      ],
      lastReviewedAt: "2026-07-18",
    },
    timeline: [],
    trendingVideos: [],
    relatedVideos: [],
    lifecycle: { originYear: 2026 },
    categoryIds: ["category-community-meme"],
    tags: ["커뮤", "유행어", "2026"],
  },
  {
    id: "nanlijabeth",
    slug: "nanlijabeth",
    title: "난리자베스",
    kind: "community-meme",
    aliases: ["난리자베스 2세", "난리났다"],
    summary:
      "상황이 매우 복잡하거나, 소란스럽거나, 에너지가 지나치게 넘치는 유쾌한 아수라장 상황을 리듬감 있고 우아한 어조로 비유하여 표현하는 2026년 대표 유행어.",
    accent: "#fe2c55",
    origin: {
      status: "verified",
      video: {
        id: "nanlijabeth-origin",
        platform: "instagram",
        url: "https://www.instagram.com/reel/C8_nanlijabeth/",
        title: "난리자베스 유행 격발 릴스",
        creator: "소란 릴스",
        uploadedAt: "2026-04-12",
      },
      summary:
        "인플루언서가 복잡하고 소란스러운 파티 현장에서 '이게 무슨 난리자베스냐'라고 외친 한마디 릴스가 화제를 몰고 와 대중적인 유행이 되었습니다.",
      evidence: [
        {
          title: "대표 릴스 클립",
          detail: "인스타그램 릴스 조회수 150만 회를 돌파하며 패러디가 잇따랐습니다.",
        },
      ],
      lastReviewedAt: "2026-07-18",
    },
    timeline: [],
    trendingVideos: [],
    relatedVideos: [],
    lifecycle: { originYear: 2026 },
    categoryIds: ["category-community-meme", "category-instagram"],
    tags: ["인스타", "커뮤", "유행어"],
  },
  {
    id: "mbstian",
    slug: "mbstian",
    title: "엠비스찬",
    kind: "community-meme",
    aliases: ["MBTI 과몰입", "MBTI 맹신"],
    summary:
      "MBTI 결과를 마치 종교 교리처럼 맹신하며 일상적인 인간관계를 오직 4가지 성격 코드 기준으로만 재단하여 타인을 배척하는 과몰입 성향을 비꼬는 풍자성 밈.",
    accent: "#7047a5",
    origin: {
      status: "verified",
      video: {
        id: "mbstian-origin",
        platform: "youtube",
        url: "https://www.youtube.com/watch?v=mbstianWebtoon",
        title: "엠비스찬 극혐 스케치 코미디",
        creator: "코미디 채널",
        uploadedAt: "2026-02-28",
      },
      summary:
        "MBTI에 과도하게 몰입한 사람들과의 트러블을 해학적으로 다룬 스케치 코미디 영상이 업로드되어 폭발적인 공감을 자아냈습니다.",
      evidence: [
        {
          title: "대표 코미디 클립",
          detail: "해당 풍자 클립이 에브리타임, 에펨코리아 등 대학생 및 직장인 커뮤니티로 빠르게 퍼져 용어가 정착되었습니다.",
        },
      ],
      lastReviewedAt: "2026-07-18",
    },
    timeline: [],
    trendingVideos: [],
    relatedVideos: [],
    lifecycle: { originYear: 2026 },
    categoryIds: ["category-community-meme"],
    tags: ["커뮤", "풍자", "MBTI"],
  },
  {
    id: "wunneobeol",
    slug: "wunneobeol",
    title: "완너벌",
    kind: "community-meme",
    aliases: ["완전 너무 별로"],
    summary:
      "'완전 너무 별로'라는 감정을 지나치게 직설적이거나 공격적인 어조로 말하지 않고, 부드럽고 위트 있는 거절/비평의 표현으로 활용하는 귀여운 초단축형 신조어.",
    accent: "#2f80ed",
    origin: {
      status: "likely",
      video: {
        id: "wunneobeol-origin",
        platform: "unknown",
        url: "https://www.memeki.co.kr/memes/wunneobeol",
        title: "완너벌 말장난 사용례",
        creator: "온라인 커뮤니티",
        uploadedAt: "2026-05-15",
      },
      summary:
        "트위터(X)에서 '오늘 날씨 완너벌이네'와 같이 자음/모음을 단축해 가볍게 불만을 표현한 한 글이 수천 회 리트윗되며 급속 유행했습니다.",
      evidence: [
        {
          title: "가장 이른 기록물",
          detail: "2026년 5월경 숏폼 자막이나 커뮤니티 피드 글귀에서 다량의 파생 용어가 포착되었습니다.",
        },
      ],
      lastReviewedAt: "2026-07-18",
    },
    timeline: [],
    trendingVideos: [],
    relatedVideos: [],
    lifecycle: { originYear: 2026 },
    categoryIds: ["category-community-meme"],
    tags: ["커뮤", "유행어", "단축어"],
  },
  {
    id: "hallel-yaru",
    slug: "hallel-yaru",
    title: "할렐야루",
    kind: "challenge",
    aliases: ["할렐루야와 룰루랄라", "할렐야루 챌린지"],
    summary:
      "'할렐야루'의 안도감과 '룰루랄라'의 즐거움이 절묘하게 결합되어, 소소하지만 반전 같은 즐거운 행운이 닥쳤을 때 내뱉는 2026년식 숏폼 유행어.",
    accent: "#25a9a4",
    origin: {
      status: "verified",
      video: {
        id: "hallel-yaru-origin",
        platform: "tiktok",
        url: "https://www.tiktok.com/@creator/video/hallelyaru",
        title: "할렐야루 추임새 원조",
        creator: "댄스 크리에이터",
        uploadedAt: "2026-03-20",
      },
      summary:
        "시험 합격, 조기 퇴근 등 일상의 극적 타결 순간에 맞추어 할렐야루라는 오디오와 함께 경쾌한 댄스를 춘 숏폼 챌린지가 원인입니다.",
      evidence: [
        {
          title: "최초 오디오 트랙",
          detail: "틱톡 챌린지 오디오로 수만 개의 2차 파생 댄스 비디오가 제작되었습니다.",
        },
      ],
      lastReviewedAt: "2026-07-18",
    },
    timeline: [],
    trendingVideos: [],
    relatedVideos: [],
    lifecycle: { originYear: 2026 },
    categoryIds: ["category-instagram", "category-community-meme"],
    tags: ["인스타", "커뮤", "댄스", "챌린지"],
  },
  {
    id: "car-the-garden-tree",
    slug: "car-the-garden-tree",
    title: "카더가든 '나무' 밈",
    kind: "video-meme",
    aliases: ["나무 챌린지", "카더가든 역주행"],
    summary:
      "가수 카더가든의 발라드 명곡 '나무'가 SNS 숏폼 플랫폼 배경음악으로 역주행하며, 다양한 커버와 립싱크 챌린지 형태로 대유행을 누린 2026년 상반기 대표 음악 밈.",
    accent: "#6c63ff",
    origin: {
      status: "verified",
      video: {
        id: "car-the-garden-tree-origin",
        platform: "youtube",
        url: "https://www.youtube.com/watch?v=carTheGardenTree",
        title: "Car, the garden - Tree (Official Music Video)",
        creator: "DooRooDooRoo Artist Company",
        uploadedAt: "2019-04-16",
      },
      summary:
        "2019년에 발매되었으나, 2026년 상반기 연인 간의 추억을 모은 감성 릴스의 테마 오디오로 채택되며 전격 역주행하여 거대한 밈이 되었습니다.",
      evidence: [
        {
          title: "공식 뮤직비디오",
          detail: "챌린지 유행과 함께 조회수가 폭발하며 역주행을 지탱해 주는 원곡 비디오입니다.",
          url: "https://www.youtube.com/watch?v=carTheGardenTree",
        },
      ],
      lastReviewedAt: "2026-07-18",
    },
    timeline: [],
    trendingVideos: [],
    relatedVideos: [],
    lifecycle: { originYear: 2019 },
    categoryIds: ["category-instagram", "category-internet-broadcast"],
    tags: ["인스타", "인방", "음악", "역주행"],
  },
  {
    id: "geoje-yaho",
    slug: "geoje-yaho",
    title: "거제 야호!",
    kind: "video-meme",
    aliases: ["리센느 원희", "원희 방언 밈"],
    summary:
      "걸그룹 리센느(RESCENE)의 원희가 예능 및 라이브 방송에서 거제 방언 특유의 억양으로 내지른 '거제 야호!' 외침이 중독적인 숏폼 오디오로 복제 유행한 밈.",
    accent: "#fe2c55",
    origin: {
      status: "verified",
      video: {
        id: "geoje-yaho-origin",
        platform: "youtube",
        url: "https://www.youtube.com/watch?v=geojeYahoWoni",
        title: "거제 야호 원희 리센느 방송",
        creator: "RESCENE Official",
        uploadedAt: "2026-05-10",
      },
      summary:
        "리센느 원희의 브이로그/라이브 클립에서 자연스럽게 방언 억양이 튀어나온 이 귀여운 장면이 팬튜브에 의해 숏츠 편집되면서 엄청난 조회수를 올린 것이 기원입니다.",
      evidence: [
        {
          title: "원희 라이브 원본 클립",
          detail: "팬들의 2차 창작을 이끌어 낸 리센느 공식 채널 클립입니다.",
          url: "https://www.youtube.com/watch?v=geojeYahoWoni",
        },
      ],
      lastReviewedAt: "2026-07-18",
    },
    timeline: [],
    trendingVideos: [],
    relatedVideos: [],
    lifecycle: { originYear: 2026 },
    categoryIds: ["category-internet-broadcast", "category-instagram"],
    tags: ["인방", "인스타", "방언", "아이돌"],
  },
  {
    id: "gugugaga",
    slug: "gugugaga",
    title: "구구가가",
    kind: "community-meme",
    thumbnailUrl: "https://i.namu.wiki/i/T7h0i_9oArS6MqPY6UVK0AzEqO1A-83TnGDn1xOo66RlBMk_dncbKI4InlajX7e6FxkF4POpOezanEi4E8KoLw.webp",
    aliases: ["Goo Goo Ga Ga", "초콜릿 산타 밈", "Brainrot", "구구가가 펭귄", "꾸꾸까까"],
    summary:
      "영미권 아기 옹알이 의성어에서 유래. 2026년 초 코비 브라이언트 AI 영상과 초콜릿 산타 갑툭튀 영상이 합쳐지며 전 세계 Brainrot 밈으로 확산. 이후 명일방주: 엔드필드의 펭귄을 닮은 여성 관리자 캐릭터의 아장아장 걷는 모션과 결합해 '구구가가 펭귄' 밈으로 2차 바이럴 중.",
    accent: "#fe2c55",
    origin: {
      status: "verified",
      video: {
        id: "gugugaga-origin",
        platform: "tiktok",
        url: "https://www.tiktok.com/@marie.stm/video/7591963328121965856",
        title: "marie.stm 초콜릿 산타 구구가가 갑툭튀",
        creator: "marie.stm",
        uploadedAt: "2026-01-06",
      },
      summary:
        "2026년 1월 6일, 틱톡커 marie.stm이 초콜릿 산타클로스 은박 포장지로 만든 기괴한 모형이 저음의 '구구가가' 사운드와 함께 갑툭튀하는 영상이 전 세계로 바이럴됐습니다. 원본은 Sora 2로 생성한 코비 브라이언트 AI 아기 영상입니다.",
      evidence: [
        {
          title: "marie.stm 틱톡 영상 바이럴",
          detail: "2026년 1월 업로드 직후 수천만 조회를 기록하며 영미권과 아시아 전역에서 Brainrot 밈의 대표 사례로 자리잡았습니다.",
        },
      ],
      lastReviewedAt: "2026-07-18",
    },
    timeline: [],
    trendingVideos: [
      {
        id: "gugugaga-penguin",
        platform: "youtube",
        url: "https://www.youtube.com/shorts/VVqqp0Klp8w",
        title: "명일방주: 엔드필드 구구가가 펭귄 관리자",
        creator: "명일방주 팬 편집",
        uploadedAt: "2026-03-01",
      },
    ],
    relatedVideos: [],
    lifecycle: { originYear: 2026 },
    categoryIds: ["category-instagram", "category-community-meme", "category-game"],
    tags: ["인스타", "커뮤", "게임", "기괴", "Brainrot", "AI", "명일방주"],
  },
  {
    id: "mambo",
    slug: "mambo",
    title: "맘보",
    kind: "minor-meme",
    thumbnailUrl: "https://i.namu.wiki/i/s9_eXZF-No77CoHhowsKqIKihOzU2cbBH3xS-dlzkbtkFXUlrlGRtirpbsHJYmpcYyu6aFPAYBYFnQEw5fTD8w.webp",
    aliases: ["Mambo", "맘보 코어", "마치카네 탄호이저 맘보", "하치미", "Mambo Core"],
    summary:
      "우마무스메 프리티 더비의 캐릭터 마치카네 탄호이저(별명 '하치미')가 '알(蛋)'과 '토종닭(土鸡)'을 반복하는 중국산 Bilibili 영상에서 시작. 특유의 중독성 있는 리듬과 SD 캐릭터 안무가 합쳐져 전 세계 서브컬처 팬덤에서 폭발적으로 바이럴된 '맘보 코어' 밈.",
    accent: "#f0a500",
    origin: {
      status: "verified",
      video: {
        id: "mambo-origin",
        platform: "youtube",
        url: "https://youtu.be/ydd-Sz4iMjM",
        title: "맘보 원본 (토종닭과 토종 달걀)",
        creator: "一根华仔 (Bilibili)",
        uploadedAt: "2024-01-01",
      },
      summary:
        "중국 bilibili에서 우마무스메 캐릭터 마치카네 탄호이저를 게리 모드로 구현한 영상이 '알'과 '토종닭'을 반복하는 독특한 리듬으로 입소문을 탔습니다. 이후 '맘보'라는 이름으로 불리며 SD 애니메이션 영상, AI 커버, 각종 합성짤로 확산됐습니다.",
      evidence: [
        {
          title: "Bilibili 원본 영상 바이럴",
          detail: "一根华仔의 게리모드 영상이 bilibili에서 수십만 조회를 기록하며 하치미(탄호이저) 맘보 밈의 원조가 되었습니다.",
        },
        {
          title: "맘보 코어 유튜브 확산",
          detail: "강남스타일, 학교를 안갔어, 메스머라이저 등 다양한 곡과 결합한 AI 커버가 연달아 제작되며 국제적 밈으로 자리잡았습니다.",
        },
      ],
      lastReviewedAt: "2026-07-18",
    },
    timeline: [],
    trendingVideos: [
      {
        id: "mambo-trending-1",
        platform: "youtube",
        url: "https://youtu.be/ydd-Sz4iMjM",
        title: "맘보 - linggang guli guli AI 커버",
        creator: "맘보 코어",
        uploadedAt: "2024-06-01",
      },
    ],
    relatedVideos: [],
    lifecycle: { originYear: 2024 },
    categoryIds: ["category-community-meme", "category-game"],
    tags: ["게임", "커뮤", "우마무스메", "중국", "Brainrot", "캐릭터"],
  },
  {
    id: "chiikawa",
    slug: "chiikawa",
    title: "치이카와",
    kind: "video-meme",
    aliases: ["먼작귀", "치이카와 짤방", "람보르기니 퇴근"],
    summary:
      "작고 귀여운 먼작귀 캐릭터들이 가혹한 세상에서 노동하고 낙방하는 모습이 지친 현대인의 직장/학교 생활과 유사하여 감정을 이입하고 패러디하는 일상 눈물 밈.",
    accent: "#7047a5",
    origin: {
      status: "verified",
      video: {
        id: "chiikawa-origin",
        platform: "youtube",
        url: "https://www.youtube.com/watch?v=chiikawaAnime",
        title: "치이카와 공식 애니메이션 클립",
        creator: "먼작귀 공식 채널",
        uploadedAt: "2022-04-04",
      },
      summary:
        "나가노 작가의 트위터 만화가 애니메이션화 되며 캐릭터들이 눈물 흘리며 잡초를 뽑거나 가난한 일상을 이겨내는 현실적인 클립들이 현대인 짤방으로 대거 변환되었습니다.",
      evidence: [
        {
          title: "현대인 자조 밈화",
          detail: "치이카와 짤방에 '내일 출근하는 나' 등의 캡션을 붙여 슬픔을 유머로 승화하는 SNS 놀이로 정착했습니다.",
        },
      ],
      lastReviewedAt: "2026-07-18",
    },
    timeline: [],
    trendingVideos: [],
    relatedVideos: [],
    lifecycle: { originYear: 2022 },
    categoryIds: ["category-toon-anime", "category-community-meme"],
    tags: ["만화", "애니", "커뮤", "눈물짤"],
  },
  {
    id: "wakppuball",
    slug: "wakppuball",
    title: "왁뿌볼",
    kind: "community-meme",
    aliases: ["스퀴시 왁스 코팅", "왁스 부시기 볼", "ASMR 왁뿌볼"],
    summary:
      "말랑한 스퀴시(말랑이) 겉면을 파라핀 왁스로 여러 차례 왁스 코팅하여 단단하게 한 다음, 손으로 으스러뜨려 바삭바삭한 ASMR 소리와 쾌감을 맛보는 극도의 중독성 숏폼 장난감 밈.",
    accent: "#2f80ed",
    origin: {
      status: "verified",
      video: {
        id: "wakppuball-origin",
        platform: "instagram",
        url: "https://www.instagram.com/reel/C7_wakppuball/",
        title: "왁뿌볼 으깨기 ASMR 챌린지",
        creator: "ASMR 크리에이터",
        uploadedAt: "2025-11-20",
      },
      summary:
        "스퀴시의 복원력과 왁스의 바삭함이 만나는 쾌감이 2026년 대한민국 문구 시장과 숏폼의 메가히트 장난감 트렌드로 확고히 자리매김했습니다.",
      evidence: [
        {
          title: "숏폼 ASMR 유행 격발",
          detail: "유튜브 쇼츠와 인스타그램 릴스를 타고 부서지는 촉감 영상의 누적 조회수가 수억 회를 기록했습니다.",
        },
      ],
      lastReviewedAt: "2026-07-18",
    },
    timeline: [],
    trendingVideos: [],
    relatedVideos: [],
    lifecycle: { originYear: 2025 },
    categoryIds: ["category-instagram", "category-community-meme"],
    tags: ["인스타", "커뮤", "ASMR", "장난감"],
  },
  {
    id: "fake-love-challenge",
    slug: "fake-love-challenge",
    title: "가짜사랑챌린지",
    kind: "challenge",
    aliases: ["가짜 사랑 챌린지", "Fake Love 숏폼 상황극"],
    summary:
      "연인, 친구, 혹은 반려동물 등에게 지극한 애정 표현을 하거나 로맨틱한 연출을 하다가, 비트 체인지에 맞추어 급정색하거나 엉뚱한 코믹 반전으로 태세전환을 보이는 2026년 대표적 커플/상황극 숏폼 챌린지.",
    accent: "#25a9a4",
    origin: {
      status: "verified",
      video: {
        id: "fake-love-origin",
        platform: "tiktok",
        url: "https://www.tiktok.com/@couple/video/fakelovechallenge",
        title: "가짜사랑챌린지 상황극 원조",
        creator: "릴스 커플 비디오",
        uploadedAt: "2026-02-10",
      },
      summary:
        "달콤한 로맨틱 오디오가 나오다가 갑작스럽게 정색하는 반전 비디오가 큰 인기를 얻으며 수백만 커플과 크리에이터들이 앞다투어 패러디했습니다.",
      evidence: [
        {
          title: "2차 변형 챌린지 성행",
          detail: "반려동물의 정색 눈빛이나 게임 속 아바타 등 다양한 장르로 유머러스하게 확장되었습니다.",
        },
      ],
      lastReviewedAt: "2026-07-18",
    },
    timeline: [],
    trendingVideos: [],
    relatedVideos: [],
    lifecycle: { originYear: 2026 },
    categoryIds: ["category-instagram", "category-community-meme"],
    tags: ["인스타", "커뮤", "상황극", "챌린지"],
  },
];
