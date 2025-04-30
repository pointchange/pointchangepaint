import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { mainWindow, secondWindow } from ".";

const createWindow = () => {
    const win = new BrowserWindow({
        width: 400,
        height: 800,
        show: false,
        autoHideMenuBar: true,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            preload: join(__dirname, "../preload/preload.js"),
        },
    });
    win.on('ready-to-show', () => {
        win.show();
    })
    // win.setTitle('pointchangepaint')
    // 如果打包了，渲染index.html
    // if (app.isPackaged) {
    //   win.loadFile(join(__dirname, "../../index.html"));
    // } else {
    //   let url = "http://localhost:5173";
    //   win.loadURL(url);
    // }
    if (process.env.NODE_ENV !== 'development') {
        win.loadFile(join(__dirname, "../page/main/index.html"))
        // win.webContents.openDevTools()
    } else {
        let url = "http://localhost:5173/src/page/main/index.html";
        win.loadURL(url)
        win.webContents.openDevTools({ mode: 'detach' });
    }
    return win;


};
const createScreenshotWindow = () => {
    const win = new BrowserWindow({
        transparent: true,
        frame: false,
        skipTaskbar: true,
        fullscreen: true,
        show: false,
        autoHideMenuBar: true,
        // resizable: false,
        webPreferences: {
            nodeIntegration: true,
            preload: join(__dirname, "../preload/preload.js"),
        },
    });
    if (process.env.NODE_ENV !== 'development') {
        win.loadFile(join(__dirname, "../page/screenshot/index.html"))
        // win.webContents.openDevTools()
    } else {
        let url = "http://localhost:5173/src/page/screenshot/index.html"
        win.loadURL(url)
        win.webContents.openDevTools({ mode: 'detach' })
    }
    return win;
};
function winIpcMain() {
    ipcMain.on('on-close-win', () => {
        app.quit();
    })
    ipcMain.on('on-fullScreen-win', (_e, bool) => {
        if (bool) {
            mainWindow.maximize()
        } else {
            mainWindow.unmaximize();
        }
    })
    ipcMain.on('on-minimizable-win', () => {
        mainWindow.minimize();
    })
    mainWindow.on('moved', () => {
        mainWindow.webContents.send('on-get-position', mainWindow.getPosition());
    })
    mainWindow.on('focus', () => {
        mainWindow.webContents.send('on-leave-win', true);
    })
    mainWindow.on('blur', () => {
        mainWindow.webContents.send('on-leave-win', false);
    })
    ipcMain.on('on-set-position', (_e, arr) => {
        mainWindow.setPosition(arr[0], arr[1]);
    })
}
export {
    createScreenshotWindow,
    createWindow,
    winIpcMain
}