const configuration = {
    paths: ['features/api/**/*.feature'],
    import: [
        './00-tsx-register.mjs',
        './features/api/step-definitions/**/*.ts',
        './features/api/support/**/*.ts',
    ],
    format: ['@serenity-js/cucumber'],
    formatOptions: {
        specDirectory: './features/api',
    },
    parallel: 0,
    publish: false,
};

export default configuration;
