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
