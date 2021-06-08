/// <reference types="cypress"/>
import { authPage } from "../../support/page_objects/loginPage"
import { navigateTo } from "../../support/page_objects/navigationPage"

describe('First Login', () => {
    it('If you see button [CLEAR DATA & RESET] click on it', () => {
        cy.visit('/')
        cy.get('button').should('be.visible')
        cy.get('button').then(($btn) => {
            if ($btn.hasClass('red')) {
                cy.get('button.red').should('be.visible')
                cy.get('button.red').click()
            }
        })
        // authPage.clearDataAndReset()
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
        cy.get('[placeholder="Password"]').type(password)
        authPage.saveCredentialsDisabled()
        cy.get('[placeholder="Confirm password"]').type(password + "23")
        authPage.saveCredentialsDisabled()
        cy.get('[placeholder="Password"]').clear().type(password)
        cy.get('[placeholder="Confirm password"]').clear().type(password.toUpperCase())
        authPage.saveCredentialsDisabled()
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

    it('Nav bar have 1) TRADING TERMINAL (default selected) MARKET DATA 3) STRATEGY EDITOR 4) SETTINGS', () => {
        const navTitles = ["Trading Terminal", "Market Data", "Strategy Editor", "Settings" ]

        cy.get('.hfui-navbarbutton').eq(0).should('contain.text', 'Trading Terminal').and('have.class', 'active')
        cy.get('.hfui-navbarbutton').eq(1).should('contain.text', 'Market Data')
        cy.get('.hfui-navbarbutton').eq(2).should('contain.text', 'Strategy Editor')
        cy.get('.hfui-navbarbutton').eq(3).should('contain.text', 'Settings')

    } )

    it('First time you login Tour with red blinking point will be visible on Plus Icon', () => {
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
        cy.get('.icon-api').should('be.visible').click()
        cy.get('.hfui-orderform__modal-form').should('be.visible')
        cy.get('.hfui-orderform__modal-buttons').should('be.visible')
        //Click on any order form element
        // let randomPick = Math.floor(Math.random()) * 15
        // cy.get('.hfui-orderformmenu__wrapper li').eq(randomPick).click()
        // cy.get('.icon-api').should('be.visible').click()
        // cy.get('.hfui-orderform__modal-form').should('be.visible')
        // cy.get('.hfui-orderform__modal-buttons').should('be.visible')
    })
})