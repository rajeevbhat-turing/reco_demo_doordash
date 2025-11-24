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

  const barWidth = (availableWidth / data.length) * 0.6
  const barSpacing = (availableWidth / data.length) * 0.4

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

        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = maxValue === 0 ? 1 : (item.value / maxValue) * availableHeight
          const x = paddingLeft + index * (barWidth + barSpacing) + barSpacing / 2
          const y = paddingTop + availableHeight - barHeight

          return (
            <rect
              key={index}
              x={`${x}%`}
              y={y}
              width={`${barWidth}%`}
              height={Math.max(barHeight, 0.5)}
              fill="#9333EA"
              rx="2"
              className="hover:opacity-80 transition-opacity"
            />
          )
        })}

        {/* Prior period bars (gray) */}
        {priorData && priorData.map((item, index) => {
          const barHeight = maxValue === 0 ? 1 : (item.value / maxValue) * availableHeight
          const x = paddingLeft + index * (barWidth + barSpacing) + barSpacing / 2 + (barWidth / 2)
          const y = paddingTop + availableHeight - barHeight

          return (
            <rect
              key={`prior-${index}`}
              x={`${x}%`}
              y={y}
              width={`${barWidth / 2}%`}
              height={Math.max(barHeight, 0.5)}
              fill="#9CA3AF"
              rx="2"
              className="hover:opacity-80 transition-opacity"
            />
          )
        })}

        {/* X-axis labels */}
        {data.map((item, index) => {
          const x = paddingLeft + index * (barWidth + barSpacing) + barSpacing / 2 + barWidth / 2
          return (
            <text
              key={index}
              x={`${x}%`}
              y={chartHeight - paddingBottom + 20}
              className="text-xs fill-gray-500"
              textAnchor="middle"
              fontSize="10"
            >
              {item.day}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

