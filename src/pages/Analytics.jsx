import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAnalytics } from '../hooks/useAnalytics';
import ChartCard from '../components/ChartCard';
import StatCard from '../components/StatCard';
import { formatCurrency } from '../utils/formatCurrency';
import { getMonthName } from '../utils/dateUtils';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';

const Analytics = () => {
  const { user } = useAuth();
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const { data, loading, error } = useAnalytics(selectedMonth, selectedYear);
  const currency = user?.currency || 'INR';

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Generating graphical analytics...
      </div>
    );
  }

  const summary = data?.summary || {};
  const categoryBreakdown = data?.categoryBreakdown || [];
  const monthlyExpenses = data?.monthlyExpenses || [];
  const weeklyExpenses = data?.weeklyExpenses || [];
  const dailyExpenses = data?.dailyExpenses || [];
  const budgetStatus = data?.budgetStatus || [];
  const necessaryVsDiscretionary = data?.necessaryVsDiscretionary || { necessaryPercentage: 50, discretionaryPercentage: 50 };

  // Data for Budget vs Actual Chart
  const budgetVsActualData = budgetStatus.map(b => ({
    name: b.categoryName,
    Planned: b.budgetAmount,
    Actual: b.spentAmount
  }));

  // Data for Needs vs Wants
  const needsVsWantsData = [
    { name: 'Needs (Essential)', value: necessaryVsDiscretionary.necessaryTotal || 0, color: '#10b981' },
    { name: 'Wants (Discretionary)', value: necessaryVsDiscretionary.discretionaryTotal || 0, color: '#f59e0b' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header & Month Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Spending & Savings Analytics</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Visual patterns, category distributions, and multi-month trends
          </p>
        </div>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          style={{ fontWeight: 600, padding: '8px 14px' }}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {getMonthName(i + 1)} {selectedYear}
            </option>
          ))}
        </select>
      </div>

      {/* Highlights Banner */}
      <div className="grid-3">
        <div className="card" style={{ borderLeft: '4px solid var(--primary-500)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Top Expense Category
          </span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>
            {summary.topCategory || 'None'}
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Absorbs the largest slice of your money
          </p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Savings Rate
          </span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px', color: 'var(--success)' }}>
            {summary.savingsRate || 0}%
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {formatCurrency(summary.savings || 0, currency)} retained this period
          </p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Single Highest Purchase
          </span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>
            {summary.highestExpense ? formatCurrency(summary.highestExpense.amount, currency) : '₹0'}
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {summary.highestExpense ? summary.highestExpense.description : 'No records'}
          </p>
        </div>
      </div>

      {/* Row 1: 1. Monthly Expense Line Chart & 2. Income vs Expenses Comparison */}
      <div className="grid-2">
        {/* 1. Monthly Expense Trend (Line/Area) */}
        <ChartCard
          title="1. Monthly Spending Trend"
          subtitle="6-month timeline of expenditures"
          height={280}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyExpenses} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip
                formatter={(val) => [formatCurrency(val, currency)]}
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-sm)' }}
              />
              <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#6366f1" strokeWidth={3} dot={{ r: 5, fill: '#6366f1' }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 4. Income vs Expense Comparison Chart */}
        <ChartCard
          title="2. Income vs Expenses Comparison"
          subtitle="Cash inflow compared with spending"
          height={280}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyExpenses} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip
                formatter={(val) => [formatCurrency(val, currency)]}
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-sm)' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2: 2. Category Expense Bar Chart & 3. Category Donut Chart */}
      <div className="grid-2">
        {/* Category Expense Bar Chart */}
        <ChartCard
          title="3. Category Spending Breakdown"
          subtitle="Ranked by total expenditure"
          height={280}
        >
          {categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBreakdown} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={11} width={80} />
                <Tooltip
                  formatter={(val) => [formatCurrency(val, currency)]}
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
                <Bar dataKey="total" name="Spent" radius={[0, 6, 6, 0]}>
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              No category data available
            </div>
          )}
        </ChartCard>

        {/* Expense Category Donut */}
        <ChartCard
          title="4. Category Share Percentage"
          subtitle="Relative distribution of expenses"
          height={280}
        >
          {categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={3}
                  dataKey="total"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [formatCurrency(val, currency)]}
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              No data
            </div>
          )}
        </ChartCard>
      </div>

      {/* Row 3: 5. Budget vs Actual & 6. Weekly Spending & 7. Needs vs Wants */}
      <div className="grid-3">
        {/* 5. Budget vs Actual Chart */}
        <ChartCard
          title="5. Budget vs Actual"
          subtitle="Target limits vs spent"
          height={260}
        >
          {budgetVsActualData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetVsActualData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip
                  formatter={(val) => [formatCurrency(val, currency)]}
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
                <Legend verticalAlign="top" height={30} />
                <Bar dataKey="Planned" fill="#818cf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No budgets configured this month
            </div>
          )}
        </ChartCard>

        {/* 6. Weekly Spending Chart */}
        <ChartCard
          title="6. Weekly Spending"
          subtitle="Pacing across month weeks"
          height={260}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyExpenses} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="week" stroke="var(--text-muted)" fontSize={10} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip
                formatter={(val) => [formatCurrency(val, currency)]}
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-sm)' }}
              />
              <Bar dataKey="amount" name="Spent" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 7. Needs vs Wants Chart */}
        <ChartCard
          title="7. Needs vs Wants Ratio"
          subtitle="Essential vs Discretionary"
          height={260}
        >
          <div style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
            <div style={{ flex: 1, height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={needsVsWantsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    dataKey="value"
                    paddingAngle={4}
                  >
                    {needsVsWantsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [formatCurrency(val, currency)]}
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ width: '45%', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <p style={{ color: '#10b981', fontWeight: 700 }}>
                  Needs: {necessaryVsDiscretionary.necessaryPercentage}%
                </p>
                <p style={{ color: 'var(--text-muted)' }}>
                  {formatCurrency(necessaryVsDiscretionary.necessaryTotal, currency)}
                </p>
              </div>
              <div>
                <p style={{ color: '#f59e0b', fontWeight: 700 }}>
                  Wants: {necessaryVsDiscretionary.discretionaryPercentage}%
                </p>
                <p style={{ color: 'var(--text-muted)' }}>
                  {formatCurrency(necessaryVsDiscretionary.discretionaryTotal, currency)}
                </p>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default Analytics;
