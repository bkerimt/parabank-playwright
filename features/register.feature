Feature: Customer Registration
  As a new visitor
  I want to open an online banking account
  So that I can use ParaBank services

  Scenario: New customer registers successfully
    Given the user is on the registration page
    When the user registers with valid customer details
    Then the welcome message for the new customer should be displayed
    And the message "Your account was created successfully" should be displayed

  Scenario: Registration fails when passwords do not match
    Given the user is on the registration page
    When the user registers with password confirmation "FarkliSifre123"
    Then the message "Passwords did not match." should be displayed
