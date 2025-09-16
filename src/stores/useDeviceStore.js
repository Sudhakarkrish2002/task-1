import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useDeviceStore = create(
  persist(
    (set, get) => ({
      // State
      devices: [],
      deviceData: {}, // Real-time data from MQTT
      isLoading: false,
      error: null,
      mqttConnected: false,

      // Actions
      addDevice: (device) => {
        const newDevice = {
          id: device.id || Date.now().toString(),
          name: device.name || 'New Device',
          type: device.type || 'sensor',
          status: 'offline',
          lastSeen: null,
          config: device.config || {},
          location: device.location || '',
          mqttTopic: device.mqttTopic || '',
          createdAt: new Date().toISOString(),
          ...device
        }

        set((state) => ({
          devices: [...state.devices, newDevice]
        }))

        return newDevice
      },

      updateDevice: (deviceId, updates) => {
        set((state) => ({
          devices: state.devices.map(device =>
            device.id === deviceId
              ? { ...device, ...updates, lastSeen: new Date().toISOString() }
              : device
          )
        }))
      },

      removeDevice: (deviceId) => {
        set((state) => ({
          devices: state.devices.filter(device => device.id !== deviceId),
          deviceData: Object.fromEntries(
            Object.entries(state.deviceData).filter(([key]) => key !== deviceId)
          )
        }))
      },

      updateDeviceData: (deviceId, data) => {
        set((state) => ({
          deviceData: {
            ...state.deviceData,
            [deviceId]: {
              ...state.deviceData[deviceId],
              ...data,
              timestamp: new Date().toISOString()
            }
          },
          devices: state.devices.map(device =>
            device.id === deviceId
              ? { ...device, status: 'online', lastSeen: new Date().toISOString() }
              : device
          )
        }))
      },

      updateDeviceStatus: (deviceId, status) => {
        set((state) => ({
          devices: state.devices.map(device =>
            device.id === deviceId
              ? { ...device, status, lastSeen: new Date().toISOString() }
              : device
          )
        }))
      },

      getDeviceData: (deviceId) => {
        const state = get()
        return state.deviceData[deviceId] || null
      },

      getDevicesByTopic: (topic) => {
        const state = get()
        return state.devices.filter(device => device.mqttTopic === topic)
      },

      setMqttConnection: (connected) => {
        set({ mqttConnected: connected })
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null })
    }),
    {
      name: 'device-storage',
      partialize: (state) => ({ devices: state.devices })
    }
  )
)
