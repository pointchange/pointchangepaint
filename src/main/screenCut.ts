import { exec } from "child_process";
import { desktopCapturer, dialog, ipcMain, net, screen } from "electron";
import { createWriteStream } from "fs";
import { join } from "path";
import os from 'node:os';
import { createServer, type Server } from "node:http";
import { createReadStream, existsSync, readFileSync, writeFileSync } from "node:fs";
import { COPY, exitSecondWin, IMAGES, IMGS, isExistsSync, mode, SHARE } from "./public";
import { mainWindow, secondWindow } from ".";
import { stat, unlink } from "node:fs/promises";
let path: string;
let server: Server | null;
let copyPath = '';

async function getScreenCut() {
    const { bounds: { width, height }, scaleFactor } = screen.getPrimaryDisplay();
    const stream = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: {
            width: width * scaleFactor,
            height: height * scaleFactor
        }
    });
    const imgBuffer = stream[0].thumbnail.toPNG();

    mode.path = path = join(IMGS, `${crypto.randomUUID()}.png`)
    const ws = createWriteStream(path);
    ws.write(imgBuffer);
    await new Promise(resolve => {
        ws.on('drain', () => {
            ws.end();
            resolve(true);
        })
    })
    return path;
}
function writeImage(path: string, buffer: ArrayBuffer) {
    const ws = createWriteStream(path, { flush: true });
    const buf = Buffer.from(buffer)
    ws.write(buf);
    ws.end();
}
function screenCutIpcMain() {
    ipcMain.handle('on-copy-image', async (_e, buffer) => {
        if (copyPath) {
            unlink(copyPath);
        }
        copyPath = join(COPY, `${crypto.randomUUID()}.png`)
        writeImage(copyPath, buffer);
        const psCommand = `powershell -command Set-Clipboard -Path ${copyPath}`;
        const res = await new Promise((resolve, reject) => {
            exec(psCommand, (error) => {
                if (error) {
                    reject(false);
                    return;
                }
                resolve(true);
            })
        })
        return res;
    })
    ipcMain.on('on-image-save-as', async (_e, buffer) => {
        const pathArr = path.split('.');
        const parthArrLenght = pathArr.length - 1;
        const pathSuffix = pathArr[parthArrLenght];
        const id = crypto.randomUUID();
        const result = dialog.showSaveDialogSync(secondWindow, {
            title: '图片另存为',
            defaultPath: id + '.' + pathSuffix,
            filters: [
                { name: 'png', extensions: ['png'] },
                { name: 'jpeg', extensions: ['jpeg'] },
                { name: 'All Files', extensions: ['*'] },
            ],
        });
        if (!result || result === '') return;
        writeImage(result, buffer)
    })
    ipcMain.handle('on-image-share', (_e, buffer) => {
        if (server) {
            server.close();
            server.removeAllListeners();
            server = null;
        }
        const path = join(IMAGES, '1.png')
        writeImage(path, buffer);
        // const rs = createReadStream();
        // const ws = createWriteStream(join(SHARE, 'index.html'));
        // ws.write(rs);
        // ws.end();
        if (!existsSync(join(SHARE, 'index.html'))) {
            const rf = readFileSync(join(__dirname, '../../../extraResources/index.html'));
            writeFileSync(join(SHARE, 'index.html'), rf);
        }
        return startServer(SHARE);
    })
    ipcMain.on('on-image-save', (_e, buffer) => {
        writeImage(path, buffer);
    })
    ipcMain.on('on-exit-screen-cut', async (_e, bool) => {
        if (bool) {
            const res = await stat(mode.path);
            mainWindow.webContents.send('on-complete-screencut', {
                path: mode.path,
                birthtime: res.birthtimeMs
            } as FileInfo);
            exitSecondWin();
        } else {
            await unlink(mode.path);
            exitSecondWin();
        }
    })
}
const loaclAdress = '127.0.0.1';
function startServer(root: string) {
    if (!net.isOnline()) return new Error('启动局域网服务器失败');
    if (server) return;
    const SERVER_IP = getAddress();
    const SERVER_PORT = 8745;
    server = createServer((req, res) => {
        const { pathname } = new URL(req.url as string, `http://${SERVER_IP}:${SERVER_PORT}`);
        const filePath = join(root + pathname);
        res.setHeader('Content-type', 'text/html;charset=UTF-8');
        const rs = createReadStream(filePath);
        rs.pipe(res);
        rs.on('error', (_error) => {
            res.statusCode = 404;
            res.end('404 找不到文件');
            return;
        });
    });
    server.listen(SERVER_PORT, SERVER_IP);
    // return `http://${SERVER_IP}:${SERVER_PORT}/index.html`;
    return {
        protocol: 'http://',
        ip: SERVER_IP,
        port: SERVER_PORT,
        pathname: '/index.html',
        address: `http://${SERVER_IP}:${SERVER_PORT}/index.html`
    }
}
function getAddress() {
    const interfaces = os.networkInterfaces();
    for (const dev of Object.values(interfaces)) {
        if (typeof dev === 'undefined') continue;
        for (const iface of dev) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return loaclAdress;
}
export {
    getScreenCut,
    screenCutIpcMain,
}

