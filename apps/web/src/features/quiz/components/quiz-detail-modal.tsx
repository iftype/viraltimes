"use client";

import { useEffect } from "react";
import { X, Calendar, Play, Layers } from "lucide-react";
import { Button } from "@origin/ui";

interface QuizCard {
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

interface QuizDetailModalProps {
  card: QuizCard;
  onClose: () => void;
}

export function QuizDetailModal({ card, onClose }: QuizDetailModalProps) {
  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden"; // 모달 오픈 시 스크롤 잠금
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
      {/* 백드롭 */}
      <div 
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* 모달 바디 */}
      <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-neutral-200/50 dark:border-neutral-800/80 transform transition-all duration-300 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-8">
        
        {/* 헤더 */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full text-white ${
              card.type === "minor" 
                ? "bg-[var(--vo-color-brand)]" 
                : "bg-[var(--vo-color-signal)] text-neutral-900"
            }`}>
              {card.type === "minor" ? "마이너 밈" : "원조 챌린지"}
            </span>
            <h3 className="font-bold text-lg text-neutral-950 dark:text-neutral-50 truncate max-w-[240px]">
              {card.title}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>

        {/* 바디 콘텐츠 */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 hide-scrollbar">
          
          {/* 대표 썸네일 이미지 */}
          <div className="relative aspect-video rounded-xl overflow-hidden shadow-inner group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={card.thumbnailUrl} 
              alt={card.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <p className="text-xs text-white/80">Visual Reference</p>
              <h4 className="font-semibold text-sm">{card.title}</h4>
            </div>
          </div>

          {/* 한줄 설명 */}
          <div>
            <h4 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
              한 줄 요약
            </h4>
            <p className="text-base font-medium text-neutral-800 dark:text-neutral-200 leading-relaxed">
              {card.summary}
            </p>
          </div>

          {/* 정보 메타데이터 그리드 */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800/60">
            <div className="space-y-1">
              <span className="flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                <Calendar size={14} /> 최초 발견
              </span>
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                {card.originDetail.originYear ? `${card.originDetail.originYear}년` : "불명"}
              </p>
            </div>
            
            <div className="space-y-1">
              <span className="flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                <Play size={14} /> 플랫폼
              </span>
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 capitalize">
                {card.originDetail.platform || "정보 없음"}
              </p>
            </div>

            <div className="space-y-1 col-span-2 pt-2 border-t border-neutral-200/50 dark:border-neutral-800/50">
              <span className="flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                <Layers size={14} /> 제작자 / 출처
              </span>
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                {card.originDetail.creator || "미상"}
              </p>
            </div>
          </div>

          {/* 상세 확산 과정/원인 설명 */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              히스토리 및 확산 배경
            </h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {card.originDetail.description}
            </p>
          </div>

        </div>

        {/* 푸터 */}
        <div className="p-4 bg-neutral-50 dark:bg-neutral-800/20 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
          <Button 
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            확인완료
          </Button>
        </div>
      </div>
    </div>
  );
}
