import type Line from "@screenshot/utils/Class/Line";
import { defineStore } from "pinia";

export const usePaint = defineStore('paint', {
    state: () => ({
        lineWidth: 2.0,
        strokeColor: '#d03050',
        operation: {
            x: 0,
            y: 0,
            h: 200,
            w: 200,
            show: false
        },
        s: {
            working: null as unknown as Line,
            line: [] as Line[]
        }
    }),
    actions: {
        resetPaintStyle() {
            this.lineWidth = 2.0;
            this.strokeColor = '#d03050';
        },
        changePaintStyle(line: Line) {
            line.lineWidth = this.lineWidth;
            line.strokeColor = this.strokeColor;
        },
        readLineStyle(line: Line) {
            this.lineWidth = line.lineWidth;
            this.strokeColor = line.strokeColor;
        },
        userChangePaintStyle(lineWidth = 0, strokeColor = '') {
            if (!this.s.working) return;
            if (lineWidth > 0) {
                this.lineWidth = lineWidth;
            }
            if (strokeColor !== '') {
                this.strokeColor = strokeColor;
            }
            this.changePaintStyle(this.s.working);
        }
    }
})