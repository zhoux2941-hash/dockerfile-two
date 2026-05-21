function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

function formatDateTime(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().replace('T', ' ').split('.')[0];
}

function formatRelativeTime(date) {
  if (!date) return '';
  
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`;
  return `${Math.floor(diffDays / 365)}年前`;
}

function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return '';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}分钟`;
  if (mins === 0) return `${hours}小时`;
  return `${hours}小时${mins}分钟`;
}

function formatNumber(num, decimals = 2) {
  if (num === null || num === undefined) return '';
  return parseFloat(num).toFixed(decimals);
}

function formatPercentage(value, total) {
  if (!total || total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
}

function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function capitalizeFirst(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatUserRole(role) {
  const roleMap = {
    'admin': '管理员',
    'manager': '经理',
    'user': '用户',
    'guest': '访客'
  };
  return roleMap[role] || role;
}

function formatTaskStatus(status) {
  const statusMap = {
    'pending': '待处理',
    'in_progress': '进行中',
    'completed': '已完成',
    'cancelled': '已取消',
    'on_hold': '暂停'
  };
  return statusMap[status] || status;
}

function formatPriority(priority) {
  const priorityMap = {
    'low': '低',
    'medium': '中',
    'high': '高',
    'urgent': '紧急'
  };
  return priorityMap[priority] || priority;
}

function formatProjectStatus(status) {
  const statusMap = {
    'planning': '规划中',
    'active': '进行中',
    'completed': '已完成',
    'cancelled': '已取消',
    'on_hold': '暂停'
  };
  return statusMap[status] || status;
}

function formatBoolean(value, trueText = '是', falseText = '否') {
  return value ? trueText : falseText;
}

function formatArrayToString(arr, separator = ', ') {
  if (!Array.isArray(arr)) return '';
  return arr.join(separator);
}

function formatTags(tags) {
  if (!Array.isArray(tags)) return '';
  return tags.map(tag => `#${tag}`).join(' ');
}

function formatSearchQuery(query) {
  if (!query) return '';
  return query.trim().replace(/[<>]/g, '');
}

function formatPagination(page, limit, total) {
  const totalPages = Math.ceil(total / limit);
  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
}

function formatResponse(success, data, message = '') {
  return {
    success,
    data,
    message,
    timestamp: new Date().toISOString()
  };
}

function formatError(message, code = '') {
  return {
    success: false,
    error: {
      message,
      code,
      timestamp: new Date().toISOString()
    }
  };
}

function formatTableData(items, columns) {
  return items.map(item => {
    const row = {};
    columns.forEach(col => {
      row[col] = item[col];
    });
    return row;
  });
}

function formatChartData(data, labelKey, valueKey) {
  return data.map(item => ({
    label: item[labelKey],
    value: item[valueKey]
  }));
}

function formatSelectOptions(items, valueKey, labelKey) {
  return items.map(item => ({
    value: item[valueKey],
    label: item[labelKey]
  }));
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatCurrency(amount, currency = '¥') {
  if (amount === null || amount === undefined) return '';
  return `${currency}${parseFloat(amount).toFixed(2)}`;
}

function formatPhoneNumber(phone) {
  if (!phone) return '';
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
  if (match) {
    return match[1] + '-' + match[2] + '-' + match[3];
  }
  return phone;
}

function formatEmail(email) {
  return (email || '').toLowerCase().trim();
}

module.exports = {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatDuration,
  formatNumber,
  formatPercentage,
  truncateText,
  capitalizeFirst,
  formatUserRole,
  formatTaskStatus,
  formatPriority,
  formatProjectStatus,
  formatBoolean,
  formatArrayToString,
  formatTags,
  formatSearchQuery,
  formatPagination,
  formatResponse,
  formatError,
  formatTableData,
  formatChartData,
  formatSelectOptions,
  formatFileSize,
  formatCurrency,
  formatPhoneNumber,
  formatEmail
};