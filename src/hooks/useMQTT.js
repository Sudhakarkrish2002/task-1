import { useContext } from 'react'
import { MQTTContext } from '../App'

export const useMQTT = () => {
  const context = useContext(MQTTContext)
  if (!context) {
    throw new Error('useMQTT must be used within an MQTTProvider')
  }
  return context
}

export default useMQTT
