export class TradingTerminalPage {

    selectMarketType(marketType) {
        /**
        * Selecting from order form dropdown market type. It can be exchange, margin and derivatives
        * @example  selectMarketType('Margin')
        */
        cy.get('li .hfui-dropdown__wrapper').click()
        cy.get('ul[class=with-icon]').contains(marketType).click()
        cy.get('p[class="with-icon"]').should('contain', marketType)
    }
    submitMarketOrder(marketType, amount, orderSide) {
        cy.get('.icon-market-active').click()
        this.selectMarketType(marketType)
        cy.get('.hfui-orderform__input-label').contains('Amount').parent().type(amount)
        cy.get('.hfui-orderform__layout-actions button').contains(orderSide).click()

    }
    openComponent(componentName) {
        cy.get('.icon-plus').click()
        cy.get('.hfui-modal__content').should('be.visible')
                cy.get('.hfui-modal__actions button').click()
        cy.get('.error').should('contain', 'Invalid Component')
        cy.get('.hfui-dropdown__button').click()
        cy.get('.hfui-modal__content ul li').contains(componentName).click()
        cy.get(".hfui-modal__actions button").click();
    }
    moveComponent() {
        cy.get('.icon-move').trigger('mousedown').trigger('mousemove', { clientX: 1000, clientY: 200 }).trigger('mouseleave')
        cy.get('.icon-move').click()
    }
    resizeComponent() {
        cy.get('.react-resizable-handle').trigger('mousedown').trigger('mousemove', { clientX: 1500, clientY: 1500 })
        cy.get('.react-resizable-hide').click()
    }
}

export const onTradingTerminalPage = new TradingTerminalPage()