import { defineStore } from 'pinia'
export const useThemeStore = defineStore('theme', {
    state: () => ({
        theme: 'light',
        position: [760, 120],
    }),
    actions: {

    },
    persist: true
})