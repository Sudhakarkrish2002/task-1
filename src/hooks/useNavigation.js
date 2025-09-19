import { useNavigate } from 'react-router-dom'
import { startTransition } from 'react'
import { useNavigationWithScroll } from './useScrollToTop'

export const useNavigation = () => {
  const navigate = useNavigate()
  const { navigateWithScrollToTop } = useNavigationWithScroll()

  const handleNavigation = (path, options = {}) => {
    startTransition(() => {
      navigateWithScrollToTop(navigate, path, options)
    })
  }

  const handleFooterLinkClick = (path) => {
    handleNavigation(path)
  }

  return {
    navigate: handleNavigation,
    handleFooterLinkClick,
    handleNavigation
  }
}
