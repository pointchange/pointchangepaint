import { Stop20Regular, Circle20Regular, ArrowUpRight20Regular, DrawText20Regular, AppFolder20Filled, TextT20Regular } from '@vicons/fluent'
import { shallowRef } from 'vue';

const slider = {
    min: 1,
    max: 10,
}
const operationShapeBtns = shallowRef([
    {
        name: 'rect',
        icon: Stop20Regular,
        des: '矩形',
        slider
    },
    {
        name: 'circle',
        icon: Circle20Regular,
        des: '椭圆',
        slider

    },
    {
        name: 'arrow',
        icon: ArrowUpRight20Regular,
        des: '箭头',

        slider
    },
    {
        name: 'line',
        icon: DrawText20Regular,
        des: '线',
        slider

    },
    {
        name: 'mosaic',
        icon: AppFolder20Filled,
        des: '马赛克',
        slider: {
            min: 10,
            max: 30
        }
    },
    {
        name: 'text',
        icon: TextT20Regular,
        des: '文字',
        slider: {
            min: 16,
            max: 60
        }
    },
]);
export {
    operationShapeBtns
}