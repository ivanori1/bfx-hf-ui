export class LoginPage {
    clearDataAndReset() {
        cy.get('button').then(($btn) => {
            if ($btn.hasClass('red')) {
                cy.get('button.red').should('be.visible')
                cy.get('button.red').click()
            }
        })

    }
    saveCredentialsDisabled() {
        cy.get('button').contains('Save Credentials').then(($btn) => {
            expect($btn).to.have.class('disabled')
        })
    }
    submitCredentialsForm(password) {
        this.saveCredentialsDisabled()
        cy.get('form').then(form => {
            cy.wrap(form).find('[placeholder="Password"]').type(password)
            this.saveCredentialsDisabled()
            cy.wrap(form).find('[placeholder="Confirm Password "]').type(password + ' 1 2 3')
            this.saveCredentialsDisabled()
        })
    }
}

export const authPage = new LoginPage()