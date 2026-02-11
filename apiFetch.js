export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("jwt");

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  if (res.status === 401) {
    alert("Sesión expirada. Volvé a iniciar sesión.");
    window.location.href = "/login.html";
    throw new Error("Unauthorized");
  }

  return res;
}
