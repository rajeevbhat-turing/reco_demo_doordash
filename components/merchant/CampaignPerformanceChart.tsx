'use client'

interface CampaignPerformanceChartProps {
  data: { date: string; value: number }[]
  type: 'Sales' | 'Orders' | 'Impressions'
}

export default function CampaignPerformanceChart({ data, type }: CampaignPerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No data available for this period
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.value), 1)
  const chartHeight = 200
  const chartWidth = 100
  const paddingLeft = 40
  const paddingRight = 20
  const paddingTop = 20
  const paddingBottom = 30
  const availableWidth = chartWidth - paddingLeft - paddingRight
  const availableHeight = chartHeight - paddingTop - paddingBottom

  // Format value based on type
  const formatValue = (value: number) => {
    if (type === 'Sales') {
      return `$${value.toLocaleString()}`
    }
    return value.toLocaleString()
  }

  // Format Y-axis labels
  const formatYAxisLabel = (value: number) => {
    if (type === 'Sales') {
      if (value >= 1000) {
        return `$${(value / 1000).toFixed(1)}K`
      }
      return `$${value}`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toString()
  }

  // Generate Y-axis labels
  const yAxisSteps = 5
  const yAxisLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) => {
    const value = (maxValue / yAxisSteps) * (yAxisSteps - i)
    return {
      value,
      y: paddingTop + (availableHeight / yAxisSteps) * i,
      label: formatYAxisLabel(value)
    }
  })

  // Calculate points for the line
  const points = data.map((point, index) => {
    const x = paddingLeft + (availableWidth / (data.length - 1 || 1)) * index
    const y = paddingTop + availableHeight - (point.value / maxValue) * availableHeight
    return { x, y, value: point.value, date: point.date }
  })

  // Create path for the line
  const pathData = points.map((point, index) => {
    return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  }).join(' ')

  // Create area path (for fill)
  const areaPath = `${pathData} L ${points[points.length - 1].x} ${paddingTop + availableHeight} L ${points[0].x} ${paddingTop + availableHeight} Z`

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

        {/* Chart area */}
        <g transform={`translate(0, 0)`}>
          {/* Area fill */}
          <path
            d={areaPath}
            fill="url(#gradient)"
            opacity="0.2"
          />
          
          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke="#EF4444"
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
                r="4"
                fill="#EF4444"
                stroke="white"
                strokeWidth="2"
                className="hover:r-6 transition-all cursor-pointer"
              />
              {/* Tooltip on hover */}
              <title>{`${point.date}: ${formatValue(point.value)}`}</title>
            </g>
          ))}
        </g>

        {/* X-axis labels */}
        {points.map((point, index) => {
          // Show every nth label to avoid crowding
          const showLabel = data.length <= 7 || index % Math.ceil(data.length / 7) === 0 || index === data.length - 1
          if (!showLabel) return null
          
          return (
            <text
              key={index}
              x={point.x}
              y={chartHeight - paddingBottom + 20}
              className="text-xs fill-gray-500"
              textAnchor="middle"
              fontSize="10"
            >
              {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </text>
          )
        })}

        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

