"use client";

import { useState, useRef, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";
import { Play, Check, X } from "lucide-react";
import { Card } from "@origin/ui";

interface QuizCardData {
  id: string;
  slug: string;
  title: string;
  summary: string;
  type: "minor" | "origin";
  thumbnailUrl?: string;
  accentColor?: string;
  field?: string;
  originDetail: {
    creator?: string;
    originYear?: number;
    platform?: string;
    description: string;
  };
}

interface QuizCardProps {
  card: QuizCardData;
  active: boolean;
  onSwipe: (direction: "left" | "right") => void;
  onViewDetail: () => void;
}

export function QuizCard({ card, active, onSwipe, onViewDetail }: QuizCardProps) {
  const [dragState, setDragState] = useState({
    isDragging: false,
    startX: 0,
    offsetX: 0,
  });
  const [fledDirection, setFledDirection] = useState<"left" | "right" | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!active && !fledDirection) return null;

  const handleStart = (clientX: number) => {
    if (!active || fledDirection) return;
    setDragState({
      isDragging: true,
      startX: clientX,
      offsetX: 0,
    });
  };

  const handleMove = (clientX: number) => {
    if (!dragState.isDragging) return;
    const offsetX = clientX - dragState.startX;
    setDragState((prev) => ({ ...prev, offsetX }));
  };

  const handleEnd = () => {
    if (!dragState.isDragging) return;
    const threshold = 120; // 스와이프 인정 임계치 (px)

    if (dragState.offsetX > threshold) {
      // 오른쪽 스와이프 (KNOW)
      triggerFlee("right");
    } else if (dragState.offsetX < -threshold) {
      // 왼쪽 스와이프 (NO)
      triggerFlee("left");
    } else {
      // 제자리 복귀
      setDragState({
        isDragging: false,
        startX: 0,
        offsetX: 0,
      });
    }
  };

  const triggerFlee = (direction: "left" | "right") => {
    setFledDirection(direction);
    setDragState((prev) => ({ ...prev, isDragging: false }));
    setTimeout(() => {
      onSwipe(direction);
    }, 300); // 날아가는 애니메이션 재생 후 이벤트 발생
  };

  // 마우스 핸들러
  const onMouseDown = (e: ReactMouseEvent) => {
    // 버튼이나 아이콘 클릭 시 드래그 방지
    if ((e.target as HTMLElement).closest("button")) return;
    handleStart(e.clientX);
  };

  const onMouseMove = (e: ReactMouseEvent) => {
    handleMove(e.clientX);
  };

  const onMouseUp = () => {
    handleEnd();
  };

  // 터치 핸들러
  const onTouchStart = (e: ReactTouchEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    const touch = e.touches[0];
    handleStart(touch.clientX);
  };

  const onTouchMove = (e: ReactTouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientX);
  };

  const onTouchEnd = () => {
    handleEnd();
  };

  // 계산 값들
  const { offsetX, isDragging } = dragState;
  const rotation = offsetX * 0.08; // 기울기 계산
  const scale = isDragging ? 1.02 : 1;

  // 날아간 상태 스타일 계산
  let transformStyle = "";
  if (fledDirection === "right") {
    transformStyle = "translate3d(1000px, 0, 0) rotate(45deg)";
  } else if (fledDirection === "left") {
    transformStyle = "translate3d(-1000px, 0, 0) rotate(-45deg)";
  } else {
    transformStyle = `translate3d(${offsetX}px, 0, 0) rotate(${rotation}deg) scale(${scale})`;
  }

  // 스티커 투명도 (임계치로 나아가는 비율)
  const stickerOpacity = Math.min(Math.abs(offsetX) / 100, 1);
  const isRightSticker = offsetX > 10;
  const isLeftSticker = offsetX < -10;

  return (
    <div
      ref={cardRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        transform: transformStyle,
        transition: isDragging ? "none" : "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)",
        touchAction: "none",
        zIndex: active ? 10 : 1,
      }}
      className={`absolute h-full w-full max-w-[340px] select-none cursor-grab active:cursor-grabbing sm:aspect-[3/4.5] sm:h-auto ${
        !active ? "pointer-events-none opacity-40 scale-95" : ""
      }`}
    >
      <Card className="flex h-full w-full flex-col overflow-hidden rounded-[var(--vo-radius-lg)] border border-neutral-200/60 bg-white p-0 shadow-xl">

        {/* 카드 미디어/썸네일 영역 */}
        <div className="relative h-[39%] w-full shrink-0 overflow-hidden border-b border-neutral-100 bg-neutral-100 sm:h-auto sm:aspect-[4/3]">
          {card.thumbnailUrl ? <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={card.thumbnailUrl} alt={`${card.title} 대표 장면`} className="w-full h-full object-cover pointer-events-none" />
          </> : <div aria-label={`${card.title} 썸네일 없음`} className="absolute inset-0" role="img" style={{ background: `radial-gradient(circle at 30% 25%, ${card.accentColor ?? "#fe2c55"}88, transparent 48%), #111` }} />}

          {/* 카드 타입 뱃지 */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full text-white shadow-sm ${
              card.type === "minor"
                ? "bg-[var(--vo-color-brand)]"
                : "bg-[var(--vo-color-signal)] text-neutral-900"
            }`}>
              {card.type === "minor" ? "마이너 밈" : "원조 챌린지"}
            </span>
            {card.field && <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-black shadow-sm">{card.field}</span>}
          </div>

          {/* 스와이프 상태 오버레이 스티커 */}
          {isRightSticker && (
            <div
              style={{ opacity: stickerOpacity }}
              className="absolute top-8 right-6 border-4 border-emerald-500 text-emerald-500 font-black text-3xl px-3 py-1 rounded-lg uppercase tracking-wider rotate-12 pointer-events-none flex items-center gap-1 bg-white/90  shadow-md"
            >
              <Check size={28} className="stroke-[3]" /> KNOW
            </div>
          )}
          {isLeftSticker && (
            <div
              style={{ opacity: stickerOpacity }}
              className="absolute top-8 left-6 border-4 border-rose-500 text-rose-500 font-black text-3xl px-3 py-1 rounded-lg uppercase tracking-wider -rotate-12 pointer-events-none flex items-center gap-1 bg-white/90  shadow-md"
            >
              <X size={28} className="stroke-[3]" /> NO
            </div>
          )}
        </div>

        {/* 설명 및 콘텐츠 영역 */}
        <div className="flex min-h-0 flex-1 flex-col justify-between p-4 sm:p-5">
          <div className="space-y-2.5">
            <h2 className="text-lg font-extrabold leading-snug tracking-tight text-neutral-900 sm:text-xl">
              {card.title}
            </h2>
            <p className="line-clamp-2 text-sm font-medium leading-relaxed text-neutral-500 sm:line-clamp-3">
              {card.summary}
            </p>
          </div>

          {/* 아래 버튼 (상세 정보 보기) */}
          <div className="mt-auto pt-2 sm:pt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetail();
              }}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--vo-radius-md)] bg-black px-4 py-2.5 text-sm font-black text-white shadow-sm transition-all duration-200 hover:scale-[1.01] hover:bg-black/85 active:scale-[0.99] sm:py-3.5"
            >
              <Play className="fill-current" size={16} />
              영상 보러 가기
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
