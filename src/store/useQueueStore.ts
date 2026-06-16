import { create } from 'zustand';
import { QueueInfo, ChargingPreference, Message, Vehicle, Station, FleetMember, ActionReport } from '@/types';
import { mockQueueInfo, mockNotInQueue, mockFleetMembers } from '@/data/mockQueue';
import { mockMessages } from '@/data/mockMessages';
import { mockVehicles } from '@/data/mockVehicles';

interface QueueState {
  queueInfo: QueueInfo;
  messages: Message[];
  vehicles: Vehicle[];
  currentVehicle: Vehicle | null;
  fleetMembers: FleetMember[];
  fleetCode: string;
  stations: Station[];
  setQueueInfo: (info: QueueInfo) => void;
  updatePreference: (pref: ChargingPreference) => void;
  joinQueue: (stationId: string, stationName: string) => void;
  leaveQueue: () => void;
  markMessageRead: (id: string) => void;
  markAllMessagesRead: () => void;
  addMessage: (msg: Message) => void;
  setCurrentVehicle: (vehicle: Vehicle) => void;
  getUnreadCount: () => number;
  simulateQueueUpdate: () => void;
  validateStationCode: (code: string) => { success: boolean; station?: Station; message: string };
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  reportAction: (type: 'arrived' | 'leave' | 'reverse', label: string) => void;
  clearActionReport: () => void;
  addFleetMember: (code: string) => { success: boolean; message: string; member?: FleetMember };
  inviteFleetMember: () => string;
  updateFleetMemberStatus: (id: string, status: 'pending' | 'accepted' | 'rejected') => void;
}

export const useQueueStore = create<QueueState>((set, get) => ({
  queueInfo: { ...mockQueueInfo, currentAction: null },
  messages: mockMessages,
  vehicles: mockVehicles,
  currentVehicle: mockVehicles[0],
  fleetMembers: mockFleetMembers.map(m => ({
    ...m,
    memberStatus: 'accepted' as const,
    joinTime: new Date().toISOString()
  })),
  fleetCode: '88235',
  stations: [
    { id: 'S001', name: '京东物流港充电站', address: '北京市朝阳区京东大道1号', phone: '400-123-4567', totalChargingPorts: 20, availablePorts: 8 },
    { id: 'S002', name: '顺丰速运顺义场站', address: '北京市顺义区顺丰路88号', phone: '400-987-6543', totalChargingPorts: 15, availablePorts: 3 },
    { id: 'S003', name: '中通快递通州枢纽站', address: '北京市通州区中通路66号', phone: '400-111-2222', totalChargingPorts: 25, availablePorts: 12 }
  ],

  setQueueInfo: (info) => set({ queueInfo: info }),

  updatePreference: (pref) => set((state) => ({
    queueInfo: { ...state.queueInfo, chargingPreference: pref }
  }),

  joinQueue: (stationId, stationName) => {
    const newQueueNumber = Math.floor(Math.random() * 50) + 30;
    const newQueueInfo: QueueInfo = {
      id: `Q${Date.now()}`,
      stationId,
      stationName,
      queueNumber: newQueueNumber,
      aheadCount: Math.floor(Math.random() * 10) + 3,
      estimatedWaitTime: Math.floor(Math.random() * 60) + 20,
      status: 'waiting',
      joinTime: new Date().toISOString(),
      estimatedCallTime: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
      chargingPreference: { type: 'normal', label: '普通安排' },
      currentCalledNumber: newQueueNumber - 5,
      totalInQueue: newQueueNumber + 10
    };
    console.log('[QueueStore] joinQueue:', newQueueInfo);
    set({ queueInfo: newQueueInfo });
  },

  leaveQueue: () => {
    console.log('[QueueStore] leaveQueue');
    set({ queueInfo: mockNotInQueue });
  },

  markMessageRead: (id) => set((state) => ({
    messages: state.messages.map(m =>
      m.id === id ? { ...m, read: true } : m
    )
  })),

  markAllMessagesRead: () => set((state) => ({
    messages: state.messages.map(m => ({ ...m, read: true }))
  })),

  addMessage: (msg) => set((state) => ({
    messages: [msg, ...state.messages]
  })),

  setCurrentVehicle: (vehicle) => set({ currentVehicle: vehicle }),

  getUnreadCount: () => {
    return get().messages.filter(m => !m.read).length;
  },

  simulateQueueUpdate: () => {
    const state = get();
    if (state.queueInfo.status === 'waiting' && state.queueInfo.aheadCount > 0) {
      const newAheadCount = state.queueInfo.aheadCount - 1;
      const newCalledNumber = state.queueInfo.currentCalledNumber + 1;
      const newStatus = newAheadCount === 0 ? 'calling' : 'waiting';
      const newEstimatedTime = newAheadCount * 8;

      console.log('[QueueStore] simulateQueueUpdate:', {
        aheadCount: newAheadCount,
        status: newStatus,
        estimatedWaitTime: newEstimatedTime
      });

      set({
        queueInfo: {
          ...state.queueInfo,
          aheadCount: newAheadCount,
          currentCalledNumber: newCalledNumber,
          estimatedWaitTime: newEstimatedTime,
          status: newStatus
        }
      });

      if (newAheadCount === 2) {
        const reminderMsg: Message = {
          id: `msg-${Date.now()}`,
          type: 'reminder',
          title: '即将叫号提醒',
          content: `您好，您前面还有2台车，预计15分钟后叫号，请做好准备。`,
          time: new Date().toLocaleString(),
          read: false,
          queueNumber: state.queueInfo.queueNumber
        };
        get().addMessage(reminderMsg);
      }

      if (newStatus === 'calling') {
        const callingMsg: Message = {
          id: `msg-${Date.now()}`,
          type: 'calling',
          title: '正式叫号',
          content: `${state.queueInfo.queueNumber}号车请前往B区充电区，5分钟内未到将过号。`,
          time: new Date().toLocaleString(),
          read: false,
          queueNumber: state.queueInfo.queueNumber
        };
        get().addMessage(callingMsg);
      }
    }
  },

  validateStationCode: (code) => {
    console.log('[QueueStore] validateStationCode:', code);
    const stationPattern = /^STATION-(S00[1-3])$/;
    const match = code.match(stationPattern);
    
    if (!code || code.trim() === '') {
      return { success: false, message: '二维码内容为空，请重新扫描' };
    }
    
    if (!match) {
      if (code.length < 5) {
        return { success: false, message: '二维码不完整，请确保扫描完整的场站二维码' };
      }
      if (code.startsWith('HTTP') || code.startsWith('http')) {
        return { success: false, message: '这是普通网页链接，不是场站入队二维码' };
      }
      if (code.startsWith('WECHAT') || code.startsWith('wechat')) {
        return { success: false, message: '这是微信小程序码，不是场站入队二维码' };
      }
      return { success: false, message: '无效的场站码，请扫描正确的场站入口二维码' };
    }
    
    const stationId = match[1];
    const station = get().stations.find(s => s.id === stationId);
    
    if (!station) {
      return { success: false, message: '该场站不存在或已停止服务，请联系客服' };
    }
    
    return { success: true, station, message: `已识别：${station.name}` };
  },

  addVehicle: (vehicle) => {
    console.log('[QueueStore] addVehicle:', vehicle);
    const newVehicle: Vehicle = {
      ...vehicle,
      id: `V${Date.now()}`
    };
    
    set((state) => {
      let updatedVehicles = [...state.vehicles, newVehicle];
      let newCurrentVehicle = state.currentVehicle;
      
      if (vehicle.isDefault) {
        updatedVehicles = updatedVehicles.map(v => ({
          ...v,
          isDefault: v.id === newVehicle.id
        }));
        newCurrentVehicle = newVehicle;
      }
      
      return {
        vehicles: updatedVehicles,
        currentVehicle: newCurrentVehicle
      };
    });
  },

  updateVehicle: (id, updates) => {
    console.log('[QueueStore] updateVehicle:', id, updates);
    set((state) => {
      let updatedVehicles = state.vehicles.map(v =>
        v.id === id ? { ...v, ...updates } : v
      );
      let newCurrentVehicle = state.currentVehicle;
      
      if (updates.isDefault) {
        updatedVehicles = updatedVehicles.map(v => ({
          ...v,
          isDefault: v.id === id
        }));
        const vehicle = updatedVehicles.find(v => v.id === id);
        if (vehicle) {
          newCurrentVehicle = vehicle;
        }
      } else if (state.currentVehicle?.id === id && updates.isDefault === false) {
        const defaultVehicle = updatedVehicles.find(v => v.isDefault) || updatedVehicles[0];
        newCurrentVehicle = defaultVehicle || null;
      }
      
      return {
        vehicles: updatedVehicles,
        currentVehicle: newCurrentVehicle
      };
    });
  },

  deleteVehicle: (id) => {
    console.log('[QueueStore] deleteVehicle:', id);
    set((state) => {
      const updatedVehicles = state.vehicles.filter(v => v.id !== id);
      let newCurrentVehicle = state.currentVehicle;
      
      if (state.currentVehicle?.id === id) {
        newCurrentVehicle = updatedVehicles.find(v => v.isDefault) || updatedVehicles[0] || null;
      }
      
      return {
        vehicles: updatedVehicles,
        currentVehicle: newCurrentVehicle
      };
    });
  },

  reportAction: (type, label) => {
    console.log('[QueueStore] reportAction:', type, label);
    const actionReport: ActionReport = {
      type,
      label,
      reportTime: new Date().toISOString(),
      status: 'pending'
    };
    
    set((state) => ({
      queueInfo: {
        ...state.queueInfo,
        currentAction: actionReport
      }
    }));
    
    setTimeout(() => {
      set((state) => ({
        queueInfo: {
          ...state.queueInfo,
          currentAction: state.queueInfo.currentAction
            ? { ...state.queueInfo.currentAction, status: 'confirmed' }
            : null
        }
      }));
    }, 3000);
  },

  clearActionReport: () => {
    console.log('[QueueStore] clearActionReport');
    set((state) => ({
      queueInfo: {
        ...state.queueInfo,
        currentAction: null
      }
    }));
  },

  addFleetMember: (code) => {
    console.log('[QueueStore] addFleetMember:', code);
    
    if (!code || code.trim().length < 4) {
      return { success: false, message: '请输入有效的车队码（至少4位）' };
    }
    
    const existingCodes = ['88235', '12345', '67890', '11111', '22222'];
    if (!existingCodes.includes(code.trim())) {
      return { success: false, message: '车队码不存在或已过期，请确认后重试' };
    }
    
    if (code.trim() === get().fleetCode) {
      return { success: false, message: '这是您自己的车队码，无法加入自己的车队' };
    }
    
    const randomNames = ['刘师傅', '陈师傅', '周师傅', '吴师傅', '郑师傅', '孙师傅'];
    const randomPlates = ['京B·F12345', '京B·F67890', '京B·F54321', '京B·F09876'];
    
    const newMember: FleetMember = {
      id: `FM${Date.now()}`,
      driverName: randomNames[Math.floor(Math.random() * randomNames.length)],
      plateNumber: randomPlates[Math.floor(Math.random() * randomPlates.length)],
      queueNumber: Math.floor(Math.random() * 30) + 20,
      status: 'waiting',
      memberStatus: 'pending',
      joinTime: new Date().toISOString(),
      fleetCode: code.trim()
    };
    
    set((state) => ({
      fleetMembers: [...state.fleetMembers, newMember]
    }));
    
    setTimeout(() => {
      set((state) => ({
        fleetMembers: state.fleetMembers.map(m =>
          m.id === newMember.id ? { ...m, memberStatus: 'accepted' as const } : m
        )
      }));
    }, 5000);
    
    return { success: true, message: '已发送加入请求，等待队长确认', member: newMember };
  },

  inviteFleetMember: () => {
    const code = get().fleetCode;
    console.log('[QueueStore] inviteFleetMember:', code);
    return code;
  },

  updateFleetMemberStatus: (id, status) => {
    console.log('[QueueStore] updateFleetMemberStatus:', id, status);
    set((state) => ({
      fleetMembers: state.fleetMembers.map(m =>
        m.id === id ? { ...m, memberStatus: status } : m
      )
    }));
  }
}));
