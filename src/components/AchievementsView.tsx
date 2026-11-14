import { Award, CheckCircle2, Flame, Lock, Shield, Star, Trophy } from 'lucide-react';
import type { StudentProgress } from '../types/math';
import { computeOverallLevel, evaluateBadges } from '../utils/mathEngine';

interface AchievementsViewProps {
  progress: StudentProgress;
  onStartPractice: () => void;
}

export function AchievementsView({ progress, onStartPractice }: AchievementsViewProps) {
  const badges = evaluateBadges(progress);
  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const levelInfo = computeOverallLevel(progress.xp);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-8">
      {/* Thẻ tổng quan cấp độ & thành tích */}
      <section className="card-surface rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-[#FEF3C7] border-4 border-[#F59E0B] flex items-center justify-center badge-glow-gold shrink-0">
            <Trophy className="w-10 h-10 text-[#B45309]" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <div className="font-display font-bold text-xs text-[#B45309]">
              Cấp {levelInfo.level} · {levelInfo.title}
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#0F172A]">
              Bộ Sưu Tập Huy Hiệu
            </h1>
            <p className="font-body font-semibold text-sm text-[#475569] tabular-nums">
              Đã mở khóa {unlockedCount} / {badges.length} huy hiệu cột mốc · {progress.xp} Tổng XP
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onStartPractice}
          className="btn-tactile-secondary px-6 py-3.5 rounded-full font-display font-extrabold text-sm whitespace-nowrap shrink-0 cursor-pointer"
        >
          Kiếm thêm XP
        </button>
      </section>

      {/* Lưới huy hiệu hai lớp viền tròn và khiên */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {badges.map((badge, index) => {
          const isShield = index % 2 === 1;
          return (
            <article
              key={badge.id}
              className={`card-surface rounded-3xl p-6 flex flex-col items-center text-center space-y-4 ${
                badge.unlocked ? 'bg-white' : 'bg-[#F8FAFC]'
              }`}
            >
              <div
                className={`relative w-24 h-24 flex items-center justify-center ${
                  isShield ? 'rounded-2xl' : 'rounded-full'
                } border-4 ${
                  badge.unlocked
                    ? 'bg-[#FEF3C7] border-[#F59E0B] badge-glow-gold'
                    : 'bg-[#E2E8F0] border-[#CBD5E1]'
                }`}
              >
                <div
                  className={`w-16 h-16 flex items-center justify-center border-2 ${
                    isShield ? 'rounded-xl' : 'rounded-full'
                  } ${
                    badge.unlocked
                      ? 'bg-[#F59E0B] border-[#FDE68A] text-white'
                      : 'bg-[#F1F5F9] border-[#CBD5E1] text-[#94A3B8]'
                  }`}
                >
                  {badge.unlocked ? (
                    badge.id === 'streak-spark' ? (
                      <Flame className="w-8 h-8" aria-hidden="true" />
                    ) : isShield ? (
                      <Shield className="w-8 h-8" aria-hidden="true" />
                    ) : (
                      <Award className="w-8 h-8" aria-hidden="true" />
                    )
                  ) : (
                    <Lock className="w-7 h-7" aria-hidden="true" />
                  )}
                </div>

                {badge.unlocked && (
                  <span
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#10B981] border-2 border-white text-white flex items-center justify-center"
                    aria-label="Đã mở khóa"
                  >
                    <Star className="w-4 h-4 fill-current" aria-hidden="true" />
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <h2 className="font-display font-extrabold text-lg text-[#0F172A]">
                  {badge.title}
                </h2>
                <div className="font-display font-bold text-xs text-[#64748B]">
                  {badge.subtitle}
                </div>
                <p className="font-body font-semibold text-sm text-[#475569] pt-1">
                  {badge.description}
                </p>
              </div>

              <div className="w-full pt-2 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-display font-bold tabular-nums">
                  <span className={badge.unlocked ? 'text-[#047857]' : 'text-[#64748B]'}>
                    {badge.unlocked ? (
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        Đã mở khóa
                      </span>
                    ) : (
                      'Đang thực hiện'
                    )}
                  </span>
                  <span className="text-[#0F172A]">
                    {badge.current} / {badge.target}
                  </span>
                </div>
                <div className="h-2.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      badge.unlocked ? 'bg-[#10B981]' : 'bg-[#2563EB]'
                    }`}
                    style={{ width: `${badge.percent}%` }}
                  />
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
