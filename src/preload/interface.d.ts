type Mode = {
    mode: string;
    path: string;
}
type Address = {
    protocol: string;
    ip: string;
    port: number;
    pathname: string;
    address: string;
} | undefined | Error


export interface IElectronAPI {
    startSecondWin: (str: string) => void,
    getColor: (cb: (event: Electron.IpcRendererEvent, color: string) => void) => Electron.IpcRenderer,
    getInfo: (cb: (event: Electron.IpcRendererEvent, obj: Mode) => void) => Electron.IpcRenderer,
    imageSave: (buffer: ArrayBuffer) => void,
    imageCopy: (buffer: ArrayBuffer) => Promive<boolean>,
    imageSaveAs: (buffer: ArrayBuffer) => void,
    imageShare: (buffer: ArrayBuffer) => Promive<Address>,
    eyedropGetColor: (color: string) => void,
    completeScreenCut: (cb: (event: Electron.IpcRendererEvent, obj: FileInfo) => void) => Electron.IpcRenderer,
    onExitSecondWindow: (cb: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => Electron.IpcRenderer,
    onExitScreenCut: (bool: boolean) => void,
    onMinimizableWin: () => void,
    onFullScreenWin: (bool: boolean) => void,
    onCloseWin: () => void,
    onSetPosition: (posi: number[]) => void,
    onGetPosition: (cb: (event: Electron.IpcRendererEvent, posi: number[]) => void) => Electron.IpcRenderer,
    onLeaveWin: (cb: (event: Electron.IpcRendererEvent, bool: boolean) => void) => Electron.IpcRenderer,
}

declare global {
    interface Window {
        electronAPI: IElectronAPI,
        EyeDropper: EyeDropper
    }
}

