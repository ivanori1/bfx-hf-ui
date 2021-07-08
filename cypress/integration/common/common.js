import { defineStep } from 'cypress-cucumber-preprocessor/steps'

defineStep("Open application", () => {
    cy.visit("/", {timeout: 60000});
    cy.get("button");
  });

  defineStep("Form is visible", () => {
    cy.get('form').should('be.visible')
  });

  defineStep('{string} page is open', (page) => {
    cy.get('.hfui-navbarbutton').contains(page).click()
  })
  
  defineStep('You are on {string} Page', (page)=> {
    cy.get('button').contains(page).and('have.class', 'active')
  })
  defineStep("IF Create a password is visible then Save Credentials", () => {
    cy.get("button").then(($btn) => {
        if (!$btn.hasClass("red")) {
            cy.get('[placeholder="Password"]').type("test1");
            cy.get('[placeholder="Confirm password"]').type("test1");
        }
      });
});
defineStep('Close modal', ()=> {
  cy.get('.modal__close-button').click()
})