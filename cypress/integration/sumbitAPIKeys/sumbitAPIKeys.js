///  <reference types="cypress"/>
import { Given, When, Then, And } from "cypress-cucumber-preprocessor/steps";
import { authPage } from "../../support/page_objects/loginPage";
import { navigateTo } from "../../support/page_objects/navigationPage";
Given("Open application", () => {
  cy.visit("/");
  cy.get("button");
});
When("Form is visible", () => {
  cy.get("form").should("be.visible");
});
Then("IF Create a password is visible then Save Credentials", () => {
    cy.get("button").then(($btn) => {
        if (!$btn.hasClass("red")) {
            cy.get('[placeholder="Password"]').type("test1");
            cy.get('[placeholder="Confirm password"]').type("test1");
        }
      });
});

When("Select {string}", (dropdown) => {
  cy.get(".dropdown-field").click();
  cy.get("ul li").contains(dropdown).click();
});
And("Click Unclock button", () => {
  cy.get("button").contains("Unlock").click();
});
And('Type Password', ()=> {
    cy.get('[placeholder="Password"]').type("test1");

})

Then("Trading terminal page is open", () => {
  const navTitles = [
    "Trading Terminal",
    "Market Data",
    "Strategy Editor",
    "Settings",
  ];

  cy.get(".hfui-navbarbutton")
    .eq(0)
    .should("contain.text", navTitles[0])
    .and("have.class", "active");
});
Given('{string} page is open', (page) => {
  cy.get('.hfui-navbarbutton').contains(page).click()
})
When("Correct API data is typed", ()=> {
  cy.fixture('apiKeys').then((apiKeys) => {
    cy.get('main section .hfui-settings__option [placeholder="API Key"]').type(apiKeys[0].apiKey)
    cy.get('main section .hfui-settings__option [placeholder="API Secret"]').type(apiKeys[0].apiSecret)
})
cy.get('button').contains('Update Keys').click()
cy.get('.hfui-statusbar__left > p:last-of-type').contains('UNLOCKED')
} )

Then("HF status is Connected", ()=> {
  cy.get('.hfui-statusbar__right').within(($statusbar) => {
    cy.wrap($statusbar).find('p').should('contain.text', 'HF Connected')
    cy.wrap($statusbar).find('span').should('have.class', 'green')
})
})
When('Any Execute order is open', ()=> {
        let randomPick = Math.floor(Math.random()) * 15
        cy.get('.hfui-orderformmenu__wrapper li').eq(randomPick).click()

})
Then('When API form is visible', ()=> {
  cy.get('.hfui-orderform__layout-label').should('be.visible')
})