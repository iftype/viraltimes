"use client";

import { ExternalLink, MessageCircle, ThumbsDown, ThumbsUp } from "lucide-react";
import { FormEvent, useMemo, useState, useSyncExternalStore } from "react";

import {
  getProposalSnapshot,
  makeLocalId,
  proposalSectionLabels,
  readProposals,
  type Proposal,
  subscribeToProposals,
  writeProposals,
} from "../lib/local-contributions";

export function ProposalDiscussion({ memeId }: { memeId: string }) {
  const proposalSnapshot = useSyncExternalStore(
    subscribeToProposals,
    getProposalSnapshot,
    () => "[]",
  );
  const proposals = useMemo(() => {
    try {
      return (JSON.parse(proposalSnapshot) as Proposal[])
        .filter((proposal) => proposal.memeId === memeId)
        .reverse();
    } catch {
      return [] as Proposal[];
    }
  }, [memeId, proposalSnapshot]);
  const [commentDrafts, setCommentDrafts] = useState<
    Record<string, { author: string; body: string }>
  >({});

  function updateProposal(
    proposalId: string,
    updater: (proposal: Proposal) => Proposal,
  ) {
    writeProposals(
      readProposals().map((proposal) =>
        proposal.id === proposalId ? updater(proposal) : proposal,
      ),
    );
  }

  function addComment(event: FormEvent<HTMLFormElement>, proposalId: string) {
    event.preventDefault();
    const draft = commentDrafts[proposalId];
    if (!draft?.body.trim()) return;

    updateProposal(proposalId, (proposal) => ({
      ...proposal,
      comments: [
        ...proposal.comments,
        {
          id: makeLocalId("comment"),
          author: draft.author.trim() || "익명",
          body: draft.body.trim(),
          createdAt: new Date().toISOString(),
        },
      ],
    }));
    setCommentDrafts((current) => ({
      ...current,
      [proposalId]: { author: "", body: "" },
    }));
  }

  return (
    <section className="page-shell py-14 sm:py-20" id="discussion">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black text-[#8b5cf6]">OPEN DISCUSSION</p>
            <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">
              수정 제안 토론
            </h2>
            <p className="mt-2 text-sm leading-6 text-black/45">
              제안은 곧바로 확정되지 않아요. 근거와 의견을 모은 뒤 반영합니다.
            </p>
          </div>
          <span className="rounded-full bg-[#f4efff] px-3 py-1.5 text-xs font-black text-[#7047a5]">
            토론 중 {proposals.length}
          </span>
        </div>

        {proposals.length ? (
          <div className="mt-6 space-y-4">
            {proposals.map((proposal) => {
              const draft = commentDrafts[proposal.id] ?? {
                author: "",
                body: "",
              };

              return (
                <article
                  className="rounded-2xl border border-black/5 bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.04)] sm:p-6"
                  key={proposal.id}
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                    <span className="rounded-full bg-[#fff7df] px-2.5 py-1 text-[#9a6200]">
                      토론 중
                    </span>
                    <span className="text-black/35">
                      {proposalSectionLabels[proposal.section]} · {proposal.author}
                    </span>
                  </div>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-black/70">
                    {proposal.body}
                  </p>
                  {proposal.evidenceUrl && (
                    <a
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-[#fe2c55]"
                      href={proposal.evidenceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      제안 근거
                      <ExternalLink className="size-3" aria-hidden="true" />
                    </a>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2 border-t border-black/5 pt-4">
                    <button
                      className="inline-flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-2 text-xs font-black text-black/55"
                      type="button"
                      onClick={() =>
                        updateProposal(proposal.id, (current) => ({
                          ...current,
                          agree: current.agree + 1,
                        }))
                      }
                    >
                      <ThumbsUp className="size-3.5" aria-hidden="true" /> 찬성 {proposal.agree}
                    </button>
                    <button
                      className="inline-flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-2 text-xs font-black text-black/55"
                      type="button"
                      onClick={() =>
                        updateProposal(proposal.id, (current) => ({
                          ...current,
                          disagree: current.disagree + 1,
                        }))
                      }
                    >
                      <ThumbsDown className="size-3.5" aria-hidden="true" /> 반대 {proposal.disagree}
                    </button>
                    <span className="inline-flex items-center gap-1.5 px-2 py-2 text-xs font-bold text-black/35">
                      <MessageCircle className="size-3.5" aria-hidden="true" /> 의견 {proposal.comments.length}
                    </span>
                  </div>

                  {proposal.comments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {proposal.comments.map((comment) => (
                        <div
                          className="rounded-xl bg-[#f7f7f8] px-4 py-3 text-sm"
                          key={comment.id}
                        >
                          <span className="font-black">{comment.author}</span>
                          <p className="mt-1 leading-5 text-black/55">{comment.body}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <form
                    className="mt-4 grid gap-2 sm:grid-cols-[8rem_1fr_auto]"
                    onSubmit={(event) => addComment(event, proposal.id)}
                  >
                    <input
                      className="rounded-xl border border-black/10 bg-[#f7f7f8] px-3 py-2.5 text-sm outline-none focus:border-black"
                      placeholder="닉네임"
                      value={draft.author}
                      onChange={(event) =>
                        setCommentDrafts((current) => ({
                          ...current,
                          [proposal.id]: { ...draft, author: event.target.value },
                        }))
                      }
                    />
                    <input
                      className="rounded-xl border border-black/10 bg-[#f7f7f8] px-3 py-2.5 text-sm outline-none focus:border-black"
                      placeholder="이 제안에 의견을 남겨주세요"
                      required
                      value={draft.body}
                      onChange={(event) =>
                        setCommentDrafts((current) => ({
                          ...current,
                          [proposal.id]: { ...draft, body: event.target.value },
                        }))
                      }
                    />
                    <button
                      className="rounded-xl bg-black px-4 py-2.5 text-sm font-black text-white"
                      type="submit"
                    >
                      등록
                    </button>
                  </form>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-black/10 bg-white px-6 py-10 text-center">
            <p className="text-sm font-black">아직 열린 제안이 없어요.</p>
            <p className="mt-1 text-xs leading-5 text-black/40">
              각 섹션의 ‘수정 제안’ 버튼으로 첫 토론을 시작해 보세요.
            </p>
          </div>
        )}

        <p className="mt-4 text-center text-[0.7rem] leading-5 text-black/35">
          현재 프로토타입의 제안과 토론은 이 브라우저에만 저장됩니다.
        </p>
      </div>
    </section>
  );
}
