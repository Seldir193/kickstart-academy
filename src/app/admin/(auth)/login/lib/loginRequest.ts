export async function requestLogin(email: string, password: string) {
  return fetch("/api/admin/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }), credentials: "include", cache: "no-store" });
}

export async function readLoginError(response: Response) {
  const text = await response.text();
  const data = parseLoginError(text);
  return data?.error || "Login failed";
}

function parseLoginError(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return { error: text || "Login failed" };
  }
}
