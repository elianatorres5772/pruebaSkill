import { Question } from '@serenity-js/core';
import { Page } from '@serenity-js/web';

export const WebsiteTitle = () =>
    Question.about('the current website title', actor =>
        actor.answer(Page.current().title()),
    );
