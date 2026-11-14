import { cubicInOut, cubicOut } from 'svelte/easing';
export const OVERLAY_MS = 350;
export const overlay_ease = cubicOut;
export const FLIGHT_MS = 450;
export const FLIGHT_EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';
export const flight_ease = cubicInOut;
export function reduced_motion() {
    return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}
export function motion_time(ms) {
    return reduced_motion() ? 0 : ms;
}
export function css_time(element, name) {
    const value = getComputedStyle(element).getPropertyValue(name).trim();
    return parseFloat(value) * (value.endsWith('ms') ? 1 : 1000);
}

export function overlay_pace() {
    return { duration: motion_time(OVERLAY_MS), easing: overlay_ease };
}
