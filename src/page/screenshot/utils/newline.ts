function newline(str: string, maxWidth: number, shape: any) {
    let achar = 0;
    let content = '';
    let paragraph = '';
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (achar + 16 >= maxWidth || char === '\n') {
            content += paragraph + '\n';
            achar = 0;
            paragraph = '';
        }
        if (char === '\n') continue;
        shape.ctx.font = "24px sans-serif";
        achar += shape.ctx.measureText(char).width;
        paragraph += char;
        if (i === str.length - 1) {
            content += paragraph + '\n';
        }
    }
    return content;
}
export { newline }