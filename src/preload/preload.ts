import { ipcRenderer, contextBridge } from "electron";
import type { IElectronAPI } from "./interface";

contextBridge.exposeInMainWorld('electronAPI', {
    startSecondWin: str => ipcRenderer.send('on-start-second-win', str),
    getColor: cb => ipcRenderer.on('second-win-send-color', cb),
    getInfo: cb => ipcRenderer.on('on-send-info-to-second-win', cb),
    imageSave: (buffer) => ipcRenderer.send('on-image-save', buffer),
    imageCopy: (buffer) => ipcRenderer.invoke('on-copy-image', buffer),
    imageSaveAs: (buffer) => ipcRenderer.send('on-image-save-as', buffer),
    imageShare: (buffer) => ipcRenderer.invoke('on-image-share', buffer),
    eyedropGetColor: color => ipcRenderer.send('on-get-color', color),
    completeScreenCut: cb => ipcRenderer.on('on-complete-screencut', cb),
    onExitSecondWindow: cb => ipcRenderer.on('on-exit-second-window', cb),
    onExitScreenCut: bool => ipcRenderer.send('on-exit-screen-cut', bool),
    onMinimizableWin: () => ipcRenderer.send('on-minimizable-win'),
    onFullScreenWin: bool => ipcRenderer.send('on-fullScreen-win', bool),
    onCloseWin: () => ipcRenderer.send('on-close-win'),
    onSetPosition: obj => ipcRenderer.send('on-set-position', obj),
    onGetPosition: cb => ipcRenderer.on('on-get-position', cb),
    onLeaveWin: cb => ipcRenderer.on('on-leave-win', cb),
} as IElectronAPI)