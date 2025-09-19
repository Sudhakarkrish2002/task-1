import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Custom hook to handle scroll-to-top functionality
 * Works across all device types and handles edge cases
 */
export const useScrollToTop = () => {
  const location = useLocation()
  const previousPathname = useRef(location.pathname)

  useEffect(() => {
    // Only scroll to top if the pathname has actually changed
    if (previousPathname.current !== location.pathname) {
      previousPathname.current = location.pathname
      
      // Multiple scroll methods to ensure compatibility across all devices
      const scrollToTop = () => {
        // Method 1: Standard scrollTo with smooth behavior
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        })

        // Method 2: Direct scrollTop assignment for immediate effect
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0

        // Method 3: For mobile Safari and other browsers that might not support smooth scrolling
        if (window.pageYOffset > 0) {
          window.scrollTo(0, 0)
        }
      }

      // Execute immediately
      scrollToTop()

      // Also execute after a small delay to handle async route changes
      const timeoutId = setTimeout(scrollToTop, 50)

      // Cleanup timeout
      return () => clearTimeout(timeoutId)
    }
  }, [location.pathname])

  // Manual scroll to top function for programmatic use
  const scrollToTop = (smooth = true) => {
    if (smooth) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
    } else {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }
  }

  return { scrollToTop }
}

/**
 * Hook specifically for navigation with scroll to top
 * Enhanced version of the existing useNavigation hook
 */
export const useNavigationWithScroll = () => {
  const { scrollToTop } = useScrollToTop()
  
  const navigateWithScrollToTop = (navigate, path, options = {}) => {
    // Navigate first
    navigate(path, options)
    
    // Force scroll to top after navigation
    setTimeout(() => {
      scrollToTop(true)
    }, 10)
    
    // Additional fallback for slower devices
    setTimeout(() => {
      scrollToTop(false)
    }, 100)
  }

  return { navigateWithScrollToTop, scrollToTop }
}
