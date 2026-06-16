export type QueueProcessStatus = 'queuing' | 'calling' | 'arrived' | 'charging' | 'completed' | 'notInQueue';

export interface QueueInfo {
  id: string;
  stationName: string;
  stationId: string;
  queueNumber: number;
  aheadCount: number;
  estimatedWaitTime: number;
  status: 'waiting' | 'calling' | 'overdue' | 'completed' | 'notInQueue';
  processStatus: QueueProcessStatus;
  joinTime: string;
  estimatedCallTime: string;
  chargingPreference: ChargingPreference;
  currentCalledNumber: number;
  totalInQueue: number;
  currentAction?: ActionReport | null;
  arriveTime?: string;
  chargingStartTime?: string;
  completeTime?: string;
}

export interface Station {
  id: string;
  name: string;
  address: string;
  phone: string;
  totalChargingPorts: number;
  availablePorts: number;
}

export interface ActionReport {
  type: 'arrived' | 'leave' | 'reverse';
  label: string;
  reportTime: string;
  status: 'pending' | 'confirmed' | 'completed';
}

export interface ChargingPreference {
  type: 'fast' | 'exit' | 'quiet' | 'normal';
  label: string;
}

export interface OneClickAction {
  id: string;
  type: 'arrived' | 'leave' | 'reverse';
  label: string;
  icon: string;
  description: string;
}

export interface FleetMember {
  id: string;
  driverName: string;
  plateNumber: string;
  queueNumber: number;
  status: 'waiting' | 'calling' | 'completed';
  memberStatus: 'pending' | 'accepted' | 'rejected';
  joinTime: string;
  fleetCode?: string;
}

export interface Message {
  id: string;
  type: 'calling' | 'reminder' | 'overdue' | 'reroute' | 'system' | 'fleet';
  title: string;
  content: string;
  time: string;
  read: boolean;
  queueNumber?: number;
  pageUrl?: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  vehicleType: string;
  weight: string;
  length: string;
  isDefault: boolean;
}

export interface HistoryRecord {
  id: string;
  stationName: string;
  enterTime: string;
  exitTime: string;
  queueNumber: number;
  waitTime: number;
  chargingType: string;
}

export interface StationMapPoint {
  id: string;
  type: 'charging' | 'rest' | 'toilet' | 'weigh';
  name: string;
  x: number;
  y: number;
  status: 'available' | 'occupied';
  description: string;
}

export interface RatingOption {
  id: string;
  label: string;
  value: number;
}

export interface FeedbackOption {
  id: string;
  label: string;
  value: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  page: string;
  color: string;
}
