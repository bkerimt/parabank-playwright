export type Customer = {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  ssn: string;
  username: string;
  password: string;
};

// Her çağrıldığında benzersiz kullanıcı adına sahip yeni bir müşteri üretir
export function createCustomer(): Customer {
  const unique = `${Date.now()}${Math.floor(Math.random() * 1000)}`;

  return {
    firstName: 'Test',
    lastName: 'Kullanici',
    street: 'Ataturk Cad. No:1',
    city: 'Istanbul',
    state: 'Istanbul',
    zipCode: '34000',
    phone: '5551234567',
    ssn: '123-45-6789',
    username: `user${unique}`,
    password: 'Test1234!',
  };
}

export type BillPayment = {
  payeeName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  accountNumber: string;
  verifyAccount: string;
  amount: string;
};

// Geçerli bir fatura ödemesi üretir; istenen alanlar "overrides" ile değiştirilebilir
export function createBillPayment(overrides: Partial<BillPayment> = {}): BillPayment {
  return {
    payeeName: 'Istanbul Elektrik',
    street: 'Barbaros Bulvari No:10',
    city: 'Istanbul',
    state: 'Istanbul',
    zipCode: '34349',
    phone: '4440000',
    accountNumber: '12345',
    verifyAccount: '12345',
    amount: '75.50',
    ...overrides,
  };
}
