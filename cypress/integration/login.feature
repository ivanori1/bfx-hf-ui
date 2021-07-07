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
        Given "Trading Terminal" page is open
        When You are on "Trading Terminal" Page
        Then Trading tour should have 4 steps
    Scenario: First time you login Tour with red blinking point will be visible Market Data Page
        Given "Market Data" page is open
        When You are on "Market Data" Page
        Then Trading tour should have 1 steps
  Scenario: First time you login Tour with red blinking point will be visible on Strategy Editor Page
        Given "Strategy Editor" page is open
        When You are on "Strategy Editor" Page
        Then Trading tour should have 3 steps
Scenario: Verify that API banner is visible on Order Form
        Given "Trading Terminal" page is open
        When Click on Order form Submit API keys
        Then API form is visible
Scenario: In footer Status should be Locked WS should show Connected (green point) but HF should be Disconnected (red point)
        Given "Trading Terminal" page is open
        When API form is visible
        Then Status is locked 
        And Status HF Disconnected
Scenario: Click on Settings on the navigation bar, you will see Production API keys and  Paper trading API (with link)
        Given "Settings" page is open
        When API Credentials form is visible
        Then Click on link will open paper trading CS