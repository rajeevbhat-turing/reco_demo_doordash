'use client'

interface ByHourOfDayChartProps {
  data: { hour: string; value: number }[]
  priorData?: { hour: string; value: number }[]
  type: 'Sales' | 'Total orders' | 'Average ticket value'
}

export default function ByHourOfDayChart({ data, priorData, type }: ByHourOfDayChartProps) {
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

  // Calculate points for the line
  const getXPosition = (index: number, total: number, containerWidth: number) => {
    const availableWidth = containerWidth - paddingLeft - paddingRight
    return paddingLeft + (availableWidth / Math.max(total - 1, 1)) * index
  }

  const getYPosition = (value: number) => {
    if (maxValue === 0) {
      return paddingTop + availableHeight / 2
    }
    return paddingTop + availableHeight - (value / maxValue) * availableHeight
  }

  const points = data.map((point, index) => {
    const x = getXPosition(index, data.length, 800)
    const y = getYPosition(point.value)
    return { x, y, value: point.value, hour: point.hour }
  })

  // Prior period points
  const priorPoints = priorData?.map((point, index) => {
    const x = getXPosition(index, data.length, 800)
    const y = getYPosition(point.value)
    return { x, y, value: point.value, hour: point.hour }
  })

  // Create path for the line
  const pathData = points.map((point, index) => {
    return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  }).join(' ')

  const priorPathData = priorPoints?.map((point, index) => {
    return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  }).join(' ')

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

        {/* Prior period line (gray) */}
        {priorPathData && (
          <path
            d={priorPathData}
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="4,4"
          />
        )}

        {/* Current period line (purple) */}
        <path
          d={pathData}
          fill="none"
          stroke="#9333EA"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Prior period data points */}
        {priorPoints?.map((point, index) => (
          <g key={`prior-${index}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r="3"
              fill="#9CA3AF"
              stroke="white"
              strokeWidth="2"
            />
            <title>{`${point.hour}: ${type === 'Sales' || type === 'Average ticket value' ? `$${point.value.toFixed(2)}` : point.value}`}</title>
          </g>
        ))}

        {/* Current period data points */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="3"
              fill="#9333EA"
              stroke="white"
              strokeWidth="2"
            />
            <title>{`${point.hour}: ${type === 'Sales' || type === 'Average ticket value' ? `$${point.value.toFixed(2)}` : point.value}`}</title>
          </g>
        ))}

        {/* X-axis labels - show every 2 hours */}
        {points.map((point, index) => {
          if (index % 2 !== 0 && index !== points.length - 1) return null
          return (
            <text
              key={index}
              x={point.x}
              y={chartHeight - paddingBottom + 20}
              fill="#6B7280"
              textAnchor="middle"
              fontSize="10"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {point.hour}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

