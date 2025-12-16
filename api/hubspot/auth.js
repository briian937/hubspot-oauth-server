export default function handler(req, res) {
  console.log('=== auth function reached ===');

  try {
    const clientId = process.env.HUBSPOT_CLIENT_ID;
    if (!clientId) {
      console.error('HUBSPOT_CLIENT_ID is not set in environment variables');
      return res.status(500).json({ error: 'HUBSPOT_CLIENT_ID not defined' });
    }

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

    console.log('Redirecting user to HubSpot auth URL:', authUrl);

    // Redirige al usuario
    res.writeHead(302, { Location: authUrl });
    res.end();

  } catch (err) {
    console.error('Error in auth endpoint:', err);
    res.status(500).json({ error: err.message });
  }
}
