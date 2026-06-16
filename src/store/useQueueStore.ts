import { create } from 'zustand';
import { QueueInfo, ChargingPreference, Message, Vehicle } from '@/types';
import { mockQueueInfo, mockNotInQueue } from '@/data/mockQueue';
import { mockMessages } from '@/data/mockMessages';
import { mockVehicles } from '@/data/mockVehicles';

interface QueueState {
  queueInfo: QueueInfo;
  messages: Message[];
  vehicles: Vehicle[];
  currentVehicle: Vehicle | null;
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
}

export const useQueueStore = create<QueueState>((set, get) => ({
  queueInfo: mockQueueInfo,
  messages: mockMessages,
  vehicles: mockVehicles,
  currentVehicle: mockVehicles[0],

  setQueueInfo: (info) => set({ queueInfo: info }),

  updatePreference: (pref) => set((state) => ({
    queueInfo: { ...state.queueInfo, chargingPreference: pref }
  })),

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
  }
}));
