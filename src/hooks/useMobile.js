import { useState, useEffect } from 'react'

/**
 * Custom hook for mobile detection and responsive behavior
 * Provides utilities for mobile-specific functionality
 */
export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [screenSize, setScreenSize] = useState('desktop')

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      const isMobileDevice = width <= 768
      const isTabletDevice = width > 768 && width <= 1024
      
      setIsMobile(isMobileDevice)
      setIsTablet(isTabletDevice)
      
      if (isMobileDevice) {
        setScreenSize('mobile')
      } else if (isTabletDevice) {
        setScreenSize('tablet')
      } else {
        setScreenSize('desktop')
      }
    }

    // Initial check
    checkScreenSize()

    // Add resize listener with debouncing
    let timeoutId
    const debouncedResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(checkScreenSize, 150)
    }

    window.addEventListener('resize', debouncedResize)
    
    return () => {
      window.removeEventListener('resize', debouncedResize)
      clearTimeout(timeoutId)
    }
  }, [])

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    screenSize,
    // Utility functions
    getResponsiveValue: (mobile, tablet, desktop) => {
      if (isMobile) return mobile
      if (isTablet) return tablet
      return desktop
    },
    // Touch detection
    isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    // Orientation detection
    isPortrait: window.innerHeight > window.innerWidth,
    isLandscape: window.innerWidth > window.innerHeight
  }
}

/**
 * Hook for mobile-specific performance optimizations
 */
export const useMobilePerformance = () => {
  const { isMobile } = useMobile()
  
  useEffect(() => {
    if (isMobile) {
      // Disable hover effects on mobile for better performance
      document.body.classList.add('mobile-device')
      
      // Optimize scroll performance
      document.body.style.webkitOverflowScrolling = 'touch'
      
      // Prevent zoom on input focus (iOS)
      const preventZoom = (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
          e.target.style.fontSize = '16px'
        }
      }
      
      document.addEventListener('focusin', preventZoom)
      
      return () => {
        document.body.classList.remove('mobile-device')
        document.body.style.webkitOverflowScrolling = ''
        document.removeEventListener('focusin', preventZoom)
      }
    }
  }, [isMobile])

  return {
    isMobile,
    // Performance optimizations
    enableTouchOptimizations: isMobile,
    reduceAnimations: isMobile,
    optimizeScrolling: isMobile
  }
}

export default useMobile
