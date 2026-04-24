import { browser, expect } from '@wdio/globals'

import HomePage from '../page-objects/home.page.js'
import DeletePage from '../page-objects/deletePage.js'
import CommonUtils from '../helpers/commonUtils.js';

describe('Home Page', () => {
    it('Homepage loads successfully', async () => {        

        await HomePage.open()
        const loaded = await HomePage.isLoaded();
        await expect(loaded).toBe(true);
    });
});


describe('Plain Text Upload Validations', () => {
    it('Error message validations for plain texts upload', async () => {

        await HomePage.navigate();
        await expect(await HomePage.isLoaded()).toBe(true);

        await HomePage.selectRadioOption('Insert text');

        // No text content provided
        await expect(HomePage.getCharacterCountMessage())
            .toHaveText('You have 100000 characters remaining');

        await HomePage.clickReviewContent();

        await expect(HomePage.getErrorHeader())
            .toHaveText('There is a problem');

        await expect(HomePage.getDisplayedErrorMessage())
            .toHaveText('Enter text content for review');

        await expect(HomePage.getDisplayedErrorSummaryMessage())
            .toHaveText('Enter text content for review');

        // Less than 10 chars    
        await HomePage.providePlainText('Lessthan10Char');
        await HomePage.clickReviewContent();

        await expect(HomePage.getDisplayedErrorMessage())
            .toHaveText('Text content too short. Enter at least 10 characters');

        await expect(HomePage.getDisplayedErrorSummaryMessage())
            .toHaveText('Text content too short. Enter at least 10 characters');

        await expect(HomePage.getCharacterCountMessage())
            .toHaveText('You have 99994 characters remaining');

        //More than 100k characters provided
        await HomePage.providePlainText('MoreThan100kChars');
        await HomePage.clickReviewContent();

        await expect(HomePage.getDisplayedErrorMessage())
            .toHaveText('Text content too long. Maximum 100000 characters. Your content has 100140 characters.');

        await expect(HomePage.getDisplayedErrorSummaryMessage())
            .toHaveText('Text content too long. Maximum 100000 characters. Your content has 100140 characters.');

        await expect(HomePage.getCharacterCountMessage())
            .toHaveText('You have 140 characters too many');
    });
});

describe('Clear text button Validations', () => {
    it('Clear text button for plain text & URL Upload', async () => {

        await HomePage.navigate();
        await expect(await HomePage.isLoaded()).toBe(true);

        await HomePage.selectRadioOption('Insert text');
        await HomePage.providePlainText('Lessthan10Char');

        await expect(HomePage.getCharacterCountMessage())
            .toHaveText('You have 99994 characters remaining');

        await HomePage.clickClearText();

        await expect(HomePage.getCharacterCountMessage())
            .toHaveText('You have 100000 characters remaining');

        await expect(HomePage.getPlainText()).toHaveValue('');

        //URL Upload
        await HomePage.selectRadioOption('URL upload');
        await HomePage.provideURL('google.co.uk');
        await HomePage.clickClearURLButton();

        await expect(HomePage.getUrlTextArea()).toHaveValue('');
    });
});

describe('URL Upload Validations', () => {
    it('Error message validations for URL upload', async () => {

        await HomePage.navigate();
        await expect(await HomePage.isLoaded()).toBe(true);

        await HomePage.selectRadioOption('URL upload');

        //URL not provided    
        await HomePage.clickReviewContent();

        await expect(HomePage.getErrorHeader())
            .toHaveText('There is a problem');

        await expect(HomePage.getDisplayedURLErrorMessage())
            .toHaveText('Enter URL for content review');

        await expect(HomePage.getDisplayedErrorSummaryMessage())
            .toHaveText('Enter URL for content review');

        //Invalid URL   
        await HomePage.provideURL('google.co.uk');
        await HomePage.clickReviewContent();

        await expect(HomePage.getDisplayedURLErrorMessage())
            .toHaveText('Enter a valid GOV.UK URL');

        await expect(HomePage.getDisplayedErrorSummaryMessage())
            .toHaveText('Enter a valid GOV.UK URL');
    });
});

describe('Text Upload - E2E flow', () => {
    it('Submit & wait for text review to complete', async () => {

        const reviewContent = CommonUtils.generateAutomationText(
            'Documentation for automation test suite for validating GOV.UK content formatting'
        );

        const reviewTitle = reviewContent.split('\n')[0];
        // const reviewTitle = 'Automation 15/04/2026 11:44:11AM';
        await HomePage.navigate();
        await expect(await HomePage.isLoaded()).toBe(true);

        await HomePage.selectRadioOption('Insert text');
        await HomePage.provideDynamicPlainText(reviewContent);
        await HomePage.clickReviewContent();

        const row = await HomePage.waitForStatusCompleted(reviewTitle);

        await expect(HomePage.getStatusForRow(row))
            .toHaveText('Completed');

        const dateTimeText =
            await HomePage.getDateTimeForRow(row).getText();

        expect(dateTimeText)
            .toMatch(/^\d{2}\/\d{2}\/\d{4},\s\d{2}:\d{2}$/);

        await HomePage.getViewResultsLink(row).click();

        await expect(browser)
            .toHaveUrl(expect.stringContaining('/review/results/'));

        await browser.back();

        await HomePage.getDeleteLink(row).click();
        await DeletePage.expectConfirmationHeadingVisible();

        await DeletePage.cancelAndGoBack();
        
        await expect(row).toBeExisting();

        await HomePage.getDeleteLink(row).click();

        await DeletePage.expectConfirmationHeadingVisible();

        await DeletePage.clickConfirmDelete();

        await HomePage.clickHome();
        
        
        let confirmRowDeleted;

        await browser.waitUntil(async () => {
            confirmRowDeleted = await HomePage.getRowByReviewName(reviewTitle);
            return confirmRowDeleted === null;
        }, {
            timeout: 10000,
            timeoutMsg: `Row "${reviewTitle}" was still present after delete`
        });

        expect(confirmRowDeleted).toBeNull();
    });
});
