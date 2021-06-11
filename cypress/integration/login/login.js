///  <reference types="cypress"/>
import {Given, When, Then} from "cypress-cucumber-preprocessor/steps"


Given('Open application', () => {
    cy.visit('/')
    cy.get('button')
})

When('IF Clear Data & Reset button is visible click on it', () => {
    cy.get('button').then(($btn) => {
        if ($btn.hasClass('red')) {
            cy.get('button.red').should('be.visible')
            cy.get('button.red').click()
        }
    })
})

Then('Save Credentials button should be visible', () => {
    cy.get('button').should('be.visible').contains('Save Credentials')
})