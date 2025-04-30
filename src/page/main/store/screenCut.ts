import { createDiscreteApi } from 'naive-ui';
import { defineStore } from 'pinia'
export const useScreenshot = defineStore('screenshot', {
    state: (() => ({
        protocol: 'local-img://',
        src: [] as FileInfo[],
    })),
    actions: {
        async init() {
            await this.getImagePath();
        },
        async getImagePath() {
            const result = await fetch(this.protocol + 'source');
            const data = await result.json();
            this.src = data;
        },
        add(result: FileInfo) {
            this.src.unshift(result);
        },
        async delete(path: string) {
            const { message } = createDiscreteApi(['message']);

            fetch(this.protocol + path, { method: 'DElETE' })
                .then(res => res.status)
                .then((status) => {
                    if (status === 200) {
                        for (let i = 0; i < this.src.length; i++) {
                            const item = this.src[i];
                            if (item.path === path) {
                                this.src.splice(i, 1);
                            }
                        }
                        message.success('删除图片成功');
                    } else {
                        message.success('删除图片失败');
                    }
                });
        },

    },
    persist: {
        pick: ['src']
    }
})
