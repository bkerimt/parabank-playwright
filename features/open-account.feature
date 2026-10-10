Feature: Open New Account
  As a ParaBank customer
  I want to open additional accounts
  So that I can keep my savings separate from my daily spending

  Background:
    Given a logged-in customer

  Scenario Outline: Customer opens a new <type> account
    When the customer opens a new "<type>" account
    Then the account opened confirmation should be displayed
    And the new account details should show account type "<type>"

    Examples:
      | type     |
      | CHECKING |
      | SAVINGS  |
