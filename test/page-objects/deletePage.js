import { Page } from './page.js'

class DeletePage extends Page {
  get confirmationHeading() {
    return $('.govuk-heading-l')
  }

  get deleteButton() {
    return $('button[type="submit"]=Delete')
  }

  get cancelLink() {
    return $('.govuk-back-link')
  }

  get successHeading() {
    return $('.govuk-panel__title')
  }

  get successMessage() {
    return $('.govuk-panel__body')
  }

  // ===== ACTIONS =====

  async clickConfirmDelete() {
    await this.deleteButton.waitForClickable()
    await this.deleteButton.click()
  }

  async cancelAndGoBack() {
    await this.cancelLink.waitForClickable()
    await this.cancelLink.click()
  }

  // ===== ASSERTIONS =====

  async expectConfirmationHeadingVisible() {
    await expect(this.confirmationHeading).toBeDisplayed()
  }

  async expectSuccessHeadingVisible() {
    await expect(this.successHeading).toBeDisplayed()
  }

  async expectSuccessMessageVisible() {
    await expect(this.successMessage).toBeDisplayed()
  }
}

export default new DeletePage()
