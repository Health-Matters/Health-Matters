import { useEffect, useState } from 'react';
import { commonColors } from '@/lib/theme';

export const DebugAPI = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log('Testing direct fetch to:', 'http://localhost:3000/api/referrals');
        const response = await fetch('http://localhost:3000/api/referrals', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        setResult(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      }
    };

    testAPI();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Debug Test</h1>
      {error && (
        <div className={`${commonColors.status.error.bg} ${commonColors.status.error.border} border ${commonColors.status.error.text} px-4 py-3 rounded mb-4`}>
          <strong>Error:</strong> {error}
        </div>
      )}
      {result && (
        <div className={`${commonColors.status.success.bg} ${commonColors.status.success.border} border ${commonColors.status.success.text} px-4 py-3 rounded`}>
          <strong>Success!</strong> Found {result.length} referrals
          <pre className="mt-2 text-xs overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      {!error && !result && (
        <div className="text-gray-600">Loading...</div>
      )}
    </div>
  );
};
