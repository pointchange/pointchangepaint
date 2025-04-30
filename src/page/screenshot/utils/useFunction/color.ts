import type { Type } from 'naive-ui/es/button/src/interface'

import { ref } from "vue";
type LCG = {
    value: string,
    label: string,
    type: Type | undefined
}
function useColorGroup() {
    const colorGroup = ref<LCG[]>([
        {
            value: '#d03050',
            label: '红',
            type: 'error'
        },
        {
            value: '#2080f0',
            label: '蓝',
            type: 'info'

        },
        {
            value: '#18a058',
            label: '绿',
            type: 'success'

        },
        {
            value: '#f0a020',
            label: '黄',
            type: 'warning'

        },
    ]);
    return {
        colorGroup
    }
}

export {
    useColorGroup
}