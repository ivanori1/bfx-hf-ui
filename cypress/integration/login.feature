Feature: First login to application



    As a valid user
    I want to login into application

    Scenario: If you see button [CLEAR DATA & RESET] click on it
        Given Open application
        When IF Clear Data & Reset button is visible click on it
        Then Save Credentials button should be visible