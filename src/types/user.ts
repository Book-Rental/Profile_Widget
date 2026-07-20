export interface Address {
  _id?: string;
  id?: string;
  name: string;
  type: "home" | "work" | "other";
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;

  location: {
    type: "Point";
    coordinates: number[];
  };
}
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePic?: string;
  addresses: Address[];
}

export interface UserResponse {
  status: string;
  message: string;
  data: User;
}