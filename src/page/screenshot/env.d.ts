/// <reference types="vite/client" />
interface ActiveShape {
    [key: string]: boolean,
    rect: boolean;
    circle: boolean;
    arrow: boolean;
    mosaic: boolean;
    line: boolean;
    text: boolean;
}

interface Color {
    id: string;
    color: string;
    close: boolean;
}