const configuration = {
    paths: ['features/**/*.feature'],
    import: [
        './00-tsx-register.mjs',
        './features/**/*.steps.ts',
        './features/**/*.config.ts',
    ],
    format: ['@serenity-js/cucumber'],
    formatOptions: {
        specDirectory: './features',
    },
    parallel: 0,
    publish: false,
};

export default configuration;
