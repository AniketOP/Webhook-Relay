import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useApiStore = create(
  persist(
    (set) => ({
      baseUrl: 'http://localhost:8080',
      apiKey: '',
      isConnected: false,
      setBaseUrl: (url) => set({ baseUrl: url }),
      setApiKey: (key) => set({ apiKey: key }),
      setConnected: (val) => set({ isConnected: val }),
    }),
    { name: 'webhook-api-config' }
  )
);
