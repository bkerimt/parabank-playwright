Feature: Bill Pay
  As a ParaBank customer
  I want to pay my bills online
  So that I don't have to visit a branch

  Background:
    Given a logged-in customer

  Scenario: Customer pays a bill successfully
    Given the customer has noted the balance of the original account
    When the customer pays a bill of $75.50 to "Istanbul Elektrik"
    Then the bill payment confirmation should show $75.50 to "Istanbul Elektrik" from the original account
    And the original account balance should decrease by $75.50
    And the original account activity should show a "Bill Payment to Istanbul Elektrik" transaction of $75.50

  Scenario Outline: Bill payment is not sent when the <field> is empty
    When the customer submits a bill payment without the "<field>"
    Then the message "<message>" should be displayed
    And the bill payment should not be sent

    Examples:
      | field          | message                     |
      | payee name     | Payee name is required.     |
      | address        | Address is required.        |
      | phone number   | Phone number is required.   |
      | account number | Account number is required. |
      | amount         | The amount cannot be empty. |

  Scenario: Bill payment is not sent when the account numbers do not match
    When the customer submits a bill payment with account "12345" and verify account "54321"
    Then the message "The account numbers do not match." should be displayed
    And the bill payment should not be sent
