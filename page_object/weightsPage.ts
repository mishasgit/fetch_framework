import { Page } from "@playwright/test";
import { WeightPageLocators } from "./locators/weightPageLocators";

export class WeightsPage {
  private readonly page: Page;
  readonly l: WeightPageLocators;
  private LEFT = "left";
  private RIGHT = "right";
  // This is used to keep track of the number of weights for the instance
  private count_weights_records = 1;

  constructor(page: Page) {
    this.page = page;
    this.l = new WeightPageLocators(page);
  }
  /*
   * This function is used to create the locator string for the left bowl cell
   * @param index: the index of the cell
   * @returns the locator string
   * */
  getLeftBowlCell(index: number) {
    return `#left_${index}`;
  }
  /*
   * This function is used to create the locator string for the right bowl cell
   * @param index: the index of the cell
   * @returns the locator string
   * */
  getRightBowlCell(index: number) {
    return `#right_${index}`;
  }
  /*
   * This function is used to create the locator string for the answer coin
   * @param index: the index of the coin
   * @returns the locator string
   * */
  getAnswerCoin(index: number) {
    return `#coin_${index}`;
  }

  /*
   * This function is used to fill the bowl with gold bars
   * @param side: the side of the bowl
   * @param coins: the gold bars to fill the bowl
   * */

  private async fillBowl(side: string, goldBars: number[]) {
    for (let i = 0; i < goldBars.length; i++) {
      const bowlCell =
        side === "left" ? this.getLeftBowlCell(i) : this.getRightBowlCell(i);
      this.checkIfFilledAndClear(bowlCell);
      await this.page.locator(bowlCell).fill(goldBars[i].toString());
    }
  }

  /*
   * This function is used to check if a bowl is filled and clear it
   * @param locString: the locator string
   * */
  private async checkIfFilledAndClear(locString: string) {
    const loc = this.page.locator(locString);
    await loc.waitFor({ state: "attached" });
    if ((await loc.textContent()) !== "") {
      await loc.clear();
    }
  }

  /*
   * This function is used to weigh the coins and get the results
   * @returns the results of the weighing
   * */
  private async weightAndGetResults() {
    await this.l.weigh_button.click();
    await this.waitForWeightResults();
    const result = await this.l.result_icon.textContent();
    if (result === "<") {
      return this.LEFT;
    } else if (result === ">") {
      return this.RIGHT;
    } else {
      return "even";
    }
  }

  /*
   * This function is used to swap the golden bars and get the lighter bar
    * @param lighter: the lighter bar
    * @param larger: the larger bar
    * @returns the lighter bar
    * */
  private async swapBarsAndGetLighter(lighter: number[], larger: number[]) {
    await this.fillBowl(this.LEFT, lighter);
    await this.fillBowl(this.RIGHT, larger);
    for (let i = 0; i < lighter.length; i++) {
      // If we are at the last bar, it is the lighter bar
      if (i === lighter.length - 1) {
        return lighter[i];
      }
      const leftBowlCell = this.page.locator(this.getLeftBowlCell(i));
      const rightBowlCell = this.page.locator(this.getRightBowlCell(i));
      const lighterBar = lighter[i];
      const largerBar = larger[i];
      await leftBowlCell.fill(largerBar.toString());
      await rightBowlCell.fill(lighterBar.toString());
      if ((await this.weightAndGetResults()) === this.RIGHT) {
        return lighterBar;
      }
    }
    // This should never happen
    return -1;
  }

  /*
   * This function is used to select the correct coin
   * @param coinGroups: the groups of coins
   * */
  async selectFakeBar(barGroups: number[][]) {
    for (let i = 0; i < barGroups.length; i++) {
      const left = barGroups[i];
      const right = barGroups[i + 1];
      await this.fillBowl(this.LEFT, left);
      await this.fillBowl(this.RIGHT, right);
      const result = await this.weightAndGetResults();
      // If the result is not even, we have found the lighter coin
      let fakeBar: number;
      if (result === this.LEFT) {
        fakeBar = await this.swapBarsAndGetLighter(left, right);
      } else if (result === this.RIGHT) {
        fakeBar = await this.swapBarsAndGetLighter(right, left);
      } else {
        continue;
      }
      await this.page
          .locator(
            this.getAnswerCoin(fakeBar)
          )
          .click();
          return fakeBar;
    }
  }

  /*
   * This function is used to wait for the weight results
   * */
  private async waitForWeightResults() {
    const count = await this.l.weight_results.count();
    if (count === this.count_weights_records) {
      this.count_weights_records++;
      return;
    } else {
      await this.page.waitForTimeout(50);
      await this.waitForWeightResults();
    }
  }

  /*
   * This function is used to reset the game
   * */
  async resetgame() {
    await this.l.reset_button.click();
    this.count_weights_records = 1;
  }

  /*
   * This function is used to get the number of weight records
   * @returns the number of weight records
   * */
  getWeightRecordsCount() {
    return this.count_weights_records - 1;
  }

  /*
   * This function is used to get the weight results
   * @returns the weight results
   * */
  async getWeightResults() {
    const values = await this.l.weight_results.allTextContents();
    return values;
  }
}
