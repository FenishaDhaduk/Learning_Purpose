// utils/messageUtils.js
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';

export const formatDateHeader = (date) => {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date)) return format(date, 'EEEE');
  return format(date, 'dd/MM/yyyy');
};

export const isSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const getStatusIcon = (status) => {
  switch (status) {
    case 'sent':
      return '✓'; 
    case 'delivered':
      return '✓✓'; 
    case 'seen':
      return <span style={{ color: 'blue' }}>✓✓</span>; 
    default:
      return '';
  }
};
