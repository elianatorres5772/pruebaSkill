import { defineParameterType } from '@cucumber/cucumber';
import { actorCalled, actorInTheSpotlight } from '@serenity-js/core';

defineParameterType({
    regexp: /[A-Z][a-z]+/,
    name: 'actor',
    transformer: (name: string) => actorCalled(name),
});

defineParameterType({
    regexp: /he|she|they|his|her|their/,
    name: 'pronoun',
    transformer: () => actorInTheSpotlight(),
});
