import { Task } from '@serenity-js/core';
import { Navigate } from '@serenity-js/web';

import { ARAJET_BASE_URL } from '../../config/environment.js';

export const OpenArajet = {
    homePage: () =>
        Task.where(
            '#actor opens the Arajet home page',
            Navigate.to(ARAJET_BASE_URL),
        ),
};
