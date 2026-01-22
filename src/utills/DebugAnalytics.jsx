// src/components/DebugAnalytics.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DebugAnalytics = () => {
  const [apiResponse, setApiResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token);
      
      const response = await axios.get(
        'https://sales-system-production.up.railway.app/api/analytics/daily',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('API Response:', response.data);
      setApiResponse(response.data);
      
    } catch (err) {
      console.error('API Error Details:', err);
      console.error('Error Response:', err.response?.data);
      console.error('Error Status:', err.response?.status);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkSalesDirectly = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'https://sales-system-production.up.railway.app/api/sales',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Direct Sales Data:', response.data);
    } catch (err) {
      console.error('Direct Sales Error:', err);
    }
  };

  useEffect(() => {
    testApi();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">API Debugger</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testApi}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? 'Testing...' : 'Test Analytics API'}
        </button>
        
        <button
          onClick={checkSalesDirectly}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ml-4"
        >
          Check Sales Directly
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h3 className="text-red-800 font-bold">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {apiResponse && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-bold mb-2">API Response</h3>
          <pre className="text-sm bg-gray-900 text-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DebugAnalytics;