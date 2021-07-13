///  <reference types="cypress"/>
import { Given, When, Then, And } from "cypress-cucumber-preprocessor/steps";
import { authPage } from "../../support/page_objects/loginPage";
import { navigateTo } from "../../support/page_objects/navigationPage"


Then("IF Clear Data & Reset button is visible click on it", () => {
  cy.get("button").then(($btn) => {
    if ($btn.hasClass("red")) {
      cy.get("button.red").should("be.visible");
      cy.get("button.red").click();
    }
  });
});



Given("Password, Confirm password input will be visible", () => {
  cy.get('[placeholder="Password"]').should("be.visible");
  cy.get('[placeholder="Confirm password"]').should("be.visible");
  cy.get('[class="hfui-button green disabled"]').contains("Save Credentials");
});

When("Type inputs that are not matching", () => {
  const password = "test1";
  cy.get('[placeholder="Password"]').type(password);
  authPage.saveCredentialsDisabled();
  cy.get('[placeholder="Confirm password"]').type(password + "23");
  authPage.saveCredentialsDisabled();
  cy.get('[placeholder="Password"]').clear().type(password);
  cy.get('[placeholder="Confirm password"]')
    .clear()
    .type(password.toUpperCase());
});

Then("SAVE CREDENTIALS will be disabled", () => {
  authPage.saveCredentialsDisabled();
});

When("Type matching passwords", () => {
  const password = "test1";
  cy.get("form").then((form) => {
    cy.wrap(form).find('[placeholder="Password"]').clear().type(password);
    cy.wrap(form)
      .find('[placeholder="Confirm password"]')
      .clear()
      .type(password);
  });
});

Then("Save Credentials button will be enabled", () => {
  cy.get("button").should("not.have.class", "disabled");
});

When("Click on Save credentials", () => {
  cy.get("button").contains("Save Credentials").click();
});

Then('Trading tour should have {int} steps', (steps)=> {
  cy.firstLoginTour(steps)
})

When("Click on Order form Submit API keys", ()=> {
  cy.get('.icon-api').should('be.visible').click()

})

Then("API form is visible", () => {
  cy.get('.hfui-orderform__modal-form').should('be.visible')
  cy.get('.hfui-orderform__modal-buttons').should('be.visible')
})

Then('Status is locked', ()=> {
  cy.get('.hfui-statusbar__left > p:last-of-type').contains('LOCKED')
})
And('Status HF Disconnected', ()=> {
  cy.get('.hfui-statusbar__right').within(($statusbar) => {
      cy.wrap($statusbar).find('p').should('contain.text', 'HF Disconnected')
      cy.wrap($statusbar).find('span').should('have.class', 'red')
  })
})
