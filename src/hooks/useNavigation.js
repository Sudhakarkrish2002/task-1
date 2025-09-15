import { useNavigate } from 'react-router-dom'

export const useNavigation = () => {
  const navigate = useNavigate()

  const navigateWithScrollToTop = (path, options = {}) => {
    navigate(path, options)
    
    // Ensure scroll to top happens after navigation
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
    }, 100)
  }

  const handleFooterLinkClick = (path) => {
    navigateWithScrollToTop(path)
  }

  const handleNavigation = (path) => {
    navigateWithScrollToTop(path)
  }

  return {
    navigate: navigateWithScrollToTop,
    handleFooterLinkClick,
    handleNavigation
  }
}
