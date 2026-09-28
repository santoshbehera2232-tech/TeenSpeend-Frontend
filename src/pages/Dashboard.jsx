import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAnalytics } from '../hooks/useAnalytics';
import { useToast } from '../context/ToastContext';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import BudgetProgress from '../components/BudgetProgress';
import SuggestionCard from '../components/SuggestionCard';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/dateUtils';
import {
  Wallet,
  TrendingDown,
  PiggyBank,
  Sparkles,
  PlusCircle,
  Plus,
  ArrowUpRight,
  Target,
  PieChart as PieChartIcon,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const { data, loading, error, refresh } = useAnalytics();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const currency = user?.currency || 'INR';

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div className="card" style={{ height: '110px' }} />
          <div className="card" style={{ height: '110px' }} />
          <div className="card" style={{ height: '110px' }} />
          <div className="card" style={{ height: '110px' }} />
        </div>
      </div>
    );
  }

  const summary = data?.summary || {
    totalIncome: 0,
    totalExpenses: 0,
    remainingMoney: 0,
    savings: 0,
    savingsRate: 0,
    averageDailyExpense: 0,
    topCategory: 'None',
    budgetUsedPercentage: 0
  };

  const categoryBreakdown = data?.categoryBreakdown || [];
  const monthlyExpenses = data?.monthlyExpenses || [];
  const budgetStatus = data?.budgetStatus || [];
  const recentExpenses = data?.recentExpenses || [];
  const dailyExpenses = data?.dailyExpenses || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner & Quick Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            Financial Overview
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
            {data?.period?.monthName} {data?.period?.year} • {data?.period?.remainingDays} days left this month
          </p>
        </div>

        {/* Quick Action Pill Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/add-expense" className="btn btn-primary">
            <Plus size={16} />
            <span>Add Expense</span>
          </Link>
          <Link to="/income" className="btn btn-secondary">
            <Wallet size={16} />
            <span>Add Income</span>
          </Link>
          <Link to="/budget" className="btn btn-secondary">
            <PieChartIcon size={16} />
            <span>Set Budget</span>
          </Link>
        </div>
      </div>

      {/* 4 Core Financial Stat Cards */}
      <div className="grid-4">
        <StatCard
          title="Total Income"
          amount={summary.totalIncome}
          currency={currency}
          subtitle="Pocket money & earnings"
          icon={Wallet}
          iconBg="rgba(16, 185, 129, 0.12)"
          iconColor="var(--success)"
          highlightColor="var(--success)"
        />

        <StatCard
          title="Total Expenses"
          amount={summary.totalExpenses}
          currency={currency}
          subtitle={`Avg ${formatCurrency(summary.averageDailyExpense, currency)}/day`}
          icon={TrendingDown}
          iconBg="rgba(239, 68, 68, 0.12)"
          iconColor="var(--danger)"
          highlightColor="var(--danger)"
        />

        <StatCard
          title="Available Balance"
          amount={summary.remainingMoney}
          currency={currency}
          subtitle={summary.remainingMoney >= 0 ? 'Surplus this month' : 'Overspent budget!'}
          icon={Sparkles}
          iconBg="var(--primary-50)"
          iconColor="var(--primary-600)"
          highlightColor="var(--primary-500)"
        />

        <StatCard
          title="Savings Rate"
          amount={summary.savings}
          currency={currency}
          subtitle={`${summary.savingsRate}% of income saved`}
          icon={PiggyBank}
          iconBg="rgba(245, 158, 11, 0.12)"
          iconColor="var(--warning)"
          trend={{ value: summary.savingsRate, label: 'saved', isPositive: summary.savingsRate >= 15 }}
          highlightColor="var(--warning)"
        />
      </div>

      {/* Charts Grid: Monthly Trend & Category Donut */}
      <div className="grid-2">
        {/* Monthly Expense & Income Trend */}
        <ChartCard
          title="Income vs Expenses (6 Months)"
          subtitle="Historical cashflow trend"
          height={280}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyExpenses} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-md)',
                  color: 'var(--text-primary)'
                }}
                formatter={(val) => [formatCurrency(val, currency)]}
              />
              <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#incomeGrad)" />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#expenseGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Category Breakdown Donut */}
        <ChartCard
          title="Spending by Category"
          subtitle={`Top category: ${summary.topCategory}`}
          action={
            <Link to="/analytics" style={{ fontSize: '0.82rem', color: 'var(--primary-600)', fontWeight: 600 }}>
              Full report →
            </Link>
          }
          height={280}
        >
          {categoryBreakdown.length > 0 ? (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
              <div style={{ flex: 1, height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="total"
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [formatCurrency(val, currency)]}
                      contentStyle={{
                        backgroundColor: 'var(--bg-card)',
                        borderColor: 'var(--border-color)',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend List */}
              <div style={{ width: '45%', maxHeight: '240px', overflowY: 'auto', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {categoryBreakdown.slice(0, 5).map(cat => (
                  <div key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: cat.color, flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                        {cat.name}
                      </span>
                    </div>
                    <span style={{ fontWeight: 700, flexShrink: 0 }}>{cat.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No expenses recorded this month
            </div>
          )}
        </ChartCard>
      </div>

      {/* Middle Grid: Budget Progress & Smart Suggestions Sneak Peek */}
      <div className="grid-2">
        {/* Budgets Section */}
        <div className="card">
          <div className="card-header">
            <div>
              <h4 className="card-title">Budget Health</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {summary.budgetUsedPercentage}% overall monthly limit used
              </p>
            </div>
            <Link to="/budget" className="btn btn-secondary btn-sm">
              Manage Budgets
            </Link>
          </div>

          <div>
            {budgetStatus.length > 0 ? (
              budgetStatus.slice(0, 3).map(b => (
                <BudgetProgress
                  key={b.id}
                  categoryName={b.categoryName}
                  budgetAmount={b.budgetAmount}
                  spentAmount={b.spentAmount}
                  percentageUsed={b.percentageUsed}
                  currency={currency}
                  status={b.status}
                />
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)' }}>
                <p style={{ fontSize: '0.88rem', marginBottom: '10px' }}>
                  No budgets set for this month yet. Setting budgets keeps your pocket money safe!
                </p>
                <Link to="/budget" className="btn btn-primary btn-sm">
                  Create First Budget Target
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="card">
          <div className="card-header">
            <div>
              <h4 className="card-title">Recent Transactions</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Latest spending activity</p>
            </div>
            <Link to="/expenses" className="btn btn-secondary btn-sm">
              View All ({data?.period?.totalDays || 0})
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentExpenses.length > 0 ? (
              recentExpenses.map(exp => (
                <div
                  key={exp.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: exp.category?.color ? `${exp.category.color}20` : 'var(--primary-50)',
                      color: exp.category?.color || 'var(--primary-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}>
                      {exp.category?.name ? exp.category.name.charAt(0) : 'E'}
                    </div>

                    <div>
                      <p style={{ fontSize: '0.88rem', fontWeight: 600 }}>{exp.description}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {formatDate(exp.expenseDate)} • {exp.paymentMethod} •{' '}
                        {exp.isNecessary ? 'Need' : 'Want'}
                      </p>
                    </div>
                  </div>

                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--danger)' }}>
                    -{formatCurrency(exp.amount, currency)}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)' }}>
                <p style={{ fontSize: '0.88rem', marginBottom: '10px' }}>
                  No recent transactions recorded yet.
                </p>
                <Link to="/add-expense" className="btn btn-primary btn-sm">
                  + Add First Expense
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
