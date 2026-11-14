export type MathDomain = 'fractions' | 'decimals' | 'geometry' | 'measurement';

export type ExamPaperId = 'de-1' | 'de-2' | 'de-3' | 'de-4';

export type PracticeMode = MathDomain | ExamPaperId | 'daily';

export type NavView = 'dashboard' | 'practice' | 'lab' | 'achievements' | 'parent';

export type QuestionInputMode =
  | 'multiple-choice'
  | 'numpad-decimal'
  | 'numpad-fraction'
  | 'multi-sub';

export type CompareOperator = '<' | '=' | '>';

export interface SubQuestionItem {
  id: string;
  label: string;
  kind: 'decimal' | 'fraction' | 'compare' | 'choice';
  unitSuffix?: string;
  correctDecimal?: number;
  correctFraction?: FractionValue;
  correctCompare?: CompareOperator;
  compareLeft?: string;
  compareRight?: string;
  options?: string[];
  correctChoiceIndex?: number;
}

export interface FractionValue {
  numerator: number;
  denominator: number;
}

export interface MixedNumberValue {
  whole: number;
  numerator: number;
  denominator: number;
}

export type DiagramSpec =
  | {
      type: 'fraction-bar';
      bars: {
        label: string;
        numerator: number;
        denominator: number;
        color: 'blue' | 'amber' | 'emerald';
      }[];
    }
  | {
      type: 'decimal-grid';
      shadedCount: number; // out of 100
      secondaryCount?: number; // optional second color out of 100
      caption: string;
    }
  | {
      type: 'geometry-shape';
      shape: 'rectangle' | 'triangle';
      width: number;
      height: number;
      unit: string;
      highlight?: 'area' | 'perimeter';
      widthLabel?: string;
      heightLabel?: string;
    }
  | {
      type: 'measurement-scale';
      leftValue: string;
      leftUnit: string;
      rightValue: string;
      rightUnit: string;
      factorLabel: string;
    }
  | {
      type: 'clock-angle';
      hour: number;
      minute: number;
      caption: string;
    }
  | {
      type: 'info-cards';
      title: string;
      cards: {
        label: string;
        value: string;
        accent?: 'blue' | 'amber' | 'emerald';
      }[];
      footer?: string;
    };

export interface ChoiceOption {
  id: string;
  label: string;
  fraction?: FractionValue;
  mixedNumber?: MixedNumberValue;
}

export interface Question {
  id: string;
  domain: MathDomain;
  examPaper: ExamPaperId;
  sourceLabel: string;
  topic: string;
  prompt: string;
  placeholderNote?: string;
  formula?: {
    leftFraction?: FractionValue;
    operator?: '+' | '-' | '×' | '÷' | '=';
    rightFraction?: FractionValue;
    expressionText?: string;
  };
  inputMode: QuestionInputMode;
  options?: ChoiceOption[];
  correctOptionIndex?: number;
  correctDecimal?: number;
  correctFraction?: FractionValue;
  subItems?: SubQuestionItem[];
  unitSuffix?: string;
  hint: string;
  explanation: string;
  diagram: DiagramSpec;
}

export interface SessionRecord {
  id: string;
  dateLabel: string;
  domain: PracticeMode;
  title: string;
  correctCount: number;
  totalCount: number;
  xpEarned: number;
  stars: 1 | 2 | 3;
}

export interface DomainStats {
  questionsAnswered: number;
  questionsCorrect: number;
  lessonsCompleted: number;
}

export interface StudentProgress {
  studentName: string;
  grade: string;
  xp: number;
  streakDays: number;
  dailyGoalQuestions: number;
  todayQuestionsAnswered: number;
  perfectRounds: number;
  domainStats: Record<MathDomain, DomainStats>;
  recentSessions: SessionRecord[];
}

export interface BadgeDefinition {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: MathDomain | 'milestone';
  target: number;
  getCurrent: (progress: StudentProgress) => number;
}

export interface SessionScoreSummary {
  accuracyPercent: number;
  stars: 1 | 2 | 3;
  xpEarned: number;
  isPerfect: boolean;
}
