import type {
  BadgeDefinition,
  CompareOperator,
  FractionValue,
  MathDomain,
  Question,
  SessionScoreSummary,
  StudentProgress,
} from '../types/math';

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x === 0 ? 1 : x;
}

export function simplifyFraction(numerator: number, denominator: number): FractionValue {
  if (denominator === 0) {
    return { numerator: 0, denominator: 1 };
  }
  const sign = denominator < 0 ? -1 : 1;
  const num = numerator * sign;
  const den = Math.abs(denominator);
  const divisor = gcd(num, den);
  return {
    numerator: num / divisor,
    denominator: den / divisor,
  };
}

export function areFractionsEquivalent(a: FractionValue, b: FractionValue): boolean {
  if (a.denominator === 0 || b.denominator === 0) return false;
  return a.numerator * b.denominator === b.numerator * a.denominator;
}

export function parseFractionInput(raw: string): FractionValue | null {
  const cleaned = raw.trim();
  if (!cleaned) return null;

  if (cleaned.includes('/')) {
    const parts = cleaned.split('/');
    if (parts.length !== 2) return null;
    const num = Number(parts[0].trim());
    const den = Number(parts[1].trim());
    if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return null;
    if (!Number.isInteger(num) || !Number.isInteger(den)) return null;
    return { numerator: num, denominator: den };
  }

  const whole = Number(cleaned);
  if (Number.isInteger(whole) && Number.isFinite(whole)) {
    return { numerator: whole, denominator: 1 };
  }

  return null;
}

export function formatDecimalVi(value: number): string {
  return String(Number(value.toFixed(6))).replace('.', ',');
}

export interface SubAnswerInput {
  decimalText?: string;
  numeratorText?: string;
  denominatorText?: string;
  compareSign?: CompareOperator;
  choiceIndex?: number | null;
}

export interface AnswerCheckResult {
  isValidInput: boolean;
  isCorrect: boolean;
  validationMessage?: string;
  subResults?: Record<string, boolean>;
}

export function checkQuestionAnswer(
  question: Question,
  answer: {
    selectedOptionIndex?: number | null;
    decimalText?: string;
    numeratorText?: string;
    denominatorText?: string;
    subAnswers?: Record<string, SubAnswerInput>;
  }
): AnswerCheckResult {
  if (question.inputMode === 'multiple-choice') {
    if (
      answer.selectedOptionIndex === null ||
      answer.selectedOptionIndex === undefined ||
      answer.selectedOptionIndex < 0
    ) {
      return {
        isValidInput: false,
        isCorrect: false,
        validationMessage: 'Hãy chọn một đáp án trước khi kiểm tra nhé.',
      };
    }
    return {
      isValidInput: true,
      isCorrect: answer.selectedOptionIndex === question.correctOptionIndex,
    };
  }

  if (question.inputMode === 'numpad-decimal') {
    const raw = (answer.decimalText ?? '').trim().replace(/\s+/g, '').replace(',', '.');
    if (!raw || raw === '.' || raw === '-') {
      return {
        isValidInput: false,
        isCorrect: false,
        validationMessage: 'Hãy nhập số bằng bàn phím toán học trước khi kiểm tra.',
      };
    }
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) {
      return {
        isValidInput: false,
        isCorrect: false,
        validationMessage: 'Giá trị vừa nhập chưa phải là một số thập phân hợp lệ.',
      };
    }
    const expected = question.correctDecimal ?? 0;
    const isCorrect = Math.abs(parsed - expected) < 0.00001;
    return { isValidInput: true, isCorrect };
  }

  if (question.inputMode === 'multi-sub') {
    const subItems = question.subItems ?? [];
    const subAnswers = answer.subAnswers ?? {};
    const subResults: Record<string, boolean> = {};

    for (const item of subItems) {
      const entry = subAnswers[item.id];
      if (!entry) {
        return {
          isValidInput: false,
          isCorrect: false,
          validationMessage: 'Hãy hoàn thành tất cả các ý nhỏ trong câu trước khi kiểm tra nhé.',
        };
      }

      if (item.kind === 'compare') {
        if (!entry.compareSign) {
          return {
            isValidInput: false,
            isCorrect: false,
            validationMessage: 'Hãy chọn đầy đủ dấu (>, <, =) cho tất cả các phép so sánh nhé.',
          };
        }
        subResults[item.id] = entry.compareSign === item.correctCompare;
      } else if (item.kind === 'choice') {
        if (entry.choiceIndex === null || entry.choiceIndex === undefined || entry.choiceIndex < 0) {
          return {
            isValidInput: false,
            isCorrect: false,
            validationMessage: 'Hãy hoàn thành đầy đủ các ý chọn đáp án trước khi kiểm tra nhé.',
          };
        }
        subResults[item.id] = entry.choiceIndex === item.correctChoiceIndex;
      } else if (item.kind === 'decimal') {
        const raw = (entry.decimalText ?? '').trim().replace(/\s+/g, '').replace(',', '.');
        if (!raw || raw === '.' || raw === '-') {
          return {
            isValidInput: false,
            isCorrect: false,
            validationMessage: 'Hãy điền đầy đủ kết quả cho tất cả các ô trống trước khi kiểm tra nhé.',
          };
        }
        const parsed = Number(raw);
        if (!Number.isFinite(parsed)) {
          return {
            isValidInput: false,
            isCorrect: false,
            validationMessage: 'Có một ô chứa giá trị số chưa hợp lệ. Hãy kiểm tra lại nhé.',
          };
        }
        subResults[item.id] = Math.abs(parsed - (item.correctDecimal ?? 0)) < 0.00001;
      } else {
        // fraction sub-item
        const numStr = (entry.numeratorText ?? '').trim();
        const denStr = (entry.denominatorText ?? '').trim();
        if (!numStr || !denStr) {
          return {
            isValidInput: false,
            isCorrect: false,
            validationMessage: 'Hãy điền đầy đủ tử số và mẫu số cho các ô phân số nhé.',
          };
        }
        const num = Number(numStr);
        const den = Number(denStr);
        if (!Number.isInteger(num) || !Number.isInteger(den) || den <= 0) {
          return {
            isValidInput: false,
            isCorrect: false,
            validationMessage: 'Mẫu số phải là một số nguyên dương lớn hơn 0.',
          };
        }
        subResults[item.id] = item.correctFraction
          ? areFractionsEquivalent({ numerator: num, denominator: den }, item.correctFraction)
          : false;
      }
    }

    return {
      isValidInput: true,
      isCorrect: subItems.length > 0 && subItems.every((item) => subResults[item.id]),
      subResults,
    };
  }

  // numpad-fraction
  const numStr = (answer.numeratorText ?? '').trim();
  const denStr = (answer.denominatorText ?? '').trim();
  if (!numStr || !denStr) {
    return {
      isValidInput: false,
      isCorrect: false,
      validationMessage: 'Hãy điền đầy đủ cả tử số (ô trên) và mẫu số (ô dưới).',
    };
  }
  const num = Number(numStr);
  const den = Number(denStr);
  if (!Number.isInteger(num) || !Number.isInteger(den) || den <= 0) {
    return {
      isValidInput: false,
      isCorrect: false,
      validationMessage: 'Mẫu số phải là một số nguyên dương lớn hơn 0.',
    };
  }
  const expected = question.correctFraction;
  if (!expected) {
    return { isValidInput: true, isCorrect: false };
  }
  return {
    isValidInput: true,
    isCorrect: areFractionsEquivalent({ numerator: num, denominator: den }, expected),
  };
}

export function calculateSessionScore(
  correctCount: number,
  totalCount: number,
  streakDays: number,
  isDailyChallenge: boolean
): SessionScoreSummary {
  const safeTotal = Math.max(1, totalCount);
  const accuracyPercent = Math.round((correctCount / safeTotal) * 100);
  const isPerfect = correctCount === safeTotal;
  const stars: 1 | 2 | 3 = accuracyPercent >= 90 ? 3 : accuracyPercent >= 65 ? 2 : 1;

  const baseXp = correctCount * 20;
  const perfectBonus = isPerfect ? 30 : 0;
  const dailyBonus = isDailyChallenge ? 40 : 0;
  const streakBonus = Math.min(streakDays, 10) * 2;
  const xpEarned = baseXp + perfectBonus + dailyBonus + streakBonus;

  return {
    accuracyPercent,
    stars,
    xpEarned,
    isPerfect,
  };
}

export function computeDomainMastery(progress: StudentProgress, domain: MathDomain): number {
  const stats = progress.domainStats[domain];
  if (!stats || stats.questionsAnswered === 0) return 0;
  const accuracy = stats.questionsCorrect / stats.questionsAnswered;
  const volumeFactor = Math.min(1, stats.questionsAnswered / 12);
  return Math.min(100, Math.round(accuracy * 70 + volumeFactor * 30));
}

export function computeOverallLevel(xp: number): {
  level: number;
  title: string;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
} {
  const xpPerLevel = 250;
  const level = Math.floor(xp / xpPerLevel) + 1;
  const currentLevelXp = xp % xpPerLevel;
  const progressPercent = Math.round((currentLevelXp / xpPerLevel) * 100);

  const titles = [
    'Nhà Thám Hiểm Số Học',
    'Chiến Binh Phân Số',
    'Kỵ Sĩ Thập Phân',
    'Kiến Trúc Sư Hình Học',
    'Quán Quân Math Spark',
  ];
  const title = titles[Math.min(titles.length - 1, level - 1)];

  return {
    level,
    title,
    currentLevelXp,
    nextLevelXp: xpPerLevel,
    progressPercent,
  };
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'fraction-master',
    title: 'Bậc Thầy Phân Số',
    subtitle: 'Phân Số & Hỗn Số',
    description: 'Giải đúng 8 bài tập về phân số thập phân, hỗn số và phép tính phân số.',
    category: 'fractions',
    target: 8,
    getCurrent: (p) => p.domainStats.fractions.questionsCorrect,
  },
  {
    id: 'perfect-hunter',
    title: 'Thợ Săn Điểm 10',
    subtitle: 'Hoàn Hảo Tuyệt Đối',
    description: 'Hoàn thành 2 lượt luyện tập đạt độ chính xác 100%.',
    category: 'milestone',
    target: 2,
    getCurrent: (p) => p.perfectRounds,
  },
  {
    id: 'decimal-explorer',
    title: 'Nhà Thám Hiểm Thập Phân',
    subtitle: 'So Sánh & Làm Tròn',
    description: 'Trả lời đúng 8 câu hỏi về số thập phân, làm tròn và tính thuận tiện.',
    category: 'decimals',
    target: 8,
    getCurrent: (p) => p.domainStats.decimals.questionsCorrect,
  },
  {
    id: 'geometry-architect',
    title: 'Kiến Trúc Sư Hình Học',
    subtitle: 'Chu Vi, Diện Tích & Góc',
    description: 'Giải đúng 6 thử thách về hình chữ nhật, héc-ta và góc đồng hồ.',
    category: 'geometry',
    target: 6,
    getCurrent: (p) => p.domainStats.geometry.questionsCorrect,
  },
  {
    id: 'measurement-navigator',
    title: 'Bậc Thầy Đo Lường',
    subtitle: 'Đổi Đơn Vị Siêu Nhanh',
    description: 'Quy đổi chính xác 6 bài toán về độ dài, khối lượng và diện tích.',
    category: 'measurement',
    target: 6,
    getCurrent: (p) => p.domainStats.measurement.questionsCorrect,
  },
  {
    id: 'streak-spark',
    title: 'Chuỗi Lửa 7 Ngày',
    subtitle: 'Kiên Trì Mỗi Ngày',
    description: 'Duy trì chuỗi học tập liên tục 7 ngày không nghỉ.',
    category: 'milestone',
    target: 7,
    getCurrent: (p) => p.streakDays,
  },
];

export function evaluateBadges(progress: StudentProgress) {
  return BADGE_DEFINITIONS.map((badge) => {
    const current = Math.min(badge.target, badge.getCurrent(progress));
    const unlocked = badge.getCurrent(progress) >= badge.target;
    const percent = Math.round((current / badge.target) * 100);
    return {
      ...badge,
      current,
      unlocked,
      percent,
    };
  });
}

export type LengthUnit = 'km' | 'm' | 'dm' | 'cm' | 'mm';
export type MassUnit = 'tấn' | 'tạ' | 'yến' | 'kg' | 'g';
export type AreaUnit = 'km²' | 'ha' | 'm²' | 'cm²';
export type MeasurementCategory = 'length' | 'mass' | 'area';

const LENGTH_TO_MM: Record<LengthUnit, number> = {
  km: 1_000_000,
  m: 1_000,
  dm: 100,
  cm: 10,
  mm: 1,
};

const MASS_TO_G: Record<MassUnit, number> = {
  tấn: 1_000_000,
  tạ: 100_000,
  yến: 10_000,
  kg: 1_000,
  g: 1,
};

const AREA_TO_CM2: Record<AreaUnit, number> = {
  'km²': 10_000_000_000,
  ha: 100_000_000,
  'm²': 10_000,
  'cm²': 1,
};

export function convertLength(value: number, from: LengthUnit, to: LengthUnit): number {
  const inMm = value * LENGTH_TO_MM[from];
  return Number((inMm / LENGTH_TO_MM[to]).toFixed(6));
}

export function convertMass(value: number, from: MassUnit, to: MassUnit): number {
  const inG = value * MASS_TO_G[from];
  return Number((inG / MASS_TO_G[to]).toFixed(6));
}

export function convertArea(value: number, from: AreaUnit, to: AreaUnit): number {
  const inCm2 = value * AREA_TO_CM2[from];
  return Number((inCm2 / AREA_TO_CM2[to]).toFixed(6));
}

export function computeGeometryMetrics(
  shape: 'rectangle' | 'triangle',
  width: number,
  height: number
): { area: number; perimeter: number } {
  if (shape === 'rectangle') {
    return {
      area: Number((width * height).toFixed(2)),
      perimeter: Number((2 * (width + height)).toFixed(2)),
    };
  }
  const hypotenuse = Math.sqrt(width * width + height * height);
  return {
    area: Number((0.5 * width * height).toFixed(2)),
    perimeter: Number((width + height + hypotenuse).toFixed(2)),
  };
}
