const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');
const PORT = process.env.PORT || 10012;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function sendResponse(res, statusCode, data, contentType = 'text/html; charset=utf-8') {
  res.writeHead(statusCode, { 'Content-Type': contentType });
  res.end(data);
}

function sendJSON(res, statusCode, data) {
  sendResponse(res, statusCode, JSON.stringify(data, null, 2), 'application/json; charset=utf-8');
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (pathname === '/api/health') {
    sendJSON(res, 200, { status: 'ok', message: '重卡排队助手小程序预览服务运行中' });
    return;
  }

  if (pathname === '/api/build-info') {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
    sendJSON(res, 200, {
      name: packageJson.name,
      version: packageJson.version,
      buildTime: new Date().toISOString(),
      pages: [
        { path: 'pages/home/index', name: '首页', tabBar: true },
        { path: 'pages/queue/index', name: '排队详情', tabBar: true },
        { path: 'pages/navigation/index', name: '进站导航', tabBar: true },
        { path: 'pages/messages/index', name: '消息中心', tabBar: true },
        { path: 'pages/profile/index', name: '个人车辆', tabBar: true },
        { path: 'pages/scan/index', name: '扫码入队', tabBar: false },
        { path: 'pages/rating/index', name: '服务评价', tabBar: false },
        { path: 'pages/feedback/index', name: '催办反馈', tabBar: false },
        { path: 'pages/fleet/index', name: '车队共享', tabBar: false },
        { path: 'pages/vehicle-edit/index', name: '车辆编辑', tabBar: false }
      ],
      features: [
        '扫码加入当前场站队列',
        '查看实时排队名次、前方车辆数和预计等待时长',
        '选择补电偏好（快充优先/离出口近优先）',
        '接收即将叫号、正式叫号、过号提醒和改道通知',
        '查看站内充电区、休息区、洗手间和称重点位',
        '一键上报"已到门口""临时离开""需要协助倒车"',
        '支持同行车队共享排队进度',
        '查看历史进站记录与常用车辆',
        '对服务态度、排队秩序和引导准确度做快速评价',
        '遇到长时间不动可发起催办反馈'
      ]
    });
    return;
  }

  let filePath = path.join(__dirname, 'dist', 'h5', pathname === '/' ? 'index.html' : pathname);

  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    const content = fs.readFileSync(filePath);
    sendResponse(res, 200, content, contentType);
    return;
  }

  const distIndex = path.join(__dirname, 'dist', 'h5', 'index.html');
  if (fs.existsSync(distIndex)) {
    const content = fs.readFileSync(distIndex);
    sendResponse(res, 200, content, 'text/html; charset=utf-8');
    return;
  }

  const fallbackHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>重卡排队助手 - 构建中</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 24px;
      padding: 48px 32px;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .icon {
      font-size: 72px;
      margin-bottom: 24px;
    }
    h1 {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 12px;
    }
    .subtitle {
      font-size: 16px;
      color: #666;
      margin-bottom: 32px;
      line-height: 1.6;
    }
    .status {
      display: inline-block;
      padding: 8px 20px;
      background: #fff3e0;
      color: #f57c00;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 24px;
    }
    .tips {
      background: #f5f7fa;
      border-radius: 12px;
      padding: 16px;
      text-align: left;
      margin-bottom: 24px;
    }
    .tips-title {
      font-size: 14px;
      font-weight: 600;
      color: #1e88e5;
      margin-bottom: 8px;
    }
    .tips-content {
      font-size: 13px;
      color: #666;
      line-height: 1.8;
    }
    .features {
      text-align: left;
    }
    .features-title {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a2e;
      margin-bottom: 16px;
    }
    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .feature-item:last-child {
      border-bottom: none;
    }
    .feature-icon {
      font-size: 20px;
      flex-shrink: 0;
    }
    .feature-text {
      font-size: 14px;
      color: #444;
      line-height: 1.5;
    }
    .footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #f0f0f0;
      font-size: 12px;
      color: #999;
    }
    code {
      background: #e3f2fd;
      padding: 2px 8px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: #1976d2;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">🚚</div>
    <h1>重卡排队助手</h1>
    <p class="subtitle">让司机在进站前后都能清楚知道<br>"前面还有几台、轮到我还要多久、该不该先休息"</p>
    <div class="status">⏳ H5 版本构建中...</div>
    
    <div class="tips">
      <div class="tips-title">💡 使用说明</div>
      <div class="tips-content">
        1. 请先执行 <code>npm run build:h5</code> 构建 H5 版本<br>
        2. 构建完成后刷新此页面即可预览<br>
        3. 也可执行 <code>npm run dev:h5</code> 启动开发模式<br>
        4. 微信小程序版本请使用 <code>npm run dev:weapp</code>
      </div>
    </div>

    <div class="features">
      <div class="features-title">📋 核心功能</div>
      <div class="feature-item">
        <span class="feature-icon">📱</span>
        <span class="feature-text">扫码加入当前场站队列，快速入队</span>
      </div>
      <div class="feature-item">
        <span class="feature-icon">📊</span>
        <span class="feature-text">实时查看排队名次、前方车辆和预计等待时长</span>
      </div>
      <div class="feature-item">
        <span class="feature-icon">⚡</span>
        <span class="feature-text">选择补电偏好：快充优先或离出口近优先</span>
      </div>
      <div class="feature-item">
        <span class="feature-icon">🔔</span>
        <span class="feature-text">接收叫号提醒、过号提醒和改道通知</span>
      </div>
      <div class="feature-item">
        <span class="feature-icon">🗺️</span>
        <span class="feature-text">站内导航：充电区、休息区、洗手间、称重点</span>
      </div>
      <div class="feature-item">
        <span class="feature-icon">👥</span>
        <span class="feature-text">车队共享：同行车队实时共享排队进度</span>
      </div>
      <div class="feature-item">
        <span class="feature-icon">⭐</span>
        <span class="feature-text">服务评价：快速评价服务态度和排队秩序</span>
      </div>
      <div class="feature-item">
        <span class="feature-icon">⏰</span>
        <span class="feature-text">催办反馈：长时间不动可发起催办</span>
      </div>
    </div>

    <div class="footer">
      基于 Taro 4.x + React + TypeScript 构建<br>
      支持多端发布：微信小程序 / H5 / 支付宝小程序等
    </div>
  </div>
</body>
</html>
  `;

  sendResponse(res, 200, fallbackHtml, 'text/html; charset=utf-8');
});

server.listen(PORT, () => {
  console.log(`\n🚀 重卡排队助手小程序预览服务已启动`);
  console.log(`📍 预览地址: http://localhost:${PORT}`);
  console.log(`📋 API 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`📦 构建信息: http://localhost:${PORT}/api/build-info`);
  console.log(`\n💡 提示: 请先执行 npm run build:h5 构建 H5 版本后再访问`);
  console.log(`\n🔧 支持的小程序凭证配置:`);
  console.log(`   - 微信小程序: AppID (project.config.json)`);
  console.log(`   - 支付宝小程序: 小程序ID (mini.project.json)`);
  console.log(`   - 字节跳动小程序: 小程序ID (project.tt.json)`);
  console.log(`\n📱 支持的完整流程:`);
  console.log(`   1. 配置小程序 AppID → 2. 执行 build → 3. 生成预览二维码`);
  console.log(`   4. 真机预览调试 → 5. 上传代码 → 6. 发布审核\n`);
});
