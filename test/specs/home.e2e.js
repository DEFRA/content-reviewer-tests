import { browser, expect } from '@wdio/globals'

import HomePage from '../page-objects/home.page.js'
import DeletePage from '../page-objects/deletePage.js'
import CommonUtils from '../helpers/commonUtils.js'
import SignInPage from '../page-objects/sigInPage.js'
import ReviewResults from '../page-objects/reviewResults.js'

describe('Plain Text Upload Validations', () => {
  it('Error message validations-plain texts-No text content provided', async () => {
    await HomePage.navigate()
    await SignInPage.signIn()
    await expect(await HomePage.isLoaded()).toBe(true)

    await HomePage.selectRadioOption('Insert text')

    // No text content provided
    await expect(HomePage.getCharacterCountMessage()).toHaveText(
      'You have 100000 characters remaining'
    )

    await HomePage.clickReviewContent()

    await expect(HomePage.getErrorHeader()).toHaveText('There is a problem')

    await expect(HomePage.getDisplayedErrorMessage()).toHaveText(
      'Enter text content for review'
    )

    await expect(HomePage.getDisplayedErrorSummaryMessage()).toHaveText(
      'Enter text content for review'
    )
  })

  it('Error message validations-plain texts-Less than 10 chars', async () => {
    // Less than 10 chars
    await HomePage.providePlainText('Lessthan10Char')
    await HomePage.clickReviewContent()

    await expect(HomePage.getDisplayedErrorMessage()).toHaveText(
      'Text content too short. Enter at least 10 characters'
    )

    await expect(HomePage.getDisplayedErrorSummaryMessage()).toHaveText(
      'Text content too short. Enter at least 10 characters'
    )

    await expect(HomePage.getCharacterCountMessage()).toHaveText(
      'You have 99994 characters remaining'
    )
  })

  it('Error message validations-plain texts-More than 100k characters', async () => {
    await HomePage.providePlainText('MoreThan100kChars')
    await HomePage.clickReviewContent()

    await expect(HomePage.getDisplayedErrorMessage()).toHaveText(
      'Text content too long. Maximum 100000 characters. Your content has 100140 characters.'
    )

    await expect(HomePage.getDisplayedErrorSummaryMessage()).toHaveText(
      'Text content too long. Maximum 100000 characters. Your content has 100140 characters.'
    )

    await expect(HomePage.getCharacterCountMessage()).toHaveText(
      'You have 140 characters too many'
    )
  })
})

describe('Clear text button Validations', () => {
  it('Clear text button for plain text', async () => {
    await HomePage.navigate()
    await SignInPage.signIn()
    await expect(await HomePage.isLoaded()).toBe(true)

    await HomePage.selectRadioOption('Insert text')
    await HomePage.providePlainText('Lessthan10Char')

    await expect(HomePage.getCharacterCountMessage()).toHaveText(
      'You have 99994 characters remaining'
    )

    await HomePage.clickClearText()

    await expect(HomePage.getCharacterCountMessage()).toHaveText(
      'You have 100000 characters remaining'
    )

    await expect(HomePage.getPlainText()).toHaveValue('')
  })
  it('Clear text button for URL Upload', async () => {
    await HomePage.selectRadioOption('URL upload')
    await HomePage.provideURL('google.co.uk')
    await HomePage.clickClearURLButton()
    await expect(HomePage.getUrlTextArea()).toHaveValue('')
  })
})

describe('URL Upload Validations', () => {
  it('Error message validations-URL upload-No URL provided', async () => {
    await HomePage.navigate()
    await SignInPage.signIn()
    await expect(await HomePage.isLoaded()).toBe(true)

    await HomePage.selectRadioOption('URL upload')

    await HomePage.clickReviewContent()

    await expect(HomePage.getErrorHeader()).toHaveText('There is a problem')

    await expect(HomePage.getDisplayedURLErrorMessage()).toHaveText(
      'Enter URL for content review'
    )

    await expect(HomePage.getDisplayedErrorSummaryMessage()).toHaveText(
      'Enter URL for content review'
    )
  })

  it('Error message validations-URL upload-Not a GOV.UK URL', async () => {
    await HomePage.provideURL('google.co.uk')
    await HomePage.clickReviewContent()

    await expect(HomePage.getDisplayedURLErrorMessage()).toHaveText(
      'Enter a valid GOV.UK URL'
    )

    await expect(HomePage.getDisplayedErrorSummaryMessage()).toHaveText(
      'Enter a valid GOV.UK URL'
    )
  })
  it('Error message validations-URL upload-More than 100k character URL', async () => {
    await HomePage.provideURL(
      'https://www.gov.uk/government/publications/guide-to-making-legislation/guide-to-making-legislation-html--2'
    )
    await HomePage.clickReviewContent()

    await expect(HomePage.getDisplayedURLErrorMessage()).toHaveText(
      'Extracted text is too long. Maximum 100000 characters. The webpage has 781684 characters'
    )

    await expect(HomePage.getDisplayedErrorSummaryMessage()).toHaveText(
      'Extracted text is too long. Maximum 100000 characters. The webpage has 781684 characters'
    )
  })
})

describe('Document Upload Validations', () => {
  it('Error message validations-Document upload-No document provided', async () => {
    await HomePage.navigate()
    await SignInPage.signIn()
    await expect(await HomePage.isLoaded()).toBe(true)

    await HomePage.selectRadioOption('File upload')

    await HomePage.clickReviewContent()

    await expect(HomePage.getErrorHeader()).toHaveText('There is a problem')

    await expect(HomePage.getDisplayedDocumentErrorMessage()).toHaveText(
      'Select a file to upload'
    )

    await expect(HomePage.getDisplayedErrorSummaryMessage()).toHaveText(
      'Select a file to upload'
    )
  })
  it('Error message validations-Document upload-Not a valid .docx or .pdf', async () => {
    CommonUtils.uploadFile('plainTextForValidation.txt')
    await HomePage.clickReviewContent()

    await expect(HomePage.getDisplayedDocumentErrorMessage()).toHaveText(
      'The selected file must be a PDF or Word document'
    )

    await expect(HomePage.getDisplayedErrorSummaryMessage()).toHaveText(
      'The selected file must be a PDF or Word document'
    )
  })
  it('Error message validations-Document upload-File larger than 10 MB -.docx', async () => {
    await CommonUtils.uploadFile('largerThan10Mb.docx')
    await HomePage.clickReviewContent()

    await expect(HomePage.getDisplayedDocumentErrorMessage()).toHaveText(
      'The selected file must be 10 MB or smaller'
    )

    await expect(HomePage.getDisplayedErrorSummaryMessage()).toHaveText(
      'The selected file must be 10 MB or smaller'
    )
  })
  it('Error message validations-Document upload-File larger than 10 MB -.pdf', async () => {
    await CommonUtils.uploadFile('largerThan10Mb.pdf')
    await HomePage.clickReviewContent()

    await expect(HomePage.getDisplayedDocumentErrorMessage()).toHaveText(
      'The selected file must be 10 MB or smaller'
    )

    await expect(HomePage.getDisplayedErrorSummaryMessage()).toHaveText(
      'The selected file must be 10 MB or smaller'
    )
  })
})

describe('Text Upload - E2E flow', () => {
  it('Submit & wait for text review to complete', async () => {
    await HomePage.navigate()
    await SignInPage.signIn()
    const reviewContent = CommonUtils.generateAutomationText(
      'Documentation for automation test suite for validating GOV.UK content formatting'
    )

    const reviewTitle = reviewContent.split('\n')[0]

    await expect(await HomePage.isLoaded()).toBe(true)

    await HomePage.selectRadioOption('Insert text')
    await HomePage.provideDynamicPlainText(reviewContent)
    await HomePage.clickReviewContent()

    const row = await HomePage.waitForStatusCompleted(reviewTitle)

    await expect(await HomePage.getStatusForRow(row)).toHaveText('Completed')

    const dateTimeText = await HomePage.getDateTimeForRow(row).getText()

    expect(dateTimeText).toMatch(/^\d{2}\/\d{2}\/\d{4},\s\d{2}:\d{2}$/)

    await HomePage.getViewResultsLink(row).click()

    await expect(browser).toHaveUrl(expect.stringContaining('/review/results/'))

    await browser.back()

    await HomePage.getDeleteLink(row).click()
    await DeletePage.expectConfirmationHeadingVisible()

    await DeletePage.cancelAndGoBack()

    await expect(row).toBeExisting()

    await HomePage.getDeleteLink(row).click()

    await DeletePage.expectConfirmationHeadingVisible()

    await DeletePage.clickConfirmDelete()

    await HomePage.clickHome()

    let confirmRowDeleted

    await browser.waitUntil(
      async () => {
        confirmRowDeleted = await HomePage.getRowByReviewName(reviewTitle)
        return confirmRowDeleted === null
      },
      {
        timeout: 10000,
        timeoutMsg: `Row "${reviewTitle}" was still present after delete`
      }
    )

    expect(confirmRowDeleted).toBeNull()
  })

  it('Submit text for review & verify review page', async () => {
    const reviewContent = CommonUtils.generateAutomationText(
      await CommonUtils.getTextFromFile('plainTextForValidation')
    )

    const reviewTitle = reviewContent.split('\n')[0]
    await HomePage.navigate()
    await SignInPage.signIn()
    await expect(await HomePage.isLoaded()).toBe(true)

    await HomePage.selectRadioOption('Insert text')
    await HomePage.provideDynamicPlainText(reviewContent)
    await HomePage.clickReviewContent()

    const row = await HomePage.waitForStatusCompleted(reviewTitle)

    await expect(await HomePage.getStatusForRow(row)).toHaveText('Completed')

    const dateTimeText = await HomePage.getDateTimeForRow(row).getText()

    expect(dateTimeText).toMatch(/^\d{2}\/\d{2}\/\d{4},\s\d{2}:\d{2}$/)

    await HomePage.getViewResultsLink(row).click()

    await expect(browser).toHaveUrl(expect.stringContaining('/review/results/'))

    await ReviewResults.isPageLoaded()
    const status = await ReviewResults.getOverallStatus()

    await expect(status).toBe('Completed')

    await ReviewResults.clickToggle()
    await ReviewResults.validateScorecard()
    // await ReviewResults.verifyCategoryScore('Plain English', '4/5')
    // await ReviewResults.verifyCategoryScore('GOV.UK Style Compliance', '3/5')

    await browser.back()

    await HomePage.getDeleteLink(row).click()

    await DeletePage.expectConfirmationHeadingVisible()

    await DeletePage.clickConfirmDelete()

    await HomePage.clickHome()

    let confirmRowDeleted

    await browser.waitUntil(
      async () => {
        confirmRowDeleted = await HomePage.getRowByReviewName(reviewTitle)
        return confirmRowDeleted === null
      },
      {
        timeout: 10000,
        timeoutMsg: `Row "${reviewTitle}" was still present after delete`
      }
    )

    expect(confirmRowDeleted).toBeNull()
  })
})

describe('URL Upload - E2E flow', () => {
  it('Submit & wait for URL review to complete', async () => {
    await HomePage.navigate()
    await SignInPage.signIn()

    await expect(await HomePage.isLoaded()).toBe(true)

    await HomePage.selectRadioOption('URL upload')
    await HomePage.provideURL(
      'https://www.gov.uk/guidance/flood-risk-assessment-standing-advice'
    )
    await HomePage.clickReviewContent()
    const reviewTitle = 'Preparing a flood risk assessment: standing advice'
    const row = await HomePage.waitForStatusCompleted(reviewTitle)

    await expect(await HomePage.getStatusForRow(row)).toHaveText('Completed')

    const dateTimeText = await HomePage.getDateTimeForRow(row).getText()

    expect(dateTimeText).toMatch(/^\d{2}\/\d{2}\/\d{4},\s\d{2}:\d{2}$/)

    await HomePage.getViewResultsLink(row).click()

    await expect(browser).toHaveUrl(expect.stringContaining('/review/results/'))

    await browser.back()

    await HomePage.getDeleteLink(row).click()
    await DeletePage.expectConfirmationHeadingVisible()

    await DeletePage.cancelAndGoBack()

    await expect(row).toBeExisting()

    await HomePage.getDeleteLink(row).click()

    await DeletePage.expectConfirmationHeadingVisible()

    await DeletePage.clickConfirmDelete()

    await HomePage.clickHome()

    let confirmRowDeleted

    await browser.waitUntil(
      async () => {
        confirmRowDeleted = await HomePage.getRowByReviewName(reviewTitle)
        return confirmRowDeleted === null
      },
      {
        timeout: 10000,
        timeoutMsg: `Row "${reviewTitle}" was still present after delete`
      }
    )

    expect(confirmRowDeleted).toBeNull()
  })
})

describe('Document Upload - E2E flow', () => {
  it('Submit & wait for Document review to complete-.docx', async () => {
    const reviewTitle = 'ValidDoc.docx'

    await HomePage.navigate()
    await SignInPage.signIn()
    await expect(await HomePage.isLoaded()).toBe(true)

    await HomePage.selectRadioOption('File upload')
    await CommonUtils.uploadFile(reviewTitle)
    await HomePage.clickReviewContent()

    const row = await HomePage.waitForStatusCompleted(reviewTitle)
    await expect(await HomePage.getStatusForRow(row)).toHaveText('Completed')
    const dateTimeText = await HomePage.getDateTimeForRow(row).getText()
    expect(dateTimeText).toMatch(/^\d{2}\/\d{2}\/\d{4},\s\d{2}:\d{2}$/)
    await HomePage.getViewResultsLink(row).click()

    await expect(browser).toHaveUrl(expect.stringContaining('/review/results/'))
    await ReviewResults.clickToggle()
    await ReviewResults.validateScorecard()
    await browser.back()

    await HomePage.getDeleteLink(row).click()
    await DeletePage.expectConfirmationHeadingVisible()
    await DeletePage.cancelAndGoBack()
    await expect(row).toBeExisting()
    await HomePage.getDeleteLink(row).click()
    await DeletePage.expectConfirmationHeadingVisible()
    await DeletePage.clickConfirmDelete()
    await HomePage.clickHome()
  })
  it('Submit & wait for Document review to complete-.pdf', async () => {
    const reviewTitle = 'ValidDoc.pdf'

    await HomePage.navigate()
    await SignInPage.signIn()
    await expect(await HomePage.isLoaded()).toBe(true)

    await HomePage.selectRadioOption('File upload')
    await CommonUtils.uploadFile(reviewTitle)
    await HomePage.clickReviewContent()

    const row = await HomePage.waitForStatusCompleted(reviewTitle)
    await expect(await HomePage.getStatusForRow(row)).toHaveText('Completed')
    const dateTimeText = await HomePage.getDateTimeForRow(row).getText()
    expect(dateTimeText).toMatch(/^\d{2}\/\d{2}\/\d{4},\s\d{2}:\d{2}$/)
    await HomePage.getViewResultsLink(row).click()

    await expect(browser).toHaveUrl(expect.stringContaining('/review/results/'))
    await browser.back()

    await HomePage.getDeleteLink(row).click()
    await DeletePage.expectConfirmationHeadingVisible()
    await DeletePage.cancelAndGoBack()
    await expect(row).toBeExisting()
    await HomePage.getDeleteLink(row).click()
    await DeletePage.expectConfirmationHeadingVisible()
    await DeletePage.clickConfirmDelete()
    await HomePage.clickHome()
    let confirmRowDeleted

    await browser.waitUntil(
      async () => {
        confirmRowDeleted = await HomePage.getRowByReviewName(reviewTitle)
        return confirmRowDeleted === null
      },
      {
        timeout: 10000,
        timeoutMsg: `Row "${reviewTitle}" was still present after delete`
      }
    )

    expect(confirmRowDeleted).toBeNull()
  })
})

describe('Sign In & Sign out', () => {
  it('Sign In successfully', async () => {
    await HomePage.navigate()
    await SignInPage.signIn()
    await SignInPage.validateSignOutLinkVisible()
    await expect(await HomePage.isLoaded()).toBe(true)
  })

  it('Sign out successfully', async () => {
    SignInPage.clickSignOut()
    SignInPage.clickSignOutUserByEmail()
    expect(await SignInPage.getLogoutMessage()).toContain(
      'You have been successfully logged out'
    )
    await SignInPage.clickSignInAgain()
    SignInPage.isSignInPageDisplayed()
  })
})

describe('Pagination', () => {
  it('User select number of reviews to display in Home page', async () => {
    await HomePage.navigate()
    await SignInPage.signIn()
    await expect(await HomePage.isLoaded()).toBe(true)
    await HomePage.applyFilterAndValidatePagination(100)
  })
})
