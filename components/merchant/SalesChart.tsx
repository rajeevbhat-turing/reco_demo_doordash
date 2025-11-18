'use client'

interface SalesChartProps {
  data: number[]
  labels?: string[]
}

export default function SalesChart({ data, labels }: SalesChartProps) {
  const maxValue = Math.max(...data, 1)
  const chartHeight = 64
  const paddingLeft = 30
  const paddingTop = 4
  const paddingBottom = 4
  const availableHeight = chartHeight - paddingTop - paddingBottom

  return (
    <div className="relative w-full" style={{ height: `${chartHeight}px` }}>
      <svg width="100%" height={chartHeight} className="overflow-visible">
        {/* Y-axis labels */}
        <text x="2" y="12" className="text-xs fill-gray-500" fontSize="10">
          $0
        </text>
        <text x="2" y={chartHeight / 2 + 2} className="text-xs fill-gray-500" fontSize="10">
          $1K
        </text>
        <text x="2" y={chartHeight - 2} className="text-xs fill-gray-500" fontSize="10">
          $2K
        </text>

        {/* Bars */}
        <g transform={`translate(${paddingLeft}, ${paddingTop})`}>
          {data.map((value, index) => {
            const barCount = data.length
            const barSpacing = 2
            const totalSpacing = barSpacing * (barCount - 1)
            const barWidth = Math.max((100 - paddingLeft - totalSpacing) / barCount, 2)
            const barHeight = (value / maxValue) * availableHeight
            const x = index * (barWidth + barSpacing)
            const y = availableHeight - barHeight

            return (
              <rect
                key={index}
                x={`${x}%`}
                y={y}
                width={`${barWidth}%`}
                height={barHeight}
                fill="#3B82F6"
                rx="2"
                className="hover:opacity-80 transition-opacity"
              />
            )
          })}
        </g>
      </svg>
    </div>
  )
}
