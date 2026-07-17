"use client";

import { useState, useRef, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";
import { Info, Check, X } from "lucide-react";
import { Card, Button } from "@origin/ui";

interface QuizCardData {
  id: string;
  title: string;
  summary: string;
  type: "minor" | "origin";
  thumbnailUrl: string;
  accentColor?: string;
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
    startY: 0,
    offsetX: 0,
    offsetY: 0,
  });
  const [fledDirection, setFledDirection] = useState<"left" | "right" | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!active && !fledDirection) return null;

  const handleStart = (clientX: number, clientY: number) => {
    if (!active || fledDirection) return;
    setDragState({
      isDragging: true,
      startX: clientX,
      startY: clientY,
      offsetX: 0,
      offsetY: 0,
    });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!dragState.isDragging) return;
    const offsetX = clientX - dragState.startX;
    const offsetY = clientY - dragState.startY;
    setDragState((prev) => ({ ...prev, offsetX, offsetY }));
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
        startY: 0,
        offsetX: 0,
        offsetY: 0,
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
    handleStart(e.clientX, e.clientY);
  };

  const onMouseMove = (e: ReactMouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const onMouseUp = () => {
    handleEnd();
  };

  // 터치 핸들러
  const onTouchStart = (e: ReactTouchEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const onTouchMove = (e: ReactTouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const onTouchEnd = () => {
    handleEnd();
  };

  // 계산 값들
  const { offsetX, offsetY, isDragging } = dragState;
  const rotation = offsetX * 0.08; // 기울기 계산
  const scale = isDragging ? 1.02 : 1;
  
  // 날아간 상태 스타일 계산
  let transformStyle = "";
  if (fledDirection === "right") {
    transformStyle = `translate3d(1000px, ${offsetY}px, 0) rotate(45deg)`;
  } else if (fledDirection === "left") {
    transformStyle = `translate3d(-1000px, ${offsetY}px, 0) rotate(-45deg)`;
  } else {
    transformStyle = `translate3d(${offsetX}px, ${offsetY}px, 0) rotate(${rotation}deg) scale(${scale})`;
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
      className={`absolute w-full max-w-[340px] aspect-[3/4.5] select-none cursor-grab active:cursor-grabbing ${
        !active ? "pointer-events-none opacity-40 scale-95" : ""
      }`}
    >
      <Card className="w-full h-full p-0 overflow-hidden flex flex-col border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl rounded-[var(--vo-radius-lg)]">
        
        {/* 카드 미디어/썸네일 영역 */}
        <div className="relative w-full aspect-[4/3] bg-neutral-100 dark:bg-neutral-950 overflow-hidden border-b border-neutral-100 dark:border-neutral-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.thumbnailUrl}
            alt={card.title}
            className="w-full h-full object-cover pointer-events-none"
          />
          
          {/* 카드 타입 뱃지 */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full text-white shadow-sm ${
              card.type === "minor" 
                ? "bg-[var(--vo-color-brand)]" 
                : "bg-[var(--vo-color-signal)] text-neutral-900"
            }`}>
              {card.type === "minor" ? "마이너 밈" : "원조 챌린지"}
            </span>
          </div>

          {/* 스와이프 상태 오버레이 스티커 */}
          {isRightSticker && (
            <div
              style={{ opacity: stickerOpacity }}
              className="absolute top-8 right-6 border-4 border-emerald-500 text-emerald-500 font-black text-3xl px-3 py-1 rounded-lg uppercase tracking-wider rotate-12 pointer-events-none flex items-center gap-1 bg-white/90 dark:bg-neutral-950/90 shadow-md"
            >
              <Check size={28} className="stroke-[3]" /> KNOW
            </div>
          )}
          {isLeftSticker && (
            <div
              style={{ opacity: stickerOpacity }}
              className="absolute top-8 left-6 border-4 border-rose-500 text-rose-500 font-black text-3xl px-3 py-1 rounded-lg uppercase tracking-wider -rotate-12 pointer-events-none flex items-center gap-1 bg-white/90 dark:bg-neutral-950/90 shadow-md"
            >
              <X size={28} className="stroke-[3]" /> NO
            </div>
          )}
        </div>

        {/* 설명 및 콘텐츠 영역 */}
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div className="space-y-2.5">
            <h2 className="text-xl font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight leading-snug">
              {card.title}
            </h2>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-3">
              {card.summary}
            </p>
          </div>

          {/* 아래 버튼 (상세 정보 보기) */}
          <div className="pt-4 mt-auto">
            <Button
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetail();
              }}
              className="w-full text-xs font-bold py-3.5 flex items-center justify-center gap-2 border border-black/10 hover:border-black/35 hover:text-black transition"
            >
              <Info size={16} />
              궁금해요! 상세 정보 보기
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
