import { loadData } from '../server/data.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  response.setHeader('Cache-Control', 'no-store');
  try {
    const sheets = await loadData(process.env);
    return response.status(200).json(sheets);
  } catch (error) {
    return response.status(502).json({ error: error.message });
  }
}
