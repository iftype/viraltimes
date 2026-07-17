import type { FastifyInstance } from "fastify";
import type { QuizStore } from "../quiz-store.js";
import type { QuizCard, QuizLog } from "../quiz-types.js";
import { randomUUID } from "node:crypto";

const defaultQuizCards: QuizCard[] = [
  {
    id: "quiz-1",
    title: "아라라키 코코아",
    summary: "특이한 발음과 중독성 있는 멜로디로 한국 서브컬처 커뮤니티에서 유행한 마이너 밈",
    type: "minor",
    thumbnailUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60",
    accentColor: "#fe2c55",
    originDetail: {
      creator: "일본 버추얼 유튜버",
      originYear: 2024,
      platform: "youtube",
      description: "특정 게임 방송 중 흘러나온 리액션이 국내 트위치 및 유튜브 쇼츠로 편집되어 퍼지며 뇌절과 합성의 대상이 된 대표적 마이너 밈입니다."
    }
  },
  {
    id: "quiz-2",
    title: "디토 댄스 원조 챌린지",
    summary: "뉴진스의 Ditto 뮤직비디오 댄스를 그대로 재현하며 시작된 글로벌 댄스 챌린지",
    type: "origin",
    thumbnailUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=60",
    accentColor: "#25f4ee",
    originDetail: {
      creator: "뉴진스 (NewJeans)",
      originYear: 2022,
      platform: "tiktok",
      description: "Ditto 발매 직후 안무 연습 영상과 Y2K 감성의 캠코더 연출이 틱톡에서 큰 반향을 일으키며 수많은 크리에이터들이 챌린지에 참여했습니다."
    }
  },
  {
    id: "quiz-3",
    title: "어쩔티비 저쩔티비",
    summary: "상대방의 말문이 막히게 하기 위해 가전제품 이름을 뒤에 붙여 반박하는 초등학생 마이너 밈",
    type: "minor",
    thumbnailUrl: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500&auto=format&fit=crop&q=60",
    accentColor: "#fe2c55",
    originDetail: {
      creator: "인터넷 커뮤니티",
      originYear: 2021,
      platform: "unknown",
      description: "어쩌라고와 가전제품(티비)이 합쳐져 유행했으며, 이후 쿠팡플레이 SNL 코리아 등 미디어에서 패러디되며 대중에게 널리 퍼진 밈입니다."
    }
  },
  {
    id: "quiz-4",
    title: "슬릭백 공중부양 챌린지",
    summary: "공중을 걷는 듯한 독특한 스텝으로 전 세계 2억 뷰 이상을 달성한 댄스 챌린지",
    type: "origin",
    thumbnailUrl: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=500&auto=format&fit=crop&q=60",
    accentColor: "#25f4ee",
    originDetail: {
      creator: "한국 중학생 크리에이터 (이효철)",
      originYear: 2023,
      platform: "tiktok",
      description: "해외 스케이트 스텝인 Jubi Slide를 초고속 슬라이딩 스텝으로 완벽히 재해석해 업로드한 영상이 알고리즘을 타고 글로벌 챌린지로 확대되었습니다."
    }
  },
  {
    id: "quiz-5",
    title: "홍박사님을 아세요?",
    summary: "조주봉 캐릭터의 가사와 엉덩이 댄스가 병맛 코드로 인기를 끈 소셜 플랫폼 밈",
    type: "minor",
    thumbnailUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60",
    accentColor: "#fe2c55",
    originDetail: {
      creator: "개그맨 조훈",
      originYear: 2023,
      platform: "youtube",
      description: "독특하고 뻔뻔한 멜로디의 댄스 챌린지로 인기를 얻었으나 선정성 논란과 호불호가 갈리며 특정 커뮤니티 성향을 띠게 된 마이너 밈입니다."
    }
  },
  {
    id: "quiz-6",
    title: "마라탕후루 챌린지",
    summary: "선배 맘에 탕탕 후루후루라는 킬링 파트로 엄청난 양의 챌린지 커버를 양산한 원조 댄스 곡",
    type: "origin",
    thumbnailUrl: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&auto=format&fit=crop&q=60",
    accentColor: "#25f4ee",
    originDetail: {
      creator: "크리에이터 서이브",
      originYear: 2024,
      platform: "tiktok",
      description: "중독성 있는 멜로디와 초등학생의 최애 음식인 마라탕+탕후루를 조합한 가사에 쉬운 포인트 안무가 결합되어 최단기간 메이저 챌린지로 등극했습니다."
    }
  }
];

export function registerQuizRoutes(app: FastifyInstance, quizStore: QuizStore) {
  app.get("/api/v1/quiz/cards", async (request, reply) => {
    reply.header("Cache-Control", "no-store");
    return { cards: defaultQuizCards };
  });

  app.post("/api/v1/quiz/log", async (request, reply) => {
    const body = request.body as {
      sessionId: string;
      cardId: string;
      cardType: "minor" | "origin";
      response: "know" | "dont_know" | "view_detail";
    };

    if (!body.sessionId || !body.cardId || !body.cardType || !body.response) {
      return reply.code(400).send({ error: "잘못된 데이터 형식입니다." });
    }

    const log: QuizLog = {
      id: randomUUID(),
      sessionId: body.sessionId,
      cardId: body.cardId,
      cardType: body.cardType,
      response: body.response,
      timestamp: new Date().toISOString(),
    };

    await quizStore.addLog(log);
    return { success: true };
  });

  app.get("/api/v1/quiz/stats", async (request, reply) => {
    const logs = await quizStore.getLogs();
    
    const totalLogs = logs.length;
    const byType = {
      minor: { know: 0, dont_know: 0, view_detail: 0, total: 0 },
      origin: { know: 0, dont_know: 0, view_detail: 0, total: 0 }
    };

    logs.forEach(log => {
      const type = log.cardType;
      if (byType[type]) {
        byType[type].total++;
        if (log.response === "know") byType[type].know++;
        else if (log.response === "dont_know") byType[type].dont_know++;
        else if (log.response === "view_detail") byType[type].view_detail++;
      }
    });

    reply.header("Cache-Control", "no-store");
    return {
      totalLogs,
      stats: byType
    };
  });
}
