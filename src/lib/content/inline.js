const MARKS = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;

export function inline_parts(text) {
    const parts = [];
    let last = 0;
    for (const match of text.matchAll(MARKS)) {
        if (match.index > last) parts.push({ text: text.slice(last, match.index) });
        parts.push(match[1] ? { text: match[1], strong: true } : { text: match[2], href: match[3] });
        last = match.index + match[0].length;
    }
    if (last < text.length) parts.push({ text: text.slice(last) });
    return parts;
}
