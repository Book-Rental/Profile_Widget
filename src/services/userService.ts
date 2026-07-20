import axios from "axios";
import { Address, UserResponse } from "../types/user";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePic?: File;
}

export const getUser = async (
  userId: string
): Promise<UserResponse> => {
  const response = await axios.get(
    `${API_URL}/user/${userId}`,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const updateUser = async (
  userId: string,
  payload: UpdateUserPayload
): Promise<UserResponse> => {

  const formData = new FormData();

  if (payload.firstName) {
    formData.append("firstName", payload.firstName);
  }

  if (payload.lastName) {
    formData.append("lastName", payload.lastName);
  }

  if (payload.email) {
    formData.append("email", payload.email);
  }

  if (payload.profilePic) {
    formData.append("profilePic", payload.profilePic);
  }

  const response = await axios.put(
    `${API_URL}/user/${userId}`,
    formData,
    {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};
export const addAddress = async (
  userId: string,
  address: Address
) => {
  const response = await axios.post(
    `${API_URL}/user/addAddress/${userId}`,
    address,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const updateAddress = async (
  userId: string,
  addressId: string,
  address: Address
) => {
  const response = await axios.put(
    `${API_URL}/user/updateAddress/${userId}/${addressId}`,
    address,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const deleteAddress = async (
  userId: string,
  addressId: string
) => {
  const response = await axios.delete(
    `${API_URL}/user/deleteAddress/${userId}/${addressId}`,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const getAddresses = async (
  userId: string
) => {
  const response = await axios.get(
    `${API_URL}/user/addresses/${userId}`,
    {
      withCredentials: true,
    }
  );

  return response.data;
};