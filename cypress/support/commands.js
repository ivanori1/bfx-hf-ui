Cypress.Commands.add('firstLoginTour', (counter) => {
    cy.get('button[class="react-joyride__beacon"]').should('be.visible').click()
    cy.get('.react-joyride__overlay').should('be.visible')
    cy.get('.__floater__open').should('be.visible')
    cy.get('.react-joyride__tooltip button[data-action="primary"]').then(($btn) => {
        for (let n = 0; n < counter; n++) {
            cy.get('[title="Next"]').click()
        }
        cy.get('[title="Finish"]').click()
        cy.get('.react-joyride__overlay').should('not.exist')
        cy.get('.__floater__open').should('not.exist')

    })
})