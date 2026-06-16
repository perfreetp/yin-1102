import { QueueInfo, ChargingPreference, OneClickAction, FleetMember, QuickAction } from '@/types';

export const chargingPreferences: ChargingPreference[] = [
  { type: 'fast', label: '快充优先' },
  { type: 'exit', label: '离出口近' },
  { type: 'quiet', label: '安静区域' },
  { type: 'normal', label: '普通安排' }
];

export const oneClickActions: OneClickAction[] = [
  {
    id: '1',
    type: 'arrived',
    label: '已到门口',
    icon: '🚚',
    description: '告知场站您已到达入口'
  },
  {
    id: '2',
    type: 'leave',
    label: '临时离开',
    icon: '⏸️',
    description: '暂离5分钟内保留位置'
  },
  {
    id: '3',
    type: 'reverse',
    label: '协助倒车',
    icon: '🆘',
    description: '需要工作人员协助'
  }
];

export const mockQueueInfo: QueueInfo = {
  id: 'Q001',
  stationName: '京东物流港充电站',
  stationId: 'S001',
  queueNumber: 38,
  aheadCount: 5,
  estimatedWaitTime: 45,
  status: 'waiting',
  processStatus: 'queuing',
  joinTime: '2024-01-15 14:30:00',
  estimatedCallTime: '2024-01-15 15:15:00',
  chargingPreference: { type: 'fast', label: '快充优先' },
  currentCalledNumber: 33,
  totalInQueue: 42
};

export const mockNotInQueue: QueueInfo = {
  id: '',
  stationName: '',
  stationId: '',
  queueNumber: 0,
  aheadCount: 0,
  estimatedWaitTime: 0,
  status: 'notInQueue',
  processStatus: 'notInQueue',
  joinTime: '',
  estimatedCallTime: '',
  chargingPreference: { type: 'normal', label: '普通安排' },
  currentCalledNumber: 0,
  totalInQueue: 0,
  chargingInfo: null
};

export const mockFleetMembers: FleetMember[] = [
  {
    id: '1',
    driverName: '张师傅',
    plateNumber: '京A·D88235',
    queueNumber: 35,
    status: 'waiting',
    memberStatus: 'accepted',
    joinTime: new Date(Date.now() - 3600000).toISOString(),
    fleetCode: '88235'
  },
  {
    id: '2',
    driverName: '李师傅',
    plateNumber: '京A·D78921',
    queueNumber: 42,
    status: 'waiting',
    memberStatus: 'accepted',
    joinTime: new Date(Date.now() - 7200000).toISOString(),
    fleetCode: '88235'
  },
  {
    id: '3',
    driverName: '王师傅',
    plateNumber: '京A·D56789',
    queueNumber: 31,
    status: 'calling',
    memberStatus: 'accepted',
    joinTime: new Date(Date.now() - 1800000).toISOString(),
    fleetCode: '88235'
  },
  {
    id: '4',
    driverName: '赵师傅',
    plateNumber: '京A·D12345',
    queueNumber: 28,
    status: 'completed',
    memberStatus: 'accepted',
    joinTime: new Date(Date.now() - 10800000).toISOString(),
    fleetCode: '88235'
  }
];

export const quickActions: QuickAction[] = [
  { id: '1', label: '扫码入队', icon: '📷', page: '/pages/scan/index', color: '#1e88e5' },
  { id: '2', label: '补电偏好', icon: '⚡', page: '/pages/queue/index', color: '#ff9800' },
  { id: '3', label: '车队共享', icon: '👥', page: '/pages/fleet/index', color: '#4caf50' },
  { id: '4', label: '催办反馈', icon: '⏰', page: '/pages/feedback/index', color: '#f44336' }
];

export const notificationList = [
  { id: '1', content: '温馨提示：当前排队5人，预计等待45分钟' },
  { id: '2', content: '36号车请前往A区3号充电位' },
  { id: '3', content: '今日充电站优惠：快充满2小时减10元' }
];
