import { apiRequest } from "./api";

export async function login(
  branch_id: string,
  username: string,
  password: string
) {

  const res = await apiRequest("/login", "POST", {
    branch_id,
    username,
    password,
    client_ip: "127.0.0.1",
  });

  if (res.status) {

    localStorage.setItem("jwt", res.data.jwt);

    return true;
  }

  return false;
}