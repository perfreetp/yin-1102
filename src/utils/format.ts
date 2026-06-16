import dayjs from 'dayjs';

export const formatTime = (time: string): string => {
  if (!time) return '';
  try {
    return dayjs(time).format('HH:mm');
  } catch (e) {
    console.error('[Utils] formatTime error:', e);
    return time;
  }
};

export const formatDateTime = (time: string): string => {
  if (!time) return '';
  try {
    return dayjs(time).format('MM-DD HH:mm');
  } catch (e) {
    console.error('[Utils] formatDateTime error:', e);
    return time;
  }
};

export const formatWaitTime = (minutes: number): string => {
  if (minutes <= 0) return '即将叫号';
  if (minutes < 60) return `${minutes}分钟`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
};

export const formatTimeAgo = (time: string): string => {
  if (!time) return '';
  try {
    const diff = dayjs().diff(dayjs(time), 'minute');
    if (diff < 1) return '刚刚';
    if (diff < 60) return `${diff}分钟前`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    return `${days}天前`;
  } catch (e) {
    console.error('[Utils] formatTimeAgo error:', e);
    return time;
  }
};

export const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    waiting: '排队中',
    calling: '正在叫号',
    overdue: '已过号',
    completed: '已完成',
    notInQueue: '未排队'
  };
  return statusMap[status] || status;
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    waiting: '#4caf50',
    calling: '#ff9800',
    overdue: '#f44336',
    completed: '#1e88e5',
    notInQueue: '#8e8e93'
  };
  return colorMap[status] || '#8e8e93';
};

export const getMessageTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    calling: '叫号',
    reminder: '提醒',
    overdue: '过号',
    reroute: '改道',
    system: '系统',
    fleet: '车队'
  };
  return typeMap[type] || type;
};

export const getMessageTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    calling: '#ff9800',
    reminder: '#1e88e5',
    overdue: '#f44336',
    reroute: '#9c27b0',
    system: '#4caf50',
    fleet: '#00bcd4'
  };
  return colorMap[type] || '#8e8e93';
};

export const getMessageTypeBgColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    calling: '#fff3e0',
    reminder: '#e3f2fd',
    overdue: '#ffebee',
    reroute: '#f3e5f5',
    system: '#e8f5e9',
    fleet: '#e0f7fa'
  };
  return colorMap[type] || '#f5f5f5';
};

export const getPreferenceColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    fast: '#ff9800',
    exit: '#4caf50',
    quiet: '#9c27b0',
    normal: '#1e88e5'
  };
  return colorMap[type] || '#1e88e5';
};
