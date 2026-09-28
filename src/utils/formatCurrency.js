/**
 * Universal Currency Formatter
 * Supports INR (₹), USD ($), EUR (€), GBP (£), etc.
 */

const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
  AUD: 'AU$',
  JPY: '¥'
};

export const formatCurrency = (amount, currencyCode = 'INR') => {
  const num = Number(amount);
  if (isNaN(num)) return '₹0';

  const code = (currencyCode || 'INR').toUpperCase();
  const symbol = CURRENCY_SYMBOLS[code] || code;

  // Format with Indian numbering system for INR
  if (code === 'INR') {
    return `${symbol}${num.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: num % 1 !== 0 ? 2 : 0
    })}`;
  }

  return `${symbol}${num.toLocaleString('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: num % 1 !== 0 ? 2 : 0
  })}`;
};

export const getCurrencySymbol = (currencyCode = 'INR') => {
  const code = (currencyCode || 'INR').toUpperCase();
  return CURRENCY_SYMBOLS[code] || code;
};
