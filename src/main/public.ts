import { app, ipcMain } from "electron";
import { getScreenCut } from "./screenCut";
import { secondWindow } from ".";
import { join } from "node:path";
import { existsSync, mkdirSync } from "node:fs";

class Mode {
    str: string;
    path: string;
    constructor() {
        this.str = '';
        this.path = '';
    }
}
//resource/imgs
//resource/share/images
//resource/share/index.html

function isExistsSync(path: string) {
    if (!existsSync(path)) {
        mkdirSync(path)
    }
    return path;
}
const pointchangepaint = isExistsSync(join(app.getPath('appData'), '/pointchangepaint'));
const RESOURCES = isExistsSync(join(pointchangepaint, '/resources'));
const IMGS = isExistsSync(join(RESOURCES, '/imgs'));
const COPY = isExistsSync(join(RESOURCES, '/copy'));
const SHARE = isExistsSync(join(RESOURCES, '/share'));
const IMAGES = isExistsSync(join(SHARE, '/images'));

const mode = new Mode();
async function startSecondWin() {
    secondWindow.setAlwaysOnTop(true, 'screen-saver');
    secondWindow.setVisibleOnAllWorkspaces(true)
    secondWindow.setFullScreen(true);
    let path = '';
    switch (mode.str) {
        case 'screencut':
            path = await getScreenCut();

            break;
        case 'eyedrop':

            break;
        default:

            break;
    }
    secondWindow.webContents.send('on-send-info-to-second-win', {
        path,
        mode: mode.str,
    });

    secondWindow.show();
}
function exitSecondWin() {
    secondWindow.webContents.send('on-exit-second-window');
    secondWindow.setAlwaysOnTop(false);
    secondWindow.setFullScreen(false);
    secondWindow.hide();
}
function publicIpcMain() {
    ipcMain.on('on-start-second-win', async (_e, str) => {
        mode.str = str;
        await startSecondWin();
    });
}
export {
    mode,
    publicIpcMain,
    startSecondWin,
    exitSecondWin,
    RESOURCES,
    IMGS,
    SHARE,
    IMAGES,
    COPY,
    isExistsSync
}