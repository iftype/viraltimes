"use client";

import { LoaderCircle, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";

export type QuizSurveyQuestion = {
  id: string;
  prompt: string;
  required: boolean;
  multiple?: boolean;
  sortOrder: number;
  updatedAt: string;
  options: { id: string; label: string }[];
};

function draftId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function QuizSurveyManager({ items, onChange }: { items: QuizSurveyQuestion[]; onChange: (items: QuizSurveyQuestion[]) => void }) {
  const [drafts, setDrafts] = useState(items);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  function patchQuestion(index: number, value: Partial<QuizSurveyQuestion>) {
    setDrafts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...value } : item));
  }

  function patchOption(questionIndex: number, optionIndex: number, label: string) {
    setDrafts((current) => current.map((question, currentQuestionIndex) => currentQuestionIndex === questionIndex
      ? { ...question, options: question.options.map((option, currentOptionIndex) => currentOptionIndex === optionIndex ? { ...option, label } : option) }
      : question));
  }

  async function save() {
    setSaving(true);
    setNotice("");
    try {
      const response = await fetch("/viral/api/v1/admin/quiz/survey-questions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: drafts }),
      });
      const data = (await response.json()) as { items?: QuizSurveyQuestion[]; error?: string };
      if (!response.ok || !data.items) throw new Error(data.error ?? "설문을 저장하지 못했습니다.");
      setDrafts(data.items);
      onChange(data.items);
      setNotice("추가 설문을 저장했습니다.");
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : "설문을 저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  const invalid = drafts.some((question) => question.prompt.trim().length < 3 || question.options.length < 2 || question.options.some((option) => !option.label.trim()));

  return (
    <section className="rounded-3xl border border-black/5 bg-white p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black text-[#fe2c55]">EXTRA SURVEY</p>
          <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">추가 설문 관리</h2>
          <p className="mt-1 text-xs leading-5 text-black/40">퀴즈 카드가 끝난 뒤 표시할 객관식 문항을 최대 5개까지 추가합니다. 선택 문항은 건너뛸 수 있습니다.</p>
        </div>
        <button className="flex cursor-pointer items-center gap-1.5 rounded-full bg-black px-4 py-2.5 text-xs font-black text-white disabled:opacity-35" disabled={drafts.length >= 5} onClick={() => setDrafts((current) => [...current, { id: draftId("question"), prompt: "", required: false, sortOrder: current.length, updatedAt: "", options: [{ id: draftId("option"), label: "" }, { id: draftId("option"), label: "" }] }])} type="button">
          <Plus className="size-3.5" />문항 추가
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {drafts.map((question, questionIndex) => (
          <article className="rounded-2xl bg-[#f7f7f8] p-4" key={question.id}>
            <div className="flex items-start gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-black text-xs font-black text-white">{questionIndex + 1}</span>
              <label className="min-w-0 flex-1 text-xs font-black text-black/45">질문
                <input className="mt-1 w-full rounded-xl border border-black/5 bg-white px-3 py-2.5 text-sm font-bold outline-none" maxLength={160} onChange={(event) => patchQuestion(questionIndex, { prompt: event.target.value })} placeholder="예: 이 서비스를 다시 이용할 의향이 있나요?" value={question.prompt} />
              </label>
              <button aria-label="문항 삭제" className="mt-5 cursor-pointer rounded-lg bg-[#fff0f3] p-2 text-[#d91d46]" onClick={() => setDrafts((current) => current.filter((_, index) => index !== questionIndex))} type="button"><Trash2 className="size-4" /></button>
            </div>
            <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs font-bold text-black/55">
              <input checked={question.required} onChange={(event) => patchQuestion(questionIndex, { required: event.target.checked })} type="checkbox" /> 필수 응답
            </label>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {question.options.map((option, optionIndex) => (
                <div className="flex gap-1" key={option.id}>
                  <input aria-label={`선택지 ${optionIndex + 1}`} className="min-w-0 flex-1 rounded-xl border border-black/5 bg-white px-3 py-2.5 text-sm font-bold outline-none" maxLength={80} onChange={(event) => patchOption(questionIndex, optionIndex, event.target.value)} placeholder={`선택지 ${optionIndex + 1}`} value={option.label} />
                  <button aria-label={`선택지 ${optionIndex + 1} 삭제`} className="cursor-pointer rounded-lg bg-white p-2 text-black/35 disabled:opacity-25" disabled={question.options.length <= 2} onClick={() => patchQuestion(questionIndex, { options: question.options.filter((_, index) => index !== optionIndex) })} type="button"><Trash2 className="size-4" /></button>
                </div>
              ))}
            </div>
            <button className="mt-2 flex cursor-pointer items-center gap-1 text-xs font-black text-black/45 disabled:opacity-30" disabled={question.options.length >= 6} onClick={() => patchQuestion(questionIndex, { options: [...question.options, { id: draftId("option"), label: "" }] })} type="button"><Plus className="size-3.5" />선택지 추가</button>
          </article>
        ))}
        {drafts.length === 0 && <p className="rounded-2xl bg-[#f7f7f8] p-8 text-center text-sm font-bold text-black/35">추가 설문이 없습니다. 퀴즈가 끝나면 바로 결과가 표시됩니다.</p>}
      </div>
      <button className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#fe2c55] px-5 py-3 text-sm font-black text-white disabled:opacity-40" disabled={saving || invalid} onClick={() => void save()} type="button">{saving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}{saving ? "저장 중" : "추가 설문 저장"}</button>
      {notice && <p className="mt-3 text-center text-xs font-bold text-black/45">{notice}</p>}
    </section>
  );
}
