import { useState } from 'react';
import { CheckCircle2, Flame, Minus, Plus, RotateCcw, Star, Target } from 'lucide-react';
import { DOMAIN_META } from '../data/curriculum';
import type { MathDomain, StudentProgress } from '../types/math';
import { computeDomainMastery } from '../utils/mathEngine';

interface ParentViewProps {
  progress: StudentProgress;
  onUpdateDailyGoal: (newGoal: number) => void;
  onResetProgress: () => void;
}

export function ParentView({
  progress,
  onUpdateDailyGoal,
  onResetProgress,
}: ParentViewProps) {
  const [confirmReset, setConfirmReset] = useState(false);

  const domains: MathDomain[] = ['fractions', 'decimals', 'geometry', 'measurement'];

  const totalAnswered = domains.reduce(
    (sum, d) => sum + progress.domainStats[d].questionsAnswered,
    0
  );
  const totalCorrect = domains.reduce(
    (sum, d) => sum + progress.domainStats[d].questionsCorrect,
    0
  );
  const overallAccuracy =
    totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const totalLessons = domains.reduce(
    (sum, d) => sum + progress.domainStats[d].lessonsCompleted,
    0
  );

  const sortedByMastery = [...domains].sort(
    (a, b) => computeDomainMastery(progress, b) - computeDomainMastery(progress, a)
  );
  const strongestDomain = DOMAIN_META[sortedByMastery[0]];
  const focusDomain = DOMAIN_META[sortedByMastery[sortedByMastery.length - 1]];

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-8">
      {/* Tiêu đề */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#0F172A]">
            Góc Theo Dõi Phụ Huynh
          </h1>
          <p className="font-body font-semibold text-sm text-[#475569]">
            Theo dõi mức độ thành thạo môn Toán {progress.grade} của {progress.studentName} theo từng chuyên đề
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="btn-ghost-sky px-4 py-2.5 rounded-full font-display font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Đặt lại dữ liệu mẫu</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-[#FEF2F2] border-2 border-[#FCA5A5] rounded-full px-3 py-1.5">
              <span className="font-display font-bold text-xs text-[#991B1B]">
                Đặt lại toàn bộ?
              </span>
              <button
                type="button"
                onClick={() => {
                  onResetProgress();
                  setConfirmReset(false);
                }}
                className="px-3 py-1 rounded-full bg-[#EF4444] text-white font-display font-bold text-xs cursor-pointer"
              >
                Xác nhận
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-2.5 py-1 rounded-full bg-white text-[#475569] font-display font-bold text-xs cursor-pointer"
              >
                Hủy
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4 Thẻ chỉ số chính */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-surface rounded-2xl p-5">
          <div className="font-display font-bold text-xs text-[#64748B]">Độ chính xác chung</div>
          <div className="font-display font-extrabold text-3xl text-[#047857] tabular-nums mt-1">
            {overallAccuracy}%
          </div>
          <div className="font-body font-semibold text-xs text-[#64748B] mt-1 tabular-nums">
            Đúng {totalCorrect} / {totalAnswered} câu
          </div>
        </div>

        <div className="card-surface rounded-2xl p-5">
          <div className="font-display font-bold text-xs text-[#64748B]">Chuỗi học tập</div>
          <div className="font-display font-extrabold text-3xl text-[#B45309] tabular-nums mt-1 inline-flex items-center gap-2">
            <Flame className="w-6 h-6 text-[#F59E0B]" aria-hidden="true" />
            {progress.streakDays} ngày
          </div>
          <div className="font-body font-semibold text-xs text-[#64748B] mt-1">
            Duy trì thói quen đều đặn
          </div>
        </div>

        <div className="card-surface rounded-2xl p-5">
          <div className="font-display font-bold text-xs text-[#64748B]">Bài học hoàn thành</div>
          <div className="font-display font-extrabold text-3xl text-[#2563EB] tabular-nums mt-1">
            {totalLessons}
          </div>
          <div className="font-body font-semibold text-xs text-[#64748B] mt-1">
            Trên cả 4 chuyên đề chính
          </div>
        </div>

        <div className="card-surface rounded-2xl p-5">
          <div className="font-display font-bold text-xs text-[#64748B]">Tổng điểm XP</div>
          <div className="font-display font-extrabold text-3xl text-[#0F172A] tabular-nums mt-1">
            {progress.xp} XP
          </div>
          <div className="font-body font-semibold text-xs text-[#64748B] mt-1 tabular-nums">
            {progress.perfectRounds} lượt đạt điểm tuyệt đối
          </div>
        </div>
      </section>

      {/* Phân tích chuyên đề & Đặt mục tiêu ngày */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 card-surface rounded-3xl p-6 space-y-5">
          <h2 className="font-display font-extrabold text-lg text-[#0F172A]">
            Mức Độ Thành Thạo Theo Chuyên Đề
          </h2>

          <div className="space-y-4">
            {domains.map((domain) => {
              const meta = DOMAIN_META[domain];
              const stats = progress.domainStats[domain];
              const mastery = computeDomainMastery(progress, domain);
              const acc =
                stats.questionsAnswered > 0
                  ? Math.round((stats.questionsCorrect / stats.questionsAnswered) * 100)
                  : 0;

              return (
                <div key={domain} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm font-display font-bold">
                    <span className="text-[#0F172A]">{meta.title}</span>
                    <span className="text-[#475569] tabular-nums">
                      Thành thạo {mastery}% · Đúng {acc}% ({stats.questionsCorrect}/{stats.questionsAnswered})
                    </span>
                  </div>
                  <div className="h-3 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(4, mastery)}%`,
                        backgroundColor: meta.accentHex,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-5">
          {/* Điều chỉnh mục tiêu hàng ngày */}
          <div className="card-surface rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <Target className="w-5 h-5 text-[#2563EB]" aria-hidden="true" />
              <h2 className="font-display font-extrabold text-lg text-[#0F172A]">
                Mục Tiêu Luyện Tập Mỗi Ngày
              </h2>
            </div>

            <p className="font-body font-semibold text-sm text-[#475569]">
              Điều chỉnh số lượng câu hỏi mà {progress.studentName} cần hoàn thành mỗi ngày.
            </p>

            <div className="flex items-center justify-between bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl p-4">
              <button
                type="button"
                aria-label="Giảm mục tiêu hàng ngày"
                disabled={progress.dailyGoalQuestions <= 4}
                onClick={() => onUpdateDailyGoal(Math.max(4, progress.dailyGoalQuestions - 2))}
                className="w-12 h-12 rounded-full bg-white border-2 border-[#CBD5E1] flex items-center justify-center text-[#0F172A] hover:bg-[#EFF6FF] disabled:opacity-40 cursor-pointer"
              >
                <Minus className="w-5 h-5" aria-hidden="true" />
              </button>

              <div className="text-center">
                <div className="font-display font-extrabold text-3xl text-[#2563EB] tabular-nums">
                  {progress.dailyGoalQuestions}
                </div>
                <div className="font-display font-bold text-xs text-[#64748B]">
                  câu hỏi / ngày
                </div>
              </div>

              <button
                type="button"
                aria-label="Tăng mục tiêu hàng ngày"
                disabled={progress.dailyGoalQuestions >= 30}
                onClick={() => onUpdateDailyGoal(Math.min(30, progress.dailyGoalQuestions + 2))}
                className="w-12 h-12 rounded-full bg-white border-2 border-[#CBD5E1] flex items-center justify-center text-[#0F172A] hover:bg-[#EFF6FF] disabled:opacity-40 cursor-pointer"
              >
                <Plus className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Gợi ý học tập */}
          <div className="card-surface rounded-3xl p-6 space-y-3">
            <h2 className="font-display font-extrabold text-lg text-[#0F172A]">
              Gợi Ý Học Tập
            </h2>
            <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl p-3.5 flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-sm font-body font-semibold text-[#065F46]">
                <strong className="font-display font-bold">Thế mạnh nổi bật:</strong>{' '}
                {strongestDomain.title} (đạt {computeDomainMastery(progress, strongestDomain.id)}%).
              </div>
            </div>
            <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-3.5 text-sm font-body font-semibold text-[#1E3A8A]">
              <strong className="font-display font-bold">Nên ôn thêm:</strong> Hãy thử 1 bài mô hình trực quan &amp; luyện tập ngắn ở phần{' '}
              <span className="font-display font-bold">{focusDomain.title}</span> để cân bằng kiến thức Lớp 5.
            </div>
          </div>
        </div>
      </section>

      {/* Bảng lịch sử bài luyện tập */}
      <section className="card-surface rounded-3xl p-6 space-y-4">
        <h2 className="font-display font-extrabold text-lg text-[#0F172A]">
          Nhật Ký Luyện Tập Đã Hoàn Thành
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-[#E2E8F0] font-display font-bold text-xs text-[#64748B]">
                <th className="py-3 pr-4">Hoạt động</th>
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4">Điểm số</th>
                <th className="py-3 px-4">Đánh giá</th>
                <th className="py-3 pl-4 text-right">Điểm XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] font-body font-semibold text-sm text-[#0F172A] tabular-nums">
              {progress.recentSessions.map((session) => (
                <tr key={session.id}>
                  <td className="py-3.5 pr-4 font-display font-bold">{session.title}</td>
                  <td className="py-3.5 px-4 text-[#64748B]">{session.dateLabel}</td>
                  <td className="py-3.5 px-4">
                    {session.correctCount} / {session.totalCount}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[#B45309] font-display font-bold">
                      <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" aria-hidden="true" />
                      {session.stars}/3
                    </span>
                  </td>
                  <td className="py-3.5 pl-4 text-right font-display font-extrabold text-[#2563EB]">
                    +{session.xpEarned} XP
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
