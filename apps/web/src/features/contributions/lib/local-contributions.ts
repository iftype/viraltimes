export type ProposalSection =
  | "origin"
  | "trending"
  | "related"
  | "timeline"
  | "description";

export type ProposalAction = { value: string; label: string };

export const participationUpdateEvent = "viralorigin-participation-updated";

export const proposalSectionConfig: Record<
  ProposalSection,
  {
    label: string;
    buttonLabel: string;
    eyebrow: string;
    prompt: string;
    placeholder: string;
    actions: ProposalAction[];
  }
> = {
  description: {
    label: "설명·별칭 수정",
    buttonLabel: "설명 제안",
    eyebrow: "DESCRIPTION PROPOSAL",
    prompt: "설명에서 무엇을 바꾸거나 추가할까요?",
    placeholder: "잘못된 설명, 추가할 별칭, 카테고리나 태그 변경 이유를 적어주세요.",
    actions: [
      { value: "설명 수정", label: "설명 수정" },
      { value: "별칭 추가", label: "별칭 추가" },
      { value: "카테고리·태그 변경", label: "카테고리·태그 변경" },
    ],
  },
  origin: {
    label: "현재 원본 수정",
    buttonLabel: "원본 제안",
    eyebrow: "ORIGIN PROPOSAL",
    prompt: "현재 원본 판단을 어떻게 바꾸면 좋을까요?",
    placeholder: "더 이른 원본, 업로더·날짜 수정, 원본을 뒷받침할 근거를 적어주세요.",
    actions: [
      { value: "더 이른 원본 제보", label: "더 이른 원본 제보" },
      { value: "원본 정보 수정", label: "업로더·날짜·설명 수정" },
      { value: "원본 근거 추가", label: "원본 근거 추가" },
    ],
  },
  trending: {
    label: "사용 영상·자료 수정",
    buttonLabel: "사용 자료 제안",
    eyebrow: "USED CONTENT PROPOSAL",
    prompt: "대표 사용 영상·자료 TOP 3를 어떻게 바꿀까요?",
    placeholder: "이 밈이 실제로 쓰인 영상이나 게시글 링크와 대표 자료인 이유를 적어주세요.",
    actions: [
      { value: "사용 자료 추가", label: "영상·게시글 추가" },
      { value: "사용 자료 수정", label: "자료 정보 수정" },
      { value: "사용 자료 제외", label: "관련성이 낮은 자료 제외" },
    ],
  },
  related: {
    label: "연결된 밈 수정",
    buttonLabel: "연결 밈 제안",
    eyebrow: "MEME CONNECTION PROPOSAL",
    prompt: "어떤 사전 항목을 연결하거나 제외할까요?",
    placeholder: "연결할 밈 이름과 파생·함께 사용되는 관계를 간단히 적어주세요.",
    actions: [
      { value: "연결 밈 추가", label: "연결된 밈 추가" },
      { value: "연결 관계 수정", label: "관계 설명 수정" },
      { value: "연결 밈 제외", label: "관련성이 낮은 연결 제외" },
    ],
  },
  timeline: {
    label: "타임라인 수정",
    buttonLabel: "타임라인 제안",
    eyebrow: "TIMELINE PROPOSAL",
    prompt: "확산 타임라인을 어떻게 보완할까요?",
    placeholder: "추가할 시점, 날짜나 설명의 오류, 확인 가능한 근거를 적어주세요.",
    actions: [
      { value: "사건 추가", label: "새 사건·확산 시점 추가" },
      { value: "날짜·설명 수정", label: "날짜·설명 수정" },
      { value: "타임라인 근거 추가", label: "근거 링크 추가" },
    ],
  },
};

export const proposalSectionLabels = Object.fromEntries(
  Object.entries(proposalSectionConfig).map(([key, value]) => [key, value.label]),
) as Record<ProposalSection, string>;
