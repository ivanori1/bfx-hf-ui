Feature: Components
Test every component with their basic funcions
as expanding drag and drop, closing 
    
    Scenario: IF Create a password is visible then Save Credentials
        Given Open application
        When Form is visible
        And IF Create a password is visible then Save Credentials
        Then Login to app
    Scenario: Remove every component
        Given "Trading Terminal" page is open
        When Remove every component
        Then No component on layout
    Scenario: Try to select empty dropdown
        Given "Trading Terminal" page is open
        When Open Component Modal
        And Click on empty option
        Then Error "Invalid Component" will appear
    Scenario: Open, drag, resize and close Chart
        Given "Trading Terminal" page is open
        When Open Component "Chart"