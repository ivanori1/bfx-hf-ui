/// <reference types="cypress"/>
import { navigateTo } from "../../support/page_objects/navigationPage"
const apiKeys = require('../../fixtures/apiKeys.json')
describe('Submit API Keys', () => {
    before(() => {
        cy.visit('/')
        cy.contains('Enter your password to unlock.').should('be.visible')
        cy.get('[placeholder="Password"]').type('test1')
        cy.get('.green').click()
    })
    it('In footer WS should show Connected (green point) but HF should be Disconnected (red point) ', () => {
        cy.get('.hfui-statusbar__left > p:last-of-type').contains('LOCKED')
        cy.get('.hfui-statusbar__right').within(($statusbar) => {
            cy.wrap($statusbar).find('p').should('contain.text', 'HF Disconnected')
            cy.wrap($statusbar).find('span').should('have.class', 'red')
        })
    })
    it('Click on Settings on the navigation bar, you will see Production API keys and  Paper trading API (with link)', () => {
        navigateTo.settingsPage()
        cy.get('section:last-of-type > p').contains('API credentials')
        cy.get('.hfui-settings__option-description > p').contains('Paper Trading').should('have.attr', 'href',
         'https://support.bitfinex.com/hc/en-us/articles/900001525006-Paper-Trading-test-learn-and-simulate-trading-strategies-')
    })
    it('Click on link will open paper trading customer support link in default browser', () => {
        cy.get('.hfui-settings__option-description > p').contains('Paper Trading').should('have.attr', 'target', '_blank')
    })
    it('Paste correct API keys and click [Save] will change HF Connected in footer', () => {
        navigateTo.settingsPage()
        cy.fixture('apiKeys').then((apiKeys) => {
            cy.get('main section .hfui-settings__option [placeholder="API Key"]').type(apiKeys[0].apiKey)
            cy.get('main section .hfui-settings__option [placeholder="API Secret"]').type(apiKeys[0].apiSecret)
        })
        cy.get('button').contains('Update Keys').click()
        cy.get('.hfui-statusbar__left > p:last-of-type').contains('UNLOCKED')
        cy.get('.hfui-statusbar__right').within(($statusbar) => {
            cy.wrap($statusbar).find('p').should('contain.text', 'HF Connected')
            cy.wrap($statusbar).find('span').should('have.class', 'green')
        })
   
    })
    it('Go to Trading terminal and try to open any Algo/ Atomic order will not have Not configured banner ', () => {
        navigateTo.tradingTerminalPage()
        let randomPick = Math.floor(Math.random()) * 15
        cy.get('.hfui-orderformmenu__wrapper li').eq(randomPick).click()
        cy.get('.hfui-orderform__layout').should('be.visible')
    })
})