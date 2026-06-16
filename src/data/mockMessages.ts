import { Message } from '@/types';

export const mockMessages: Message[] = [
  {
    id: '1',
    type: 'reminder',
    title: '即将叫号提醒',
    content: '您好，您前面还有3台车，预计15分钟后叫号，请做好准备。',
    time: '2024-01-15 15:00:00',
    read: false,
    queueNumber: 38,
    pageUrl: '/pages/queue/index'
  },
  {
    id: '2',
    type: 'calling',
    title: '正式叫号',
    content: '38号车请前往B区充电区，5分钟内未到将过号。',
    time: '2024-01-15 15:12:00',
    read: false,
    queueNumber: 38,
    pageUrl: '/pages/queue/index'
  },
  {
    id: '3',
    type: 'system',
    title: '系统通知',
    content: '今日充电站A区检修，所有车辆请前往B、C区充电。',
    time: '2024-01-15 10:30:00',
    read: true,
    pageUrl: '/pages/queue/index'
  },
  {
    id: '4',
    type: 'reroute',
    title: '改道通知',
    content: '因B区设备维护，38号车请改到C区7号充电位。',
    time: '2024-01-15 14:20:00',
    read: true,
    queueNumber: 38,
    pageUrl: '/pages/navigation/index'
  },
  {
    id: '5',
    type: 'overdue',
    title: '过号提醒',
    content: '您的同事35号车已过号，请提醒他尽快联系工作人员。',
    time: '2024-01-15 13:45:00',
    read: true,
    queueNumber: 35,
    pageUrl: '/pages/queue/index'
  },
  {
    id: '6',
    type: 'system',
    title: '服务评价邀请',
    content: '您上次的充电服务已完成，欢迎对我们的服务进行评价。',
    time: '2024-01-14 18:30:00',
    read: true,
    pageUrl: '/pages/rating/index'
  },
  {
    id: '7',
    type: 'reminder',
    title: '休息区开放',
    content: '司机休息区24小时开放，提供热水和WiFi，欢迎前往休息。',
    time: '2024-01-15 08:00:00',
    read: true,
    pageUrl: '/pages/navigation/index'
  },
  {
    id: '8',
    type: 'system',
    title: '天气提醒',
    content: '今晚有雨，请注意行车安全，充电站提供免费雨具。',
    time: '2024-01-15 16:00:00',
    read: false,
    pageUrl: '/pages/home/index'
  }
];
