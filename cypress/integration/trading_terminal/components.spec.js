/// <reference types="cypress"/>
import { onTradingTerminalPage } from "../../support/page_objects/tradingTerminalPage"

describe('Manipulate Chart Component', () => {
    before(() => {
        cy.visit('/')

    })
    it('Login with local password', () => {
        cy.get('.hfui-authenticationpage__mode-select p').contains('Select trading mode')
        cy.get('[placeholder="Password"]').type('test1')
        cy.get('.green').click()
    })
    it('Close all components', () => {
        cy.get('.icon-cancel').its('length').then(res => {
            if (res > 0) {
                cy.get('.icon-cancel').each(($el) => {
                    cy.wrap($el).click()
                })
            }
        })
        cy.get('.react-draggable').should('not.exist');
        })
  
    it('Open Chart component', () => {
        onTradingTerminalPage.openComponent('Chart')
    })
    it('Drag Chart component', () => {
        onTradingTerminalPage.moveComponent()
    })
    it('Resize Chart component', () => {
      
        onTradingTerminalPage.resizeComponent()
    })
    it('Close Chart', () => {
        cy.get('.icon-cancel').click()
    })
})
describe('Manipulate Order book component', () => {
    it('Open Order book', () => {
        onTradingTerminalPage.openComponent('Order Book')
    })
    it('Move Order Book Component', () => {
        onTradingTerminalPage.moveComponent()
    })
    it('Resize Order Book Component', () => {
        onTradingTerminalPage.resizeComponent()
    })
    it('Change Settings on Order form: Sum Amounts Y, Stalked View Y', () => {
        cy.get('.icon-settings-icon').click()
        cy.get('.header').contains('Settings')
        //Check Sum amounts and Stalked view
        cy.get('.hfui-checkbox:first-child [type="checkbox"]').check()
        cy.get('.hfui-checkbox:last-child [type="checkbox"]').check()
        cy.get('.hfui-panelsettings__wrapper button').contains('Close').click()
        //Stalked view is applied
        cy.get('.hfui-orderbook__pl-container-stacked').should('be.visible')
        //Total is visible 
        cy.get('.hfui-orderbook__header p').contains('Total')
    })
    it('Change Settings on Order form: Sum Amounts Y, Stalked View N', () => {
        cy.get('.icon-settings-icon').click()
        cy.get('.header').contains('Settings')
        //Check Sum amounts and Stalked view
        cy.get('.hfui-checkbox:first-child [type="checkbox"]').check()
        cy.get('.hfui-checkbox:last-child [type="checkbox"]').uncheck()
        cy.get('.hfui-panelsettings__wrapper button').contains('Close').click()
        //Stalked view is not applied
        cy.get('.hfui-orderbook__side-container').should('be.visible')
        //Amount is visible 
        cy.get('.hfui-orderbook__header p').contains('Amount')
        
    })

    //TODO check is order book changing when ticker is change
    it('Close Order Book', () => {
        cy.get('.icon-cancel').click()
    })
})

describe('Manipulate Trades Table', () => {
    it('Open Trades Table', () => {
        onTradingTerminalPage.openComponent('Trades Table')
        cy.get('').scrollTo('bottom')

    })
})

