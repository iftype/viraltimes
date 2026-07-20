import { CommentSection } from "@/features/contributions/components/comment-section";
import type { Meme } from "@/types/meme";

import { MemeDetailHeader } from "./meme-detail-header";
import { MemeDescriptionSection } from "./meme-description-section";
import { MemeRequestCta } from "./meme-request-cta";
import { OriginSection } from "./origin-section";
import { RelatedMemesSection } from "./related-memes-section";
import { TimelineSection } from "./timeline-section";
import { VideoCollectionSection } from "./video-collection-section";

export function MemeDetail({ meme, otherMemes }: { meme: Meme; otherMemes: Meme[] }) {
  return (
    <article>
      <MemeDetailHeader meme={meme} />
      <OriginSection meme={meme} />
      <MemeDescriptionSection meme={meme} />
      <VideoCollectionSection meme={meme} type="trending" />
      <TimelineSection meme={meme} />
      <CommentSection memeId={meme.id} memeTitle={meme.title} />
      <RelatedMemesSection meme={meme} memes={otherMemes} />
      <MemeRequestCta />
    </article>
  );
}
