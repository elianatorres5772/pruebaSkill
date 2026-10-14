import type { Actor, Cast } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import type { Page } from 'playwright';

import {
    DEFAULT_ACTION_TIMEOUT,
    DEFAULT_NAVIGATION_TIMEOUT,
} from '../../config/environment.js';

export class AutomationActors implements Cast {
    constructor(private readonly page: Page) {
    }

    prepare(actor: Actor): Actor {
        return actor.whoCan(
            BrowseTheWebWithPlaywright.usingPage(this.page, {
                defaultNavigationTimeout: DEFAULT_NAVIGATION_TIMEOUT,
                defaultTimeout: DEFAULT_ACTION_TIMEOUT,
            }),
        );
    }
}
