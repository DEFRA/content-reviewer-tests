import { Page } from './page.js'
import HomePage from '../page-objects/home.page.js'
import logger from '@wdio/logger'

const log = logger('signInPage')

class SignInPage extends Page {
  get signInHeader() {
    return $('h1.govuk-heading-l')
  }

  get startSignInBtn() {
    return $('a.govuk-button--start[href="/auth/login"]')
  }

  get continueWithoutSignInLink() {
    return $('a[href="/"].govuk-link')
  }

  get passwordField() {
    return $('input[type="password"]')
  }

  get emailField() {
    return $('input[type="email"]')
  }

  get nextButton() {
    return $('input[type="submit"]')
  }

  get signInOtherWay() {
    return $('#idA_PWD_SwitchToCredPicker')
  }

  get loggedInEmail() {
    return $('//li[contains(@class,"govuk-header__navigation-item")][2]')
  }

  get useMyPasswordOption() {
    return $('//div[text()="Use my password"]')
  }

  get useAnotherAccount() {
    return $('#otherTileText')
  }

  get logoutSuccessMsg() {
    return $('h1.govuk-panel__title')
  }

  get contentReviewToolText() {
    return $('div.govuk-panel__body')
  }

  get returnHomeLink() {
    return $('a.govuk-link[href="/"]')
  }

  get signInAgainBtn() {
    return $('a.govuk-button[href="/auth/login-page"]')
  }

  get signOutLink() {
    return $('a[href="/auth/logout"]')
  }

  get dontShowAgainCheckbox() {
    return $('#KmsiCheckboxField')
  }

  get yesButtonForStaySignedIn() {
    return $('#idSIButton9')
  }

  async getLogoutMessage() {
    log.info('Waiting for logout success message...')
    await this.logoutSuccessMsg.waitForDisplayed({
      timeout: 30000,
      timeoutMsg: 'Logout success message did not appear within 30 seconds'
    })
    return await this.logoutSuccessMsg.getText()
  }

  async clickReturnToHomepage() {
    await this.returnHomeLink.waitForClickable()
    await this.returnHomeLink.click()
  }

  async clickSignInAgain() {
    await this.signInAgainBtn.waitForClickable()
    await this.signInAgainBtn.click()
  }

  async clickStartSignIn() {
    await this.startSignInBtn.waitForClickable()
    await this.startSignInBtn.click()
  }

  async clickContinueWithoutSignIn() {
    await this.continueWithoutSignInLink.waitForClickable()
    await this.continueWithoutSignInLink.click()
  }

  async isSignInPageDisplayed() {
    await this.signInHeader.waitForDisplayed()
    log.info('Waiting for sign-in page displayed...')
    return this.signInHeader.isDisplayed()
  }

  async typeEmail(email) {
    const exists = await this.useAnotherAccount
      .waitForExist({
        timeout: 2000,
        reverse: false
      })
      .catch(() => false)

    if (exists) {
      await this.useAnotherAccount.click()
    }
    log.info('Waiting for email field to be displayed...')
    await this.emailField.waitForDisplayed()
    await this.emailField.clearValue()
    await this.emailField.setValue(email)
  }

  async typePassword(password) {
    await this.passwordField.waitForDisplayed()
    await this.passwordField.clearValue()
    await this.passwordField.setValue(password)
  }

  async clickSignInOtherWay() {
    const exists = await this.signInOtherWay
      .waitForExist({
        timeout: 1000
      })
      .catch(() => false)

    if (exists) {
      await this.signInOtherWay.waitForClickable()
      await this.signInOtherWay.click()
    }
  }

  async clickNextOrSignInButton() {
    await this.nextButton.waitForClickable()
    await this.nextButton.click()
  }

  async clickUseMyPassword() {
    const exists = await this.useMyPasswordOption
      .waitForExist({
        timeout: 1000
      })
      .catch(() => false)

    if (exists) {
      await this.useMyPasswordOption.waitForClickable()
      await this.useMyPasswordOption.click()
    }
  }

  async clickSignOut() {
    await this.signOutLink.waitForClickable()
    await this.signOutLink.click()
  }

  async getLoggedInEmailText() {
    await this.loggedInEmail.waitForDisplayed()
    return await this.loggedInEmail.getText()
  }

  async validateSignOutLinkVisible() {
    await this.signOutLink.waitForDisplayed()
  }

  getUserTileByEmailInsensitive(email) {
    return $(
      `//small[` +
        `contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),` +
        `'${email.toLowerCase()}')` +
        `]/ancestor::div[contains(@class,"table-cell")]`
    )
  }

  async clickSignOutUserByEmail() {
    const userTile = await this.getUserTileByEmailInsensitive(
      process.env.TEST_USERNAME
    )
    await userTile.waitForClickable()
    await userTile.click()
  }

  async signIn() {
    const userName = process.env.TESTUSER_USERNAME
    const password = process.env.TESTUSER_PASSWORD
    if (userName.startsWith('XXXX') || password.startsWith('XXXX')) {
      throw new Error(
        'Credentials are not set. Please configure TEST_USERNAME and TEST_PASSWORD.'
      )
    }

    await HomePage.clickSignIn()
    this.isSignInPageDisplayed()

    await this.clickStartSignIn()
    await this.typeEmail(userName)
    await this.clickNextOrSignInButton()
    await this.clickSignInOtherWay()
    await this.clickUseMyPassword()
    await this.typePassword(password)
    await this.clickNextOrSignInButton()
    await this.acceptStaySignedIn()
    expect((await this.getLoggedInEmailText()).trim().toLowerCase()).toContain(
      userName.trim().toLowerCase()
    )
  }

  async acceptStaySignedIn() {
    if (await this.dontShowAgainCheckbox.isExisting()) {
      await this.selectDontShowAgain()
      await this.clickYesForStaySignedIn()
    }
  }

  async selectDontShowAgain() {
    await this.dontShowAgainCheckbox.waitForExist({ timeout: 5000 })

    if (!(await this.dontShowAgainCheckbox.isSelected())) {
      await this.dontShowAgainCheckbox.click()
    }
  }

  async clickYesForStaySignedIn() {
    await this.yesButtonForStaySignedIn.waitForClickable({ timeout: 10000 })
    await this.yesButtonForStaySignedIn.click()
  }
}

export default new SignInPage()
