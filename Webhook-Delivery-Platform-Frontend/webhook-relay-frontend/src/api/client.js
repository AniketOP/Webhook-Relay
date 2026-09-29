import axios from 'axios';
import { useApiStore } from '../store/apiStore';

const getClient = () => {
  const { baseUrl, apiKey } = useApiStore.getState();
  return axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'X-API-KEY': apiKey } : {}),
    },
    timeout: 10000,
  });
};

// ─── Events ───────────────────────────────────────────────────
export const api = {
  events: {
    getAll:  ()        => getClient().get('/event'),
    create:  (data)    => getClient().post('/event', data),
    update:  (id, d)   => getClient().patch(`/event/${id}`, d),
    delete:  (id)      => getClient().delete(`/event/${id}`),
  },

  // ─── Subscribers ──────────────────────────────────────────────
  subscribers: {
    getAll:  ()        => getClient().get('/subscriber'),
    create:  (data)    => getClient().post('/subscriber', data),
    update:  (id, d)   => getClient().patch(`/subscriber/${id}`, d),
    delete:  (id)      => getClient().delete(`/subscriber/${id}`),
  },

  // ─── Delivery Attempts ────────────────────────────────────────
  deliveries: {
    getAll:  ()        => getClient().get('/delivery-attempt'),
    create:  (data)    => getClient().post('/delivery-attempt', data),
    update:  (id, d)   => getClient().patch(`/delivery-attempt/${id}`, d),
    delete:  (id)      => getClient().delete(`/delivery-attempt/${id}`),
    replay:  (id)      => getClient().post(`/delivery-attempt/${id}/send`),
  },

  // ─── Circuit Breakers ─────────────────────────────────────────
  circuitBreakers: {
    getAll:  ()        => getClient().get('/actuator/circuitbreakers'),
    getOne:  (name)    => getClient().get(`/actuator/circuitbreakers/${name}`),
  },

  // ─── Dev / API Key ────────────────────────────────────────────
  dev: {
    generateKey: () => getClient().post('/dev/generate-api-key'),
  },

  // ─── Health ───────────────────────────────────────────────────
  health: {
    check: () => getClient().get('/actuator/health'),
  },
};
