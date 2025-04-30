import { globalShortcut } from "electron";
import { exitSecondWin, mode, startSecondWin } from "./public";
import { unlink } from "fs/promises";


function setGlobalShortcut() {
    globalShortcut.register('Alt+S', async () => {
        mode.str = 'screencut';
        await startSecondWin()
    })
    globalShortcut.register('Alt+Z', async () => {
        mode.str = 'eyedrop';
        await startSecondWin()
    })
    globalShortcut.register('Alt+D', async () => {
        mode.str = 'paint';
        await startSecondWin()
    })
    globalShortcut.register('Esc', async () => {
        if (mode.str === 'screencut') {
            await unlink(mode.path);
        }
        exitSecondWin();
    })
}
function GlobalShortcutIpcMain() {

}
export {
    setGlobalShortcut,
    GlobalShortcutIpcMain,

}