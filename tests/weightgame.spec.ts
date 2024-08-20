import { test, expect } from "@playwright/test";
import { WeightsPage } from "../page_object/weightsPage";

test.describe("Weight Game", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://sdetchallenge.fetch.com/");
  });

  test("find fake gold bar for minimum number of weighings", async ({
    page,
  }) => {
    const coinGroups = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
    ];
    const weightsPage = new WeightsPage(page);
    page.on("dialog", async (dialog) => {
      const alertText = dialog.message();
      console.log(`alert text is ${alertText}`);
      expect(alertText).toBe("Yay! You find it!");
      await dialog.accept();
    });
    const lightCoin = await weightsPage.selectFakeBar(coinGroups);
    console.log(`fake gold bar is: ${lightCoin} gold bar`);
    const weights = weightsPage.getWeightRecordsCount();
    console.log(`Number of weighings is: ${weights}`);
    expect(weightsPage.getWeightRecordsCount()).toBeLessThan(5);
    const weigh_results = await weightsPage.getWeightResults();
    weigh_results.forEach((result) => {
      console.log(result);
    });
  });
});
