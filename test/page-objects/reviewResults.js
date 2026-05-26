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

  get showToggleText() {
    return $('.govuk-accordion__section-toggle-text')
  }

  async clickToggle() {
    await this.showToggleText.waitForDisplayed()
    await this.showToggleText.click()
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

  async validateScorecard() {
    const rows = await $$('.govuk-summary-list__row')

    if (!rows.length) throw new Error('No scorecard rows found')

    for (const row of rows) {
      const key = await row.$('.govuk-summary-list__key').getText()
      const score = await row.$('.score-value').getText()
      const note = await row.$('.score-note').getText()

      if (!key) throw new Error('Missing key')
      if (!/^[0-5]\/5$/.test(score)) throw new Error(`Invalid score: ${score}`)
      if (!note) throw new Error('Missing score note')
    }
  }
}

export default new ReviewResults()
