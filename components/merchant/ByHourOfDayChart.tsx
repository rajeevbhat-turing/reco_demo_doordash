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
  const maxValue = Math.max(...allValues, 1)
  const chartHeight = 200
  const chartWidth = 100
  const paddingLeft = 50
  const paddingRight = 20
  const paddingTop = 20
  const paddingBottom = 40
  const availableWidth = chartWidth - paddingLeft - paddingRight
  const availableHeight = chartHeight - paddingTop - paddingBottom

  // Format Y-axis labels
  const formatYAxisLabel = (value: number) => {
    if (type === 'Sales' || type === 'Average ticket value') {
      if (value === 0) {
        return 'CA$0'
      }
      if (value >= 1) {
        return `CA$${value.toFixed(0)}`
      }
      return `CA$${value.toFixed(1)}`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toString()
  }

  // Generate Y-axis labels
  const yAxisSteps = 2
  let yAxisLabels
  if (maxValue === 0 && (type === 'Sales' || type === 'Average ticket value')) {
    yAxisLabels = [
      { value: 0, y: paddingTop, label: 'CA$0' },
      { value: 0, y: paddingTop + availableHeight / 2, label: 'CA$0' },
      { value: 0, y: paddingTop + availableHeight, label: 'CA$0' },
    ]
  } else {
    yAxisLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) => {
      const value = (maxValue / yAxisSteps) * (yAxisSteps - i)
      return {
        value,
        y: paddingTop + (availableHeight / yAxisSteps) * i,
        label: formatYAxisLabel(value)
      }
    })
  }

  // Calculate points for the line
  const points = data.map((point, index) => {
    const x = paddingLeft + (availableWidth / (data.length - 1 || 1)) * index
    let y
    if (maxValue === 0 && (type === 'Sales' || type === 'Average ticket value')) {
      y = paddingTop + availableHeight / 2
    } else {
      y = paddingTop + availableHeight - (point.value / maxValue) * availableHeight
    }
    return { x, y, value: point.value, hour: point.hour }
  })

  // Prior period points
  const priorPoints = priorData?.map((point, index) => {
    const x = paddingLeft + (availableWidth / (data.length - 1 || 1)) * index
    let y
    if (maxValue === 0 && (type === 'Sales' || type === 'Average ticket value')) {
      y = paddingTop + availableHeight / 2
    } else {
      y = paddingTop + availableHeight - (point.value / maxValue) * availableHeight
    }
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
      <svg width="100%" height={chartHeight} className="overflow-visible">
        {/* Y-axis labels */}
        {yAxisLabels.map(({ y, label }, index) => (
          <text
            key={index}
            x={paddingLeft - 10}
            y={y + 4}
            className="text-xs fill-gray-500"
            textAnchor="end"
            fontSize="11"
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
            x2={paddingLeft + availableWidth}
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

        {/* Data points */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="3"
              fill="#9333EA"
              stroke="white"
              strokeWidth="2"
              className="hover:r-5 transition-all cursor-pointer"
            />
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
              className="text-xs fill-gray-500"
              textAnchor="middle"
              fontSize="10"
            >
              {point.hour}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

