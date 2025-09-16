import api from "@/lib/axios";

export async function loginUtil(email: string, password: string) {
  const res = await api.post("/user/login", { email, password });
  return res.data;
}

export async function signupUtil(name: string, email: string, password: string) {
  const res = await api.post("/user/register", { name, email, password });
  return res.data;
}

export async function logoutUtil() {
  const res = await api.post("/user/logout");
}

export async function verifyUtil() {
  const res = await api.get("/user/verify");
  return res.data;
}
