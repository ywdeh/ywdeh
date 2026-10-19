export function get_average_color(image) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 32;
    const context = canvas.getContext('2d');
    if (!context) return null;

    let data;
    try {
        context.drawImage(image, 0, 0, 32, 32);
        data = context.getImageData(0, 0, 32, 32).data;
    } catch {
        return null;
    }

    let red = 0, green = 0, blue = 0, count = 0;
    for (let index = 0; index < data.length; index += 4) {
        if (data[index + 3] === 0) continue;
        red += data[index];
        green += data[index + 1];
        blue += data[index + 2];
        count++;
    }
    return count ? `rgb(${Math.round(red / count)}, ${Math.round(green / count)}, ${Math.round(blue / count)})` : null;
}
