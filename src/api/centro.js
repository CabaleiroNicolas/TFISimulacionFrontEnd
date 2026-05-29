const API_HOST = import.meta.env.VITE_API_HOST ?? 'http://localhost:8080';

export async function getCentro() {
  const res = await fetch(`${API_HOST}/api/centro`);
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return res.json();
}

export async function updateCentro(data) {
  const res = await fetch(`${API_HOST}/api/centro`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return res.json();
}
