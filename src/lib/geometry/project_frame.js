export const FRAME = {
    width: 1000,
    height: 400,
    baseline: 395,
    gap_min: 16,
    gap_max: 982,
    fold: 40,
    fold_radius: 6,
    fold_joint: 2,
    fold_reach: 13,
};

export function frame_gap(card, label) {
    const share = (x) => ((x - card.left) / card.width) * FRAME.width;
    return {
        start: Math.max(FRAME.gap_min, share(label.left)),
        end: Math.min(FRAME.gap_max, share(label.right)),
    };
}

export function project_frame(size, gap, fold) {
    const { width: W, height: H, baseline: B, gap_max } = FRAME;
    const p = fold;
    const fx = ((FRAME.fold * p) / size.width) * W;
    const fy = ((FRAME.fold * p) / size.height) * H;
    const rx = ((FRAME.fold_radius * p) / size.width) * W;
    const ry = ((FRAME.fold_radius * p) / size.height) * H;
    const jx = ((FRAME.fold_joint * p) / size.width) * W;
    const jy = ((FRAME.fold_joint * p) / size.height) * H;
    const right = gap_max + FRAME.fold_reach * p;
    const left = right - fx;
    const top = B - fy;
    const ax = right - jx / 2;
    const ay = top + jy / 2;
    const bx = left + jx / 2;
    const by = B - jy / 2;
    const diagonal = `Q${right} ${top} ${ax} ${ay}Q${(right + left) / 2 + p} ${(top + B) / 2 + p} ${bx} ${by}Q${left} ${B} ${left - jx} ${B}`;
    const crease = `M${ax} ${ay}Q${(right + left) / 2} ${top + p} ${left + rx} ${top}Q${left} ${top} ${left} ${top + ry}Q${left + p} ${(top + B) / 2} ${bx} ${by}`;
    const outline = `M${gap.start} ${B}L16 ${B}Q4 ${B} 5 382C8 270 2 140 5 18Q5 5 16 5C180 2 300 8 500 5S820 3 984 5Q996 5 995 18C993 130 998 265 995 ${382 + FRAME.fold_reach * p - fy - jy}Q995 ${top - jy} ${right} ${top - jy}${diagonal}L${gap.end} ${B}`;
    return p > 0.001 ? outline + crease : outline;
}
