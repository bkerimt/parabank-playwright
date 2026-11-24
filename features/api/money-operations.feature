@api
Feature: Money Operations API
  As a client application of ParaBank
  I want to open accounts and move money through the REST API
  So that customers can bank outside the website

  # Her işlemden sonra bakiye, cevaptaki "başarılı" mesajına güvenilmeden ayrıca API'den okunuyor.
  # Yeni müşteri tek bir CHECKING hesabıyla ve $515.50 bakiyeyle başlıyor.

  Background:
    Given a new customer has been registered

  Scenario: Opening a savings account moves the opening deposit from the original account
    When the client opens a new "SAVINGS" account through the API funded from the original account
    Then the response status should be 200
    And the new account should hold exactly the amount taken from the original account

  Scenario Outline: A <operation> of $<amount> updates the balance and is recorded as a transaction
    When the client makes a <operation> of $<amount> on the original account through the API
    Then the response status should be 200
    And the API should report a balance of $<balance> for the original account
    And the original account transactions should include a "<description>" <type> of $<amount>

    Examples:
      | operation  | amount | balance | description              | type   |
      | deposit    | 200.00 | 715.50  | Deposit via Web Service  | Credit |
      | withdrawal | 15.50  | 500.00  | Withdraw via Web Service | Debit  |

  Scenario: Transfer between own accounts moves the money between both balances
    Given the customer has opened a "SAVINGS" account through the API
    When the client transfers $50.00 from the original account to the new account through the API
    Then the response status should be 200
    And the response should contain the text "Successfully transferred $50.00"
    And the original account balance should have decreased by $50.00 according to the API
    And the new account balance should have increased by $50.00 according to the API

  # Transfer iki adımdan oluşuyor: gönderen hesaptan çekme ve alan hesaba yatırma.
  # İkinci adım başarısız olursa ilki de geri alınmalı (atomiklik); aksi halde para kaybolur.
  Scenario: Failed transfer to a non-existent account does not take money from the sender
    When the client transfers $50.00 from the original account to account 999999999 through the API
    Then the response status should be 400
    And the API should report a balance of $515.50 for the original account

  # Bilinen hata: Arayüzdeki bakiye kontrolü eksikliği sunucu tarafında da var.
  # API ile bakiyeden fazla para çekilebiliyor ve hesap eksiye düşüyor.
  @fail
  Scenario: Withdrawal exceeding the balance should be rejected
    When the client makes a withdrawal of $10000.00 on the original account through the API
    Then the request should be rejected as a client error
    And the API should report a balance of $515.50 for the original account

  # Bilinen hata: Tutarın pozitif olduğu kontrol edilmiyor. Negatif tutarlı transfer, parayı
  # ters yönde, yani ALICI hesaptan gönderen hesaba taşıyor.
  @fail
  Scenario: Transfer with a negative amount should be rejected
    Given the customer has opened a "SAVINGS" account through the API
    When the client transfers $-50.00 from the original account to the new account through the API
    Then the request should be rejected as a client error
    And the new account balance should be unchanged according to the API
