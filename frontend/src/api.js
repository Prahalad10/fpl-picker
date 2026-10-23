// Backend address: set VITE_API_URL when deployed, otherwise use the local backend
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// GET a backend endpoint and return the parsed JSON.
// Empty params are left out, so "All positions" means no position filter.
export async function get(path, params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== "" && value != null)
  );
  const res = await fetch(`${API_URL}/api${path}?${query}`);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

export const POSITIONS = ["GKP", "DEF", "MID", "FWD"];
