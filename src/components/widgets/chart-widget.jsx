import React, { useEffect, useRef, useState, memo, useCallback } from 'react'
import * as echarts from 'echarts'

export const ChartWidget = ({ 
  widgetId,
  mqttTopic,
  title = 'Chart',
  chartType = 'line', // line, bar, area, pie
  dataPoints = 20,
  color = '#3b82f6',
  size = 'medium'
}) => {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  const [data, setData] = useState([])
  const [timeLabels, setTimeLabels] = useState([])
  const [connected, setConnected] = useState(false)
  const [lastValue, setLastValue] = useState(0)

  // Size configurations
  const sizeConfig = {
    small: { width: 250, height: 150 },
    medium: { width: 400, height: 250 },
    large: { width: 500, height: 300 }
  }

  const { width, height } = sizeConfig[size] || sizeConfig.medium

  // Generate initial data
  useEffect(() => {
    const generateInitialData = () => {
      const now = new Date()
      const labels = []
      const values = []
      
      for (let i = dataPoints - 1; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60000) // 1 minute intervals
        labels.push(time.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }))
        values.push(0) // Initialize with 0, will be updated via MQTT
      }
      
      setTimeLabels(labels)
      setData(values)
    }

    generateInitialData()
  }, [dataPoints])

  useEffect(() => {
    if (!chartRef.current) return

    // Initialize ECharts
    chartInstance.current = echarts.init(chartRef.current)

    const getChartOption = () => {
      const baseOption = {
        title: {
          text: title,
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: timeLabels,
          axisLabel: {
            fontSize: 10
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            fontSize: 10
          }
        },
        series: []
      }

      switch (chartType) {
        case 'line':
          baseOption.series = [{
            name: title,
            type: 'line',
            data: data,
            smooth: true,
            lineStyle: {
              color: color,
              width: 2
            },
            itemStyle: {
              color: color
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0, color: color + '40'
                }, {
                  offset: 1, color: color + '10'
                }]
              }
            }
          }]
          break

        case 'bar':
          baseOption.series = [{
            name: title,
            type: 'bar',
            data: data,
            itemStyle: {
              color: color
            }
          }]
          break

        case 'area':
          baseOption.series = [{
            name: title,
            type: 'line',
            data: data,
            smooth: true,
            lineStyle: {
              color: color,
              width: 2
            },
            itemStyle: {
              color: color
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0, color: color + '80'
                }, {
                  offset: 1, color: color + '20'
                }]
              }
            }
          }]
          break

        case 'pie':
          baseOption.series = [{
            name: title,
            type: 'pie',
            radius: '50%',
            data: data.map((value, index) => ({
              name: timeLabels[index],
              value: value
            })),
            itemStyle: {
              color: (params) => {
                const colors = [color, color + '80', color + '60', color + '40']
                return colors[params.dataIndex % colors.length]
              }
            },
            label: {
              show: false
            },
            labelLine: {
              show: false
            }
          }]
          baseOption.xAxis = { show: false }
          baseOption.yAxis = { show: false }
          baseOption.grid = { show: false }
          break

        default:
          baseOption.series = [{
            name: title,
            type: 'line',
            data: data,
            smooth: true,
            lineStyle: { color: color },
            itemStyle: { color: color }
          }]
      }

      return baseOption
    }

    chartInstance.current.setOption(getChartOption())

    // Handle resize
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize()
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (chartInstance.current) {
        chartInstance.current.dispose()
      }
    }
  }, [title, chartType, data, timeLabels, color])

  // MQTT data subscription
  useEffect(() => {
    if (!mqttTopic) return

    const handleMqttData = (message, topic) => {
      if (topic === mqttTopic && message.value !== undefined) {
        setConnected(true)
        setLastValue(message.value)
        
        const now = new Date()
        
        setData(prevData => {
          const newData = [...prevData.slice(1), message.value]
          return newData
        })
        
        setTimeLabels(prevLabels => {
          const newLabels = [...prevLabels.slice(1), now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })]
          return newLabels
        })
      }
    }

    // Generate mock data for demo
    const generateMockData = () => {
      const now = new Date()
      const newData = {
        timestamp: now.toISOString(),
        value: Math.random() * 100,
        topic: mqttTopic
      }
      handleMqttData(newData)
    }

    // Set up mock data generation
    const interval = setInterval(generateMockData, 2000)
    setConnected(true)

    return () => {
      clearInterval(interval)
    }
  }, [mqttTopic])

  // Fallback: Generate random data if no MQTT topic is provided
  useEffect(() => {
    if (mqttTopic) return // Only use fallback if no MQTT topic

    const interval = setInterval(() => {
      const newValue = Math.random() * 100
      const now = new Date()
      
      setData(prevData => {
        const newData = [...prevData.slice(1), newValue]
        return newData
      })
      
      setTimeLabels(prevLabels => {
        const newLabels = [...prevLabels.slice(1), now.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })]
        return newLabels
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [mqttTopic])

  return (
    <div className="w-full h-full bg-white rounded-lg border border-gray-200 p-2 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-900 truncate">{title}</h3>
        <div className="flex items-center space-x-1 flex-shrink-0">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-500">{connected ? 'Live' : 'Offline'}</span>
        </div>
      </div>
      
      <div className="flex-1 flex justify-center items-center min-h-0 overflow-hidden">
        <div 
          ref={chartRef}
          className="w-full h-full max-w-full max-h-full"
          style={{ minHeight: '120px' }}
        />
      </div>
      
      <div className="mt-2 text-center flex-shrink-0">
        <div className="text-xs text-gray-600">
          {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
        </div>
        {mqttTopic && (
          <div className="text-xs text-gray-400 mt-1 truncate">
            {mqttTopic}
          </div>
        )}
      </div>
    </div>
  )
}

// Memoized component for better performance
export default memo(ChartWidget)
