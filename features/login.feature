Feature: Customer Login
  As a ParaBank customer
  I want to log in to online banking
  So that I can manage my accounts

  Scenario: Registered customer logs in with valid credentials
    Given a registered customer exists
    When the customer logs in with valid credentials
    Then the accounts overview page should be displayed

  Scenario: Login fails with wrong password
    Given the user is on the login page
    When the user logs in with username "olmayanKullanici999" and password "yanlisSifre"
    Then the error message "The username and password could not be verified." should be displayed

  Scenario: Login fails with empty fields
    Given the user is on the login page
    When the user clicks the login button without entering credentials
    Then the error message "Please enter a username and password." should be displayed
