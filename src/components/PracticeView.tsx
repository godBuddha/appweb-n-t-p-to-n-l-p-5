import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Info,
  Lightbulb,
  RotateCcw,
  Star,
  Trophy,
  XCircle,
} from 'lucide-react';
import { DOMAIN_META, EXAM_META, getQuestionsForMode } from '../data/curriculum';
import type {
  CompareOperator,
  ExamPaperId,
  PracticeMode,
  Question,
  SessionRecord,
  SubQuestionItem,
} from '../types/math';
import {
  calculateSessionScore,
  checkQuestionAnswer,
  type SubAnswerInput,
} from '../utils/mathEngine';
import { DiagramRenderer, FractionBlock, MixedNumberBlock } from './MathDiagrams';
import { VirtualNumpad } from './VirtualNumpad';

interface PracticeViewProps {
  initialMode: PracticeMode;
  streakDays: number;
  onCompleteSession: (
    mode: PracticeMode,
    results: { question: Question; isCorrect: boolean }[],
    sessionRecord: SessionRecord
  ) => void;
  onExitToDashboard: () => void;
}

const EXAM_TABS: { id: ExamPaperId; label: string }[] = [
  { id: 'de-1', label: 'Đề 1' },
  { id: 'de-2', label: 'Đề 2' },
  { id: 'de-3', label: 'Đề 3' },
  { id: 'de-4', label: 'Đề 4' },
];

const TOPIC_TABS: { id: PracticeMode; label: string }[] = [
  { id: 'daily', label: 'Thử thách' },
  { id: 'fractions', label: 'Phân số' },
  { id: 'decimals', label: 'Thập phân' },
  { id: 'geometry', label: 'Hình học' },
  { id: 'measurement', label: 'Đo lường' },
];

function isExamPaper(mode: PracticeMode): mode is ExamPaperId {
  return mode === 'de-1' || mode === 'de-2' || mode === 'de-3' || mode === 'de-4';
}

function getFirstEditableSubId(question?: Question): string | null {
  if (!question || question.inputMode !== 'multi-sub' || !question.subItems) return null;
  const editable = question.subItems.find(
    (s) => s.kind === 'decimal' || s.kind === 'fraction'
  );
  return editable?.id ?? null;
}

export function PracticeView({
  initialMode,
  streakDays,
  onCompleteSession,
  onExitToDashboard,
}: PracticeViewProps) {
  const [mode, setMode] = useState<PracticeMode>(initialMode);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [decimalText, setDecimalText] = useState('');
  const [numeratorText, setNumeratorText] = useState('');
  const [denominatorText, setDenominatorText] = useState('');
  const [subAnswers, setSubAnswers] = useState<Record<string, SubAnswerInput>>({});
  const [activeSubId, setActiveSubId] = useState<string | null>(() =>
    getFirstEditableSubId(getQuestionsForMode(initialMode)[0])
  );
  const [showHint, setShowHint] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [checkedState, setCheckedState] = useState<{
    checked: boolean;
    isCorrect: boolean;
    subResults?: Record<string, boolean>;
  }>({ checked: false, isCorrect: false });
  const [results, setResults] = useState<{ question: Question; isCorrect: boolean }[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const questions = getQuestionsForMode(mode);
  const currentQuestion = questions[currentIndex];
  const examMeta = isExamPaper(mode) ? EXAM_META[mode] : null;

  useEffect(() => {
    const nextQuestions = getQuestionsForMode(initialMode);
    setMode(initialMode);
    setCurrentIndex(0);
    setSelectedOption(null);
    setDecimalText('');
    setNumeratorText('');
    setDenominatorText('');
    setSubAnswers({});
    setActiveSubId(getFirstEditableSubId(nextQuestions[0]));
    setShowHint(false);
    setValidationError(null);
    setCheckedState({ checked: false, isCorrect: false });
    setResults([]);
    setIsFinished(false);
  }, [initialMode]);

  const resetForMode = (nextMode: PracticeMode) => {
    const nextQuestions = getQuestionsForMode(nextMode);
    setMode(nextMode);
    setCurrentIndex(0);
    setSelectedOption(null);
    setDecimalText('');
    setNumeratorText('');
    setDenominatorText('');
    setSubAnswers({});
    setActiveSubId(getFirstEditableSubId(nextQuestions[0]));
    setShowHint(false);
    setValidationError(null);
    setCheckedState({ checked: false, isCorrect: false });
    setResults([]);
    setIsFinished(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const updateSubAnswer = (subId: string, patch: Partial<SubAnswerInput>) => {
    setSubAnswers((prev) => ({
      ...prev,
      [subId]: {
        ...prev[subId],
        ...patch,
      },
    }));
    setValidationError(null);
  };

  const handleCheckAnswer = () => {
    if (!currentQuestion || checkedState.checked) return;

    const outcome = checkQuestionAnswer(currentQuestion, {
      selectedOptionIndex: selectedOption,
      decimalText,
      numeratorText,
      denominatorText,
      subAnswers,
    });

    if (!outcome.isValidInput) {
      setValidationError(outcome.validationMessage ?? 'Hãy nhập đáp án trước khi kiểm tra nhé.');
      return;
    }

    setValidationError(null);
    setCheckedState({
      checked: true,
      isCorrect: outcome.isCorrect,
      subResults: outcome.subResults,
    });
    setResults((prev) => [...prev, { question: currentQuestion, isCorrect: outcome.isCorrect }]);
  };

  const handleNext = () => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (currentIndex + 1 < questions.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setSelectedOption(null);
      setDecimalText('');
      setNumeratorText('');
      setDenominatorText('');
      setSubAnswers({});
      setActiveSubId(getFirstEditableSubId(questions[nextIdx]));
      setShowHint(false);
      setValidationError(null);
      setCheckedState({ checked: false, isCorrect: false });
    } else {
      const correctCount = results.filter((r) => r.isCorrect).length;
      const summary = calculateSessionScore(
        correctCount,
        questions.length,
        streakDays,
        mode === 'daily'
      );
      const titleMap: Record<PracticeMode, string> = {
        daily: 'Thử thách mỗi ngày',
        'de-1': 'Đề ôn số 1 (10 câu theo đề cương)',
        'de-2': 'Đề ôn số 2 (10 câu theo đề cương)',
        'de-3': 'Đề ôn số 3 (10 câu theo đề cương)',
        'de-4': 'Đề ôn số 4 (10 câu theo đề cương)',
        fractions: 'Chuyên đề Phân số',
        decimals: 'Chuyên đề Số thập phân',
        geometry: 'Chuyên đề Hình học',
        measurement: 'Chuyên đề Đo lường',
      };
      const record: SessionRecord = {
        id: `s-${Date.now()}`,
        dateLabel: 'Vừa xong',
        domain: mode,
        title: titleMap[mode],
        correctCount,
        totalCount: questions.length,
        xpEarned: summary.xpEarned,
        stars: summary.stars,
      };
      onCompleteSession(mode, results, record);
      setIsFinished(true);
    }
  };

  const progressPercent = Math.round(
    ((currentIndex + (checkedState.checked ? 1 : 0)) / Math.max(1, questions.length)) * 100
  );

  if (isFinished) {
    const correctCount = results.filter((r) => r.isCorrect).length;
    const summary = calculateSessionScore(
      correctCount,
      questions.length,
      streakDays,
      mode === 'daily'
    );

    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-8 py-10">
        <section className="bg-white border-2 border-[#E2E8F0] rounded-3xl p-6 sm:p-10 text-center space-y-6 victory-shadow">
          <div className="w-24 h-24 mx-auto rounded-full bg-[#FEF3C7] border-4 border-[#F59E0B] flex items-center justify-center badge-glow-gold">
            <Trophy className="w-12 h-12 text-[#B45309]" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <h1 className="font-display font-extrabold text-3xl text-[#0F172A]">
              {summary.isPerfect ? 'Xuất sắc 100%!' : 'Hoàn thành bài ôn tập!'}
            </h1>
            <p className="font-body font-semibold text-base text-[#475569]">
              Bạn đã trả lời đúng {correctCount} trên {questions.length} câu hỏi.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3" aria-label={`Đạt ${summary.stars} trên 3 sao`}>
            {[1, 2, 3].map((starIdx) => (
              <Star
                key={starIdx}
                className={`w-10 h-10 ${
                  starIdx <= summary.stars
                    ? 'fill-[#F59E0B] text-[#F59E0B]'
                    : 'text-[#CBD5E1]'
                }`}
                aria-hidden="true"
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl p-3">
              <div className="font-display font-bold text-xs text-[#64748B]">Độ chính xác</div>
              <div className="font-display font-extrabold text-2xl text-[#047857] tabular-nums mt-1">
                {summary.accuracyPercent}%
              </div>
            </div>
            <div className="bg-[#FFFBEB] border-2 border-[#FDE68A] rounded-2xl p-3">
              <div className="font-display font-bold text-xs text-[#B45309]">XP nhận được</div>
              <div className="font-display font-extrabold text-2xl text-[#B45309] tabular-nums mt-1">
                +{summary.xpEarned}
              </div>
            </div>
            <div className="bg-[#EFF6FF] border-2 border-[#BFDBFE] rounded-2xl p-3">
              <div className="font-display font-bold text-xs text-[#1D4ED8]">Số sao</div>
              <div className="font-display font-extrabold text-2xl text-[#2563EB] tabular-nums mt-1">
                {summary.stars}/3
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => resetForMode(mode)}
              className="btn-ghost-sky px-6 py-3.5 rounded-full font-display font-bold text-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Làm lại bài này</span>
            </button>
            <button
              type="button"
              onClick={onExitToDashboard}
              className="btn-tactile-primary px-7 py-3.5 rounded-full font-display font-extrabold text-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Về trang chủ</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </section>
      </main>
    );
  }

  const domainMeta = DOMAIN_META[currentQuestion.domain];
  const subItems: SubQuestionItem[] = currentQuestion.subItems ?? [];
  const editableSubItems = subItems.filter((s) => s.kind === 'decimal' || s.kind === 'fraction');
  const activeSubItem =
    editableSubItems.find((s) => s.id === activeSubId) ?? editableSubItems[0] ?? null;
  const activeSubEntry = activeSubItem ? subAnswers[activeSubItem.id] ?? {} : {};

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-8 py-4 sm:py-5 space-y-3.5">
      {/* Thanh chọn đề ôn & chuyên đề */}
      <div className="flex items-center justify-between gap-2.5 flex-wrap">
        <button
          type="button"
          onClick={onExitToDashboard}
          className="btn-ghost-sky px-3.5 py-1.5 rounded-full font-display font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Trang chủ</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <div
            className="flex items-center gap-1 p-1 bg-white border-2 border-[#E2E8F0] rounded-xl"
            role="tablist"
            aria-label="Chọn đề ôn tập"
          >
            {EXAM_TABS.map((tab) => {
              const active = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => resetForMode(tab.id)}
                  className={`px-2.5 py-1 rounded-lg font-display font-bold text-xs whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#2563EB] text-white'
                      : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div
            className="flex items-center gap-1 p-1 bg-white border-2 border-[#E2E8F0] rounded-xl overflow-x-auto max-w-full"
            role="tablist"
            aria-label="Chọn chuyên đề luyện tập"
          >
            {TOPIC_TABS.map((tab) => {
              const active = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => resetForMode(tab.id)}
                  className={`px-2.5 py-1 rounded-lg font-display font-bold text-xs whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#047857] text-white'
                      : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ghi chú đề cương */}
      {examMeta?.sourceNote && currentIndex === 0 && (
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl px-4 py-2.5 flex items-start gap-2.5 text-xs font-body font-semibold text-[#1E3A8A]">
          <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" aria-hidden="true" />
          <span>{examMeta.sourceNote}</span>
        </div>
      )}

      {/* Thanh tiến độ bài học 12px */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-display font-bold text-[#475569] tabular-nums">
          <span>
            Câu {currentIndex + 1} / {questions.length}
          </span>
          <span>Hoàn thành {progressPercent}%</span>
        </div>
        <div className="h-3 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2563EB] rounded-full progress-striped transition-all duration-300"
            style={{ width: `${Math.max(8, progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Thẻ câu hỏi */}
      <section className="card-surface rounded-3xl p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full font-display font-extrabold text-xs bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
              {currentQuestion.sourceLabel}
            </span>
            <span
              className="px-3 py-1 rounded-full font-display font-bold text-xs"
              style={{ backgroundColor: domainMeta.chipBg, color: domainMeta.chipText }}
            >
              {domainMeta.title}
            </span>
            <span className="font-display font-bold text-xs text-[#64748B]">
              {currentQuestion.topic}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowHint((h) => !h)}
            className="btn-ghost-sky px-3.5 py-1.5 rounded-full font-display font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5 text-[#F59E0B]" aria-hidden="true" />
            <span>{showHint ? 'Ẩn gợi ý' : 'Xem gợi ý'}</span>
          </button>
        </div>

        {/* Ghi chú khôi phục công thức nếu câu hỏi gốc bị trống ảnh */}
        {currentQuestion.placeholderNote && (
          <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl px-3.5 py-2 flex items-start gap-2 text-xs font-body font-semibold text-[#92400E]">
            <Info className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" aria-hidden="true" />
            <span>{currentQuestion.placeholderNote}</span>
          </div>
        )}

        {/* Đề bài & Biểu thức */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="font-display font-extrabold text-lg sm:text-xl text-[#0F172A] leading-snug">
            {currentQuestion.prompt}
          </h1>

          {currentQuestion.formula && (
            <div className="inline-flex items-center gap-2 bg-[#EFF4FF] border border-[#DBEAFE] rounded-2xl px-4 py-2 font-display font-extrabold text-[19px] text-[#0F172A] tabular-nums shrink-0 self-start sm:self-center">
              {currentQuestion.formula.leftFraction && (
                <FractionBlock fraction={currentQuestion.formula.leftFraction} size="sm" />
              )}
              {currentQuestion.formula.operator && (
                <span className="text-[#2563EB] px-0.5">{currentQuestion.formula.operator}</span>
              )}
              {currentQuestion.formula.rightFraction && (
                <FractionBlock fraction={currentQuestion.formula.rightFraction} size="sm" />
              )}
              {currentQuestion.formula.expressionText && (
                <span>{currentQuestion.formula.expressionText}</span>
              )}
            </div>
          )}
        </div>

        {/* Hình minh họa trực quan */}
        <DiagramRenderer diagram={currentQuestion.diagram} />

        {/* Hộp gợi ý */}
        {showHint && (
          <div className="bg-[#FFFBEB] border-2 border-[#FDE68A] rounded-2xl p-4 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" aria-hidden="true" />
            <p className="font-body font-semibold text-sm text-[#92400E]">
              <strong className="font-display font-bold">Gợi ý: </strong>
              {currentQuestion.hint}
            </p>
          </div>
        )}

        {/* Ô nhập liệu theo từng loại câu hỏi */}
        {currentQuestion.inputMode === 'multiple-choice' && currentQuestion.options ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectOption = idx === currentQuestion.correctOptionIndex;

              let tileClasses =
                'bg-white border-2 border-[#E2E8F0] hover:border-[#93C5FD] text-[#0F172A]';
              if (checkedState.checked) {
                if (isCorrectOption) {
                  tileClasses = 'bg-[#ECFDF5] border-2 border-[#10B981] text-[#065F46]';
                } else if (isSelected && !checkedState.isCorrect) {
                  tileClasses = 'bg-[#FEF2F2] border-2 border-[#EF4444] text-[#991B1B]';
                } else {
                  tileClasses = 'bg-[#F8FAFC] border-2 border-[#E2E8F0] text-[#64748B] opacity-75';
                }
              } else if (isSelected) {
                tileClasses = 'bg-[#EFF6FF] border-2 border-[#2563EB] text-[#004AC6]';
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={checkedState.checked}
                  onClick={() => {
                    setSelectedOption(idx);
                    setValidationError(null);
                  }}
                  aria-pressed={isSelected}
                  className={`min-h-[64px] p-4 rounded-2xl font-display font-extrabold text-base sm:text-lg flex items-center justify-between gap-3 text-left transition-all cursor-pointer disabled:cursor-default ${tileClasses}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-[#F1F5F9] border border-[#CBD5E1] text-xs font-display font-extrabold text-[#475569] flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {opt.mixedNumber ? (
                      <MixedNumberBlock mixed={opt.mixedNumber} size="sm" />
                    ) : opt.fraction ? (
                      <FractionBlock fraction={opt.fraction} size="sm" />
                    ) : (
                      <span className="tabular-nums">{opt.label}</span>
                    )}
                  </div>

                  {isSelected && !checkedState.checked && (
                    <span className="w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4" aria-hidden="true" />
                    </span>
                  )}
                  {checkedState.checked && isCorrectOption && (
                    <CheckCircle2 className="w-6 h-6 text-[#10B981] shrink-0" aria-hidden="true" />
                  )}
                  {checkedState.checked && isSelected && !isCorrectOption && (
                    <XCircle className="w-6 h-6 text-[#EF4444] shrink-0" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        ) : currentQuestion.inputMode === 'multi-sub' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {subItems.map((item) => {
                const entry = subAnswers[item.id] ?? {};
                const subOk = checkedState.subResults?.[item.id];

                if (item.kind === 'compare') {
                  const chosenSign = entry.compareSign;
                  const signs: CompareOperator[] = ['<', '=', '>'];
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border-2 flex items-center justify-between gap-2 ${
                        checkedState.checked
                          ? subOk
                            ? 'bg-[#ECFDF5] border-[#10B981]'
                            : 'bg-[#FEF2F2] border-[#EF4444]'
                          : 'bg-[#F8FAFC] border-[#E2E8F0]'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-display font-extrabold text-base text-[#0F172A] tabular-nums">
                        <span className="text-xs text-[#64748B]">{item.label}</span>
                        <span>{item.compareLeft}</span>
                      </div>

                      <div className="flex items-center gap-1" role="group" aria-label={`Chọn dấu cho ${item.compareLeft} và ${item.compareRight}`}>
                        {signs.map((sign) => {
                          const isChosen = chosenSign === sign;
                          const isExpected = checkedState.checked && item.correctCompare === sign;
                          return (
                            <button
                              key={sign}
                              type="button"
                              disabled={checkedState.checked}
                              aria-pressed={isChosen}
                              onClick={() => updateSubAnswer(item.id, { compareSign: sign })}
                              className={`w-9 h-9 rounded-xl font-display font-extrabold text-base transition-all cursor-pointer disabled:cursor-default border-2 ${
                                isExpected
                                  ? 'bg-[#10B981] border-[#059669] text-white'
                                  : isChosen
                                  ? 'bg-[#2563EB] border-[#1D4ED8] text-white'
                                  : 'bg-white border-[#CBD5E1] text-[#0F172A] hover:border-[#93C5FD]'
                              }`}
                            >
                              {sign}
                            </button>
                          );
                        })}
                      </div>

                      <div className="font-display font-extrabold text-base text-[#0F172A] tabular-nums">
                        {item.compareRight}
                      </div>
                    </div>
                  );
                }

                if (item.kind === 'choice' && item.options) {
                  return (
                    <div
                      key={item.id}
                      className="sm:col-span-2 p-4 rounded-2xl border-2 border-[#E2E8F0] bg-[#F8FAFC] space-y-2.5"
                    >
                      <div className="font-display font-bold text-sm text-[#0F172A]">
                        {item.label}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {item.options.map((optLabel, cIdx) => {
                          const isChosen = entry.choiceIndex === cIdx;
                          const isRight = checkedState.checked && item.correctChoiceIndex === cIdx;
                          return (
                            <button
                              key={optLabel}
                              type="button"
                              disabled={checkedState.checked}
                              aria-pressed={isChosen}
                              onClick={() => updateSubAnswer(item.id, { choiceIndex: cIdx })}
                              className={`px-3.5 py-2.5 rounded-xl border-2 font-display font-bold text-xs sm:text-sm text-left flex items-center justify-between gap-2 transition-colors cursor-pointer disabled:cursor-default ${
                                isRight
                                  ? 'bg-[#ECFDF5] border-[#10B981] text-[#065F46]'
                                  : checkedState.checked && isChosen && !isRight
                                  ? 'bg-[#FEF2F2] border-[#EF4444] text-[#991B1B]'
                                  : isChosen
                                  ? 'bg-[#EFF6FF] border-[#2563EB] text-[#004AC6]'
                                  : 'bg-white border-[#E2E8F0] text-[#0F172A] hover:border-[#93C5FD]'
                              }`}
                            >
                              <span className="tabular-nums">{optLabel}</span>
                              {isRight && <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                // Editable decimal or fraction sub-item card
                const isActive = activeSubItem?.id === item.id;
                const displayVal =
                  item.kind === 'fraction'
                    ? entry.numeratorText || entry.denominatorText
                      ? `${entry.numeratorText || '?'}/${entry.denominatorText || '?'}`
                      : '?'
                    : entry.decimalText || '?';

                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={checkedState.checked}
                    onClick={() => setActiveSubId(item.id)}
                    className={`p-3.5 rounded-2xl border-2 text-left flex items-center justify-between gap-3 transition-all cursor-pointer disabled:cursor-default ${
                      checkedState.checked
                        ? subOk
                          ? 'bg-[#ECFDF5] border-[#10B981]'
                          : 'bg-[#FEF2F2] border-[#EF4444]'
                        : isActive
                        ? 'bg-[#EFF6FF] border-[#2563EB] ring-2 ring-[#DBEAFE]'
                        : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#93C5FD]'
                    }`}
                  >
                    <span className="font-display font-bold text-sm text-[#0F172A]">
                      {item.label}
                    </span>

                    <span className="inline-flex items-center gap-1.5 shrink-0">
                      <span
                        className={`min-w-[68px] px-3 py-1 rounded-xl border-2 text-center font-display font-extrabold text-base tabular-nums ${
                          isActive && !checkedState.checked
                            ? 'bg-white border-[#2563EB] text-[#004AC6]'
                            : 'bg-white border-[#CBD5E1] text-[#0F172A]'
                        }`}
                      >
                        {displayVal}
                      </span>
                      {item.unitSuffix && (
                        <span className="font-display font-bold text-xs text-[#475569]">
                          {item.unitSuffix}
                        </span>
                      )}
                      {checkedState.checked && subOk && (
                        <CheckCircle2 className="w-5 h-5 text-[#10B981]" aria-hidden="true" />
                      )}
                      {checkedState.checked && !subOk && (
                        <XCircle className="w-5 h-5 text-[#EF4444]" aria-hidden="true" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bàn phím dùng chung cho ô ý nhỏ đang chọn (ẩn sau khi đã chấm để gọn màn hình) */}
            {!checkedState.checked && activeSubItem && (
              <div className="pt-1 border-t border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-display font-bold text-xs text-[#1D4ED8]">
                    Đang nhập cho: {activeSubItem.label}
                  </span>
                  {editableSubItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const curIdx = editableSubItems.findIndex((s) => s.id === activeSubItem.id);
                        const next = editableSubItems[(curIdx + 1) % editableSubItems.length];
                        if (next) setActiveSubId(next.id);
                      }}
                      className="btn-ghost-sky px-3 py-1 rounded-full font-display font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Chuyển sang ô tiếp theo</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>

                <VirtualNumpad
                  mode={activeSubItem.kind === 'fraction' ? 'fraction' : 'decimal'}
                  decimalText={activeSubEntry.decimalText ?? ''}
                  numeratorText={activeSubEntry.numeratorText ?? ''}
                  denominatorText={activeSubEntry.denominatorText ?? ''}
                  unitSuffix={activeSubItem.unitSuffix}
                  disabled={checkedState.checked}
                  onChangeDecimal={(v) => updateSubAnswer(activeSubItem.id, { decimalText: v })}
                  onChangeNumerator={(v) => updateSubAnswer(activeSubItem.id, { numeratorText: v })}
                  onChangeDenominator={(v) =>
                    updateSubAnswer(activeSubItem.id, { denominatorText: v })
                  }
                />
              </div>
            )}
          </div>
        ) : (
          <VirtualNumpad
            mode={currentQuestion.inputMode === 'numpad-fraction' ? 'fraction' : 'decimal'}
            decimalText={decimalText}
            numeratorText={numeratorText}
            denominatorText={denominatorText}
            unitSuffix={currentQuestion.unitSuffix}
            disabled={checkedState.checked}
            onChangeDecimal={(v) => {
              setDecimalText(v);
              setValidationError(null);
            }}
            onChangeNumerator={(v) => {
              setNumeratorText(v);
              setValidationError(null);
            }}
            onChangeDenominator={(v) => {
              setDenominatorText(v);
              setValidationError(null);
            }}
          />
        )}

        {/* Thông báo lỗi nhập liệu */}
        {validationError && (
          <div
            role="alert"
            className="bg-[#FEF2F2] border-2 border-[#FCA5A5] rounded-2xl px-4 py-3 text-sm font-display font-bold text-[#991B1B]"
          >
            {validationError}
          </div>
        )}

        {/* Phản hồi đúng/sai tức thì */}
        {checkedState.checked && (
          <div
            className={`rounded-2xl p-4 border-2 flex items-start gap-3 ${
              checkedState.isCorrect
                ? 'bg-[#ECFDF5] border-[#10B981] text-[#065F46]'
                : 'bg-[#FEF2F2] border-[#EF4444] text-[#991B1B]'
            }`}
          >
            {checkedState.isCorrect ? (
              <CheckCircle2 className="w-6 h-6 text-[#10B981] shrink-0 mt-0.5" aria-hidden="true" />
            ) : (
              <XCircle className="w-6 h-6 text-[#EF4444] shrink-0 mt-0.5" aria-hidden="true" />
            )}
            <div className="space-y-1">
              <div className="font-display font-extrabold text-base">
                {checkedState.isCorrect
                  ? 'Chính xác! Tuyệt vời (+20 XP)'
                  : 'Chưa đúng rồi — cùng xem cách giải nhé'}
              </div>
              <p className="font-body font-semibold text-sm">
                {currentQuestion.explanation}
              </p>
            </div>
          </div>
        )}

        {/* Nút hành động chính */}
        <div className="flex justify-end pt-2">
          {!checkedState.checked ? (
            <button
              type="button"
              onClick={handleCheckAnswer}
              className="btn-tactile-primary w-full sm:w-auto px-8 py-3.5 rounded-full font-display font-extrabold text-base cursor-pointer"
            >
              Kiểm tra
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="btn-tactile-emerald w-full sm:w-auto px-8 py-3.5 rounded-full font-display font-extrabold text-base inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>
                {currentIndex + 1 < questions.length ? 'Câu tiếp theo' : 'Hoàn thành bài học'}
              </span>
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
