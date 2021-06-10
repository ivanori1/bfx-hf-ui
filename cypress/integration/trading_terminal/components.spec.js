/// <reference types="cypress"/>
import { onTradingTerminalPage } from "../../support/page_objects/tradingTerminalPage"

describe('Manipulate Chart Component', () => {
    before(() => {
        cy.visit('/')
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
  
        it('Try to select empty dorpdown', () => {
            cy.get('.icon-plus').click()
            cy.get('.modal__footer button').click()
            cy.get('.error').should('contain', 'Invalid Component')
            cy.get('.modal__close-button').click()
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
        cy.get('.ufx-checkbox:first-child [type="checkbox"]').check({force: true})
        cy.get('.ufx-checkbox:last-child [type="checkbox"]').check({force: true})
        cy.get('.footer button').contains('Close').click()
        //Stalked view is applied
        cy.get('.spread').should('be.visible')
        //Total is visible 
        cy.get('.header div').contains('Total')
    })
    it('Change Settings on Order form: Sum Amounts Y, Stalked View N', () => {
        cy.get('.icon-settings-icon').click()
        cy.get('.header').contains('Settings')
        //Check Sum amounts and Stalked view
        cy.get('.ufx-checkbox:first-child [type="checkbox"]').uncheck({force: true})
        cy.get('.ufx-checkbox:last-child [type="checkbox"]').uncheck({force: true})
        cy.get('.footer button').contains('Close').click()
        //Stalked view is not applied
        cy.get('.spread').should('not.exist')
        //Amount is visible 
        cy.get('.header div').contains('Amount')
        
    })

    //TODO check is order book changing when ticker is change
    it('Close Order Book', () => {
        cy.get('.icon-cancel').click()
    })
})

describe('Manipulate Trades Table and assert there is 25 rows', () => {
    it('Open Trades Table', () => {
        onTradingTerminalPage.openComponent('Trades Table')
        cy.get('.ufx-table-wrapper table.ufx-table tr').should('have.length',25)

    })

    it('Close Trade', () => {
        cy.get('.icon-cancel').click()
    })
})

describe('Manipulate Postion Table', () => {
    it('Opens Position Table', () => {
        onTradingTerminalPage.openComponent('Positions Table')
    })
    it('create 2 positions with different pairs', () => {

    //TODO 

    })
    it('Close Position', () => {
        cy.get('.icon-cancel').click()
    })
})

describe('Manipulate balances table', () => {

    it('Open Balance Table', () => {
        onTradingTerminalPage.openComponent('Balances Table')

    })
    it('Click on cog (settings) and test hide zero balances ', () => {
        cy.get('.icon-settings-icon').click()
        cy.get('.header').contains('Settings')
        cy.get('.ufx-checkbox [type="checkbox"]').uncheck({force: true})
        cy.get('.footer button').contains('Close').click()
        cy.get('[role="gridcell"]').contains('0.00000000')
        })

    })