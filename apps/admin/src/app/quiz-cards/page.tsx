"use client";

import { useEffect, useState, useCallback } from "react";
import { LoaderCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { QuizCardManager, type QuizCardConfig } from "@/components/quiz-card-manager";
import type { AdminMeme } from "@/components/dictionary-manager";
import { QuizSurveyManager, type QuizSurveyQuestion } from "@/components/quiz-survey-manager";

const apiBase = "/viral/api/v1";

export default function QuizCardsPage() {
  const { setAuthenticated } = useAuth();
  const [quizCards, setQuizCards] = useState<QuizCardConfig[]>([]);
  const [memes, setMemes] = useState<AdminMeme[]>([]);
  const [surveyQuestions, setSurveyQuestions] = useState<QuizSurveyQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [cardsResponse, memeResponse, surveyResponse] = await Promise.all([
        fetch(`${apiBase}/admin/quiz/cards`, { cache: "no-store" }),
        fetch(`${apiBase}/admin/memes`, { cache: "no-store" }),
        fetch(`${apiBase}/admin/quiz/survey-questions`, { cache: "no-store" }),
      ]);

      if (cardsResponse.status === 401 || memeResponse.status === 401 || surveyResponse.status === 401) {
        setAuthenticated(false);
        return;
      }

      if (!cardsResponse.ok) throw new Error("퀴즈 카드 데이터를 불러오지 못했습니다.");
      if (!memeResponse.ok) throw new Error("사전 데이터를 불러오지 못했습니다.");
      if (!surveyResponse.ok) throw new Error("추가 설문 데이터를 불러오지 못했습니다.");

      const cardsData = (await cardsResponse.json()) as { items: QuizCardConfig[] };
      const memeData = (await memeResponse.json()) as { items: AdminMeme[] };
      const surveyData = (await surveyResponse.json()) as { items: QuizSurveyQuestion[] };

      setQuizCards(cardsData.items || []);
      setMemes(memeData.items || []);
      setSurveyQuestions(surveyData.items || []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [setAuthenticated]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadData(), 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <LoaderCircle className="size-8 animate-spin text-black/25" />
      </div>
    );
  }

  const managerKey = quizCards.map((card) => `${card.id}:${card.updatedAt}`).join("|");
  const surveyKey = surveyQuestions.map((question) => `${question.id}:${question.updatedAt}`).join("|");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.04em]">퀴즈 설정</h1>
          <p className="text-sm text-black/45 mt-1">무작위 출제 항목의 분야 라벨과 결과 전 추가 설문을 관리합니다.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-[#fff0f3] px-4 py-3 text-xs font-bold text-[#d91d46]">
          <AlertTriangle className="size-4" />
          {error}
        </div>
      )}

      <QuizCardManager key={managerKey} items={quizCards} memes={memes} onChange={setQuizCards} />
      <QuizSurveyManager key={surveyKey} items={surveyQuestions} onChange={setSurveyQuestions} />
    </div>
  );
}
