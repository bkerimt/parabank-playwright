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
steps/           Step definitions - how each step is executed
  fixtures.ts    Injects Page Objects and scenario context into steps
pages/           Page Object Model - locators and page actions
utils/           Test data generation
```

Each scenario creates its own unique customer, so tests are independent of each other and of the shared demo database.

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
