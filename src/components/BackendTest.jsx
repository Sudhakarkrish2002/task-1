import { useState } from 'react';

const BackendTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testBackendConnection = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      const response = await fetch('http://localhost:5000/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      setTestResult({
        success: true,
        data: result,
        status: response.status
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
        details: 'Make sure the backend server is running on port 5000'
      });
    } finally {
      setLoading(false);
    }
  };

  const testHealthCheck = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      const response = await fetch('http://localhost:5000/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      setTestResult({
        success: true,
        data: result,
        status: response.status
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
        details: 'Make sure the backend server is running on port 5000'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Backend Connection Test</h2>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={testBackendConnection}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Connection'}
          </button>
          
          <button
            onClick={testHealthCheck}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Health Check'}
          </button>
        </div>

        {testResult && (
          <div className={`p-4 rounded-lg ${
            testResult.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <h3 className={`font-semibold ${
              testResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {testResult.success ? '✅ Success' : '❌ Error'}
            </h3>
            
            {testResult.success ? (
              <div className="mt-2">
                <p className="text-green-700">{testResult.data.message}</p>
                <div className="mt-2 text-sm text-green-600">
                  <p><strong>Status:</strong> {testResult.status}</p>
                  <p><strong>Timestamp:</strong> {testResult.data.timestamp}</p>
                  {testResult.data.cors && (
                    <p><strong>CORS Origin:</strong> {testResult.data.cors.origin}</p>
                  )}
                  {testResult.data.environment && (
                    <p><strong>Environment:</strong> {testResult.data.environment}</p>
                  )}
                  {testResult.data.port && (
                    <p><strong>Port:</strong> {testResult.data.port}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-2">
                <p className="text-red-700"><strong>Error:</strong> {testResult.error}</p>
                {testResult.details && (
                  <p className="text-red-600 text-sm mt-1">{testResult.details}</p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Setup Instructions:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
            <li>Make sure the backend server is running: <code className="bg-gray-200 px-1 rounded">npm run dev</code></li>
            <li>Backend should be accessible at: <code className="bg-gray-200 px-1 rounded">http://localhost:5000</code></li>
            <li>Frontend should be running at: <code className="bg-gray-200 px-1 rounded">http://localhost:3000</code></li>
            <li>Configure your email settings in the backend <code className="bg-gray-200 px-1 rounded">.env</code> file</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default BackendTest;

