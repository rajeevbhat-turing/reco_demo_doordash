'use client'

interface ByDayOfWeekChartProps {
  data: { day: string; value: number }[]
  priorData?: { day: string; value: number }[]
  type: 'Sales' | 'Total orders' | 'Average ticket value'
}

export default function ByDayOfWeekChart({ data, priorData, type }: ByDayOfWeekChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No data available for this period
      </div>
    )
  }

  const allValues = [...data.map(d => d.value), ...(priorData?.map(d => d.value) || [])]
  const maxValue = Math.max(...allValues, 0.01)
  const chartHeight = 200
  const paddingLeft = 50
  const paddingRight = 20
  const paddingTop = 20
  const paddingBottom = 40
  const availableHeight = chartHeight - paddingTop - paddingBottom

  // Format Y-axis labels
  const formatYAxisLabel = (value: number) => {
    if (type === 'Sales' || type === 'Average ticket value') {
      if (value === 0) {
        return '$0'
      }
      if (value >= 1000) {
        return `$${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`
      }
      if (value >= 1) {
        return `$${value.toFixed(0)}`
      }
      return `$${value.toFixed(2)}`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toString()
  }

  // Generate Y-axis labels
  const yAxisSteps = 4
  const yAxisLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) => {
    const value = (maxValue / yAxisSteps) * (yAxisSteps - i)
    return {
      value,
      y: paddingTop + (availableHeight / yAxisSteps) * i,
      label: formatYAxisLabel(value)
    }
  })

  const getBarDimensions = (index: number, total: number, containerWidth: number) => {
    const availableWidth = containerWidth - paddingLeft - paddingRight
    const barWidth = (availableWidth / total) * 0.35
    const barSpacing = (availableWidth / total) * 0.65
    const x = paddingLeft + index * (barWidth + barSpacing) + barSpacing / 2
    return { x, width: barWidth }
  }

  return (
    <div className="w-full">
      <svg 
        viewBox={`0 0 800 ${chartHeight}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-[200px] overflow-visible"
      >
        {/* Y-axis labels */}
        {yAxisLabels.map(({ y, label }, index) => (
          <text
            key={index}
            x={paddingLeft - 10}
            y={y + 4}
            fill="#6B7280"
            textAnchor="end"
            fontSize="11"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {label}
          </text>
        ))}

        {/* Grid lines */}
        {yAxisLabels.map(({ y }, index) => (
          <line
            key={index}
            x1={paddingLeft}
            y1={y}
            x2={800 - paddingRight}
            y2={y}
            stroke="#E5E7EB"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
        ))}

        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = maxValue === 0 ? 1 : (item.value / maxValue) * availableHeight
          const { x, width } = getBarDimensions(index, data.length, 800)
          const y = paddingTop + availableHeight - barHeight

          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={width}
                height={Math.max(barHeight, 1)}
                fill="#9333EA"
                rx="2"
                className="hover:opacity-80 transition-opacity"
              />
              <title>{`${item.day}: ${type === 'Sales' || type === 'Average ticket value' ? `$${item.value.toFixed(2)}` : item.value}`}</title>
            </g>
          )
        })}

        {/* Prior period bars (gray) */}
        {priorData && priorData.map((item, index) => {
          const barHeight = maxValue === 0 ? 1 : (item.value / maxValue) * availableHeight
          const { x, width } = getBarDimensions(index, data.length, 800)
          const priorX = x + width * 0.6
          const y = paddingTop + availableHeight - barHeight

          return (
            <g key={`prior-${index}`}>
              <rect
                x={priorX}
                y={y}
                width={width * 0.4}
                height={Math.max(barHeight, 1)}
                fill="#9CA3AF"
                rx="2"
                className="hover:opacity-80 transition-opacity"
              />
              <title>{`${item.day} (prior): ${type === 'Sales' || type === 'Average ticket value' ? `$${item.value.toFixed(2)}` : item.value}`}</title>
            </g>
          )
        })}

        {/* X-axis labels */}
        {data.map((item, index) => {
          const { x, width } = getBarDimensions(index, data.length, 800)
          const labelX = x + width / 2
          return (
            <text
              key={index}
              x={labelX}
              y={chartHeight - paddingBottom + 20}
              fill="#6B7280"
              textAnchor="middle"
              fontSize="10"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {item.day}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

