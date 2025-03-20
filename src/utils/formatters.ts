// src/utils/formatters.js

/**
 * Format a date to a localized string format
 * @param {string|Date} date - Date to format
 * @param {Object} options - Format options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return dateObj.toLocaleDateString(undefined, defaultOptions);
};

/**
 * Format a date to include time
 * @param {string|Date} date - Date to format
 * @param {boolean} includeSeconds - Whether to include seconds
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date, includeSeconds = false) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  
  if (includeSeconds) {
    options.second = '2-digit';
  }
  
  return dateObj.toLocaleString(undefined, options);
};

/**
 * Format a number as currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: INR)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === undefined || amount === null) return '';
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount);
};

/**
 * Format a number with commas for thousands separator
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export const formatNumber = (number, decimals = 0) => {
  if (number === undefined || number === null) return '';
  
  const formatter = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  
  return formatter.format(number);
};

/**
 * Format a duration in seconds to MM:SS or HH:MM:SS format
 * @param {number} seconds - Duration in seconds
 * @param {boolean} includeHours - Whether to include hours
 * @returns {string} Formatted duration string
 */
export const formatDuration = (seconds, includeHours = false) => {
  if (seconds === undefined || seconds === null) return '';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (includeHours || hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  } else {
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }
};

/**
 * Convert a string to title case
 * @param {string} str - String to convert
 * @returns {string} Title case string
 */
export const toTitleCase = (str) => {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Truncate a string to a specified length
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add when truncated
 * @returns {string} Truncated string
 */
export const truncateString = (str, length = 50, suffix = '...') => {
  if (!str) return '';
  
  if (str.length <= length) return str;
  
  return str.substring(0, length).trim() + suffix;
};

/**
 * Format file size in bytes to human-readable format
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

/**
 * Calculate the time difference between two dates
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {Object} Time difference in various units
 */
export const getTimeDifference = (startDate, endDate) => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = endDate ? (typeof endDate === 'string' ? new Date(endDate) : endDate) : new Date();
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { 
      invalid: true,
      seconds: 0,
      minutes: 0,
      hours: 0,
      days: 0
    };
  }
  
  const diffMs = Math.abs(end - start);
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  return {
    invalid: false,
    seconds,
    minutes,
    hours,
    days
  };
};

/**
 * Format a time ago string (e.g., "2 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Time ago string
 */
export const formatTimeAgo = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  const diff = getTimeDifference(dateObj, new Date());
  
  if (diff.days > 30) {
    return formatDate(dateObj);
  } else if (diff.days > 0) {
    return `${diff.days} ${diff.days === 1 ? 'day' : 'days'} ago`;
  } else if (diff.hours > 0) {
    return `${diff.hours} ${diff.hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diff.minutes > 0) {
    return `${diff.minutes} ${diff.minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else {
    return 'Just now';
  }
};

export default {
  formatDate,
  formatDateTime,
  formatCurrency,
  formatNumber,
  formatDuration,
  toTitleCase,
  truncateString,
  formatFileSize,
  getTimeDifference,
  formatTimeAgo
};