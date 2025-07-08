// electron-main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

// 获取 VITE_DEV_SERVER_URL 环境变量，这在开发模式下由 package.json 脚本设置
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

function createWindow() {
  // 创建浏览器窗口
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // 推荐开启 nodeIntegration 和 contextIsolation 以获得更好的安全性
      // nodeIntegration: true, 
      // contextIsolation: true,
    },
  });

  // 根据环境加载不同的 URL
  if (VITE_DEV_SERVER_URL) {
    // 开发模式: 加载 Vite 开发服务器的 URL，实现热更新
    win.loadURL(VITE_DEV_SERVER_URL);
    // 默认打开开发者工具
    win.webContents.openDevTools();
  } else {
    // 生产模式: 加载打包后的 index.html 文件
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

// 当 Electron 完成初始化并准备创建浏览器窗口时调用
app.whenReady().then(createWindow);

// 在所有窗口都关闭时退出应用 (macOS 除外)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 当应用被激活时 (例如，点击 dock 图标)，如果没有窗口则重新创建一个 (macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});