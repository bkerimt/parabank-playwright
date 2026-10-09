import { type Page, type Locator } from '@playwright/test';
import { type Customer } from '../utils/testData';

export class RegisterPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly registerButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h1.title');
    this.registerButton = page.getByRole('button', { name: 'Register' });
  }

  // ParaBank'ta id'lerin içinde nokta var (customer.firstName),
  // bu yüzden id'yi attribute selector ile buluyoruz
  private field(id: string): Locator {
    return this.page.locator(`[id="${id}"]`);
  }

  async goto() {
    await this.page.goto('register.htm');
  }

  async register(customer: Customer, repeatedPassword = customer.password) {
    await this.field('customer.firstName').fill(customer.firstName);
    await this.field('customer.lastName').fill(customer.lastName);
    await this.field('customer.address.street').fill(customer.street);
    await this.field('customer.address.city').fill(customer.city);
    await this.field('customer.address.state').fill(customer.state);
    await this.field('customer.address.zipCode').fill(customer.zipCode);
    await this.field('customer.phoneNumber').fill(customer.phone);
    await this.field('customer.ssn').fill(customer.ssn);
    await this.field('customer.username').fill(customer.username);
    await this.field('customer.password').fill(customer.password);
    await this.field('repeatedPassword').fill(repeatedPassword);
    await this.registerButton.click();
  }
}
