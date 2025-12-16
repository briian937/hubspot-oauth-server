export default function handler(req, res) {
  try {
    const clientId = process.env.HUBSPOT_CLIENT_ID;
    const redirectUri = 'https://hubspot-oauth-server.vercel.app/api/hubspot/callback';

    const scopes = [
      'oauth',
      'crm.objects.contacts.read',
      'crm.objects.deals.read',
      'crm.objects.owners.read'
    ].join(' ');

    // Genera un state simple (solo para prueba)
    const state = Date.now().toString();

    const authUrl =
      'https://app.hubspot.com/oauth/authorize' +
      `?client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&state=${state}`;

    // Redirige al usuario
    res.writeHead(302, { Location: authUrl });
    res.end();
  } catch (err) {
    console.error('Error in auth endpoint:', err);
    res.status(500).json({ error: err.message });
  }
}
