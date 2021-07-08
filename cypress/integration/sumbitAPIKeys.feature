Feature: Submit api keys to the HF
        No matther if you are first time logining in or changing API keys

        Scenario: IF opening app for the first time Create password
            Given Open application
            When Form is visible
            Then IF Create a password is visible then Save Credentials
        Scenario: Login to Production
            Given Form is visible
            When Select "Production"
            And Type Password
            And Click Unlock button
            Then Trading terminal page is open
        Scenario: Paste correct API keys and click [Save] will change HF Connected in footer
            Given Settings modal is open
            When Click on settings tab "API keys"
            And Correct API data is typed
            Then Configuration message is "Configured"
            And Close modal
            Then HF status is Connected
        Scenario: Go to Trading terminal and try to open any Algo/ Atomic order will not have Not configured banner
            Given "Trading Terminal" page is open
            When Any Execute order is open
            Then When API form is visible

