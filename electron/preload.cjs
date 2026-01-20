const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("tetrisFlip", {
  onOpenHelp(handler) {
    if (typeof handler !== "function") return;
    ipcRenderer.on("open-help", handler);
  }
});
