/// <reference types="cypress"/>
import { navigateTo } from "../../support/page_objects/navigationPage"
const apiKeys = require('../../fixtures/apiKeys.json')
describe('Submit API Keys', () => {
    before(() => {
        cy.visit('/')

    })
    it('Login and submit API keys', () => {
        cy.contains('Enter your password to unlock.').should('be.visible')
        cy.get('[placeholder="Password"]').type('test1')
        cy.get('.green').click()
    })
    it('Settings paste API keys', () => {
        navigateTo.settingsPage()
        cy.fixture('apiKeys').then((apiKeys) => {
            cy.get('.api-key').type(apiKeys[0].apiKey)
            cy.get('.api-secret').type(apiKeys[0].apiSecret)
        })
        cy.get('.settings-save').click()
        // cy.get('nfui-notification-msg').should(($notification) => {
        //     expect($notification).to.contain('Authenticated')
        // })

    })
    it('Check order UI is visible', () => {
        navigateTo.tradingTerminalPage()
        let randomPick = Math.floor(Math.random()) * 15
        cy.get('.hfui-orderformmenu__wrapper li').eq(randomPick).click()
        cy.get('.hfui-orderform__layout').should('be.visible')
    })
})