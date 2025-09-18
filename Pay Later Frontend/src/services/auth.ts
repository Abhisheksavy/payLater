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
  await api.post("/user/logout");
}

export async function verifyUtil(user) {
  const res = await api.post("/user/verify", {
      userId: user.id,
    });
  return res.data;
}
