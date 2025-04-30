import { protocol } from "electron";
import { createReadStream } from "fs";
import { readdir, stat, unlink } from 'node:fs/promises'
import { join } from "path";
import { IMGS, isExistsSync } from "./public";

function protocolHandler() {
    return protocol.registerSchemesAsPrivileged([
        {
            scheme: 'local-img',
            privileges: {
                standard: true,
                secure: true,
                supportFetchAPI: true,
                stream: true,
                bypassCSP: true,
            }
        }
    ])
}

async function getImagePath() {
    const path = IMGS;
    try {
        const arr = <FileInfo[]>[];
        const files = await readdir(path);
        for (const file of files) {
            if (/.txt$/.test(file)) continue;
            const res = await stat(path + file);
            arr.push({
                path: path + file,
                birthtime: res.birthtimeMs
            })
        }
        return arr.toSorted((a, b) => b.birthtime - a.birthtime);
    } catch (err) {
        return []
    }
}
function imgDelete(path: string) {
    unlink(path)
}
function imgProtocol() {
    protocol.handle('local-img', async (request) => {
        const url = new URL(request.url);
        if (url.hostname === 'source') {
            const data = await getImagePath();
            return new Response(JSON.stringify(data), {
                headers: {
                    "Content-Type": "application/json"
                }
            });
        } else if (request.method === 'DELETE') {
            const path = join(url.hostname + ':', url.pathname);
            try {
                await unlink(path);
                return new Response(null, {
                    status: 200
                });
            } catch (error) {
                return new Response(null, {
                    status: 500
                });
            }



        } else {
            const path = join(url.hostname + ':', url.pathname);
            const rs = createReadStream(path);
            return new Response(rs as any, {
                headers: {
                    "Accept-Ranges": "bytes"
                }
            });
        }

    })
}
export {
    protocolHandler,
    imgProtocol
}