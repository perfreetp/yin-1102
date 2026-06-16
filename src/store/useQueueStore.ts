import { create } from 'zustand';
import { QueueInfo, ChargingPreference, Message, Vehicle, Station, FleetMember, ActionReport, QueueProcessStatus, HistoryRecord } from '@/types';
import { mockQueueInfo, mockNotInQueue, mockFleetMembers } from '@/data/mockQueue';
import { mockMessages } from '@/data/mockMessages';
import { mockVehicles, mockHistoryRecords } from '@/data/mockVehicles';

interface QueueState {
  queueInfo: QueueInfo;
  messages: Message[];
  vehicles: Vehicle[];
  currentVehicle: Vehicle | null;
  fleetMembers: FleetMember[];
  fleetCode: string;
  stations: Station[];
  historyRecords: HistoryRecord[];
  setQueueInfo: (info: QueueInfo) => void;
  updatePreference: (pref: ChargingPreference) => void;
  joinQueue: (stationId: string, stationName: string) => void;
  leaveQueue: () => void;
  markMessageRead: (id: string) => void;
  markAllMessagesRead: () => void;
  addMessage: (msg: Message) => void;
  setCurrentVehicle: (vehicle: Vehicle) => void;
  setDefaultVehicle: (vehicleId: string) => void;
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
  updateProcessStatus: (status: QueueProcessStatus) => void;
  simulateChargingProgress: () => void;
  markOverdue: () => void;
  recoverFromOverdue: () => void;
  completeAndSave: () => void;
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
  historyRecords: mockHistoryRecords.map(r => ({ ...r, vehicleId: '1', vehiclePlateNumber: '京A·D88235' })),
  stations: [
    { id: 'S001', name: '京东物流港充电站', address: '北京市朝阳区京东大道1号', phone: '400-123-4567', totalChargingPorts: 20, availablePorts: 8 },
    { id: 'S002', name: '顺丰速运顺义场站', address: '北京市顺义区顺丰路88号', phone: '400-987-6543', totalChargingPorts: 15, availablePorts: 3 },
    { id: 'S003', name: '中通快递通州枢纽站', address: '北京市通州区中通路66号', phone: '400-111-2222', totalChargingPorts: 25, availablePorts: 12 }
  ],

  setQueueInfo: (info) => set({ queueInfo: info }),

  updatePreference: (pref) => set((state) => ({
    queueInfo: { ...state.queueInfo, chargingPreference: pref }
  })),

  joinQueue: (stationId, stationName) => {
    const newQueueNumber = Math.floor(Math.random() * 50) + 30;
    const cv = get().currentVehicle;
    const newQueueInfo: QueueInfo = {
      id: `Q${Date.now()}`,
      stationId,
      stationName,
      queueNumber: newQueueNumber,
      aheadCount: Math.floor(Math.random() * 10) + 3,
      estimatedWaitTime: Math.floor(Math.random() * 60) + 20,
      status: 'waiting',
      processStatus: 'queuing',
      joinTime: new Date().toISOString(),
      estimatedCallTime: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
      chargingPreference: { type: 'normal', label: '普通安排' },
      currentCalledNumber: newQueueNumber - 5,
      totalInQueue: newQueueNumber + 10,
      vehicleId: cv?.id,
      vehiclePlateNumber: cv?.plateNumber
    };
    console.log('[QueueStore] joinQueue:', newQueueInfo);
    set({ queueInfo: newQueueInfo });

    const joinMsg: Message = {
      id: `msg-${Date.now()}`,
      type: 'system',
      title: '入队成功',
      content: `您已成功加入${stationName}，排队号：${newQueueNumber}号，前方有${newQueueNumber - newQueueInfo.currentCalledNumber}台车。`,
      time: new Date().toISOString(),
      read: false,
      queueNumber: newQueueNumber,
      pageUrl: '/pages/queue/index'
    };
    get().addMessage(joinMsg);
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

  setDefaultVehicle: (vehicleId) => {
    console.log('[QueueStore] setDefaultVehicle:', vehicleId);
    set((state) => {
      const updatedVehicles = state.vehicles.map(v => ({
        ...v,
        isDefault: v.id === vehicleId
      }));
      const newDefault = updatedVehicles.find(v => v.id === vehicleId);
      return {
        vehicles: updatedVehicles,
        currentVehicle: newDefault || state.currentVehicle
      };
    });
  },

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
      const newProcessStatus = newAheadCount === 0 ? 'calling' : state.queueInfo.processStatus;

      console.log('[QueueStore] simulateQueueUpdate:', {
        aheadCount: newAheadCount,
        status: newStatus,
        processStatus: newProcessStatus,
        estimatedWaitTime: newEstimatedTime
      });

      set({
        queueInfo: {
          ...state.queueInfo,
          aheadCount: newAheadCount,
          currentCalledNumber: newCalledNumber,
          estimatedWaitTime: newEstimatedTime,
          status: newStatus,
          processStatus: newProcessStatus
        }
      });

      if (newAheadCount === 2) {
        const reminderMsg: Message = {
          id: `msg-${Date.now()}`,
          type: 'reminder',
          title: '即将叫号提醒',
          content: `您好，您前面还有2台车，预计15分钟后叫号，请做好准备。`,
          time: new Date().toISOString(),
          read: false,
          queueNumber: state.queueInfo.queueNumber,
          pageUrl: '/pages/queue/index'
        };
        get().addMessage(reminderMsg);
      }

      if (newStatus === 'calling') {
        const callingMsg: Message = {
          id: `msg-${Date.now()}`,
          type: 'calling',
          title: '正式叫号',
          content: `${state.queueInfo.queueNumber}号车请前往B区充电区，5分钟内未到将过号。`,
          time: new Date().toISOString(),
          read: false,
          queueNumber: state.queueInfo.queueNumber,
          pageUrl: '/pages/queue/index'
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

    if (type === 'arrived') {
      get().updateProcessStatus('arrived');
    }

    setTimeout(() => {
      set((state) => ({
        queueInfo: {
          ...state.queueInfo,
          currentAction: state.queueInfo.currentAction
            ? { ...state.queueInfo.currentAction, status: 'confirmed' }
            : null
        }
      }));

      const actionMessages: Record<string, { title: string; content: string }> = {
        arrived: {
          title: '场站已确认',
          content: `您的"已到门口"上报已确认，请在场站入口等待工作人员引导。`
        },
        leave: {
          title: '场站已确认',
          content: `您的"临时离开"上报已确认，将为您保留位置5分钟，请尽快返回。`
        },
        reverse: {
          title: '场站已响应',
          content: `您的"协助倒车"请求已收到，工作人员正在赶来，请在原地等待。`
        }
      };

      const msg = actionMessages[type];
      if (msg) {
        const reportMsg: Message = {
          id: `msg-${Date.now()}`,
          type: 'system',
          title: msg.title,
          content: msg.content,
          time: new Date().toISOString(),
          read: false,
          pageUrl: '/pages/queue/index'
        };
        get().addMessage(reportMsg);
      }
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

      const fleetMsg: Message = {
        id: `msg-${Date.now()}`,
        type: 'fleet',
        title: '队友加入成功',
        content: `${newMember.driverName}（${newMember.plateNumber}）已加入您的车队，当前排队${newMember.queueNumber}号。`,
        time: new Date().toISOString(),
        read: false,
        pageUrl: '/pages/fleet/index'
      };
      get().addMessage(fleetMsg);
    }, 5000);
    
    const pendingMsg: Message = {
      id: `msg-${Date.now()}`,
      type: 'fleet',
      title: '车队邀请已发送',
      content: `已向车队码${code}发送加入请求，等待队长确认中。`,
      time: new Date().toISOString(),
      read: false,
      pageUrl: '/pages/fleet/index'
    };
    get().addMessage(pendingMsg);
    
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
  },

  updateProcessStatus: (status) => {
    console.log('[QueueStore] updateProcessStatus:', status);
    set((state) => {
      const updates: Partial<QueueInfo> = { processStatus: status };
      const now = new Date().toISOString();

      if (status === 'arrived') {
        updates.arriveTime = now;
      } else if (status === 'charging') {
        updates.chargingStartTime = now;
        const pileNames = ['B区4号快充桩', 'A区1号超充桩', 'C区2号普通桩', 'B区5号快充桩'];
        const startBattery = Math.floor(Math.random() * 15) + 5;
        updates.chargingInfo = {
          currentBattery: startBattery,
          targetBattery: 90,
          chargingPower: 120,
          estimatedFullTime: '',
          chargingDuration: 0,
          estimatedCost: 0,
          chargingPileName: pileNames[Math.floor(Math.random() * pileNames.length)]
        };
      } else if (status === 'completed') {
        updates.completeTime = now;
        updates.status = 'completed';
        if (state.queueInfo.chargingInfo) {
          updates.chargingInfo = {
            ...state.queueInfo.chargingInfo,
            currentBattery: state.queueInfo.chargingInfo.targetBattery,
            chargingDuration: state.queueInfo.chargingInfo.chargingDuration
          };
        }
      } else if (status === 'overdue') {
        updates.status = 'overdue';
      }

      return {
        queueInfo: {
          ...state.queueInfo,
          ...updates
        }
      };
    });
  },

  simulateChargingProgress: () => {
    const state = get();
    if (state.queueInfo.processStatus !== 'charging' || !state.queueInfo.chargingInfo) return;

    const info = state.queueInfo.chargingInfo;
    const increment = Math.floor(Math.random() * 5) + 3;
    const newBattery = Math.min(info.currentBattery + increment, info.targetBattery);
    const newDuration = info.chargingDuration + 5;
    const remainPct = info.targetBattery - newBattery;
    const remainMin = Math.max(0, Math.round(remainPct / 2.5));
    const costPerKwh = 1.2;
    const assumedCapacity = 300;
    const estimatedCost = Math.round(newBattery / 100 * assumedCapacity * costPerKwh * 10) / 10;

    set({
      queueInfo: {
        ...state.queueInfo,
        chargingInfo: {
          ...info,
          currentBattery: newBattery,
          chargingDuration: newDuration,
          estimatedFullTime: remainMin > 0 ? `约${remainMin}分钟` : '已充满',
          estimatedCost
        }
      }
    });
  },

  markOverdue: () => {
    console.log('[QueueStore] markOverdue');
    set((state) => ({
      queueInfo: {
        ...state.queueInfo,
        status: 'overdue',
        processStatus: 'overdue'
      }
    }));

    const overdueMsg: Message = {
      id: `msg-${Date.now()}`,
      type: 'overdue',
      title: '您已过号',
      content: `您的${get().queueInfo.queueNumber}号已过号，5分钟内未到场站。您可尝试恢复排队或重新扫码入队。`,
      time: new Date().toISOString(),
      read: false,
      queueNumber: get().queueInfo.queueNumber,
      pageUrl: '/pages/queue/index'
    };
    get().addMessage(overdueMsg);
  },

  recoverFromOverdue: () => {
    console.log('[QueueStore] recoverFromOverdue');
    set((state) => ({
      queueInfo: {
        ...state.queueInfo,
        status: 'waiting',
        processStatus: 'queuing',
        aheadCount: Math.floor(Math.random() * 5) + 3
      }
    }));

    const recoverMsg: Message = {
      id: `msg-${Date.now()}`,
      type: 'system',
      title: '已恢复排队',
      content: `您的排队已恢复，请留意叫号通知，这次请及时到场。`,
      time: new Date().toISOString(),
      read: false,
      pageUrl: '/pages/queue/index'
    };
    get().addMessage(recoverMsg);
  },

  completeAndSave: () => {
    const state = get();
    const q = state.queueInfo;
    const ci = q.chargingInfo;

    const record: HistoryRecord = {
      id: `H${Date.now()}`,
      stationName: q.stationName,
      stationId: q.stationId,
      enterTime: q.joinTime,
      exitTime: new Date().toISOString(),
      queueNumber: q.queueNumber,
      waitTime: q.arriveTime
        ? Math.round((new Date(q.arriveTime).getTime() - new Date(q.joinTime).getTime()) / 60000)
        : q.estimatedWaitTime,
      chargingType: q.chargingPreference.label,
      vehicleId: q.vehicleId,
      vehiclePlateNumber: q.vehiclePlateNumber,
      chargingDuration: ci?.chargingDuration,
      chargingCost: ci?.estimatedCost,
      startBattery: 8,
      endBattery: ci?.currentBattery ?? 90,
      chargingPileName: ci?.chargingPileName
    };

    console.log('[QueueStore] completeAndSave, record:', record);

    set((state) => ({
      historyRecords: [record, ...state.historyRecords],
      queueInfo: mockNotInQueue
    }));

    const completeMsg: Message = {
      id: `msg-${Date.now()}`,
      type: 'system',
      title: '充电完成，已保存记录',
      content: `${q.stationName}充电完成，已充至${ci?.currentBattery ?? 90}%，费用约${ci?.estimatedCost ?? 0}元。记录已保存至历史。`,
      time: new Date().toISOString(),
      read: false,
      pageUrl: '/pages/profile/index'
    };
    get().addMessage(completeMsg);
  }
}));
