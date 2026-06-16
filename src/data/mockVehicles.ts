import { Vehicle, HistoryRecord } from '@/types';

export const mockVehicles: Vehicle[] = [
  {
    id: '1',
    plateNumber: '京A·D88235',
    vehicleType: '重型半挂牵引车',
    weight: '49吨',
    length: '17.5米',
    isDefault: true
  },
  {
    id: '2',
    plateNumber: '京A·D78921',
    vehicleType: '重型厢式货车',
    weight: '25吨',
    length: '9.6米',
    isDefault: false
  },
  {
    id: '3',
    plateNumber: '京A·D56789',
    vehicleType: '重型冷藏车',
    weight: '32吨',
    length: '12米',
    isDefault: false
  }
];

export const mockHistoryRecords: HistoryRecord[] = [
  {
    id: '1',
    stationName: '京东物流港充电站',
    enterTime: '2024-01-14 14:30:00',
    exitTime: '2024-01-14 16:45:00',
    queueNumber: 25,
    waitTime: 35,
    chargingType: '快充'
  },
  {
    id: '2',
    stationName: '顺丰华北枢纽充电站',
    enterTime: '2024-01-12 09:15:00',
    exitTime: '2024-01-12 11:30:00',
    queueNumber: 18,
    waitTime: 20,
    chargingType: '快充'
  },
  {
    id: '3',
    stationName: '京东物流港充电站',
    enterTime: '2024-01-10 18:00:00',
    exitTime: '2024-01-10 20:30:00',
    queueNumber: 42,
    waitTime: 60,
    chargingType: '普通'
  },
  {
    id: '4',
    stationName: '德邦物流园充电站',
    enterTime: '2024-01-08 11:30:00',
    exitTime: '2024-01-08 13:15:00',
    queueNumber: 12,
    waitTime: 15,
    chargingType: '快充'
  },
  {
    id: '5',
    stationName: '中通快递转运中心',
    enterTime: '2024-01-05 22:00:00',
    exitTime: '2024-01-06 00:30:00',
    queueNumber: 8,
    waitTime: 10,
    chargingType: '普通'
  }
];

export const ratingOptions = [
  { id: '1', label: '服务态度', value: 5 },
  { id: '2', label: '排队秩序', value: 4 },
  { id: '3', label: '引导准确度', value: 5 }
];

export const feedbackOptions = [
  { id: '1', label: '排队时间过长', value: 'long_wait' },
  { id: '2', label: '叫号不及时', value: 'no_call' },
  { id: '3', label: '设备故障', value: 'equipment' },
  { id: '4', label: '服务态度差', value: 'service' },
  { id: '5', label: '其他问题', value: 'other' }
];
