import { atom, selector } from 'recoil';
import axios from 'axios';

export const authState = atom({
  key: 'authState',
  default: {
    user: null,
    token: null,
    role: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }
});

// Add a selector to refresh user data

export const refreshUserData = selector({
  key: 'refreshUserData',
  get: async () => {
    // Get current user data
    const response = await axios.get(`${import.meta.env.VITE_URI}/user/profile`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data.data;
  },
});