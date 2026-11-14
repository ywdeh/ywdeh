export function project_frame(size, gap, p) {
    const fx = ((40 * p) / size.width) * 1000,
        fy = ((40 * p) / size.height) * 400;
    const rx = ((6 * p) / size.width) * 1000,
        ry = ((6 * p) / size.height) * 400;
    const jx = ((2 * p) / size.width) * 1000,
        jy = ((2 * p) / size.height) * 400;
    const right = 982 + 13 * p,
        left = right - fx,
        top = 395 - fy;
    const ax = right - jx / 2,
        ay = top + jy / 2;
    const bx = left + jx / 2,
        by = 395 - jy / 2;
    const diagonal = `Q${right} ${top} ${ax} ${ay}Q${(right + left) / 2 + p} ${(top + 395) / 2 + p} ${bx} ${by}Q${left} 395 ${left - jx} 395`;
    const crease = `M${ax} ${ay}Q${(right + left) / 2} ${top + p} ${left + rx} ${top}Q${left} ${top} ${left} ${top + ry}Q${left + p} ${(top + 395) / 2} ${bx} ${by}`;
    return `M${gap.start} 395L16 395Q4 395 5 382C8 270 2 140 5 18Q5 5 16 5C180 2 300 8 500 5S820 3 984 5Q996 5 995 18C993 130 998 265 995 ${382 + 13 * p - fy - jy}Q995 ${top - jy} ${right} ${top - jy}${diagonal}L${gap.end} 395${p > 0.001 ? crease : ''}`;
}
