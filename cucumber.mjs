const configuration = {
    paths: ['features/**/*.feature'],
    import: [
        './00-tsx-register.mjs',
        // {actor} and {pronoun}, used by the steps of every flow
        './features/support/parameter-types.ts',
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
