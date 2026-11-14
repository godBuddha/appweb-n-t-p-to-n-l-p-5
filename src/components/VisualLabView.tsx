import { useEffect, useState } from 'react';
import { ArrowRight, Compass, Layers, RotateCcw, Ruler, Shapes } from 'lucide-react';
import type { MathDomain } from '../types/math';
import {
  computeGeometryMetrics,
  convertArea,
  convertLength,
  convertMass,
  formatDecimalVi,
  simplifyFraction,
  type AreaUnit,
  type LengthUnit,
  type MassUnit,
  type MeasurementCategory,
} from '../utils/mathEngine';
import { FractionBlock } from './MathDiagrams';

interface VisualLabViewProps {
  initialDomain: MathDomain;
  onStartPractice: (domain: MathDomain) => void;
}

const LAB_TABS: { id: MathDomain; label: string; icon: typeof Layers }[] = [
  { id: 'fractions', label: 'Thanh Phân Số', icon: Layers },
  { id: 'decimals', label: 'Lưới Thập Phân', icon: Compass },
  { id: 'geometry', label: 'Diện Tích & Chu Vi', icon: Shapes },
  { id: 'measurement', label: 'Đổi Đơn Vị', icon: Ruler },
];

export function VisualLabView({ initialDomain, onStartPractice }: VisualLabViewProps) {
  const [activeTab, setActiveTab] = useState<MathDomain>(initialDomain);

  // Trạng thái Phân số
  const [fracANum, setFracANum] = useState(1);
  const [fracADen, setFracADen] = useState(2);
  const [fracBNum, setFracBNum] = useState(1);
  const [fracBDen, setFracBDen] = useState(4);

  // Trạng thái Lưới Thập phân
  const [decimalSquares, setDecimalSquares] = useState(45);

  // Trạng thái Hình học
  const [geoShape, setGeoShape] = useState<'rectangle' | 'triangle'>('rectangle');
  const [geoWidth, setGeoWidth] = useState(6);
  const [geoHeight, setGeoHeight] = useState(4);

  // Trạng thái Đo lường
  const [measCategory, setMeasCategory] = useState<MeasurementCategory>('area');
  const [measInput, setMeasInput] = useState('36');
  const [lengthFrom, setLengthFrom] = useState<LengthUnit>('km');
  const [lengthTo, setLengthTo] = useState<LengthUnit>('m');
  const [massFrom, setMassFrom] = useState<MassUnit>('tấn');
  const [massTo, setMassTo] = useState<MassUnit>('kg');
  const [areaFrom, setAreaFrom] = useState<AreaUnit>('ha');
  const [areaTo, setAreaTo] = useState<AreaUnit>('km²');

  useEffect(() => {
    setActiveTab(initialDomain);
  }, [initialDomain]);

  // Tổng phân số
  const sumRawNum = fracANum * fracBDen + fracBNum * fracADen;
  const sumRawDen = fracADen * fracBDen;
  const sumSimplified = simplifyFraction(sumRawNum, sumRawDen);
  const sumDecimal = Number((sumRawNum / sumRawDen).toFixed(3));

  // Giá trị thập phân
  const decSimplified = simplifyFraction(decimalSquares, 100);
  const tenthsDigit = Math.floor(decimalSquares / 10);
  const hundredthsDigit = decimalSquares % 10;

  // Giá trị hình học
  const geoMetrics = computeGeometryMetrics(geoShape, geoWidth, geoHeight);

  // Giá trị đo lường
  const parsedMeas = Number(measInput.replace(',', '.'));
  const safeMeas = Number.isFinite(parsedMeas) ? parsedMeas : 0;

  const activeFromUnit =
    measCategory === 'length' ? lengthFrom : measCategory === 'mass' ? massFrom : areaFrom;
  const activeToUnit =
    measCategory === 'length' ? lengthTo : measCategory === 'mass' ? massTo : areaTo;
  const convertedMeas =
    measCategory === 'length'
      ? convertLength(safeMeas, lengthFrom, lengthTo)
      : measCategory === 'mass'
        ? convertMass(safeMeas, massFrom, massTo)
        : convertArea(safeMeas, areaFrom, areaTo);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
      {/* Tiêu đề & Thanh chọn công cụ */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#0F172A]">
            Phòng Thí Nghiệm Toán Trực Quan
          </h1>
          <p className="font-body font-semibold text-sm text-[#475569]">
            Tương tác trực tiếp với thanh phân số, lưới ô vuông, hình phẳng và thước đo để hiểu rõ bản chất công thức.
          </p>
        </div>

        <div
          className="flex items-center gap-1 p-1.5 bg-white border-2 border-[#E2E8F0] rounded-2xl overflow-x-auto max-w-full"
          role="tablist"
          aria-label="Công cụ toán trực quan"
        >
          {LAB_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl font-display font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#2563EB] text-white'
                    : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mô hình Phân số */}
      {activeTab === 'fractions' && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 card-surface rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-extrabold text-xl text-[#0F172A]">
                Mô Hình Cộng Phân Số
              </h2>
              <span className="font-display font-bold text-xs text-[#4338CA] bg-[#EEF2FF] px-3 py-1 rounded-full">
                Thanh trực quan
              </span>
            </div>

            {/* Thanh A */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-display font-bold text-[#0F172A] tabular-nums">
                <span>Phân số A: {fracANum}/{fracADen}</span>
                <span className="text-[#2563EB]">{Math.round((fracANum / fracADen) * 100)}%</span>
              </div>
              <div
                className="grid gap-1.5 p-1.5 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl"
                style={{ gridTemplateColumns: `repeat(${fracADen}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: fracADen }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-10 rounded-lg border-2 transition-colors ${
                      idx < fracANum
                        ? 'bg-[#2563EB] border-[#1D4ED8]'
                        : 'bg-white border-[#E2E8F0]'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Thanh B */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-display font-bold text-[#0F172A] tabular-nums">
                <span>Phân số B: {fracBNum}/{fracBDen}</span>
                <span className="text-[#B45309]">{Math.round((fracBNum / fracBDen) * 100)}%</span>
              </div>
              <div
                className="grid gap-1.5 p-1.5 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl"
                style={{ gridTemplateColumns: `repeat(${fracBDen}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: fracBDen }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-10 rounded-lg border-2 transition-colors ${
                      idx < fracBNum
                        ? 'bg-[#F59E0B] border-[#D97706]'
                        : 'bg-white border-[#E2E8F0]'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Tổng rút gọn */}
            <div className="bg-[#EFF4FF] border-2 border-[#DBEAFE] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FractionBlock fraction={{ numerator: fracANum, denominator: fracADen }} />
                <span className="font-display font-extrabold text-2xl text-[#2563EB]">+</span>
                <FractionBlock fraction={{ numerator: fracBNum, denominator: fracBDen }} />
                <span className="font-display font-extrabold text-2xl text-[#2563EB]">=</span>
                <FractionBlock fraction={sumSimplified} size="lg" />
              </div>

              <div className="text-right">
                <div className="font-display font-bold text-xs text-[#475569]">Giá trị thập phân</div>
                <div className="font-display font-extrabold text-2xl text-[#004AC6] tabular-nums">
                  {sumDecimal}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 card-surface rounded-3xl p-6 space-y-5">
            <h3 className="font-display font-extrabold text-lg text-[#0F172A]">
              Điều Chỉnh Phân Số
            </h3>

            <div className="space-y-4">
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 space-y-3">
                <div className="font-display font-bold text-sm text-[#2563EB]">
                  Phân số A
                </div>
                <label className="block space-y-1">
                  <div className="flex justify-between text-xs font-display font-bold text-[#475569] tabular-nums">
                    <span>Tử số (Số phần tô)</span>
                    <span>{fracANum}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={fracADen}
                    value={fracANum}
                    onChange={(e) => setFracANum(Number(e.target.value))}
                    className="w-full accent-[#2563EB]"
                  />
                </label>
                <label className="block space-y-1">
                  <div className="flex justify-between text-xs font-display font-bold text-[#475569] tabular-nums">
                    <span>Mẫu số (Tổng số phần)</span>
                    <span>{fracADen}</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={10}
                    value={fracADen}
                    onChange={(e) => {
                      const nextDen = Number(e.target.value);
                      setFracADen(nextDen);
                      if (fracANum > nextDen) setFracANum(nextDen);
                    }}
                    className="w-full accent-[#2563EB]"
                  />
                </label>
              </div>

              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 space-y-3">
                <div className="font-display font-bold text-sm text-[#B45309]">
                  Phân số B
                </div>
                <label className="block space-y-1">
                  <div className="flex justify-between text-xs font-display font-bold text-[#475569] tabular-nums">
                    <span>Tử số (Số phần tô)</span>
                    <span>{fracBNum}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={fracBDen}
                    value={fracBNum}
                    onChange={(e) => setFracBNum(Number(e.target.value))}
                    className="w-full accent-[#F59E0B]"
                  />
                </label>
                <label className="block space-y-1">
                  <div className="flex justify-between text-xs font-display font-bold text-[#475569] tabular-nums">
                    <span>Mẫu số (Tổng số phần)</span>
                    <span>{fracBDen}</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={10}
                    value={fracBDen}
                    onChange={(e) => {
                      const nextDen = Number(e.target.value);
                      setFracBDen(nextDen);
                      if (fracBNum > nextDen) setFracBNum(nextDen);
                    }}
                    className="w-full accent-[#F59E0B]"
                  />
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onStartPractice('fractions')}
              className="btn-tactile-primary w-full py-3.5 rounded-full font-display font-extrabold text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Luyện tập Phân số ngay</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </section>
      )}

      {/* Mô hình Lưới Thập Phân */}
      {activeTab === 'decimals' && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 card-surface rounded-3xl p-6 flex flex-col items-center space-y-5">
            <div className="w-full flex items-center justify-between">
              <h2 className="font-display font-extrabold text-xl text-[#0F172A]">
                Lưới Phần Trăm 10×10 Tương Tác
              </h2>
              <span className="font-display font-bold text-xs text-[#0E7490] bg-[#ECFEFF] px-3 py-1 rounded-full">
                Chạm vào ô bất kỳ
              </span>
            </div>

            <div
              className="grid grid-cols-10 gap-1 p-3 bg-[#F8FAFC] border-2 border-[#CBD5E1] rounded-2xl"
              role="group"
              aria-label="Lưới phần trăm 10 nhân 10"
            >
              {Array.from({ length: 100 }).map((_, idx) => {
                const filled = idx < decimalSquares;
                return (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Chọn ${idx + 1} phần trăm`}
                    onClick={() => setDecimalSquares(idx + 1)}
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-md border transition-colors cursor-pointer ${
                      filled
                        ? 'bg-[#2563EB] border-[#1D4ED8] hover:bg-[#3B82F6]'
                        : 'bg-white border-[#CBD5E1] hover:bg-[#EFF6FF]'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 card-surface rounded-3xl p-6 space-y-5">
            <h3 className="font-display font-extrabold text-lg text-[#0F172A]">
              Phân Tích Hàng Thập Phân
            </h3>

            <div className="bg-[#ECFEFF] border-2 border-[#A5F3FC] rounded-2xl p-5 text-center space-y-1">
              <div className="font-display font-bold text-xs text-[#0E7490]">Số thập phân</div>
              <div className="font-display font-extrabold text-4xl text-[#0F172A] tabular-nums">
                {(decimalSquares / 100).toFixed(2)}
              </div>
              <div className="font-body font-semibold text-sm text-[#0E7490] tabular-nums">
                {tenthsDigit} phần mười + {hundredthsDigit} phần trăm
              </div>
            </div>

            <label className="block space-y-2">
              <div className="flex justify-between text-xs font-display font-bold text-[#475569] tabular-nums">
                <span>Số ô đã tô</span>
                <span>{decimalSquares} / 100</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={decimalSquares}
                onChange={(e) => setDecimalSquares(Number(e.target.value))}
                className="w-full accent-[#2563EB]"
              />
            </label>

            <div className="flex items-center justify-between bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4">
              <span className="font-display font-bold text-sm text-[#475569]">
                Phân số tối giản
              </span>
              <FractionBlock fraction={decSimplified} size="sm" />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDecimalSquares(0)}
                className="btn-ghost-sky px-4 py-3 rounded-full font-display font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Xóa</span>
              </button>
              <button
                type="button"
                onClick={() => onStartPractice('decimals')}
                className="btn-tactile-primary flex-1 py-3 rounded-full font-display font-extrabold text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Luyện Số thập phân</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Mô hình Hình học */}
      {activeTab === 'geometry' && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 card-surface rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-display font-extrabold text-xl text-[#0F172A]">
                Mô Hình Dựng Hình Trên Lưới Ô Vuông
              </h2>
              <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-xl">
                <button
                  type="button"
                  onClick={() => setGeoShape('rectangle')}
                  className={`px-3 py-1.5 rounded-lg font-display font-bold text-xs cursor-pointer ${
                    geoShape === 'rectangle'
                      ? 'bg-white text-[#0F172A] shadow-sm'
                      : 'text-[#64748B]'
                  }`}
                >
                  Hình chữ nhật
                </button>
                <button
                  type="button"
                  onClick={() => setGeoShape('triangle')}
                  className={`px-3 py-1.5 rounded-lg font-display font-bold text-xs cursor-pointer ${
                    geoShape === 'triangle'
                      ? 'bg-white text-[#0F172A] shadow-sm'
                      : 'text-[#64748B]'
                  }`}
                >
                  Tam giác vuông
                </button>
              </div>
            </div>

            <div className="bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl p-4 flex justify-center">
              <svg
                viewBox="0 0 320 240"
                className="w-full max-w-[360px] h-60"
                role="img"
                aria-label={`Hình ${geoShape === 'rectangle' ? 'chữ nhật' : 'tam giác'} với kích thước ${geoWidth} cm và ${geoHeight} cm`}
              >
                {Array.from({ length: 13 }).map((_, x) => (
                  <line
                    key={`vx-${x}`}
                    x1={40 + x * 20}
                    y1={20}
                    x2={40 + x * 20}
                    y2={220}
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />
                ))}
                {Array.from({ length: 11 }).map((_, y) => (
                  <line
                    key={`hy-${y}`}
                    x1={40}
                    y1={20 + y * 20}
                    x2={280}
                    y2={20 + y * 20}
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />
                ))}

                {geoShape === 'rectangle' ? (
                  <rect
                    x={40}
                    y={220 - geoHeight * 20}
                    width={geoWidth * 20}
                    height={geoHeight * 20}
                    fill="rgba(37, 99, 235, 0.2)"
                    stroke="#2563EB"
                    strokeWidth="3"
                    rx="3"
                  />
                ) : (
                  <polygon
                    points={`40,220 ${40 + geoWidth * 20},220 40,${220 - geoHeight * 20}`}
                    fill="rgba(245, 158, 11, 0.25)"
                    stroke="#D97706"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                )}

                <text
                  x={40 + geoWidth * 10}
                  y={236}
                  textAnchor="middle"
                  className="font-display font-bold fill-[#0F172A] text-[12px]"
                >
                  {geoWidth} cm
                </text>
                <text
                  x={28}
                  y={220 - geoHeight * 10}
                  textAnchor="end"
                  className="font-display font-bold fill-[#0F172A] text-[12px]"
                >
                  {geoHeight} cm
                </text>
              </svg>
            </div>
          </div>

          <div className="lg:col-span-5 card-surface rounded-3xl p-6 space-y-5">
            <h3 className="font-display font-extrabold text-lg text-[#0F172A]">
              Kích Thước & Công Thức
            </h3>

            <div className="space-y-4">
              <label className="block space-y-1">
                <div className="flex justify-between text-xs font-display font-bold text-[#475569] tabular-nums">
                  <span>{geoShape === 'rectangle' ? 'Chiều dài' : 'Độ dài đáy'} (cm)</span>
                  <span>{geoWidth} cm</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={12}
                  value={geoWidth}
                  onChange={(e) => setGeoWidth(Number(e.target.value))}
                  className="w-full accent-[#2563EB]"
                />
              </label>

              <label className="block space-y-1">
                <div className="flex justify-between text-xs font-display font-bold text-[#475569] tabular-nums">
                  <span>Chiều cao (cm)</span>
                  <span>{geoHeight} cm</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={10}
                  value={geoHeight}
                  onChange={(e) => setGeoHeight(Number(e.target.value))}
                  className="w-full accent-[#2563EB]"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#EFF6FF] border-2 border-[#BFDBFE] rounded-2xl p-4">
                <div className="font-display font-bold text-xs text-[#1D4ED8]">Diện tích (S)</div>
                <div className="font-display font-extrabold text-2xl text-[#0F172A] tabular-nums mt-1">
                  {geoMetrics.area} cm²
                </div>
                <div className="font-body font-semibold text-xs text-[#475569] mt-1 tabular-nums">
                  {geoShape === 'rectangle'
                    ? `${geoWidth} × ${geoHeight}`
                    : `(${geoWidth} × ${geoHeight}) ÷ 2`}
                </div>
              </div>

              <div className="bg-[#FFFBEB] border-2 border-[#FDE68A] rounded-2xl p-4">
                <div className="font-display font-bold text-xs text-[#B45309]">Chu vi (P)</div>
                <div className="font-display font-extrabold text-2xl text-[#0F172A] tabular-nums mt-1">
                  {geoMetrics.perimeter} cm
                </div>
                <div className="font-body font-semibold text-xs text-[#475569] mt-1">
                  {geoShape === 'rectangle' ? '2 × (dài + rộng)' : 'Tổng 3 cạnh'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onStartPractice('geometry')}
              className="btn-tactile-primary w-full py-3.5 rounded-full font-display font-extrabold text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Luyện tập Hình học</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </section>
      )}

      {/* Mô hình Đo lường */}
      {activeTab === 'measurement' && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 card-surface rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-display font-extrabold text-xl text-[#0F172A]">
                Bảng Quy Đổi Đơn Vị Đo Lớp 5
              </h2>
              <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-xl">
                {(
                  [
                    { id: 'area', label: 'Diện tích', defaultVal: '36' },
                    { id: 'mass', label: 'Khối lượng', defaultVal: '9,004' },
                    { id: 'length', label: 'Độ dài', defaultVal: '4,5' },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setMeasCategory(cat.id);
                      setMeasInput(cat.defaultVal);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-display font-bold text-xs cursor-pointer ${
                      measCategory === cat.id
                        ? 'bg-white text-[#0F172A] shadow-sm'
                        : 'text-[#64748B]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {measCategory === 'length' && (
              <div className="grid grid-cols-5 gap-2">
                {(['km', 'm', 'dm', 'cm', 'mm'] as LengthUnit[]).map((unit) => {
                  const isFrom = lengthFrom === unit;
                  const isTo = lengthTo === unit;
                  return (
                    <div
                      key={unit}
                      className={`rounded-2xl p-3 text-center border-2 ${
                        isTo
                          ? 'bg-[#ECFDF5] border-[#10B981]'
                          : isFrom
                            ? 'bg-[#EFF6FF] border-[#2563EB]'
                            : 'bg-[#F8FAFC] border-[#E2E8F0]'
                      }`}
                    >
                      <div className="font-display font-extrabold text-base text-[#0F172A]">{unit}</div>
                      <div className="font-display font-bold text-[11px] text-[#64748B] mt-0.5 tabular-nums">
                        {formatDecimalVi(convertLength(safeMeas, lengthFrom, unit))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {measCategory === 'mass' && (
              <div className="grid grid-cols-5 gap-2">
                {(['tấn', 'tạ', 'yến', 'kg', 'g'] as MassUnit[]).map((unit) => {
                  const isFrom = massFrom === unit;
                  const isTo = massTo === unit;
                  return (
                    <div
                      key={unit}
                      className={`rounded-2xl p-3 text-center border-2 ${
                        isTo
                          ? 'bg-[#ECFDF5] border-[#10B981]'
                          : isFrom
                            ? 'bg-[#EFF6FF] border-[#2563EB]'
                            : 'bg-[#F8FAFC] border-[#E2E8F0]'
                      }`}
                    >
                      <div className="font-display font-extrabold text-base text-[#0F172A]">{unit}</div>
                      <div className="font-display font-bold text-[11px] text-[#64748B] mt-0.5 tabular-nums">
                        {formatDecimalVi(convertMass(safeMeas, massFrom, unit))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {measCategory === 'area' && (
              <div className="grid grid-cols-4 gap-2">
                {(['km²', 'ha', 'm²', 'cm²'] as AreaUnit[]).map((unit) => {
                  const isFrom = areaFrom === unit;
                  const isTo = areaTo === unit;
                  return (
                    <div
                      key={unit}
                      className={`rounded-2xl p-3 text-center border-2 ${
                        isTo
                          ? 'bg-[#ECFDF5] border-[#10B981]'
                          : isFrom
                            ? 'bg-[#EFF6FF] border-[#2563EB]'
                            : 'bg-[#F8FAFC] border-[#E2E8F0]'
                      }`}
                    >
                      <div className="font-display font-extrabold text-base text-[#0F172A]">{unit}</div>
                      <div className="font-display font-bold text-[11px] text-[#64748B] mt-0.5 tabular-nums">
                        {formatDecimalVi(convertArea(safeMeas, areaFrom, unit))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="bg-[#ECFDF5] border-2 border-[#A7F3D0] rounded-2xl p-6 text-center space-y-1">
              <div className="font-display font-bold text-xs text-[#047857]">
                Kết quả quy đổi
              </div>
              <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#0F172A] tabular-nums">
                {formatDecimalVi(safeMeas)} {activeFromUnit} = {formatDecimalVi(convertedMeas)} {activeToUnit}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 card-surface rounded-3xl p-6 space-y-5">
            <h3 className="font-display font-extrabold text-lg text-[#0F172A]">
              Nhập Số Đo Cần Đổi
            </h3>

            <label className="block space-y-1.5">
              <span className="font-display font-bold text-xs text-[#475569]">Giá trị (dùng dấu phẩy hoặc chấm)</span>
              <input
                type="text"
                inputMode="decimal"
                value={measInput}
                onChange={(e) => setMeasInput(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-white border-2 border-[#CBD5E1] font-display font-extrabold text-lg text-[#0F172A] tabular-nums focus:outline-none focus:border-[#2563EB]"
              />
            </label>

            {measCategory === 'length' && (
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1.5">
                  <span className="font-display font-bold text-xs text-[#475569]">Từ đơn vị</span>
                  <select
                    value={lengthFrom}
                    onChange={(e) => setLengthFrom(e.target.value as LengthUnit)}
                    className="w-full h-12 px-3 rounded-xl bg-white border-2 border-[#CBD5E1] font-display font-bold text-sm text-[#0F172A]"
                  >
                    <option value="km">Ki-lô-mét (km)</option>
                    <option value="m">Mét (m)</option>
                    <option value="dm">Đề-xi-mét (dm)</option>
                    <option value="cm">Xăng-ti-mét (cm)</option>
                    <option value="mm">Mi-li-mét (mm)</option>
                  </select>
                </label>
                <label className="block space-y-1.5">
                  <span className="font-display font-bold text-xs text-[#475569]">Sang đơn vị</span>
                  <select
                    value={lengthTo}
                    onChange={(e) => setLengthTo(e.target.value as LengthUnit)}
                    className="w-full h-12 px-3 rounded-xl bg-white border-2 border-[#CBD5E1] font-display font-bold text-sm text-[#0F172A]"
                  >
                    <option value="km">Ki-lô-mét (km)</option>
                    <option value="m">Mét (m)</option>
                    <option value="dm">Đề-xi-mét (dm)</option>
                    <option value="cm">Xăng-ti-mét (cm)</option>
                    <option value="mm">Mi-li-mét (mm)</option>
                  </select>
                </label>
              </div>
            )}

            {measCategory === 'mass' && (
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1.5">
                  <span className="font-display font-bold text-xs text-[#475569]">Từ đơn vị</span>
                  <select
                    value={massFrom}
                    onChange={(e) => setMassFrom(e.target.value as MassUnit)}
                    className="w-full h-12 px-3 rounded-xl bg-white border-2 border-[#CBD5E1] font-display font-bold text-sm text-[#0F172A]"
                  >
                    <option value="tấn">Tấn</option>
                    <option value="tạ">Tạ</option>
                    <option value="yến">Yến</option>
                    <option value="kg">Ki-lô-gam (kg)</option>
                    <option value="g">Gam (g)</option>
                  </select>
                </label>
                <label className="block space-y-1.5">
                  <span className="font-display font-bold text-xs text-[#475569]">Sang đơn vị</span>
                  <select
                    value={massTo}
                    onChange={(e) => setMassTo(e.target.value as MassUnit)}
                    className="w-full h-12 px-3 rounded-xl bg-white border-2 border-[#CBD5E1] font-display font-bold text-sm text-[#0F172A]"
                  >
                    <option value="tấn">Tấn</option>
                    <option value="tạ">Tạ</option>
                    <option value="yến">Yến</option>
                    <option value="kg">Ki-lô-gam (kg)</option>
                    <option value="g">Gam (g)</option>
                  </select>
                </label>
              </div>
            )}

            {measCategory === 'area' && (
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1.5">
                  <span className="font-display font-bold text-xs text-[#475569]">Từ đơn vị</span>
                  <select
                    value={areaFrom}
                    onChange={(e) => setAreaFrom(e.target.value as AreaUnit)}
                    className="w-full h-12 px-3 rounded-xl bg-white border-2 border-[#CBD5E1] font-display font-bold text-sm text-[#0F172A]"
                  >
                    <option value="km²">km² (Ki-lô-mét vuông)</option>
                    <option value="ha">ha (Héc-ta)</option>
                    <option value="m²">m² (Mét vuông)</option>
                    <option value="cm²">cm² (Xăng-ti-mét vuông)</option>
                  </select>
                </label>
                <label className="block space-y-1.5">
                  <span className="font-display font-bold text-xs text-[#475569]">Sang đơn vị</span>
                  <select
                    value={areaTo}
                    onChange={(e) => setAreaTo(e.target.value as AreaUnit)}
                    className="w-full h-12 px-3 rounded-xl bg-white border-2 border-[#CBD5E1] font-display font-bold text-sm text-[#0F172A]"
                  >
                    <option value="km²">km² (Ki-lô-mét vuông)</option>
                    <option value="ha">ha (Héc-ta)</option>
                    <option value="m²">m² (Mét vuông)</option>
                    <option value="cm²">cm² (Xăng-ti-mét vuông)</option>
                  </select>
                </label>
              </div>
            )}

            <button
              type="button"
              onClick={() => onStartPractice('measurement')}
              className="btn-tactile-primary w-full py-3.5 rounded-full font-display font-extrabold text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Luyện tập Đo lường</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
