import {
  ArrowRight,
  Award,
  BookOpen,
  ClipboardCheck,
  Compass,
  Flame,
  Layers,
  Play,
  Ruler,
  Shapes,
  Star,
} from 'lucide-react';
import { DOMAIN_META, EXAM_META, getQuestionsForMode } from '../data/curriculum';
import type { ExamPaperId, MathDomain, NavView, PracticeMode, StudentProgress } from '../types/math';
import { computeDomainMastery, computeOverallLevel, evaluateBadges } from '../utils/mathEngine';

interface DashboardViewProps {
  progress: StudentProgress;
  onStartPractice: (mode: PracticeMode) => void;
  onOpenLab: (domain: MathDomain) => void;
  onNavigate: (view: NavView) => void;
}

const DOMAIN_ICONS: Record<MathDomain, typeof Layers> = {
  fractions: Layers,
  decimals: Compass,
  geometry: Shapes,
  measurement: Ruler,
};

function MasteryRing({
  percent,
  colorHex,
}: {
  percent: number;
  colorHex: string;
}) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64" aria-hidden="true">
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="6"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke={colorHex}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <span className="absolute font-display font-extrabold text-sm text-[#0F172A] tabular-nums">
        {percent}%
      </span>
    </div>
  );
}

export function DashboardView({
  progress,
  onStartPractice,
  onOpenLab,
  onNavigate,
}: DashboardViewProps) {
  const levelInfo = computeOverallLevel(progress.xp);
  const dailyPercent = Math.min(
    100,
    Math.round((progress.todayQuestionsAnswered / Math.max(1, progress.dailyGoalQuestions)) * 100)
  );
  const unlockedBadges = evaluateBadges(progress).filter((b) => b.unlocked).length;

  const domains: MathDomain[] = ['fractions', 'decimals', 'geometry', 'measurement'];
  const examPapers: ExamPaperId[] = ['de-1', 'de-2', 'de-3', 'de-4'];

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-8">
      {/* Thẻ tổng quan học tập */}
      <section className="card-surface rounded-3xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-sm font-display font-bold text-[#475569]">
            <span className="text-[#004AC6]">Chương trình {progress.grade}</span>
            <span aria-hidden="true">·</span>
            <span>Cấp {levelInfo.level}: {levelInfo.title}</span>
          </div>

          <h1 className="font-display font-extrabold text-[28px] sm:text-[36px] leading-[1.2] text-[#0F172A] text-balance">
            Sẵn sàng ôn tập đề cương Toán hôm nay chưa, {progress.studentName}?
          </h1>

          <p className="font-body font-semibold text-base text-[#475569] max-w-xl leading-relaxed">
            Luyện tập trọn vẹn Đề ôn số 1 đến Đề ôn số 4 theo đúng đề cương lớp 5 cùng mô hình trực quan và lời giải từng bước.
          </p>

          {/* Thanh XP & Chuỗi ngày */}
          <div className="pt-2 space-y-2 max-w-lg">
            <div className="flex items-center justify-between text-xs font-display font-bold">
              <span className="inline-flex items-center gap-1.5 text-[#B45309] bg-[#FEF3C7] px-3 py-1 rounded-full">
                <Flame className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
                Chuỗi {progress.streakDays} ngày liên tiếp
              </span>
              <span className="text-[#475569] tabular-nums">
                {levelInfo.currentLevelXp} / {levelInfo.nextLevelXp} XP lên Cấp {levelInfo.level + 1}
              </span>
            </div>
            <div className="h-3 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] transition-all duration-500"
                style={{ width: `${Math.max(8, levelInfo.progressPercent)}%` }}
              />
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onStartPractice('de-1')}
              className="btn-tactile-primary px-6 py-3.5 rounded-full font-display font-extrabold text-base inline-flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" aria-hidden="true" />
              <span>Làm Đề ôn số 1</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenLab('measurement')}
              className="btn-ghost-sky px-5 py-3.5 rounded-full font-display font-bold text-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              <span>Mở Phòng Thí Nghiệm</span>
            </button>
          </div>
        </div>

        {/* Cột phải: Mục tiêu hôm nay */}
        <div className="lg:col-span-5 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-extrabold text-lg text-[#0F172A]">
                Mục tiêu hôm nay
              </h2>
              <p className="font-body font-semibold text-sm text-[#64748B]">
                Đã giải {progress.todayQuestionsAnswered} / {progress.dailyGoalQuestions} câu hỏi
              </p>
            </div>
            <MasteryRing percent={dailyPercent} colorHex="#2563EB" />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E2E8F0]">
            <div className="bg-white rounded-xl p-3 border border-[#E2E8F0]">
              <div className="font-display font-bold text-xs text-[#64748B]">Tổng điểm XP</div>
              <div className="font-display font-extrabold text-xl text-[#0F172A] tabular-nums mt-0.5">
                {progress.xp}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('achievements')}
              className="bg-white rounded-xl p-3 border border-[#E2E8F0] text-left hover:border-[#F59E0B] transition-colors cursor-pointer"
            >
              <div className="font-display font-bold text-xs text-[#64748B] flex items-center justify-between">
                <span>Huy hiệu</span>
                <Award className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
              </div>
              <div className="font-display font-extrabold text-xl text-[#0F172A] tabular-nums mt-0.5">
                {unlockedBadges} / 6
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Bộ 4 Đề Ôn Tập Theo Đề Cương Gốc */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-[#0F172A]">
            Bộ Đề Ôn Tập Theo Đề Cương (Đề 1 – Đề 4)
          </h2>
          <p className="font-body font-semibold text-sm text-[#64748B]">
            Tổng hợp các bài Trắc nghiệm và Tự luận bám sát đề cương ôn tập môn Toán Lớp 5
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {examPapers.map((paperId) => {
            const meta = EXAM_META[paperId];
            const count = getQuestionsForMode(paperId).length;
            return (
              <article
                key={paperId}
                className="card-surface rounded-3xl p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-display font-bold text-xs"
                      style={{ backgroundColor: meta.chipBg, color: meta.chipText }}
                    >
                      <ClipboardCheck className="w-3.5 h-3.5" aria-hidden="true" />
                      {meta.title}
                    </span>
                    <span className="font-display font-bold text-xs text-[#64748B] tabular-nums">
                      {count} câu
                    </span>
                  </div>
                  <p className="font-body font-semibold text-xs sm:text-sm text-[#475569] leading-relaxed">
                    {meta.subtitle}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onStartPractice(paperId)}
                  className="btn-tactile-primary w-full py-2.5 rounded-full font-display font-extrabold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Bắt đầu {meta.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {/* 4 Chuyên đề Toán Lớp 5 */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-display font-extrabold text-2xl text-[#0F172A]">
              Chuyên Đề Toán Lớp 5
            </h2>
            <p className="font-body font-semibold text-sm text-[#64748B]">
              Chọn một chủ đề để luyện tập bài tập trong đề cương hoặc khám phá mô hình trực quan
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {domains.map((domain) => {
            const meta = DOMAIN_META[domain];
            const stats = progress.domainStats[domain];
            const mastery = computeDomainMastery(progress, domain);
            const Icon = DOMAIN_ICONS[domain];

            return (
              <article
                key={domain}
                className="card-surface rounded-3xl p-5 sm:p-6 flex flex-col justify-between gap-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-display font-bold text-xs"
                      style={{ backgroundColor: meta.chipBg, color: meta.chipText }}
                    >
                      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                      {meta.title}
                    </span>

                    <h3 className="font-display font-extrabold text-xl text-[#0F172A]">
                      Chuyên đề {meta.title}
                    </h3>
                    <p className="font-body font-semibold text-sm text-[#475569]">
                      {meta.subtitle}
                    </p>
                  </div>

                  <MasteryRing percent={mastery} colorHex={meta.accentHex} />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E2E8F0]">
                  <div className="text-xs font-display font-bold text-[#64748B] tabular-nums">
                    {stats.lessonsCompleted} / {meta.lessonsTotal} bài học · Đúng {stats.questionsCorrect} câu
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenLab(domain)}
                      className="btn-ghost-sky px-3.5 py-2 rounded-full font-display font-bold text-xs cursor-pointer"
                    >
                      Mô hình
                    </button>
                    <button
                      type="button"
                      onClick={() => onStartPractice(domain)}
                      className="btn-tactile-primary px-4 py-2 rounded-full font-display font-extrabold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Luyện tập</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Lịch sử luyện tập gần đây */}
      <section className="card-surface rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display font-extrabold text-lg text-[#0F172A]">
            Lịch Sử Luyện Tập Gần Đây
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('parent')}
            className="font-display font-bold text-sm text-[#2563EB] hover:underline cursor-pointer"
          >
            Xem báo cáo phụ huynh
          </button>
        </div>

        <div className="divide-y divide-[#E2E8F0]">
          {progress.recentSessions.slice(0, 3).map((session) => (
            <div
              key={session.id}
              className="py-3 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <div className="font-display font-bold text-sm text-[#0F172A]">
                  {session.title}
                </div>
                <div className="font-body font-medium text-xs text-[#64748B]">
                  {session.dateLabel}
                </div>
              </div>

              <div className="flex items-center gap-4 tabular-nums">
                <span className="inline-flex items-center gap-1 font-display font-bold text-sm text-[#B45309]">
                  <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" aria-hidden="true" />
                  {session.stars}/3
                </span>
                <span className="font-display font-bold text-sm text-[#047857]">
                  Đúng {session.correctCount}/{session.totalCount}
                </span>
                <span className="font-display font-extrabold text-sm text-[#2563EB]">
                  +{session.xpEarned} XP
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
