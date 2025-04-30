import { app, BrowserWindow, dialog } from "electron";
import { createScreenshotWindow, createWindow, winIpcMain } from "./win_config";
import { imgProtocol, protocolHandler } from "./protocol";
import { publicIpcMain } from "./public";
import { setTray } from "./tray";
import { screenCutIpcMain } from "./screenCut";
import { eyeDropperipcMain } from "./eyeDropper";
import { GlobalShortcutIpcMain, setGlobalShortcut } from "./globalshortcut";
let mainWindow: BrowserWindow;
let secondWindow: BrowserWindow;
protocolHandler();
// app.disableHardwareAcceleration();
app.whenReady().then(() => {
  imgProtocol();
  mainWindow = createWindow();
  secondWindow = createScreenshotWindow();
  if (!mainWindow) return;
  if (!secondWindow) return;
  winIpcMain();
  publicIpcMain();
  setTray();
  screenCutIpcMain();
  eyeDropperipcMain();
  setGlobalShortcut();
  GlobalShortcutIpcMain();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
  // console.log(app.getPath('appData'));
});


// 关闭窗口
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
process.on('uncaughtException', err => {
  console.error('有一个未捕获的错误', err)
  // dialog.showMessageBoxSync({
  //   title: 'test',
  //   message: err.toString()
  // })
  // process.exit(1) //强制性的（根据 Node.js 文档）
})

export {
  mainWindow,
  secondWindow
}
