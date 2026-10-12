# ParaBank Test Automation

![Playwright Tests](https://github.com/bkerimt/parabank-playwright/actions/workflows/playwright.yml/badge.svg)

BDD-style end-to-end test automation for the [ParaBank](https://parabank.parasoft.com) demo banking application.

## Tech Stack

| Tool | Purpose |
|---|---|
| [Playwright](https://playwright.dev) | Browser automation and test runner |
| TypeScript | Language |
| [playwright-bdd](https://github.com/vitalets/playwright-bdd) | Gherkin (Given/When/Then) scenarios on the Playwright runner |
| GitHub Actions | CI: tests run on every push |

## Project Structure

```
features/        Gherkin scenarios (.feature) - what is tested
setup/           Environment setup that runs before all tests
steps/           Step definitions - how each step is executed
  fixtures.ts    Injects Page Objects and scenario context into steps
pages/           Page Object Model - locators and page actions
utils/           Test data generation
```

Each scenario creates its own unique customer, so tests are independent of each other and of the shared demo database.

### Environment setup

ParaBank is a public, shared demo environment and anyone can change its admin settings. Before the test suite runs, a Playwright **setup project** (`setup/environment.setup.ts`) checks that the data access mode is set to the default (JDBC) and restores it if needed. The BDD tests depend on this setup project, so they never run against a misconfigured environment.

## Running the Tests

```bash
npm install
npx playwright install chromium
npm test
npm run report
```

## Test Coverage

| Feature | Scenarios |
|---|---|
| Customer Registration | Successful registration, password mismatch |
| Customer Login | Valid login, wrong password, empty fields |
| Open New Account | Open CHECKING and SAVINGS accounts (Scenario Outline), verify account details |
| Accounts Overview | New account is listed, total equals sum of balances, total unchanged after opening an account |
