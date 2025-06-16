import React, { useState, useEffect } from 'react';

interface AnalyticsData {
  players: number;
  workshops: number;
  transactions: number;
  gasSponsored: number;
  revenue: number;
  date: string;
}

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('https://deficraft-backend.onrender.com/api/analytics');
        const data: AnalyticsData = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="loading">Loading analytics...</div>;

  return (
    <div className="analytics-dashboard">
      <h2>DeFiCraft Analytics - {analytics?.date}</h2>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Players</h3>
          <p className="value">{analytics?.players}</p>
        </div>
        
        <div className="metric-card">
          <h3>Workshops</h3>
          <p className="value">{analytics?.workshops}</p>
        </div>
        
        <div className="metric-card">
          <h3>Transactions</h3>
          <p className="value">{analytics?.transactions}</p>
        </div>
        
        <div className="metric-card">
          <h3>Gas Sponsored</h3>
          <p className="value">{analytics?.gasSponsored} ETH</p>
        </div>
        
        <div className="metric-card">
          <h3>Revenue</h3>
          <p className="value">${analytics?.revenue.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;