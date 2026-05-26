import { Page } from '../page-objects/page.js'
import allure from '@wdio/allure-reporter'
import CommonUtils from '../helpers/commonUtils.js'

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

  get errorMessageForDocument() {
    return $('#documentErrorMessage')
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

  getDisplayedDocumentErrorMessage() {
    return this.errorMessageForDocument
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
    return await uploadBtn.isDisplayed()
  }

  async clickReviewContent() {
    await this.uploadButton.click()
  }

  async selectRadioOption(optionName) {
    const optionMap = {
      'Insert text': 'text',
      'URL upload': 'url',
      'File upload': 'document'
    }

    const value = optionMap[optionName]

    if (!value) {
      throw new Error(`Invalid option: ${optionName}`)
    }

    await $(`input[type="radio"][value="${value}"]`).click()
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

  cleanText(str) {
    return String(str)
      .replace(/\.\.\.|…/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  get rowElements() {
    return $$('table tbody tr')
  }

  async getRowByReviewName(reviewTitle) {
    const expected = this.cleanText(reviewTitle)

    const rows = await this.rowElements

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]

      let rowText = ''
      try {
        rowText = await row.getText()
      } catch (error) {
        allure.addAttachment(
          ` Could not read row ${i}: ${error.message}`,
          '',
          'text/plain'
        )
        continue
      }

      const cells = await row.$$('td')

      allure.addAttachment(
        `Row ${i} full text: "${this.cleanText(rowText)}"`,
        '',
        'text/plain'
      )

      if (!cells || cells.length < 2) {
        continue
      }

      const uploadedContentRaw = await cells[0].getText()
      const uploadedContent = this.cleanText(uploadedContentRaw)

      if (uploadedContent === expected) {
        return row
      }
    }

    allure.addAttachment(`No matching row found`, '', 'text/plain')
    return null
  }

  async getStatusForRow(row) {
    const cells = await row.$$('td')

    if (!cells || cells.length < 2) {
      throw new Error(
        `Invalid row structure. Expected at least 2 cells, found ${cells.length}`
      )
    }

    return cells[1]
  }

  async waitForStatusCompleted(reviewTitle, timeoutMs = 120000) {
    let foundRow
    let status
    let lastStatus = 'NOT_READ_YET'

    allure.addAttachment(
      `INPUT reviewTitle: "${reviewTitle}"`,
      '',
      'text/plain'
    )

    try {
      await browser.waitUntil(
        async () => {
          const table = await $('table')
          await table.waitForExist({ timeout: 10000 })
          const row = await this.getRowByReviewName(reviewTitle)

          if (!row) {
            await browser.waitUntil(
              async () => {
                const currentRows = await $$('table tbody tr')
                return currentRows.length > 0
              },
              {
                timeout: 10000,
                timeoutMsg: 'Table rows did not appear after refresh'
              }
            )

            return false
          }

          let statusRaw

          try {
            const statusElement = await this.getStatusForRow(row)
            statusRaw = await statusElement.getText()
            status = this.cleanText(statusRaw)
            lastStatus = status
          } catch (error) {
            allure.addAttachment(
              `Failed to read status: ${error.message}`,
              '',
              'text/plain'
            )
            return false
          }

          if (status === 'Completed') {
            allure.addAttachment(
              'Status changed to Completed',
              '',
              'text/plain'
            )
            foundRow = row
            return true
          }

          if (status === 'Failed') {
            allure.addAttachment(
              `Review "${reviewTitle}" failed.`,
              '',
              'text/plain'
            )
            throw new Error(`Review "${reviewTitle}" failed.`)
          }

          if (status === 'Pending') {
            allure.addAttachment(
              `Review "${reviewTitle}" status PENDING.`,
              '',
              'text/plain'
            )
            return false
          }

          if (status === 'Processing') {
            await browser.refresh()

            await browser.waitUntil(
              async () => {
                const currentRows = await $$('table tbody tr')
                return currentRows.length > 0
              },
              {
                timeout: 10000,
                timeoutMsg: 'Table rows did not appear after processing refresh'
              }
            )

            return false
          }

          return false
        },
        {
          timeout: timeoutMs,
          interval: 2000
        }
      )

      return foundRow
    } catch (error) {
      const screenshot = await browser.takeScreenshot()
      allure.addAttachment(
        'Time out on status change',
        Buffer.from(screenshot, 'base64'),
        'image/png'
      )
      throw new Error(
        `❌ Timeout after ${timeoutMs}ms waiting for "${reviewTitle}" to complete. Last status: "${lastStatus}"`
      )
    }
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
