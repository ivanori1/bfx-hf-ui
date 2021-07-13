Feature: Components
Test every component with their basic funcions
as expanding drag and drop, closing 
    Focus
    Scenario: IF Create a password is visible then Save Credentials
        Given Open application
        When Form is visible
        And IF Create a password is visible then Save Credentials and login to "Production"
        Then Component button should be visible
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
        And Resize Component
        And Move Component
        And Close Component
        Then No component on layout
    Scenario: Open, drag, resize and close Order Book
        Given "Trading Terminal" page is open
        When Open Component "Order Book"
        And Resize Component
        And Move Component
        And Close Component
        Then No component on layout
