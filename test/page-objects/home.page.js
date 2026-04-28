import { Page } from '../page-objects/page.js'
import CommonUtils from '../helpers/commonUtils.js'
import logger from '@wdio/logger'

const log = logger('homePage')
class HomePage extends Page {
  get uploadButton() {
    return $('#uploadButton')
  }

  get errorMessage() {
    return $('#errorMessage')
  }

  get errorMessageForURL() {
    return $('#urlErrorMessage')
  }

  get errorSummaryMessage() {
    return $('#errorSummaryMessage')
  }

  get textArea() {
    return $('#text-content')
  }

  get textAreaSelector() {
    return '#text-content'
  }

  get urlTextArea() {
    return $('#url-input')
  }

  get characterCountMessage() {
    return $('#characterCountMessage')
  }

  get clearTextButton() {
    return $('button.app-clear-button=Clear text')
  }

  get clearURLButton() {
    return $('button.app-clear-button=Clear URL')
  }

  get tableBody() {
    return $('#reviewHistoryBody')
  }

  get rowElements() {
    return $$('tr.govuk-table__row')
  }

  get homeLink() {
    return $('a.govuk-service-navigation__link=Home')
  }

  get errorHeader() {
    return $('#error-summary-title')
  }

  get signInLink() {
    return $('a[href="/auth/login-page"].govuk-header__link')
  }

  get signOutLink() {
    return $('a[href="/auth/logout"].govuk-header__link')
  }

  get loggedInUserEmail() {
    return $('li.govuk-header__navigation-item')
  }

  async clickSignIn() {
    await this.signInLink.waitForClickable()
    await this.signInLink.click()
  }

  async clickSignOut() {
    await this.signOutLink.waitForClickable()
    await this.signOutLink.click()
  }

  async getLoggedInUser() {
    await this.loggedInUserEmail.waitForDisplayed()
    return this.loggedInUserEmail.getText()
  }

  getDisplayedErrorMessage() {
    return this.errorMessage
  }

  getDisplayedURLErrorMessage() {
    return this.errorMessageForURL
  }

  getDisplayedErrorSummaryMessage() {
    return this.errorSummaryMessage
  }

  getErrorHeader() {
    return this.errorHeader
  }

  getCharacterCountMessage() {
    return this.characterCountMessage
  }

  getPlainText() {
    return this.textArea
  }

  getUrlTextArea() {
    return this.urlTextArea
  }

  get reviewLimitSelect() {
    return $('#reviewLimit')
  }

  get paginationInfo() {
    return $('#paginationInfo')
  }

  get nextPageButton() {
    return $('li.govuk-pagination__item--next a')
  }

  get reviewRows() {
    return $$('table tbody tr')
  }

  open() {
    return super.open('/')
  }

  async navigate() {
    await browser.url('/')
  }

  async isLoaded() {
    const uploadBtn = await this.uploadButton

    await uploadBtn.waitForDisplayed()
    log.info('Home page displayed...')
    return await uploadBtn.isDisplayed()
  }

  async clickReviewContent() {
    await this.uploadButton.click()
  }

  async selectRadioOption(optionName) {
    const optionMap = {
      'Insert text': 'text',
      'URL upload': 'url',
      'File upload': 'file'
    }

    const value = optionMap[optionName]

    if (!value) {
      throw new Error(`Invalid option: ${optionName}`)
    }

    await $(`input[type="radio"][value="${value}"]`).click()
    log.info(`Radio option selected ${value}`)
  }

  async providePlainText(fileName) {
    const content = await CommonUtils.getTextFromFile(fileName)

    await this.textArea.click()
    await browser.keys(['Control', 'a'])
    await browser.keys('Backspace')
    await browser.execute(
      function (selector, value) {
        const el = document.querySelector(selector)
        if (!el) return

        el.focus()
        el.value = value
        el.dispatchEvent(new Event('input', { bubbles: true }))
        el.dispatchEvent(new Event('change', { bubbles: true }))
        el.blur()
      },
      this.textAreaSelector,
      content
    )
  }

  async provideDynamicPlainText(text) {
    await this.textArea.click()
    await browser.keys(['Control', 'a'])
    await browser.keys('Backspace')
    await browser.execute(
      function (selector, value) {
        const el = document.querySelector(selector)
        if (!el) return

        el.focus()
        el.value = value
        el.dispatchEvent(new Event('input', { bubbles: true }))
        el.dispatchEvent(new Event('change', { bubbles: true }))
        el.blur()
      },
      this.textAreaSelector,
      text
    )
  }

  async provideURL(url) {
    await this.urlTextArea.click()
    await browser.keys(['Control', 'a'])
    await browser.keys('Backspace')

    await this.urlTextArea.setValue(url)
  }

  async clickClearText() {
    await this.clearTextButton.click()
  }

  async clickClearURLButton() {
    await this.clearURLButton.click()
  }

  async clickHome() {
    await this.homeLink.click()
  }

  async getRowByReviewName(reviewTitlePrefix) {
    const rows = await this.rowElements

    for (const row of rows) {
      const text = (await row.getText()).trim()

      if (text.includes(reviewTitlePrefix)) {
        return row
      }
    }

    return null
  }

  getStatusForRow(row) {
    return row.$$('td')[1]
  }

  getDateTimeForRow(row) {
    return row.$$('td')[2]
  }

  getViewResultsLink(row) {
    return row.$('aria/View results')
  }

  getDeleteLink(row) {
    return row.$('aria/Delete')
  }

  async waitForStatusCompleted(reviewName, timeoutMs = 120000) {
    let foundRow

    await browser.waitUntil(
      async () => {
        await browser.refresh()

        const row = await this.getRowByReviewName(reviewName)

        if (!row) {
          return false // row not visible yet
        }

        const status = (await this.getStatusForRow(row).getText()).trim()

        // SUCCESS CASE
        if (status === 'Completed') {
          foundRow = row
          return true
        }

        // FAILURE CASE — stop immediately
        if (status === 'Failed') {
          throw new Error(`Review "${reviewName}" failed.`)
        }

        return false
      },
      {
        timeout: timeoutMs,
        interval: 2000, // replaces browser.pause(2000)
        timeoutMsg: `Timeout after ${timeoutMs}ms waiting for status "Completed" for "${reviewName}".`
      }
    )

    return foundRow
  }

  async selectReviewLimit(limit) {
    await this.reviewLimitSelect.waitForDisplayed({ timeout: 60000 })
    await this.reviewLimitSelect.selectByAttribute('value', String(limit))
  }

  async getPaginationCounts() {
    await this.paginationInfo.waitForDisplayed()

    const text = await this.paginationInfo.getText()
    const match = text.match(/Showing\s+\d+\s+to\s+(\d+)\s+of\s+(\d+)/i)

    if (!match) {
      throw new Error(`Unexpected pagination text: ${text}`)
    }

    return {
      shown: Number(match[1]),
      total: Number(match[2])
    }
  }

  async waitForPaginationToChange(previousShown) {
    await browser.waitUntil(
      async () => {
        const { shown } = await this.getPaginationCounts()
        return shown > previousShown
      },
      {
        timeout: 30000,
        timeoutMsg: 'Pagination did not advance'
      }
    )
  }

  async applyFilterAndValidatePagination(limit) {
    //  Apply filter
    await this.selectReviewLimit(limit)

    // Wait for pagination info to appear
    await this.paginationInfo.waitForDisplayed({ timeout: 60000 })

    let pageNumber = 1

    // Read initial pagination state
    let { shown, total } = await this.getPaginationCounts()

    // Edge case: no reviews
    if (total === 0) {
      return
    }

    const expectedPageSize = 25

    // Pagination loop
    while (true) {
      // Rows on current page
      const rows = await this.reviewRows
      const rowCount = rows.length

      // Calculate expected rows for this page
      const remainingRecords = total - (shown - rowCount)
      const expectedRowsOnPage =
        remainingRecords >= expectedPageSize
          ? expectedPageSize
          : remainingRecords

      // Assertion
      expect(rowCount).toBe(
        expectedRowsOnPage,
        `Page ${pageNumber} expected ${expectedRowsOnPage} rows but found ${rowCount}`
      )

      // Stop condition
      if (shown >= total) {
        break
      }

      // Go to next page
      await this.nextPageButton.waitForClickable()
      await this.nextPageButton.click()

      // Wait until pagination advances
      await this.waitForPaginationToChange(shown)

      // Update pagination state
      ;({ shown, total } = await this.getPaginationCounts())

      pageNumber++
    }
  }
}

export default new HomePage()
