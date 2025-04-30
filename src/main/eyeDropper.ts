import { ipcMain } from "electron";
import { exitSecondWin } from "./public";
import { mainWindow } from ".";


function eyeDropperipcMain() {
    ipcMain.on('on-get-color', async (_e, color) => {
        mainWindow.webContents.send('second-win-send-color', color);
        exitSecondWin();
    })
}
export {
    eyeDropperipcMain
}