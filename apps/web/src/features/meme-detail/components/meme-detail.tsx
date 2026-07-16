import { ProposalDiscussion } from "@/features/contributions/components/proposal-discussion";
import { CommentSection } from "@/features/contributions/components/comment-section";
import type { Meme } from "@/types/meme";

import { MemeDetailHeader } from "./meme-detail-header";
import { OriginSection } from "./origin-section";
import { RelatedMemesSection } from "./related-memes-section";
import { TimelineSection } from "./timeline-section";
import { VideoCollectionSection } from "./video-collection-section";

export function MemeDetail({ meme, otherMemes }: { meme: Meme; otherMemes: Meme[] }) {
  return (
    <article>
      <MemeDetailHeader meme={meme} />
      <OriginSection meme={meme} />
      <VideoCollectionSection meme={meme} type="trending" />
      <VideoCollectionSection meme={meme} type="related" />
      <TimelineSection meme={meme} />
      <CommentSection memeId={meme.id} memeTitle={meme.title} />
      <ProposalDiscussion memeId={meme.id} />
      <RelatedMemesSection memes={otherMemes} />
    </article>
  );
}
