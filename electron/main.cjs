const { app, BrowserWindow, Menu } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("node:path");

let mainWindow;

function createAppMenu() {
  const menu = Menu.buildFromTemplate([
    { role: "fileMenu" },
    { role: "editMenu" },
    { role: "viewMenu" },
    { role: "windowMenu" },
    {
      label: "Help",
      submenu: [
        {
          label: "Manual",
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send("open-help");
            }
          }
        }
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);
}

function getIconPath() {
  if (app.isPackaged) {
    return path.join(app.getAppPath(), "dist", "assets", "icon.png");
  }
  return path.join(__dirname, "..", "public", "assets", "icon.png");
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 768,
    height: 1240,
    minWidth: 640,
    minHeight: 1200,
    backgroundColor: "#111111",
    icon: getIconPath(),
    useContentSize: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();
  createAppMenu();
  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
