import { ArrowRight } from 'lucide-react';
import type { DiagramSpec, FractionValue, MixedNumberValue } from '../types/math';

export function FractionBlock({
  fraction,
  size = 'md',
}: {
  fraction: FractionValue;
  size?: 'sm' | 'md' | 'lg';
}) {
  const cellClasses =
    size === 'lg'
      ? 'min-w-[40px] h-9 px-2 text-[22px]'
      : size === 'sm'
        ? 'min-w-[26px] h-6 px-1.5 text-sm'
        : 'min-w-[34px] h-8 px-2 text-lg';

  return (
    <span
      className="inline-flex flex-col items-center justify-center align-middle font-display font-extrabold tabular-nums text-[#0F172A]"
      aria-label={`${fraction.numerator} phần ${fraction.denominator}`}
    >
      <span
        className={`${cellClasses} rounded-[8px] bg-[#F1F5F9] border border-[#CBD5E1] flex items-center justify-center leading-none`}
      >
        {fraction.numerator}
      </span>
      <span className="w-full h-[2.5px] bg-[#0F172A] my-1 rounded-full" />
      <span
        className={`${cellClasses} rounded-[8px] bg-[#F1F5F9] border border-[#CBD5E1] flex items-center justify-center leading-none`}
      >
        {fraction.denominator}
      </span>
    </span>
  );
}

export function MixedNumberBlock({
  mixed,
  size = 'sm',
}: {
  mixed: MixedNumberValue;
  size?: 'sm' | 'md';
}) {
  const wholeClasses =
    size === 'md' ? 'text-[26px] mr-2' : 'text-[20px] mr-1.5';

  return (
    <span
      className="inline-flex items-center align-middle font-display font-extrabold tabular-nums text-[#0F172A]"
      aria-label={`${mixed.whole} và ${mixed.numerator} phần ${mixed.denominator}`}
    >
      <span className={wholeClasses}>{mixed.whole}</span>
      <FractionBlock
        fraction={{ numerator: mixed.numerator, denominator: mixed.denominator }}
        size={size}
      />
    </span>
  );
}

const BAR_COLORS = {
  blue: { fill: '#2563EB', light: '#DBEAFE', border: '#93C5FD', text: '#1E40AF' },
  amber: { fill: '#F59E0B', light: '#FEF3C7', border: '#FCD34D', text: '#92400E' },
  emerald: { fill: '#10B981', light: '#D1FAE5', border: '#6EE7B7', text: '#065F46' },
};

const CARD_ACCENTS = {
  blue: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]',
  amber: 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]',
  emerald: 'bg-[#ECFDF5] border-[#A7F3D0] text-[#047857]',
};

export function DiagramRenderer({ diagram }: { diagram: DiagramSpec }) {
  if (diagram.type === 'fraction-bar') {
    return (
      <div className="bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl p-3.5 space-y-2.5">
        {diagram.bars.map((bar, idx) => {
          const palette = BAR_COLORS[bar.color];
          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-display font-bold text-[#475569]">
                <span>{bar.label}</span>
                <span className="tabular-nums" style={{ color: palette.text }}>
                  {bar.numerator} trên {bar.denominator} phần
                </span>
              </div>
              <div
                className="grid gap-1 p-1 bg-white rounded-xl border border-[#CBD5E1]"
                style={{
                  gridTemplateColumns: `repeat(${Math.max(1, bar.denominator)}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: bar.denominator }).map((_, partIdx) => {
                  const shaded = partIdx < bar.numerator;
                  return (
                    <div
                      key={partIdx}
                      className="h-7 rounded-lg transition-colors"
                      style={{
                        backgroundColor: shaded ? palette.fill : '#F1F5F9',
                        border: shaded
                          ? `1.5px solid ${palette.fill}`
                          : '1.5px solid #E2E8F0',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (diagram.type === 'decimal-grid') {
    const primary = diagram.shadedCount;
    const secondary = diagram.secondaryCount ?? 0;
    return (
      <div className="bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl p-3.5 flex flex-col sm:flex-row items-center gap-4">
        <div
          className="grid grid-cols-10 gap-[2.5px] p-1.5 bg-white border-2 border-[#CBD5E1] rounded-xl shrink-0"
          role="img"
          aria-label={diagram.caption}
        >
          {Array.from({ length: 100 }).map((_, idx) => {
            let bg = '#F1F5F9';
            if (idx < primary) {
              bg = '#2563EB';
            } else if (idx < primary + secondary) {
              bg = '#F59E0B';
            }
            return (
              <div
                key={idx}
                className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[3px]"
                style={{ backgroundColor: bg }}
              />
            );
          })}
        </div>
        <div className="space-y-2 text-center sm:text-left">
          <p className="font-display font-bold text-sm text-[#0F172A]">
            Mô hình lưới phần trăm
          </p>
          <p className="font-body font-semibold text-sm text-[#475569]">
            {diagram.caption}
          </p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-xs font-display font-bold text-[#475569]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#2563EB]" aria-hidden="true" />
              {primary}/100 ({(primary / 100).toFixed(2).replace('.', ',')})
            </span>
            {secondary > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#F59E0B]" aria-hidden="true" />
                {secondary}/100 ({(secondary / 100).toFixed(2).replace('.', ',')})
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (diagram.type === 'geometry-shape') {
    const isPerimeter = diagram.highlight === 'perimeter';
    const topText = diagram.widthLabel ?? `${diagram.width} ${diagram.unit}`;
    const sideText = diagram.heightLabel ?? `${diagram.height} ${diagram.unit}`;

    return (
      <div className="bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl p-4 flex flex-col items-center">
        <svg
          viewBox="0 0 320 165"
          className="w-full max-w-[320px] h-36"
          role="img"
          aria-label={`Hình ${diagram.shape === 'rectangle' ? 'chữ nhật' : 'tam giác'} với thông số ${topText} và ${sideText}`}
        >
          <defs>
            <pattern id="geo-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect x="10" y="10" width="300" height="145" rx="12" fill="url(#geo-grid)" />

          {diagram.shape === 'rectangle' ? (
            <g>
              <rect
                x="45"
                y="34"
                width="150"
                height="90"
                rx="4"
                fill={isPerimeter ? '#FFFFFF' : '#DBEAFE'}
                stroke={isPerimeter ? '#F59E0B' : '#2563EB'}
                strokeWidth={isPerimeter ? '4' : '3'}
              />
              <text
                x="120"
                y="25"
                textAnchor="middle"
                className="font-display font-bold fill-[#0F172A] text-[12px]"
              >
                {topText}
              </text>
              <text
                x="204"
                y="84"
                textAnchor="start"
                className="font-display font-bold fill-[#0F172A] text-[12px]"
              >
                {sideText}
              </text>
            </g>
          ) : (
            <g>
              <polygon
                points="65,126 215,126 65,34"
                fill="#FEF3C7"
                stroke="#D97706"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <polyline
                points="65,112 79,112 79,126"
                fill="none"
                stroke="#B45309"
                strokeWidth="2"
              />
              <text
                x="140"
                y="146"
                textAnchor="middle"
                className="font-display font-bold fill-[#0F172A] text-[12px]"
              >
                đáy = {topText}
              </text>
              <text
                x="53"
                y="84"
                textAnchor="end"
                className="font-display font-bold fill-[#0F172A] text-[12px]"
              >
                h = {sideText}
              </text>
            </g>
          )}
        </svg>
      </div>
    );
  }

  if (diagram.type === 'clock-angle') {
    const cx = 90;
    const cy = 90;
    const hourAngleDeg = ((diagram.hour % 12) + diagram.minute / 60) * 30 - 90;
    const minuteAngleDeg = diagram.minute * 6 - 90;
    const hourAngleRad = (hourAngleDeg * Math.PI) / 180;
    const minuteAngleRad = (minuteAngleDeg * Math.PI) / 180;

    const hourX = cx + Math.cos(hourAngleRad) * 38;
    const hourY = cy + Math.sin(hourAngleRad) * 38;
    const minX = cx + Math.cos(minuteAngleRad) * 56;
    const minY = cy + Math.sin(minuteAngleRad) * 56;

    return (
      <div className="bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-center gap-5">
        <svg
          viewBox="0 0 180 180"
          className="w-40 h-40 shrink-0"
          role="img"
          aria-label={diagram.caption}
        >
          <circle cx={cx} cy={cy} r="76" fill="#FFFFFF" stroke="#84CC16" strokeWidth="8" />
          {/* 12 clock ticks & numbers */}
          {Array.from({ length: 12 }).map((_, i) => {
            const num = i === 0 ? 12 : i;
            const angle = ((i * 30 - 90) * Math.PI) / 180;
            const tx = cx + Math.cos(angle) * 57;
            const ty = cy + Math.sin(angle) * 57 + 4;
            const t1x = cx + Math.cos(angle) * 68;
            const t1y = cy + Math.sin(angle) * 68;
            const t2x = cx + Math.cos(angle) * 72;
            const t2y = cy + Math.sin(angle) * 72;
            return (
              <g key={num}>
                <line x1={t1x} y1={t1y} x2={t2x} y2={t2y} stroke="#65A30D" strokeWidth="2" />
                <text
                  x={tx}
                  y={ty}
                  textAnchor="middle"
                  className="font-display font-extrabold fill-[#0F172A] text-[12px]"
                >
                  {num}
                </text>
              </g>
            );
          })}
          {/* Minute hand (red pointing to 12) */}
          <line
            x1={cx}
            y1={cy}
            x2={minX}
            y2={minY}
            stroke="#EF4444"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Hour hand (blue pointing to 3) */}
          <line
            x1={cx}
            y1={cy}
            x2={hourX}
            y2={hourY}
            stroke="#0284C7"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r="6" fill="#334155" />
        </svg>
        <div className="space-y-1.5 text-center sm:text-left max-w-xs">
          <div className="font-display font-extrabold text-sm text-[#0F172A]">
            Đồng hồ trong Đề ôn số 2 · Bài 6
          </div>
          <p className="font-body font-semibold text-sm text-[#475569]">
            {diagram.caption}
          </p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-xs font-display font-bold pt-1">
            <span className="inline-flex items-center gap-1.5 text-[#DC2626]">
              <span className="w-3 h-1 rounded-full bg-[#EF4444]" aria-hidden="true" />
              Kim phút (chỉ 12)
            </span>
            <span className="inline-flex items-center gap-1.5 text-[#0284C7]">
              <span className="w-3 h-1 rounded-full bg-[#0284C7]" aria-hidden="true" />
              Kim giờ (chỉ 3)
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (diagram.type === 'info-cards') {
    const colClass =
      diagram.cards.length === 4
        ? 'grid-cols-2 sm:grid-cols-4'
        : diagram.cards.length === 3
          ? 'grid-cols-1 sm:grid-cols-3'
          : 'grid-cols-1 sm:grid-cols-2';

    return (
      <div className="bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl p-4 space-y-2.5">
        <div className="font-display font-bold text-xs text-[#64748B]">
          {diagram.title}
        </div>
        <div className={`grid ${colClass} gap-2.5`}>
          {diagram.cards.map((card, idx) => {
            const accent = CARD_ACCENTS[card.accent ?? 'blue'];
            return (
              <div
                key={idx}
                className={`rounded-xl border-2 px-3.5 py-2.5 text-center ${accent}`}
              >
                <div className="font-display font-bold text-[11px] opacity-80">
                  {card.label}
                </div>
                <div className="font-display font-extrabold text-base text-[#0F172A] tabular-nums mt-0.5">
                  {card.value}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // measurement-scale
  return (
    <div className="bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl p-4 flex items-center justify-center gap-3 sm:gap-5 flex-wrap">
      <div className="bg-white border-2 border-[#CBD5E1] rounded-xl px-4 py-2 text-center min-w-[100px]">
        <div className="font-display font-extrabold text-lg text-[#0F172A] tabular-nums">
          {diagram.leftValue}
        </div>
        <div className="font-display font-bold text-xs text-[#64748B]">
          {diagram.leftUnit}
        </div>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="font-display font-extrabold text-xs text-[#047857] bg-[#ECFDF5] border border-[#A7F3D0] rounded-full px-3 py-0.5 tabular-nums">
          {diagram.factorLabel}
        </span>
        <ArrowRight className="w-5 h-5 text-[#10B981]" aria-hidden="true" />
      </div>

      <div className="bg-[#ECFDF5] border-2 border-[#10B981] rounded-xl px-4 py-2 text-center min-w-[100px]">
        <div className="font-display font-extrabold text-lg text-[#047857] tabular-nums">
          {diagram.rightValue}
        </div>
        <div className="font-display font-bold text-xs text-[#065F46]">
          {diagram.rightUnit}
        </div>
      </div>
    </div>
  );
}
