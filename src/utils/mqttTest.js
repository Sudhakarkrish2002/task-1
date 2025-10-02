/**
 * MQTT Test Utility
 * Provides functions to test MQTT connection and data flow
 */

import mqttService from '../services/mqttService'
import dataSimulator from '../services/dataSimulator'

/**
 * Test MQTT connection and basic functionality
 */
export const testMqttConnection = async () => {
  console.log('🧪 Starting MQTT Connection Test...')
  
  try {
    // Test connection
    console.log('1️⃣ Testing MQTT connection...')
    const connectionStatus = mqttService.getConnectionStatus()
    console.log('📊 Connection Status:', connectionStatus)
    
    if (!connectionStatus.isConnected) {
      console.log('🔄 Attempting to connect...')
      await mqttService.connect()
      console.log('✅ Connection successful!')
    } else {
      console.log('✅ Already connected!')
    }
    
    // Test subscription
    console.log('2️⃣ Testing topic subscription...')
    const testTopic = 'test-topic-' + Date.now()
    let messageReceived = false
    
    const testHandler = (data, topic) => {
      console.log('📨 Test message received:', { topic, data })
      messageReceived = true
    }
    
    const subscribeSuccess = mqttService.subscribe(testTopic, testHandler)
    console.log('📡 Subscription result:', subscribeSuccess)
    
    // Test publishing
    console.log('3️⃣ Testing message publishing...')
    const testMessage = { test: 'Hello MQTT!', timestamp: new Date().toISOString() }
    const publishSuccess = mqttService.publish(testTopic, testMessage)
    console.log('📤 Publish result:', publishSuccess)
    
    // Wait for message
    console.log('4️⃣ Waiting for message...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Cleanup
    mqttService.unsubscribe(testTopic, testHandler)
    
    console.log('🎯 Test Results:')
    console.log('- Connection:', connectionStatus.isConnected ? '✅' : '❌')
    console.log('- Subscription:', subscribeSuccess ? '✅' : '❌')
    console.log('- Publishing:', publishSuccess ? '✅' : '❌')
    console.log('- Message Received:', messageReceived ? '✅' : '❌')
    
    return {
      connection: connectionStatus.isConnected,
      subscription: subscribeSuccess,
      publishing: publishSuccess,
      messageReceived
    }
    
  } catch (error) {
    console.error('❌ MQTT Test failed:', error)
    return {
      connection: false,
      subscription: false,
      publishing: false,
      messageReceived: false,
      error: error.message
    }
  }
}

/**
 * Test data simulator functionality
 */
export const testDataSimulator = (panelId, widgets) => {
  console.log('🧪 Starting Data Simulator Test...')
  console.log('📊 Panel ID:', panelId)
  console.log('🎯 Widgets:', widgets)
  
  try {
    // Start simulation
    const startSuccess = dataSimulator.startPanelSimulation(panelId, widgets)
    console.log('🚀 Simulation start result:', startSuccess)
    
    // Get status
    const status = dataSimulator.getStatus()
    console.log('📈 Simulation status:', status)
    
    // Wait a bit to see data
    setTimeout(() => {
      const updatedStatus = dataSimulator.getStatus()
      console.log('📈 Updated simulation status:', updatedStatus)
    }, 3000)
    
    return {
      startSuccess,
      status
    }
    
  } catch (error) {
    console.error('❌ Data Simulator Test failed:', error)
    return {
      startSuccess: false,
      status: null,
      error: error.message
    }
  }
}

/**
 * Test end-to-end data flow
 */
export const testEndToEndFlow = async (panelId, widgets) => {
  console.log('🧪 Starting End-to-End Flow Test...')
  
  try {
    // Test MQTT connection
    const mqttTest = await testMqttConnection()
    
    if (!mqttTest.connection) {
      throw new Error('MQTT connection failed')
    }
    
    // Test data simulator
    const simulatorTest = testDataSimulator(panelId, widgets)
    
    if (!simulatorTest.startSuccess) {
      throw new Error('Data simulator failed to start')
    }
    
    // Wait for data flow
    console.log('⏳ Waiting for data flow...')
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // Check final status
    const finalStatus = dataSimulator.getStatus()
    const connectionStatus = mqttService.getConnectionStatus()
    
    console.log('🎯 End-to-End Test Results:')
    console.log('- MQTT Connection:', mqttTest.connection ? '✅' : '❌')
    console.log('- Data Simulator:', simulatorTest.startSuccess ? '✅' : '❌')
    console.log('- Active Widgets:', finalStatus.activeWidgets.length)
    console.log('- Active Subscriptions:', connectionStatus.subscriptions?.length || 0)
    
    return {
      mqttTest,
      simulatorTest,
      finalStatus,
      connectionStatus,
      success: mqttTest.connection && simulatorTest.startSuccess
    }
    
  } catch (error) {
    console.error('❌ End-to-End Test failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Run all tests
 */
export const runAllTests = async (panelId, widgets) => {
  console.log('🚀 Running All MQTT Tests...')
  console.log('=' .repeat(50))
  
  const results = {
    mqttConnection: await testMqttConnection(),
    dataSimulator: testDataSimulator(panelId, widgets),
    endToEnd: await testEndToEndFlow(panelId, widgets)
  }
  
  console.log('=' .repeat(50))
  console.log('📊 Final Test Results:')
  console.log(JSON.stringify(results, null, 2))
  
  return results
}

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
  window.mqttTest = {
    testMqttConnection,
    testDataSimulator,
    testEndToEndFlow,
    runAllTests
  }
}
