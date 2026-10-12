Feature: Accounts Overview
  As a ParaBank customer
  I want to see all my accounts and their balances in one place
  So that I always know my financial position

  Background:
    Given a logged-in customer

  Scenario: Newly opened account is listed in the accounts overview
    Given the customer has opened a new "SAVINGS" account
    When the customer views the accounts overview
    Then the new account should be listed in the accounts overview
    And the accounts overview should list 2 accounts

  Scenario: Total balance equals the sum of all account balances
    Given the customer has opened a new "CHECKING" account
    When the customer views the accounts overview
    Then the total balance should equal the sum of the account balances

  Scenario: Opening a new account does not change the total balance
    Given the customer has noted the total balance
    And the customer has opened a new "SAVINGS" account
    When the customer views the accounts overview
    Then the total balance should be unchanged
