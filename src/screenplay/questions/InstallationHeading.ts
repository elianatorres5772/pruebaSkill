import { Question } from '@serenity-js/core';
import { Text } from '@serenity-js/web';

import { PlaywrightWebsite } from '../ui/PlaywrightWebsite.js';

export const InstallationHeading = () =>
    Question.about('the installation heading', actor =>
        actor.answer(Text.of(PlaywrightWebsite.installationHeading())),
    );
