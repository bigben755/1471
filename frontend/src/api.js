import axios from "axios";

const BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;
export const TOKEN_KEY = "horwich_token";

export const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem(TOKEN_KEY);
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const ROLE_LABELS = {
  admin: "Squadron Admin",
  cfav: "Adult Volunteer (CFAV)",
  cadet: "Cadet",
  parent: "Parent / Carer",
};
