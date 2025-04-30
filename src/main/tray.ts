import { Menu, Tray } from "electron"
import { join } from "path"
import { mode, startSecondWin } from "./public";
import { mainWindow } from ".";
// import icon from '../../resources/favicon-16x16.png?asset'
//为了确保您的图标在视网膜监视器不模糊，请确认你的 @2x 图片是 144dpi 。
//16x16 (72dpi) 和 32x32@2x (144dpi) 适合大多数图标。
const icon = join(__dirname, '../../../resources/favicon.png');
function setTray() {
    // const iconPath = process.env.NODE_ENV === 'development'
    //     ? join(__dirname, '../resources/favicon.png')  // 开发环境路径‌:ml-citation{ref="3,6" data="citationList"}
    //     : join(process.resourcesPath, 'favicon.png');

    const tray = new Tray(icon)
    const contextMenu = Menu.buildFromTemplate([
        {
            label: '截屏( alt + s )', async click() {
                mode.str = 'screencut';
                await startSecondWin();
            }
        },
        {
            label: '取色( alt + z )', async click() {
                mode.str = 'eyedrop';
                await startSecondWin();
            }
        },
        {
            label: '画图( alt + d )', async click() {
                mode.str = 'paint';
                await startSecondWin();
            }
        },
        {
            label: '退出', role: 'quit'
        },

    ])
    tray.setToolTip('pointchangepaint')
    tray.setContextMenu(contextMenu)
    tray.on('double-click', () => {
        mainWindow.show()
    })
}
export {
    setTray
}