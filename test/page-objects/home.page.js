import { Page } from '../page-objects/page.js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
      'File upload': 'file'
    }

    const value = optionMap[optionName]

    if (!value) {
      throw new Error(`Invalid option: ${optionName}`)
    }

    await $(`input[type="radio"][value="${value}"]`).click()
  }

  async providePlainText(fileName) {
    const filePath = path.join(__dirname, '..', 'testdata', `${fileName}.txt`)

    const content = fs.readFileSync(filePath, 'utf-8')

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
    await this.textArea.setValue(text)
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

  async waitForStatusCompleted(reviewName, timeoutMs = 600000) {
    let foundRow

    await browser.waitUntil(
      async () => {
        await browser.refresh()

        const row = await this.getRowByReviewName(reviewName)

        if (!row) {
          return false // keep waiting
        }

        const status = (await this.getStatusForRow(row).getText()).trim()

        if (status === 'Completed') {
          foundRow = row
          return true
        }

        return false
      },
      {
        timeout: timeoutMs,
        interval: 2000, // replaces browser.pause(2000)
        timeoutMsg: `Status did not reach Completed for "${reviewName}"`
      }
    )
    return foundRow
  }
}

export default new HomePage()
