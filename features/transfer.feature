Feature: Transfer Funds
  As a ParaBank customer
  I want to move money between my own accounts
  So that I can manage my savings and my daily spending

  Background:
    Given a logged-in customer
    And the customer has opened a new "SAVINGS" account

  Scenario: Transfer between own accounts updates both balances
    Given the customer has noted the balances of the original and new accounts
    When the customer transfers $50.00 from the original account to the new account
    Then the transfer confirmation should show $50.00 from the original account to the new account
    And the original account balance should decrease by $50.00
    And the new account balance should increase by $50.00

  Scenario: Transfer is recorded in the activity of both accounts
    When the customer transfers $25.00 from the original account to the new account
    Then the original account activity should show a "Funds Transfer Sent" transaction of $25.00
    And the new account activity should show a "Funds Transfer Received" transaction of $25.00

  # Bilinen hata: ParaBank transferde bakiye kontrolü yapmıyor ve hesabın eksiye düşmesine izin veriyor.
  # @fail etiketi bu senaryonun şu an başarısız olmasını beklendiğini belirtir. Hata düzeltilirse
  # test beklenmedik şekilde geçer ve kırmızıya döner; o zaman @fail etiketi kaldırılmalıdır.
  @fail
  Scenario: Transfer exceeding the available balance should be rejected
    Given the customer has noted the balances of the original and new accounts
    When the customer transfers $10000.00 from the original account to the new account
    Then the original account balance should be unchanged
