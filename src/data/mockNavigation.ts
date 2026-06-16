import { StationMapPoint } from '@/types';

export const stationInfo = {
  name: '京东物流港充电站',
  address: '北京市通州区京东物流园A区',
  totalChargingPorts: 48,
  availablePorts: 12,
  restArea: '24小时开放，提供热水、WiFi、休息室',
  toilet: '位于A区入口处和B区中部',
  weighStation: '出口处地磅，24小时服务'
};

export const mockMapPoints: StationMapPoint[] = [
  { id: 'c1', type: 'charging', name: 'A区1号快充', x: 150, y: 200, status: 'available', description: '120kW快充桩' },
  { id: 'c2', type: 'charging', name: 'A区2号快充', x: 200, y: 200, status: 'occupied', description: '120kW快充桩' },
  { id: 'c3', type: 'charging', name: 'A区3号快充', x: 250, y: 200, status: 'available', description: '120kW快充桩' },
  { id: 'c4', type: 'charging', name: 'B区1号快充', x: 150, y: 350, status: 'available', description: '180kW超充桩' },
  { id: 'c5', type: 'charging', name: 'B区2号快充', x: 200, y: 350, status: 'available', description: '180kW超充桩' },
  { id: 'c6', type: 'charging', name: 'B区3号快充', x: 250, y: 350, status: 'occupied', description: '180kW超充桩' },
  { id: 'c7', type: 'charging', name: 'C区1号普通', x: 400, y: 200, status: 'available', description: '60kW普通桩' },
  { id: 'c8', type: 'charging', name: 'C区2号普通', x: 450, y: 200, status: 'occupied', description: '60kW普通桩' },
  { id: 'r1', type: 'rest', name: '司机休息区', x: 550, y: 150, status: 'available', description: '24小时开放，热水、WiFi' },
  { id: 'r2', type: 'rest', name: '便利店', x: 580, y: 180, status: 'available', description: '食品、日用品' },
  { id: 't1', type: 'toilet', name: 'A区洗手间', x: 100, y: 150, status: 'available', description: '公共卫生间' },
  { id: 't2', type: 'toilet', name: 'B区洗手间', x: 100, y: 400, status: 'available', description: '公共卫生间' },
  { id: 'w1', type: 'weigh', name: '入口地磅', x: 80, y: 280, status: 'available', description: '称重量方' },
  { id: 'w2', type: 'weigh', name: '出口地磅', x: 600, y: 400, status: 'available', description: '称重量方' }
];

export const pointTypeConfig = {
  charging: { label: '充电区', color: '#1e88e5', icon: '⚡' },
  rest: { label: '休息区', color: '#4caf50', icon: '☕' },
  toilet: { label: '洗手间', color: '#ff9800', icon: '🚻' },
  weigh: { label: '称重点', color: '#9c27b0', icon: '⚖️' }
};
