export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/queue/index',
    'pages/navigation/index',
    'pages/messages/index',
    'pages/profile/index',
    'pages/scan/index',
    'pages/rating/index',
    'pages/feedback/index',
    'pages/fleet/index',
    'pages/vehicle-edit/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1e88e5',
    navigationBarTitleText: '重卡排队助手',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f5f7fa'
  },
  tabBar: {
    color: '#8e8e93',
    selectedColor: '#1e88e5',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/queue/index',
        text: '排队详情'
      },
      {
        pagePath: 'pages/navigation/index',
        text: '进站导航'
      },
      {
        pagePath: 'pages/messages/index',
        text: '消息中心'
      },
      {
        pagePath: 'pages/profile/index',
        text: '个人车辆'
      }
    ]
  }
})
