///  <reference types="cypress"/>
import { Given, When, Then, And } from "cypress-cucumber-preprocessor/steps";
import { authPage } from "../../support/page_objects/loginPage";
import { navigateTo } from "../../support/page_objects/navigationPage";



When("Select {string}", (dropdown) => {
  cy.get(".dropdown-field").click();
  cy.get("ul li").contains(dropdown).click();
});
And("Click Unlock button", () => {
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

Then("HF status is Connected", ()=> {
  cy.get('.hfui-statusbar__right').within(($statusbar) => {
    cy.wrap($statusbar).find('p:first-of-type').should('contain.text', 'HF Connected')
    cy.wrap($statusbar).find('span:first-of-type').should('have.class', 'green')
})
})
When('Any Execute order is open', ()=> {
        let randomPick = Math.floor(Math.random()) * 15
        cy.get('.hfui-orderformmenu__wrapper li').eq(randomPick).click()

})
Then('When API form is visible', ()=> {
  cy.get('.hfui-orderform__layout-label').should('be.visible')
})
Given('Settings modal is open', ()=> {
  cy.get('header .icon-settings-icon').click()
  cy.get('.modal__title').contains('Settings')
})
When('Click on settings tab {string}', (tab)=>{
  cy.get('.appsettings-modal__tab').contains(tab).click()
  cy.get('.appsettings-modal__tab').contains(tab).should('have.class', 'is-active')
})
And('Correct API data is typed', ()=> {
  cy.fixture('apiKeys').then((apiKeys) => {
    cy.get('.appsettings-modal__input [placeholder="API Key"]').type(apiKeys[0].apiKey)
    cy.get('.appsettings-modal__input [placeholder="API Secret"]').type(apiKeys[0].apiSecret)
})
cy.get('.appsettings-modal__content .ufx-button').click()
cy.get('.hfui-statusbar__left > p:last-of-type').contains('UNLOCKED')

})
And('Configuration message is {string}', (message)=>{
  cy.get('.appsettings-modal__api-configuration-message').contains(message)
})