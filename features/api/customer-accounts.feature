@api
Feature: Customer and Account API
  As a client application of ParaBank (e.g. a mobile app)
  I want to read customer and account data through the REST API
  So that I can show the same information outside the website

  # Bu senaryolar tarayıcı açmadan, doğrudan ParaBank'ın REST servisine (services/bank) istek atar.

  Background:
    Given a new customer has been registered

  Scenario: Login returns the customer's details
    When the client logs in through the API with the customer's credentials
    Then the response status should be 200
    And the response should contain the customer's registration details

  Scenario: Login with a wrong password is rejected
    When the client logs in through the API with a wrong password
    Then the response status should be 400
    And the response should contain the text "Invalid username and/or password"

  Scenario: Customer details can be retrieved by customer ID
    When the client requests the customer's details
    Then the response status should be 200
    And the response should contain the customer's registration details

  Scenario: New customer has one checking account with the initial balance
    When the client requests the customer's accounts
    Then the response status should be 200
    And the number of accounts in the response should be 1
    And the first account should be a "CHECKING" account with a balance of $515.50

  Scenario: Account details can be retrieved by account ID
    When the client requests the details of the customer's first account
    Then the response status should be 200
    And the account in the response should belong to the customer

  Scenario: Requesting a non-existent account is rejected
    When the client requests the details of account 999999999
    Then the response status should be 400
    And the response should contain the text "Could not find account #999999999"

  # Bilinen hata (güvenlik): REST servisi hiçbir kimlik doğrulaması istemiyor.
  # Müşteri numarasını bilen herkes, giriş yapmadan o müşterinin hesaplarını ve bakiyelerini okuyabiliyor.
  @fail
  Scenario: Customer accounts cannot be read without authentication
    When a client without any credentials requests the customer's accounts
    Then the response status should be 401
