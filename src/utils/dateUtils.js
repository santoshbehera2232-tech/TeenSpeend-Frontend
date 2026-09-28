/**
 * Date manipulation and friendly formatting helpers
 */

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const formatDate = (dateInput) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return dateInput;

  const day = d.getDate();
  const month = MONTHS_SHORT[d.getMonth()];
  const year = d.getFullYear();

  return `${day} ${month} ${year}`;
};

export const formatRelativeDate = (dateInput) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return dateInput;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const compareDate = new Date(d);
  compareDate.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - compareDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays === -1) return 'Tomorrow';
  if (diffDays > 1 && diffDays <= 7) return `${diffDays} days ago`;

  return formatDate(dateInput);
};

export const getGreeting = (name = 'there') => {
  const hour = new Date().getHours();
  let timeOfDay = 'Good morning';

  if (hour >= 12 && hour < 17) {
    timeOfDay = 'Good afternoon';
  } else if (hour >= 17) {
    timeOfDay = 'Good evening';
  }

  const firstName = name ? name.split(' ')[0] : 'friend';
  return `${timeOfDay}, ${firstName} 👋`;
};

export const getMonthName = (monthNumber, short = false) => {
  const idx = Math.max(0, Math.min(11, (parseInt(monthNumber, 10) || 1) - 1));
  return short ? MONTHS_SHORT[idx] : MONTHS_FULL[idx];
};

export const getTodayISO = () => {
  return new Date().toISOString().split('T')[0];
};
