///  <reference types="cypress"/>
import { Given, When, Then } from "cypress-cucumber-preprocessor/steps";
import { authPage } from "../../support/page_objects/loginPage";

Given("Open application", () => {
  cy.visit("/");
  cy.get("button");
});

When("IF Clear Data & Reset button is visible click on it", () => {
  cy.get("button").then(($btn) => {
    if ($btn.hasClass("red")) {
      cy.get("button.red").should("be.visible");
      cy.get("button.red").click();
    }
  });
});

Then("Save Credentials button should be visible", () => {
  cy.get("button").should("be.visible").contains("Save Credentials");
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
