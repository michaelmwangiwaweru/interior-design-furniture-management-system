import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:9193",
  withCredentials: true
});

export const login = (email, password) =>
  API.post("/auth/login", new URLSearchParams({email, password}));

export const registerUser = (user) =>
  API.post("/auth/register", user);

export const getRoleRedirect = () =>
  API.get("/auth/role-redirect");

export const changePassword = (newPassword) =>
  API.post("/auth/change-password?newPassword=" + newPassword);
