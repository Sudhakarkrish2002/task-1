import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useRealtimeData } from '../../hooks/useRealtimeData'
import * as echarts from 'echarts'

// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])
  
  return isMobile
}

export const ChartWidget = ({ 
  widgetId,
  title = 'Chart',
  chartType = 'line', // line, bar, area
  color = '#ef4444',
  panelId = 'default',
  // MQTT wiring - REQUIRED for real-time data
  topic,
  valuePath
}) => {
  const { value: liveValue, history: liveHistory, connected: realtimeConnected } = useRealtimeData(topic, { valuePath, historySize: 40 })
  const connected = realtimeConnected
  
  // Use only real-time WebSocket data
  const data = useMemo(() => {
    if (liveHistory && liveHistory.length > 0) return liveHistory
    if (typeof liveValue === 'number') return [liveValue]
    return []
  }, [liveHistory, liveValue])
  
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  const isMobile = useIsMobile()

  // Validate data
  const safeData = Array.isArray(data) && data.length > 0 ? data : []
  const validData = safeData.filter(val => typeof val === 'number' && !isNaN(val))

  // Initialize ECharts instance
  useEffect(() => {
    if (!chartRef.current) return

    // Initialize chart
    chartInstance.current = echarts.init(chartRef.current)

    // Handle window resize
    const handleResize = () => {
      chartInstance.current?.resize()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chartInstance.current?.dispose()
      chartInstance.current = null
    }
  }, [])

  // Update chart with real-time data
  useEffect(() => {
    if (!chartInstance.current) return

    const hasData = validData.length > 0

    const option = {
      animation: true,
      animationDuration: 300,
      grid: {
        left: isMobile ? '12%' : '10%',
        right: isMobile ? '8%' : '5%',
        top: isMobile ? '15%' : '10%',
        bottom: isMobile ? '15%' : '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: hasData ? validData.map((_, i) => `T${i + 1}`) : [],
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisLabel: { 
          color: '#6b7280',
          fontSize: isMobile ? 10 : 12,
          interval: isMobile ? 'auto' : 0
        },
        splitLine: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisLabel: { 
          color: '#6b7280',
          fontSize: isMobile ? 10 : 12
        },
        splitLine: { 
          lineStyle: { color: '#f3f4f6', type: 'dashed' }
        }
      },
      series: [
        {
          name: title,
          type: chartType === 'area' ? 'line' : chartType,
          data: validData,
          smooth: chartType === 'line' || chartType === 'area',
          areaStyle: chartType === 'area' ? {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: color + '80' },
              { offset: 1, color: color + '10' }
            ])
          } : undefined,
          itemStyle: {
            color: color,
            borderRadius: chartType === 'bar' ? [4, 4, 0, 0] : 0
          },
          lineStyle: {
            width: 2,
            color: color
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 10,
              shadowColor: color
            }
          },
          label: {
            show: false
          }
        }
      ],
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: { color: '#374151', fontSize: isMobile ? 11 : 12 },
        axisPointer: {
          type: 'line',
          lineStyle: { color: color, width: 2 }
        }
      }
    }

    chartInstance.current.setOption(option, true)
  }, [validData, chartType, color, title, isMobile])

  return (
    <div className="w-full h-full bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className={`flex items-center justify-between ${isMobile ? 'p-3' : 'p-4'} bg-gradient-to-r from-gray-50 to-white border-b border-gray-100`}>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold text-gray-800 truncate`}>{title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className={`${isMobile ? 'text-xs' : 'text-xs'} font-medium ${connected ? 'text-green-600' : 'text-red-600'}`}>
            {connected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>
      
      {/* Chart - ECharts */}
      <div className={`flex-1 ${isMobile ? 'p-2' : 'p-4'} bg-gradient-to-b from-white to-gray-50`}>
        <div className="relative h-full">
          <div
            ref={chartRef}
            className="w-full h-full"
            style={{ minHeight: isMobile ? '150px' : '180px' }}
          />
          {/* Chart overlay info */}
          {validData.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 text-sm font-medium">No data available</div>
                <div className="text-gray-300 text-xs mt-1">
                  {topic ? 'Waiting for MQTT data...' : 'Configure MQTT topic'}
                </div>
              </div>
            </div>
          )}
          <div className={`absolute ${isMobile ? 'top-1 right-1' : 'top-2 right-2'} bg-white/90 backdrop-blur-sm rounded-lg ${isMobile ? 'px-1 py-0.5' : 'px-2 py-1'}`}>
            <div className={`${isMobile ? 'text-xs' : 'text-xs'} font-medium text-gray-600`}>
              {validData.length} points
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className={`${isMobile ? 'px-3 pb-3' : 'px-4 pb-4'} bg-gradient-to-r from-gray-50 to-white`}>
        <div className="flex items-center justify-between">
          <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-600 font-medium truncate flex items-center gap-1`}>
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
            {topic ? `ECharts ${chartType.charAt(0).toUpperCase() + chartType.slice(1)}` : 'No MQTT Topic'}
          </div>
          <div className="flex items-center space-x-2">
            <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500`}>
              {validData.length > 0 ? (
                <>Min: {Math.min(...validData).toFixed(1)} | Max: {Math.max(...validData).toFixed(1)}</>
              ) : (
                'No data'
              )}
            </div>
          </div>
        </div>
        {/* Real-time indicator */}
        {topic && (
          <div className={`${isMobile ? 'mt-1' : 'mt-2'} flex items-center justify-between`}>
            <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-400`}>
              Topic: {topic}
            </div>
            <div className="flex items-center gap-1">
              <div className="text-xs text-gray-400">MQTT → WS → ECharts</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}