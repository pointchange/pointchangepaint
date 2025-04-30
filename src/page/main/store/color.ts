import { createDiscreteApi } from 'naive-ui';
import { defineStore } from 'pinia'
export const useColor = defineStore('color', {
    state: (() => ({
        colors: [] as Color[]

    })),
    actions: {
        addColor(color: string) {
            const id = crypto.randomUUID();
            this.colors.unshift({
                id,
                color,
                close: false,
            })
        },
        deleteColor(id: string) {
            for (let i = 0; i < this.colors.length; i++) {
                const item = this.colors[i];
                if (item.id === id) {
                    this.colors.splice(i, 1);
                }
            }
        },
        copy(color: string) {
            const type = "text/plain";
            const blob = new Blob([color], { type });
            const data = [new ClipboardItem({ [type]: blob })];
            const { message } = createDiscreteApi(['message']);
            navigator.clipboard.write(data).then(
                () => {
                    message.success('复制成功');
                },
                (e) => {
                    message.error(`复制失败，${e}`);
                },
            );
        },
        setHexColor(color: string) {
            const reg = /\d+/g;
            const arr = color.match(reg);
            if (!arr) return '';
            function toHex(str: string) {
                return (Number(str)).toString(16).padStart(2, '0')
            }
            return `#${toHex(arr[0])}${toHex(arr[1])}${toHex(arr[2])}`;
        },
        setRgbColor(color: string) {
            const num = color.slice(1).toUpperCase();
            const r = parseInt(num.slice(0, 2), 16);
            const g = parseInt(num.slice(2, 4), 16);
            const b = parseInt(num.slice(4, 6), 16);
            return `rgb(${r}, ${g}, ${b})`;
        },
        switchColorFormat(color: string) {
            let c = '';
            if (color[0] === '#') {
                c = this.setRgbColor(color);
            } else {
                c = this.setHexColor(color);
            }
            for (let i = 0; i < this.colors.length; i++) {
                const item = this.colors[i];
                if (item.color === color) {
                    item.color = c;
                }
            }
        }
    },
    persist: true
})