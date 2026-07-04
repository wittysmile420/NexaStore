import { useState, useEffect, useMemo } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import api from '../utils/api';
import './Analytics.css';

const CHART_COLORS = [
  '#6366f1', '#8b5cf6', '#a78bfa', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316',
  '#3b82f6', '#84cc16', '#e879f9', '#22d3ee', '#fb923c',
  '#a855f7', '#2dd4bf', '#fbbf24', '#f87171', '#818cf8',
  '#34d399', '#c084fc', '#38bdf8', '#facc15',
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip glass-card">
      <p className="chart-tooltip-label">{label || payload[0]?.name}</p>
      {payload.map((p, i) => (
        <p key={i} className="chart-tooltip-value" style={{ color: p.color || p.fill }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const result = await api.get('/products/analytics/summary');
        setData(result);
      } catch (error) {
        console.error('Analytics fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // useMemo for chart data transformation — Performance Optimization
  const categoryChartData = useMemo(() => {
    if (!data?.categoryDistribution) return [];
    return data.categoryDistribution.map(c => ({
      name: c._id,
      value: c.count,
      avgPrice: Math.round(c.avgPrice),
    }));
  }, [data]);

  const ratingChartData = useMemo(() => {
    if (!data?.ratingDistribution) return [];
    const labels = ['0-1', '1-2', '2-3', '3-4', '4-5'];
    return data.ratingDistribution.map((r, i) => ({
      name: labels[i] || `${r._id}`,
      count: r.count,
    }));
  }, [data]);

  const priceChartData = useMemo(() => {
    if (!data?.priceRanges) return [];
    const labels = {
      0: '$0-25', 25: '$25-50', 50: '$50-100', 100: '$100-250',
      250: '$250-500', 500: '$500-1K', 1000: '$1K-5K', '5000+': '$5K+',
    };
    return data.priceRanges.map(r => ({
      name: labels[r._id] || `$${r._id}`,
      count: r.count,
      avgRating: r.avgRating?.toFixed(1),
    }));
  }, [data]);

  const stockChartData = useMemo(() => {
    if (!data?.stockStatus) return [];
    return data.stockStatus.map(s => ({
      name: s._id,
      value: s.count,
    }));
  }, [data]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span className="loading-text">Loading analytics...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="products-empty">
        <h3>Failed to load analytics</h3>
      </div>
    );
  }

  return (
    <div className="analytics-page animate-fade-in">
      <div className="analytics-header">
        <h1 className="analytics-title">Analytics</h1>
        <p className="analytics-subtitle">Product inventory insights and metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card glass-card">
          <div className="kpi-icon kpi-icon-products">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            </svg>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{data.totalProducts?.toLocaleString()}</span>
            <span className="kpi-label">Total Products</span>
          </div>
          <div className="kpi-footer">
            <span className="kpi-badge badge badge-success">{data.publishedCount} published</span>
          </div>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-icon kpi-icon-rating">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{data.averageRating?.toFixed(2)}</span>
            <span className="kpi-label">Average Rating</span>
          </div>
          <div className="kpi-footer">
            <div className="stars" style={{ fontSize: '14px' }}>
              {[1,2,3,4,5].map(i => (
                <span key={i} className={i <= Math.round(data.averageRating) ? '' : 'star-empty'}>★</span>
              ))}
            </div>
          </div>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-icon kpi-icon-inventory">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">${data.totalInventoryValue?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            <span className="kpi-label">Total Inventory Value</span>
          </div>
          <div className="kpi-footer">
            <span className="kpi-sub">Σ (price × stock)</span>
          </div>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-icon kpi-icon-categories">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{categoryChartData.length}</span>
            <span className="kpi-label">Categories</span>
          </div>
          <div className="kpi-footer">
            <span className="kpi-sub">Distinct categories</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Category Distribution - Donut Chart */}
        <div className="chart-card glass-card">
          <h3 className="chart-title">Category Distribution</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryChartData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Price Distribution - Bar Chart */}
        <div className="chart-card glass-card">
          <h3 className="chart-title">Price Distribution</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={priceChartData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Products" radius={[6, 6, 0, 0]}>
                  {priceChartData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rating Distribution - Bar Chart */}
        <div className="chart-card glass-card">
          <h3 className="chart-title">Rating Distribution</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={ratingChartData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Products" radius={[6, 6, 0, 0]}>
                  {ratingChartData.map((_, i) => (
                    <Cell key={i} fill={['#ef4444', '#f59e0b', '#f97316', '#10b981', '#6366f1'][i] || CHART_COLORS[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Status - Pie Chart */}
        <div className="chart-card glass-card">
          <h3 className="chart-title">Stock Status</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={stockChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {stockChartData.map((entry, i) => {
                    const colorMap = {
                      'In Stock': '#10b981',
                      'Low Stock': '#f59e0b',
                      'Out of Stock': '#ef4444',
                    };
                    return <Cell key={i} fill={colorMap[entry.name] || CHART_COLORS[i]} />;
                  })}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  layout="horizontal"
                  align="center"
                  verticalAlign="bottom"
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
