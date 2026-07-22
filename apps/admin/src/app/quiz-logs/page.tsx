"use client";

import { useEffect, useState, useCallback } from "react";
import { LoaderCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { QuizLogManager, type QuizLog, type QuizSurveyAnswer, type QuizSurveySubmission } from "@/components/quiz-log-manager";
import type { QuizSurveyQuestion } from "@/components/quiz-survey-manager";
import type { AdminMeme } from "@/components/dictionary-manager";

const apiBase = "/viral/api/v1";

export default function QuizLogsPage() {
  const { setAuthenticated } = useAuth();
  const [quizLogs, setQuizLogs] = useState<QuizLog[]>([]);
  const [memes, setMemes] = useState<AdminMeme[]>([]);
  const [surveyAnswers, setSurveyAnswers] = useState<QuizSurveyAnswer[]>([]);
  const [surveySubmissions, setSurveySubmissions] = useState<QuizSurveySubmission[]>([]);
  const [surveyQuestions, setSurveyQuestions] = useState<QuizSurveyQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [logsResponse, memeResponse] = await Promise.all([
        fetch(`${apiBase}/admin/quiz/logs`, { cache: "no-store" }),
        fetch(`${apiBase}/admin/memes`, { cache: "no-store" }),
      ]);

      if (logsResponse.status === 401 || memeResponse.status === 401) {
        setAuthenticated(false);
        return;
      }

      if (!logsResponse.ok) throw new Error("퀴즈 로그 데이터를 불러오지 못했습니다.");
      if (!memeResponse.ok) throw new Error("사전 데이터를 불러오지 못했습니다.");

      const logsData = (await logsResponse.json()) as { items: QuizLog[]; surveyAnswers?: QuizSurveyAnswer[]; surveySubmissions?: QuizSurveySubmission[]; surveyQuestions?: QuizSurveyQuestion[] };
      const memeData = (await memeResponse.json()) as { items: AdminMeme[] };

      setQuizLogs(logsData.items || []);
      setSurveyAnswers(logsData.surveyAnswers || []);
      setSurveySubmissions(logsData.surveySubmissions || []);
      setSurveyQuestions(logsData.surveyQuestions || []);
      setMemes(memeData.items || []);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.04em]">매치 로그</h1>
          <p className="text-sm text-black/45 mt-1">참여자들이 진행한 퀴즈 기록과 각 단계별 도달 퍼널 로그를 확인합니다.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-[#fff0f3] px-4 py-3 text-xs font-bold text-[#d91d46]">
          <AlertTriangle className="size-4" />
          {error}
        </div>
      )}

      <QuizLogManager logs={quizLogs} surveyAnswers={surveyAnswers} surveySubmissions={surveySubmissions} surveyQuestions={surveyQuestions} memes={memes} onChange={setQuizLogs} onSurveyAnswersChange={setSurveyAnswers} onSurveySubmissionsChange={setSurveySubmissions} />
    </div>
  );
}
