import adapter from '@sveltejs/adapter-cloudflare';

export default {
    compilerOptions: {
        runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true),
    },
    kit: { adapter: adapter() },
};
