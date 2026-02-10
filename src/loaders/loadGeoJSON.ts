export async function loadGeoJSON(path: string) {
  const res = await fetch(path);

  if (!res.ok) {
    throw new Error(`Failed to load GeoJSON: ${res.status}`);
  }

  const data = await res.json();

  if (!data || data.type !== 'FeatureCollection') {
    throw new Error('Invalid GeoJSON format');
  }

  return data;
}
