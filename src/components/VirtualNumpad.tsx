import { useState } from 'react';
import { Delete, RotateCcw } from 'lucide-react';

interface VirtualNumpadProps {
  mode: 'decimal' | 'fraction';
  decimalText: string;
  numeratorText: string;
  denominatorText: string;
  unitSuffix?: string;
  disabled?: boolean;
  onChangeDecimal: (val: string) => void;
  onChangeNumerator: (val: string) => void;
  onChangeDenominator: (val: string) => void;
}

export function VirtualNumpad({
  mode,
  decimalText,
  numeratorText,
  denominatorText,
  unitSuffix,
  disabled = false,
  onChangeDecimal,
  onChangeNumerator,
  onChangeDenominator,
}: VirtualNumpadProps) {
  const [activeSlot, setActiveSlot] = useState<'numerator' | 'denominator'>('numerator');

  const handleDigit = (key: string) => {
    if (disabled) return;

    if (mode === 'decimal') {
      if (key === ',' && (decimalText.includes(',') || decimalText.includes('.'))) return;
      if (decimalText.length >= 10) return;
      const next = decimalText === '' && key === ',' ? '0,' : decimalText + key;
      onChangeDecimal(next);
      return;
    }

    if (key === ',') return;
    const current = activeSlot === 'numerator' ? numeratorText : denominatorText;
    if (current.length >= 4) return;
    const next = current + key;
    if (activeSlot === 'numerator') {
      onChangeNumerator(next);
    } else {
      onChangeDenominator(next);
    }
  };

  const handleBackspace = () => {
    if (disabled) return;
    if (mode === 'decimal') {
      onChangeDecimal(decimalText.slice(0, -1));
      return;
    }
    if (activeSlot === 'numerator') {
      onChangeNumerator(numeratorText.slice(0, -1));
    } else {
      onChangeDenominator(denominatorText.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (disabled) return;
    if (mode === 'decimal') {
      onChangeDecimal('');
    } else {
      onChangeNumerator('');
      onChangeDenominator('');
      setActiveSlot('numerator');
    }
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', mode === 'decimal' ? ',' : 'C', '0', 'BACK'];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
      {/* Ô nhập đáp án toán học */}
      <div className="flex flex-col items-center gap-2">
        {mode === 'decimal' ? (
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="math-decimal-input">
              Giá trị đáp án
            </label>
            <input
              id="math-decimal-input"
              type="text"
              inputMode="decimal"
              disabled={disabled}
              value={decimalText}
              onChange={(e) => {
                const filtered = e.target.value.replace('.', ',').replace(/[^0-9,]/g, '');
                if ((filtered.match(/,/g) || []).length <= 1) {
                  onChangeDecimal(filtered);
                }
              }}
              placeholder="?"
              className="w-44 h-16 rounded-2xl bg-white border-2 border-[#2563EB] text-center font-display font-extrabold text-[26px] text-[#0F172A] tabular-nums focus:outline-none focus:ring-4 focus:ring-[#DBEAFE]"
            />
            {unitSuffix && (
              <span className="font-display font-bold text-lg text-[#475569]">
                {unitSuffix}
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <span className="font-display font-bold text-xs text-[#64748B]">
              Chạm ô trên hoặc ô dưới để nhập
            </span>
            <div className="inline-flex flex-col items-center p-3 rounded-2xl bg-[#F8FAFC] border-2 border-[#E2E8F0]">
              <button
                type="button"
                disabled={disabled}
                onClick={() => setActiveSlot('numerator')}
                aria-label="Ô nhập tử số"
                className={`w-20 h-12 rounded-[10px] font-display font-extrabold text-[22px] tabular-nums border-2 transition-colors cursor-pointer ${
                  activeSlot === 'numerator'
                    ? 'bg-[#EFF6FF] border-[#2563EB] text-[#004AC6]'
                    : 'bg-white border-[#CBD5E1] text-[#0F172A]'
                }`}
              >
                {numeratorText || '?'}
              </button>
              <div className="w-24 h-[3px] bg-[#0F172A] my-2 rounded-full" />
              <button
                type="button"
                disabled={disabled}
                onClick={() => setActiveSlot('denominator')}
                aria-label="Ô nhập mẫu số"
                className={`w-20 h-12 rounded-[10px] font-display font-extrabold text-[22px] tabular-nums border-2 transition-colors cursor-pointer ${
                  activeSlot === 'denominator'
                    ? 'bg-[#EFF6FF] border-[#2563EB] text-[#004AC6]'
                    : 'bg-white border-[#CBD5E1] text-[#0F172A]'
                }`}
              >
                {denominatorText || '?'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bàn phím toán học ảo nút tròn (>= 48x48px) */}
      <div
        className="grid grid-cols-3 gap-2.5 bg-[#F8FAFC] p-3.5 rounded-2xl border-2 border-[#E2E8F0]"
        role="group"
        aria-label="Bàn phím toán học ảo"
      >
        {keys.map((key) => {
          if (key === 'BACK') {
            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onClick={handleBackspace}
                aria-label="Xóa lùi"
                className="w-12 h-12 rounded-full bg-[#EFF6FF] border-2 border-[#BFDBFE] text-[#1D4ED8] flex items-center justify-center font-display font-bold hover:bg-[#DBEAFE] active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Delete className="w-5 h-5" aria-hidden="true" />
              </button>
            );
          }

          if (key === 'C') {
            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onClick={handleClear}
                aria-label="Xóa phân số"
                className="w-12 h-12 rounded-full bg-[#FFFBEB] border-2 border-[#FDE68A] text-[#B45309] flex items-center justify-center font-display font-bold hover:bg-[#FEF3C7] active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
              </button>
            );
          }

          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => handleDigit(key)}
              aria-label={key === ',' ? 'Dấu phẩy thập phân' : `Số ${key}`}
              className="w-12 h-12 rounded-full bg-white border-2 border-[#CBD5E1] shadow-[0_2px_0_#CBD5E1] text-[#0F172A] font-display font-extrabold text-xl tabular-nums flex items-center justify-center hover:bg-[#EFF6FF] hover:border-[#93C5FD] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer disabled:opacity-50"
            >
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
