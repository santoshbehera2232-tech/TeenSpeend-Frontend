import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { suggestionApi } from '../api/suggestionApi';
import SuggestionCard from '../components/SuggestionCard';
import { Sparkles, RefreshCw } from 'lucide-react';

const Suggestions = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const currency = user?.currency || 'INR';

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const res = await suggestionApi.getSuggestions();
      setSuggestions(res.data?.suggestions || []);
    } catch (err) {
      console.error('Failed to load suggestions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Smart Spending Engine</h1>
            <span className="badge badge-primary">
              <Sparkles size={12} /> AI-Ready Rules
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
            Personalized, friendly money insights based on your recent spending habits
          </p>
        </div>

        <button
          onClick={fetchSuggestions}
          className="btn btn-secondary btn-sm"
          disabled={loading}
        >
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          <span>Re-Analyze Spending</span>
        </button>
      </div>

      {/* Header Motivation Banner */}
      <div className="card" style={{
        backgroundColor: 'var(--primary-50)',
        border: '1px solid var(--primary-100)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-600)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          💡
        </div>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Financial Wisdom for Your Teen Years
          </h4>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Building conscious spending habits now gives you financial superpower in your 20s. We never judge your spending — we only provide clarity!
          </p>
        </div>
      </div>

      {/* Suggestions List */}
      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Analyzing transactions, budget utilization, and savings rates...
        </div>
      ) : suggestions.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '1rem', fontWeight: 600 }}>No suggestions generated yet.</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
            Record a few more expenses and set budgets to let our engine provide custom advice.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {suggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              currency={currency}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Suggestions;
