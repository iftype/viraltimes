import type { Metadata } from "next";
import { FeedExperience } from "@/features/feed/components/feed-experience";

export const metadata: Metadata = {
  title: "유행 피드",
  description: "실시간 유행 밈과 챌린지 원본 영상 피드를 확인하세요.",
};

export default function FeedPage() {
  return <FeedExperience />;
}
