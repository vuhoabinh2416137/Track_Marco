'use client';

import React from 'react';
import { Home, BookOpen, LineChart, Dumbbell, Settings } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Trang chủ', icon: Home },
    { id: 'diary', label: 'Nhật ký', icon: BookOpen },
    { id: 'weight', label: 'Xu hướng', icon: LineChart },
    { id: 'workout', label: 'Tập luyện', icon: Dumbbell },
    { id: 'settings', label: 'Hồ sơ', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 select-none ${
                isActive
                  ? 'text-brand-blue font-semibold scale-105'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
              <span className="text-[11px] tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 mt-0.5 rounded-full bg-brand-blue animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
