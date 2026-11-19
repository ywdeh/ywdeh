import { cubicInOut, cubicOut } from 'svelte/easing';

export function reduced_motion() {
    return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function token(name, element = document.documentElement) {
    return getComputedStyle(element).getPropertyValue(name).trim();
}

export function token_ms(name, element) {
    const value = token(name, element);
    return parseFloat(value) * (value.endsWith('ms') ? 1 : 1000) || 0;
}

export function motion_ms(name, element) {
    return reduced_motion() ? 0 : token_ms(name, element);
}

export function overlay_pace() {
    return { duration: motion_ms('--duration-overlay'), easing: cubicOut };
}

export function flight_pace() {
    return { duration: motion_ms('--duration-flight'), easing: cubicInOut };
}
