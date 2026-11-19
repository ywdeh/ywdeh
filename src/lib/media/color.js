const SAMPLE_SIZE = 24;
const LUMA = [0.299, 0.587, 0.114];

let probe;

export function luminance(color) {
    probe ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = color;
    probe.fillRect(0, 0, 1, 1);
    const pixel = probe.getImageData(0, 0, 1, 1).data;
    return LUMA.reduce((sum, weight, channel) => sum + weight * pixel[channel], 0) / 255;
}

export async function average_color(url) {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = url;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = SAMPLE_SIZE;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
    const { data } = context.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
    const sum = [0, 0, 0];
    for (let i = 0; i < data.length; i += 4) for (let c = 0; c < 3; c++) sum[c] += data[i + c];
    const pixels = data.length / 4;
    return `rgb(${sum.map((value) => Math.round(value / pixels)).join(' ')})`;
}
