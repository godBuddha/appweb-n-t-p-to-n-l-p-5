import { Flame, Sparkles, Zap } from 'lucide-react';
import type { NavView } from '../types/math';

interface TopBarProps {
  activeView: NavView;
  onNavigate: (view: NavView) => void;
  onStartDailyChallenge: () => void;
  streakDays: number;
  xp: number;
}

const NAV_ITEMS: { id: NavView; label: string }[] = [
  { id: 'dashboard', label: 'Học tập' },
  { id: 'practice', label: 'Luyện tập' },
  { id: 'lab', label: 'Mô hình' },
  { id: 'achievements', label: 'Huy hiệu' },
  { id: 'parent', label: 'Phụ huynh' },
];

export function TopBar({
  activeView,
  onNavigate,
  onStartDailyChallenge,
  streakDays,
  xp,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b-2 border-[#E2E8F0]">
      <div className="max-w-6xl mx-auto px-3 sm:px-8 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 text-left whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] rounded-lg cursor-pointer"
        >
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-[0_3px_0_#1D4ED8]">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
          </span>
          <span className="font-display font-extrabold text-base sm:text-xl tracking-tight text-[#0F172A] whitespace-nowrap">
            Math Spark Junior
          </span>
        </button>

        {/* Zone 2: Single-line navigation links */}
        <nav
          aria-label="Điều hướng chính"
          className="hidden md:flex items-center gap-6"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-2 font-display text-sm font-bold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] rounded cursor-pointer ${
                  isActive
                    ? 'text-[#2563EB]'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 -bottom-[15px] h-[3px] rounded-full bg-[#2563EB]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-3 text-xs font-display font-bold text-[#475569] tabular-nums mr-1">
            <span className="inline-flex items-center gap-1 text-[#B45309]">
              <Flame className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
              {streakDays} ngày
            </span>
            <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
            <span className="text-[#0F172A]">{xp} XP</span>
          </div>

          <button
            type="button"
            onClick={onStartDailyChallenge}
            className="btn-tactile-secondary px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-display text-xs sm:text-sm font-extrabold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B45309]"
          >
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
            <span>Thử Thách Ngày</span>
          </button>
        </div>
      </div>

      {/* Mobile compact single-row navigation */}
      <nav
        aria-label="Điều hướng di động"
        className="md:hidden border-t border-[#E2E8F0] bg-[#F8FAFC] px-2 py-1 flex items-center justify-around gap-1 overflow-x-auto"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`px-2.5 py-1 rounded-lg font-display text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#DBEAFE] text-[#004AC6]'
                  : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
