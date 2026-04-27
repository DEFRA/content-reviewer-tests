import { Page } from './page.js'

class ReviewResults extends Page {
  get reviewResultsHeading() {
    return $('.govuk-heading-xl')
  }

  get overallStatusHeading() {
    return $('h2.govuk-notification-banner__heading')
  }

  get overallStatusTag() {
    return $('h2.govuk-notification-banner__heading strong')
  }

  getRowByLabel(label) {
    return $(`//div[contains(@class,"govuk-summary-list__row")]
                  [.//dt[normalize-space()="${label}"]]`)
  }

  getScoreValue(label) {
    return this.getRowByLabel(label).$(
      `.//span[contains(@class,"score-value")]`
    )
  }

  async waitForPageToLoad() {
    await this.reviewResultsHeading.waitForDisplayed({
      timeout: 15000,
      timeoutMsg: 'Review Results Page did not load - heading not found'
    })
  }

  async getHeaderText() {
    await this.waitForPageToLoad()
    return this.reviewResultsHeading.getText()
  }

  async isPageLoaded() {
    await this.waitForPageToLoad()
    return this.reviewResultsHeading.isDisplayed()
  }

  async getOverallStatus() {
    await this.overallStatusTag.waitForDisplayed({
      timeout: 10000,
      timeoutMsg: 'Overall Status Tag not displayed'
    })

    return this.overallStatusTag.getText()
  }

  async isCompletedStatusDisplayed() {
    const status = await this.getOverallStatus()
    return status === 'Completed'
  }

  async getScore(label) {
    const score = await this.getScoreValue(label)
    await score.waitForDisplayed({
      timeout: 10000,
      timeoutMsg: `Score not displayed for ${label}`
    })
    return await score.getText()
  }

  async verifyCategoryScore(label, expectedScore) {
    const actualScore = await this.getScore(label)
    await expect(actualScore).toBe(expectedScore)
  }
}

export default new ReviewResults()
