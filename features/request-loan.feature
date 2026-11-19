Feature: Request Loan
  As a ParaBank customer
  I want to apply for a loan online
  So that I can get a quick decision without visiting a branch

  # İş kuralı (ParaBank varsayılan ayarları):
  # - Peşinat, müşterinin toplam varlığından fazla olamaz.
  # - Toplam varlık, kredi tutarının en az %20'si olmalı.
  # Yeni müşteri $515.50 ile başlar, yani onaylanabilecek en yüksek kredi $2577.50'dir.

  Background:
    Given a logged-in customer
    And the customer has total available funds of $515.50

  Scenario Outline: Loan decision for $<amount> with a down payment of $<downPayment>
    When the customer requests a loan of $<amount> with a down payment of $<downPayment>
    Then the loan status should be "<status>"
    And the loan message should be "<message>"

    Examples:
      | amount  | downPayment | status   | message                                                           |
      | 1000.00 | 100.00      | Approved | Congratulations, your loan has been approved.                     |
      | 2577.50 | 50.00       | Approved | Congratulations, your loan has been approved.                     |
      | 2600.00 | 50.00       | Denied   | We cannot grant a loan in that amount with your available funds.  |
      | 1000.00 | 600.00      | Denied   | You do not have sufficient funds for the given down payment.      |

  Scenario: Approved loan opens a loan account and withdraws the down payment
    Given the customer has noted the balance of the original account
    When the customer requests a loan of $1000.00 with a down payment of $100.00
    Then the loan status should be "Approved"
    And the loan account details should show account type "LOAN" and a balance of $1000.00
    And the original account balance should decrease by $100.00
    And the original account activity should show the down payment of $100.00 for the loan

  # Bilinen hata: Uygulamada boş kredi tutarı için bir doğrulama mesajı tanımlı
  # ("The loan amount cannot be empty."), ama sayfa bunu göstermek yerine genel bir hata veriyor.
  @fail
  Scenario: Loan request without an amount should show a validation message
    When the customer requests a loan without entering an amount
    Then the message "The loan amount cannot be empty." should be displayed
