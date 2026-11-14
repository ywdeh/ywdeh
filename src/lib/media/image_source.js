import { image_data, sizes } from './image_data.js';

export const image_color = (src) => image_data[src]?.[2];

export const srcset_of = (src) =>
    [...(sizes[src] ?? []), [src, image_data[src]?.[0]]]
        .filter(([, width]) => width)
        .map(([path, width]) => `${path} ${width}w`)
        .join(', ');
