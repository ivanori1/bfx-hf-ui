Feature: First login to application



    As a valid user
    I want to login into application

    Scenario: If you see button [CLEAR DATA & RESET] click on it
        Given Open application
        When Form is visible
        Then IF Clear Data & Reset button is visible click on it

    Scenario: Not possible to [Save Credentials] without matching passwords
        Given Password, Confirm password input will be visible
        When Type inputs that are not matching
        Then SAVE CREDENTIALS will be disabled
    Scenario: Type matching passwords [SAVE CREDENTIALS] button will be enabled
        Given Password, Confirm password input will be visible
        When Type matching passwords
        Then Save Credentials button will be enabled
    Scenario: When credentials are saved, new page will be open with TRADING TERMINAL (default selected)
        Given Save Credentials button will be enabled
        When Click on Save credentials
        Then Trading terminal page is open
    Scenario: First time you login Tour with red blinking point will be visible on Plus Icon of Trading Terminal Page
        Given Trading terminal page is open
        When You are on Trading Terminal Page
        Then Trading tour should be visible
