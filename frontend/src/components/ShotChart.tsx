// NBA coordinate system: origin at basket center
// LOC_X: -250 to 250 (tenths of a foot, left to right)
// LOC_Y: negative = behind basket, positive = toward half court
// SVG mapping: toSvgX(x) = x + 250, toSvgY(y) = BASKET_Y - y

const W = 500
const BASKET_Y = 422.5   // SVG y of the basket; leaves ~47px below for corner 3s

function sx(x: number) { return x + 250 }
function sy(y: number) { return BASKET_Y - y }

interface Shot {
  x: number
  y: number
  made: boolean
}

interface ShotChartProps {
  shots: Shot[]
}

export default function ShotChart({ shots }: ShotChartProps) {
  return (
    <svg
      viewBox={`0 0 ${W} 470`}
      className="w-full max-w-xl mx-auto"
      style={{ background: "#0f172a" }}
    >
      <Court />
      {shots.map((shot, i) => (
        <circle
          key={i}
          cx={sx(shot.x)}
          cy={sy(shot.y)}
          r={4}
          fill={shot.made ? "#4ade80" : "#f87171"}
          fillOpacity={0.55}
          stroke={shot.made ? "#16a34a" : "#dc2626"}
          strokeWidth={0.5}
          strokeOpacity={0.7}
        />
      ))}
    </svg>
  )
}

function Court() {
  const stroke = "#334155"
  const sw = 1.5

  // 3pt arc: radius 238, straight sides at x=±220 up to y≈90.8
  const arcY = sy(Math.sqrt(238 ** 2 - 220 ** 2)) // ≈ 331.7
  const baselineY = sy(-52.5)                       // ≈ 475, off-screen — clip at 470

  return (
    <g stroke={stroke} strokeWidth={sw} fill="none">
      {/* Court boundary */}
      <rect x={0} y={0} width={W} height={470} />

      {/* Paint */}
      <rect x={sx(-80)} y={sy(190)} width={160} height={190} />

      {/* Free throw circle — solid below, dashed above */}
      <path
        d={`M ${sx(-60)} ${sy(190)} A 60 60 0 0 0 ${sx(60)} ${sy(190)}`}
      />
      <path
        d={`M ${sx(-60)} ${sy(190)} A 60 60 0 0 1 ${sx(60)} ${sy(190)}`}
        strokeDasharray="6 4"
      />

      {/* Restricted area arc */}
      <path
        d={`M ${sx(-40)} ${BASKET_Y} A 40 40 0 0 1 ${sx(40)} ${BASKET_Y}`}
      />

      {/* Three-point line */}
      <path
        d={`M ${sx(-220)} ${Math.min(baselineY, 470)} L ${sx(-220)} ${arcY} A 238 238 0 0 1 ${sx(220)} ${arcY} L ${sx(220)} ${Math.min(baselineY, 470)}`}
      />

      {/* Basket */}
      <circle cx={sx(0)} cy={BASKET_Y} r={7.5} />

      {/* Backboard */}
      <line x1={sx(-30)} y1={sy(-7.5)} x2={sx(30)} y2={sy(-7.5)} strokeWidth={2.5} />
    </g>
  )
}
