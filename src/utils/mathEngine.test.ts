import test from 'node:test';
import assert from 'node:assert/strict';
import {
  areFractionsEquivalent,
  calculateSessionScore,
  checkQuestionAnswer,
  computeDomainMastery,
  computeGeometryMetrics,
  convertArea,
  convertLength,
  convertMass,
  evaluateBadges,
  formatDecimalVi,
  simplifyFraction,
} from './mathEngine';
import { CURRICULUM_QUESTIONS, getQuestionsForMode } from '../data/curriculum';
import type { Question, StudentProgress } from '../types/math';

const sampleProgress: StudentProgress = {
  studentName: 'Bạn ơi',
  grade: 'Lớp 5',
  xp: 520,
  streakDays: 7,
  dailyGoalQuestions: 10,
  todayQuestionsAnswered: 6,
  perfectRounds: 2,
  domainStats: {
    fractions: { questionsAnswered: 10, questionsCorrect: 9, lessonsCompleted: 2 },
    decimals: { questionsAnswered: 8, questionsCorrect: 6, lessonsCompleted: 1 },
    geometry: { questionsAnswered: 6, questionsCorrect: 5, lessonsCompleted: 1 },
    measurement: { questionsAnswered: 4, questionsCorrect: 3, lessonsCompleted: 1 },
  },
  recentSessions: [],
};

test('simplifyFraction reduces fractions to lowest terms', () => {
  assert.deepEqual(simplifyFraction(6, 8), { numerator: 3, denominator: 4 });
  assert.deepEqual(simplifyFraction(10, 15), { numerator: 2, denominator: 3 });
  assert.deepEqual(simplifyFraction(4, 4), { numerator: 1, denominator: 1 });
});

test('areFractionsEquivalent checks cross-multiplication accurately', () => {
  assert.equal(areFractionsEquivalent({ numerator: 2, denominator: 4 }, { numerator: 1, denominator: 2 }), true);
  assert.equal(areFractionsEquivalent({ numerator: 3, denominator: 5 }, { numerator: 6, denominator: 10 }), true);
  assert.equal(areFractionsEquivalent({ numerator: 2, denominator: 3 }, { numerator: 3, denominator: 4 }), false);
});

test('checkQuestionAnswer validates multiple-choice, Vietnamese comma decimals, and fraction numpad', () => {
  const mcQuestion: Question = {
    id: 'q1',
    domain: 'fractions',
    examPaper: 'de-1',
    sourceLabel: 'Đề 1 · Câu 1',
    topic: 'Phân số thập phân',
    prompt: 'Chọn phân số thập phân',
    inputMode: 'multiple-choice',
    options: [
      { id: 'a', label: '65/100' },
      { id: 'b', label: '41/50' },
    ],
    correctOptionIndex: 0,
    hint: 'Mẫu số là 100.',
    explanation: '65/100 là phân số thập phân.',
    diagram: { type: 'fraction-bar', bars: [] },
  };
  assert.equal(checkQuestionAnswer(mcQuestion, { selectedOptionIndex: null }).isValidInput, false);
  assert.equal(checkQuestionAnswer(mcQuestion, { selectedOptionIndex: 0 }).isCorrect, true);
  assert.equal(checkQuestionAnswer(mcQuestion, { selectedOptionIndex: 1 }).isCorrect, false);

  const decQuestion: Question = {
    id: 'q2',
    domain: 'measurement',
    examPaper: 'de-1',
    sourceLabel: 'Đề 1 · Câu 8d',
    topic: 'Đổi đơn vị diện tích',
    prompt: '5 m² 413 cm² = ? m²',
    inputMode: 'numpad-decimal',
    correctDecimal: 5.0413,
    hint: '1 m² = 10 000 cm².',
    explanation: '5,0413 m²',
    diagram: { type: 'measurement-scale', leftValue: '5 m² 413 cm²', leftUnit: 'm², cm²', rightValue: '?', rightUnit: 'm²', factorLabel: '÷ 10 000' },
  };
  assert.equal(checkQuestionAnswer(decQuestion, { decimalText: '' }).isValidInput, false);
  assert.equal(checkQuestionAnswer(decQuestion, { decimalText: '5,0413' }).isCorrect, true);
  assert.equal(checkQuestionAnswer(decQuestion, { decimalText: '5.0413' }).isCorrect, true);
  assert.equal(checkQuestionAnswer(decQuestion, { decimalText: '5,413' }).isCorrect, false);

  const fracQuestion: Question = {
    id: 'q3',
    domain: 'fractions',
    examPaper: 'de-1',
    sourceLabel: 'Test',
    topic: 'Phân số bằng nhau',
    prompt: 'Viết 1/2 + 1/4',
    inputMode: 'numpad-fraction',
    correctFraction: { numerator: 3, denominator: 4 },
    hint: 'Quy đồng 1/2 thành 2/4.',
    explanation: '2/4 + 1/4 = 3/4',
    diagram: { type: 'fraction-bar', bars: [] },
  };
  assert.equal(checkQuestionAnswer(fracQuestion, { numeratorText: '3', denominatorText: '4' }).isCorrect, true);
  assert.equal(checkQuestionAnswer(fracQuestion, { numeratorText: '6', denominatorText: '8' }).isCorrect, true);
  assert.equal(checkQuestionAnswer(fracQuestion, { numeratorText: '2', denominatorText: '4' }).isCorrect, false);
});

test('measurement unit conversions match Đề ôn 1-4 outline values', () => {
  assert.equal(convertLength(3.5, 'km', 'm'), 3500);
  assert.equal(convertLength(4.5, 'm', 'dm'), 45);
  assert.equal(convertArea(36, 'ha', 'km²'), 0.36);
  assert.equal(convertArea(15829, 'ha', 'km²'), 158.29);
  assert.equal(convertArea(150000, 'm²', 'ha'), 15);
  assert.equal(convertArea(9600, 'm²', 'ha'), 0.96);
  assert.equal(convertMass(9.004, 'tấn', 'kg'), 9004);
  assert.equal(convertMass(72019, 'kg', 'tấn'), 72.019);
  assert.equal(formatDecimalVi(9.004), '9,004');
});

test('calculateSessionScore and computeGeometryMetrics return expected values', () => {
  const perfectDaily = calculateSessionScore(5, 5, 7, true);
  assert.equal(perfectDaily.accuracyPercent, 100);
  assert.equal(perfectDaily.stars, 3);
  assert.equal(perfectDaily.isPerfect, true);
  assert.equal(perfectDaily.xpEarned, 100 + 30 + 40 + 14);

  assert.deepEqual(computeGeometryMetrics('rectangle', 18, 12), { area: 216, perimeter: 60 });
  assert.deepEqual(computeGeometryMetrics('rectangle', 120, 80), { area: 9600, perimeter: 400 });
});

test('evaluateBadges and computeDomainMastery compute accurate progress', () => {
  const badges = evaluateBadges(sampleProgress);
  const fracMaster = badges.find((b) => b.id === 'fraction-master');
  const perfectHunter = badges.find((b) => b.id === 'perfect-hunter');
  const decExplorer = badges.find((b) => b.id === 'decimal-explorer');

  assert.equal(fracMaster?.unlocked, true);
  assert.equal(perfectHunter?.unlocked, true);
  assert.equal(decExplorer?.unlocked, false);

  const mastery = computeDomainMastery(sampleProgress, 'fractions');
  assert.ok(mastery > 70 && mastery <= 100);
});

test('checkQuestionAnswer validates multi-sub questions (compare, decimal, fraction, choice)', () => {
  const de1c7 = CURRICULUM_QUESTIONS.find((q) => q.id === 'de1-c7')!;
  assert.equal(checkQuestionAnswer(de1c7, { subAnswers: {} }).isValidInput, false);
  assert.equal(
    checkQuestionAnswer(de1c7, {
      subAnswers: {
        a1: { compareSign: '>' },
        a2: { compareSign: '<' },
        b1: { compareSign: '>' },
        b2: { compareSign: '=' },
      },
    }).isCorrect,
    true
  );

  const de1c8 = CURRICULUM_QUESTIONS.find((q) => q.id === 'de1-c8')!;
  const de1c8Outcome = checkQuestionAnswer(de1c8, {
    subAnswers: {
      a: { decimalText: '4,5' },
      b: { decimalText: '0,36' },
      c: { decimalText: '72,019' },
      d: { decimalText: '5,0413' },
    },
  });
  assert.equal(de1c8Outcome.isValidInput, true);
  assert.equal(de1c8Outcome.isCorrect, true);

  const de2c7 = CURRICULUM_QUESTIONS.find((q) => q.id === 'de2-c7')!;
  assert.equal(
    checkQuestionAnswer(de2c7, {
      subAnswers: {
        a: { numeratorText: '7', denominatorText: '10' },
        b: { numeratorText: '7', denominatorText: '3' },
      },
    }).isCorrect,
    true
  );

  const de2c8 = CURRICULUM_QUESTIONS.find((q) => q.id === 'de2-c8')!;
  assert.equal(
    checkQuestionAnswer(de2c8, {
      subAnswers: {
        a: { choiceIndex: 0 },
        b1: { decimalText: '50' },
        b2: { decimalText: '0' },
      },
    }).isCorrect,
    true
  );
});

test('curriculum integrity: every exam paper has exactly 10 valid questions (40 total)', () => {
  assert.equal(getQuestionsForMode('de-1').length, 10);
  assert.equal(getQuestionsForMode('de-2').length, 10);
  assert.equal(getQuestionsForMode('de-3').length, 10);
  assert.equal(getQuestionsForMode('de-4').length, 10);
  assert.equal(CURRICULUM_QUESTIONS.length, 40);

  for (const q of CURRICULUM_QUESTIONS) {
    if (q.inputMode === 'multiple-choice') {
      assert.ok(q.options && q.options.length >= 4, `${q.id} should have 4 options`);
      assert.ok(
        q.correctOptionIndex !== undefined &&
          q.correctOptionIndex >= 0 &&
          q.correctOptionIndex < q.options.length,
        `${q.id} has valid correctOptionIndex`
      );
    } else if (q.inputMode === 'numpad-decimal') {
      assert.equal(typeof q.correctDecimal, 'number', `${q.id} should have correctDecimal`);
    } else if (q.inputMode === 'numpad-fraction') {
      assert.ok(q.correctFraction && q.correctFraction.denominator > 0, `${q.id} has valid correctFraction`);
    } else if (q.inputMode === 'multi-sub') {
      assert.ok(q.subItems && q.subItems.length >= 2, `${q.id} should have >= 2 subItems`);
    }
  }
});
