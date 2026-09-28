import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Sun, Moon, Plus, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getGreeting } from '../utils/dateUtils';

const Navbar = ({ onOpenSidebar }) => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header style={{
      height: '70px',
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      backdropFilter: 'blur(8px)'
    }}>
      {/* Left: Mobile hamburger & Greeting */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onOpenSidebar}
          className="mobile-hamburger"
          style={{
            background: 'transparent',
            color: 'var(--text-primary)',
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            display: 'none',
            alignItems: 'center'
          }}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
            {getGreeting(user?.name)}
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Track smart, save better.
          </p>
        </div>
      </div>

      {/* Right: Quick actions, Theme toggle, Profile avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Quick Add Expense Button */}
        <Link
          to="/add-expense"
          className="btn btn-primary btn-sm"
          style={{ padding: '8px 14px', borderRadius: 'var(--radius-full)' }}
        >
          <Plus size={16} />
          <span>New Expense</span>
        </Link>

        {/* Dark/Light mode toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-app)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s ease'
          }}
        >
          {isDark ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
        </button>

        {/* User Avatar linking to profile */}
        <Link
          to="/profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 8px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-app)'
          }}
        >
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'var(--primary-gradient)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, paddingRight: '4px' }}>
            {user?.currency || 'INR'}
          </span>
        </Link>
      </div>

      <style>{`
        @media (max-width: 900px) {
          header {
            padding: 0 16px !important;
          }
          .mobile-hamburger {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
