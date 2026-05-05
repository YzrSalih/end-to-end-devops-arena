import { motion } from 'framer-motion'

interface ServiceBoxProps {
  x: number
  y: number
  width: number
  height: number
  label: string
  sublabel: string
  color: string
  borderColor: string
  delay: number
}

function ServiceBox({ x, y, width, height, label, sublabel, color, borderColor, delay }: ServiceBoxProps) {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
    >
      <rect
        x={x} y={y} width={width} height={height} rx="12"
        fill={color} stroke={borderColor} strokeWidth="1.5"
      />
      <text x={x + width / 2} y={y + height / 2 - 8} textAnchor="middle" fill="white" fontSize="13" fontWeight="600" fontFamily="Inter, sans-serif">
        {label}
      </text>
      <text x={x + width / 2} y={y + height / 2 + 12} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10" fontFamily="Inter, sans-serif">
        {sublabel}
      </text>
    </motion.g>
  )
}

function AnimatedArrow({ x1, y, x2, color, delay }: { x1: number; y: number; x2: number; color: string; delay: number }) {
  const mid = (x1 + x2) / 2

  return (
    <g>
      {/* Static line */}
      <line x1={x1} y1={y} x2={x2} y2={y} stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="4 4" />
      {/* Arrowhead */}
      <polygon
        points={`${x2},${y} ${x2 - 8},${y - 5} ${x2 - 8},${y + 5}`}
        fill="rgba(255,255,255,0.2)"
      />

      {/* Animated dots */}
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          r="4"
          fill={color}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          initial={{ cx: x1, opacity: 0 }}
          animate={{
            cx: [x1, mid, x2 - 10],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 1.8,
            delay: delay + i * 0.6,
            repeat: Infinity,
            ease: 'linear',
          }}
          cy={y}
        />
      ))}
    </g>
  )
}

export default function FlowDiagram() {
  const height = 180
  const boxH = 80

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox="0 0 860 180"
        className="w-full max-w-3xl mx-auto"
        style={{ minWidth: 480, height }}
      >
        {/* Order Service */}
        <ServiceBox
          x={10} y={(height - boxH) / 2} width={180} height={boxH}
          label="Order Service" sublabel="Python / Flask"
          color="rgba(99,102,241,0.18)" borderColor="rgba(99,102,241,0.6)"
          delay={0}
        />

        {/* Arrow 1 */}
        <AnimatedArrow x1={193} y={height / 2} x2={328} color="#6366f1" delay={0.8} />

        {/* RabbitMQ */}
        <ServiceBox
          x={330} y={(height - boxH) / 2} width={200} height={boxH}
          label="RabbitMQ" sublabel="Message Broker"
          color="rgba(245,158,11,0.18)" borderColor="rgba(245,158,11,0.6)"
          delay={0.3}
        />

        {/* Arrow 2 */}
        <AnimatedArrow x1={533} y={height / 2} x2={668} color="#f59e0b" delay={1.4} />

        {/* Notification Service */}
        <ServiceBox
          x={670} y={(height - boxH) / 2} width={185} height={boxH}
          label="Notification" sublabel="Python Worker"
          color="rgba(139,92,246,0.18)" borderColor="rgba(139,92,246,0.6)"
          delay={0.6}
        />

        {/* Label above arrows */}
        <text x={254} y={height / 2 - 22} textAnchor="middle" fill="rgba(99,102,241,0.7)" fontSize="9" fontFamily="Inter, sans-serif">
          publish event
        </text>
        <text x={596} y={height / 2 - 22} textAnchor="middle" fill="rgba(245,158,11,0.7)" fontSize="9" fontFamily="Inter, sans-serif">
          consume
        </text>
      </svg>
    </div>
  )
}
