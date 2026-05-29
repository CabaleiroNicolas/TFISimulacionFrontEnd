const API_HOST = import.meta.env.VITE_API_HOST ?? 'http://localhost:8080';

export async function getPrecios() {
  const res = await fetch(`${API_HOST}/api/precios`);
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const json = await res.json();
  return json.precios;
}

export async function updatePrecios(precios) {
  const res = await fetch(`${API_HOST}/api/precios`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ precios }),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const json = await res.json();
  return json.precios;
}
