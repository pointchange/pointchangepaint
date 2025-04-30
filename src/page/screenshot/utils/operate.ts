function operated(shapes: any, shape: any, index: number) {
    shape.setHistory();
    shapes.push(shape);
    shapes.splice(index, 1);
}
function removeDocumentListen() {
    document.onmousedown = null;
    document.onmousemove = null;
    document.onmouseup = null;
}

export {
    operated, removeDocumentListen
}