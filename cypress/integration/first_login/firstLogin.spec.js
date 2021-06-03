/// <reference types="cypress"/>
import { authPage } from "../../support/page_objects/loginPage"
import { navigateTo } from "../../support/page_objects/navigationPage"

describe('First Login', () => {
    it('If you see button [CLEAR DATA & RESET] click on it', () => {
        cy.visit('/')
        authPage.clearDataAndReset()
    })
    it('Password, Confirm password input will be visible', () => {
        cy.get('[placeholder="Password"]').should('be.visible')
        cy.get('[placeholder="Confirm password"]').should('be.visible')
    })
    it('[SAVE CREDENTIALS] button will be disabled ', () => {
        cy.get('[class="hfui-button green disabled"]').contains('Save Credentials')
    })
    it('Type inputs that are not matching and [SAVE CREDENTIALS] will be disabled', () => {
        const password = 'test1'
        cy.get('form').then(form => {
        cy.wrap(form).find('[placeholder="Password"]').type(password)
        authPage.saveCredentialsDisabled()
        cy.wrap(form).find('[placeholder="Confirm password"]').type(password + "23")
        authPage.saveCredentialsDisabled()
        cy.wrap(form).find('[placeholder="Password"]').clear().type(password)
        cy.wrap(form).find('[placeholder="Confirm password"]').clear().type(password.toUpperCase())
        authPage.saveCredentialsDisabled()
        })
    })
    it('Type matching passwords and click eye icon, will reveled content, [SAVE CREDENTIALS] button will be enabled', () => {
        const password = 'test1'
        cy.get('form').then(form => {
            cy.wrap(form).find('[placeholder="Confirm password"]').clear().type(password)
            cy.wrap(form).find('button').should('not.have.class', 'disabled')
        })
    })

    it('Click [SAVE CREDENTIALS] and new page will be open', () => {
        cy.get('button').contains('Save Credentials').click()
    })
    it('Verify tour pointer on Trading Terminal', () => {
        navigateTo.tradingTerminalPage()
        cy.firstLoginTour(4)
    })
    it('Verify tour pointer on Market Data', () => {
        navigateTo.marketDataPage()
        cy.firstLoginTour(0)
    })
    it('Verify tour pointer on Strategy Editor', () => {
        navigateTo.strategyEditorPage()
        cy.firstLoginTour(2)
    })
    it('Verify that API banner is visible on Order Form', () => {
        navigateTo.tradingTerminalPage()
        //Click on any order form element
        let randomPick = Math.floor(Math.random()) * 15
        cy.get('.hfui-orderformmenu__wrapper li').eq(randomPick).click()
        cy.get('.icon-api').should('be.visible').click()
        cy.get('.hfui-orderform__modal-form').should('be.visible')
        cy.get('.hfui-orderform__modal-buttons').should('be.visible')
    })
})