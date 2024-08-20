import { Locator, Page } from "@playwright/test";

export class WeightPageLocators {
    readonly reset_button: Locator;
    readonly weigh_button: Locator;
    readonly result_icon: Locator;
    readonly weight_results: Locator;
    readonly page: Page

    constructor(page: Page) {
        this.page = page;
        this.reset_button = page.locator('#reset').nth(1);
        this.weigh_button = page.locator('#weigh');
        this.result_icon = page.locator('#reset').nth(0);
        this.weight_results = page.locator('li');
    }


}