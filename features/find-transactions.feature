Feature: Find Transactions
  As a ParaBank customer
  I want to search my account transactions by amount, date or transaction ID
  So that I can quickly find a specific payment

  Background:
    Given a logged-in customer
    And the customer has opened a new "SAVINGS" account
    And the customer has transferred $37.25 from the original account to the new account

  Scenario Outline: Transfer can be found by amount in the <account> account
    When the customer searches transactions of the <account> account by amount $37.25
    Then the number of transactions found should be 1
    And the search results should include a "<description>" <type> of $37.25

    Examples:
      | account  | description             | type   |
      | original | Funds Transfer Sent     | debit  |
      | new      | Funds Transfer Received | credit |

  Scenario: Transfer can be found by date range
    When the customer searches transactions of the original account from yesterday to tomorrow
    Then the search results should include a "Funds Transfer Sent" debit of $37.25

  Scenario: Search with an amount that has no transactions returns no results
    When the customer searches transactions of the original account by amount $999.99
    Then the number of transactions found should be 0

  Scenario: Transaction can be found by its ID
    Given the customer has noted the ID of the "Funds Transfer Sent" transaction of $37.25 on the original account
    When the customer searches transactions by the noted transaction ID
    Then the number of transactions found should be 1
    And the search results should include a "Funds Transfer Sent" debit of $37.25

  # Bilinen hata (yetkilendirme açığı): İşlem numarasıyla aramada işlemin, arayan müşteriye
  # ait olup olmadığı kontrol edilmiyor. Başka bir müşteri, numarasını bildiği her işlemi görebiliyor.
  @fail
  Scenario: Customer cannot see another customer's transaction by its ID
    Given the customer has noted the ID of the "Funds Transfer Sent" transaction of $37.25 on the original account
    And another customer is logged in
    When the customer searches transactions by the noted transaction ID
    Then the noted transaction should not be in the search results

  Scenario Outline: Search is not performed with an invalid <criterion>
    When the customer searches transactions by "<criterion>" using "<value>"
    Then the message "<message>" should be displayed
    And no search should be performed

    Examples:
      | criterion      | value      | message                |
      | transaction ID | abc        | Invalid transaction ID |
      | date           | 2026-11-19 | Invalid date format    |
      | amount         | ten        | Invalid amount         |
