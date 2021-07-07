///  <reference types="cypress"/>
import { Given, When, Then, And } from "cypress-cucumber-preprocessor/steps";
import { authPage } from "../../support/page_objects/loginPage";
import { navigateTo } from "../../support/page_objects/navigationPage"

Given("Open application", () => {
  cy.visit("/");
  cy.get("button");
});

When("Form is visible", () => {
  cy.get("form").should("be.visible");
});
And ("IF Create a password is visible then Save Credentials", () => {
    cy.get("button").then(($btn) => {
        if (!$btn.hasClass("red")) {
            cy.get('[placeholder="Password"]').type("test1");
            cy.get('[placeholder="Confirm password"]').type("test1");
        }
      });
});

Then('Login to app', ()=> {
  cy.get('[placeholder="Password"]').type("test1");
  cy.get('button.green').click()
})

Given('{string} page is open', (page) => {
  cy.get('.hfui-navbarbutton').contains(page).click()
})
When('Remove every component', ()=> {
  cy.get('.icon-cancel').its('length').then(res => {
    if (res > 0) {
        cy.get('.icon-cancel').each(($el) => {
            cy.wrap($el).click()
        })
    }
})
})

Then('No component on layout', ()=> {
  cy.get('.react-draggable').should('not.exist');
})

When('Open Component Modal', ()=> {
  cy.get('.hfui-navbar__layout-settings').click()
  cy.get('.hfui-navbar__layout-settings__menu-buttons').should('be.visible')
  cy.get('.hfui-navbar__layout-settings__item').contains('Add Component').click()
  cy.get('.modal__title').should('contain', 'Add Component')
  cy.get('[role="dialog"] [data-qa]').should('have.attr', 'data-qa', 'Select an option')
})

And('Click on empty option', ()=> {
  cy.get('[role="dialog"] [data-qa]').should('have.attr', 'data-qa', 'Select an option')
  cy.get('.modal__button').click()
})

Then('Error {string} will appear', (error)=> {
  cy.get('p.error').contains(error)
  cy.get('.modal__close-button').click()
})
Then('Open Component {string}', (componentName)=> {
  cy.get('.hfui-navbar__layout-settings').click()
  cy.get('.hfui-navbar__layout-settings__item').contains('Add Component').click()
  cy.get('.modal .dropdown-field').click()
  cy.get('.modal ul li').contains(componentName).click()
  cy.get('.modal__button').click()
})