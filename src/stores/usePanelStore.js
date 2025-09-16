import { createWithEqualityFn } from 'zustand/traditional'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { shallow } from 'zustand/shallow'

export const usePanelStore = createWithEqualityFn(
  subscribeWithSelector(
    persist(
      (set, get) => ({
      // State
      panels: [],
      currentPanel: null,
      isLoading: false,
      error: null,

      // Actions
      createPanel: (panelData) => {
        const state = get()
        
        // Generate unique name if duplicate exists
        let panelName = panelData.name || 'New Panel'
        let counter = 1
        while (state.panels.some(panel => panel.name === panelName)) {
          panelName = `${panelData.name || 'New Panel'} (${counter})`
          counter++
        }
        
        // Generate a truly unique ID
        const generateUniqueId = () => {
          return `panel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
        
        const newPanel = {
          id: panelData.id || generateUniqueId(),
          name: panelName,
          widgets: panelData.widgets || [],
          layout: panelData.layout || {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isShared: false,
          sharedUsers: [],
          deviceCount: panelData.widgets?.length || 0,
          // Don't spread panelData at the end to avoid overriding our generated values
          ...(panelData.id ? {} : panelData) // Only spread if no ID was provided
        }
        
        set((state) => {
          const updatedPanels = [...state.panels, newPanel]
          return {
            panels: updatedPanels,
            currentPanel: newPanel
          }
        })
        return newPanel
      },

      updatePanel: (panelId, updates) => {
        set((state) => ({
          panels: state.panels.map(panel =>
            panel.id === panelId
              ? { ...panel, ...updates, updatedAt: new Date().toISOString() }
              : panel
          ),
          currentPanel: state.currentPanel?.id === panelId
            ? { ...state.currentPanel, ...updates, updatedAt: new Date().toISOString() }
            : state.currentPanel
        }))
      },

      deletePanel: (panelId) => {
        set((state) => ({
          panels: state.panels.filter(panel => panel.id !== panelId),
          currentPanel: state.currentPanel?.id === panelId ? null : state.currentPanel
        }))
      },

      setCurrentPanel: (panel) => {
        set({ currentPanel: panel })
      },

      addWidget: (panelId, widget) => {
        const newWidget = {
          id: Date.now().toString(),
          type: widget.type,
          config: widget.config || {},
          deviceId: widget.deviceId || '',
          mqttTopic: widget.mqttTopic || '',
          position: widget.position || { x: 0, y: 0, w: 3, h: 3 },
          ...widget
        }

        set((state) => ({
          panels: state.panels.map(panel =>
            panel.id === panelId
              ? { 
                  ...panel, 
                  widgets: [...panel.widgets, newWidget],
                  updatedAt: new Date().toISOString()
                }
              : panel
          ),
          currentPanel: state.currentPanel?.id === panelId
            ? { 
                ...state.currentPanel, 
                widgets: [...state.currentPanel.widgets, newWidget],
                updatedAt: new Date().toISOString()
              }
            : state.currentPanel
        }))
      },

      updateWidget: (panelId, widgetId, updates) => {
        set((state) => ({
          panels: state.panels.map(panel =>
            panel.id === panelId
              ? {
                  ...panel,
                  widgets: panel.widgets.map(widget =>
                    widget.id === widgetId ? { ...widget, ...updates } : widget
                  ),
                  updatedAt: new Date().toISOString()
                }
              : panel
          ),
          currentPanel: state.currentPanel?.id === panelId
            ? {
                ...state.currentPanel,
                widgets: state.currentPanel.widgets.map(widget =>
                  widget.id === widgetId ? { ...widget, ...updates } : widget
                ),
                updatedAt: new Date().toISOString()
              }
            : state.currentPanel
        }))
      },


      removeWidget: (panelId, widgetId) => {
        set((state) => ({
          panels: state.panels.map(panel =>
            panel.id === panelId
              ? {
                  ...panel,
                  widgets: panel.widgets.filter(widget => widget.id !== widgetId),
                  updatedAt: new Date().toISOString()
                }
              : panel
          ),
          currentPanel: state.currentPanel?.id === panelId
            ? {
                ...state.currentPanel,
                widgets: state.currentPanel.widgets.filter(widget => widget.id !== widgetId),
                updatedAt: new Date().toISOString()
              }
            : state.currentPanel
        }))
      },

      sharePanel: (panelId, userData) => {
        set((state) => ({
          panels: state.panels.map(panel =>
            panel.id === panelId
              ? {
                  ...panel,
                  isShared: true,
                  sharedUsers: [...panel.sharedUsers, userData],
                  updatedAt: new Date().toISOString()
                }
              : panel
          )
        }))
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Utility function to remove duplicate panels
      removeDuplicates: () => {
        set((state) => {
          const uniquePanels = []
          const seenNames = new Set()
          
          state.panels.forEach(panel => {
            if (!seenNames.has(panel.name)) {
              seenNames.add(panel.name)
              uniquePanels.push(panel)
            }
          })
          
          return { panels: uniquePanels }
        })
      }
      }),
      {
        name: 'panel-storage',
        partialize: (state) => ({ panels: state.panels })
      }
    )
  )
)

// Optimized selectors for better performance
export const usePanels = () => usePanelStore(state => state.panels, shallow)
export const useCurrentPanel = () => usePanelStore(state => state.currentPanel)
export const usePanelById = (id) => usePanelStore(state => 
  state.panels.find(panel => panel.id === id)
)
export const usePanelActions = () => usePanelStore(state => ({
  createPanel: state.createPanel,
  updatePanel: state.updatePanel,
  deletePanel: state.deletePanel,
  removeDuplicates: state.removeDuplicates
}), shallow)
