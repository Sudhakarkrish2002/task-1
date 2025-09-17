/**
 * Dashboard Service
 * Handles all dashboard-related API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class DashboardService {
  /**
   * Save dashboard to backend
   * @param {Object} dashboardData - Dashboard data to save
   * @returns {Promise<Object>} Response from server
   */
  async saveDashboard(dashboardData) {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dashboardData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save dashboard');
      }

      return result;
    } catch (error) {
      console.error('Error saving dashboard:', error);
      throw error;
    }
  }

  /**
   * Update existing dashboard
   * @param {string} dashboardId - ID of dashboard to update
   * @param {Object} dashboardData - Updated dashboard data
   * @returns {Promise<Object>} Response from server
   */
  async updateDashboard(dashboardId, dashboardData) {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/update/${dashboardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dashboardData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update dashboard');
      }

      return result;
    } catch (error) {
      console.error('Error updating dashboard:', error);
      throw error;
    }
  }

  /**
   * Publish dashboard
   * @param {Object} dashboardData - Dashboard data to publish
   * @returns {Promise<Object>} Response from server
   */
  async publishDashboard(dashboardData) {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dashboardData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to publish dashboard');
      }

      return result;
    } catch (error) {
      console.error('Error publishing dashboard:', error);
      throw error;
    }
  }

  /**
   * Get shared dashboard
   * @param {string} shareableId - Shareable ID of the dashboard
   * @param {string} password - Optional password for access
   * @returns {Promise<Object>} Shared dashboard data
   */
  async getSharedDashboard(shareableId, password = null) {
    try {
      const url = new URL(`${API_BASE_URL}/dashboard/shared/${shareableId}`);
      if (password) {
        url.searchParams.append('password', password);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get shared dashboard');
      }

      return result;
    } catch (error) {
      console.error('Error getting shared dashboard:', error);
      throw error;
    }
  }

  /**
   * Get user's dashboards
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User's dashboards
   */
  async getUserDashboards(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get user dashboards');
      }

      return result;
    } catch (error) {
      console.error('Error getting user dashboards:', error);
      throw error;
    }
  }

  /**
   * Delete dashboard
   * @param {string} dashboardId - ID of dashboard to delete
   * @returns {Promise<Object>} Response from server
   */
  async deleteDashboard(dashboardId) {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/${dashboardId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete dashboard');
      }

      return result;
    } catch (error) {
      console.error('Error deleting dashboard:', error);
      throw error;
    }
  }

  /**
   * Generate a new topic ID
   * @returns {Promise<Object>} Response with topic ID
   */
  async generateTopicId() {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/generate-topic-id`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate topic ID');
      }

      return result;
    } catch (error) {
      console.error('Error generating topic ID:', error);
      throw error;
    }
  }

  /**
   * Check if backend is available
   * @returns {Promise<boolean>} True if backend is available
   */
  async checkBackendHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
const dashboardService = new DashboardService();
export default dashboardService;

