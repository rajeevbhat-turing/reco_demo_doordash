// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  country: {
    dialCode: string;
    code: string;
    name: string;
  };
}
