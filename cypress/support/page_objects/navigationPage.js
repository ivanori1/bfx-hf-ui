export class NavigationPage {
    tradingTerminalPage() {
        cy.get('.hfui-navbarbutton').contains('Trading Terminal').click()
    }
    marketDataPage() {
        cy.get('.hfui-navbarbutton').contains('Market Data').click()
    }

    strategyEditorPage() {
        cy.get('.hfui-navbarbutton').contains('Strategy Editor').click()
    }
    settingsPage() {
        cy.get('.hfui-navbarbutton').contains('Settings').click()
    }
}


export const navigateTo = new NavigationPage()