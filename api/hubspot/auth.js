import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

export default async function handler(req, res) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const clientId = process.env.HUBSPOT_CLIENT_ID;
    const redirectUri = 'https://hubspot-oauth-server.vercel.app/api/hubspot/callback';

    const scopes = [
      'oauth',
      'crm.objects.contacts.read',
      'crm.objects.deals.read',
      'crm.objects.owners.read'
    ].join(' ');

    // Aquí usamos el user ID como state
    const state = user.id;

    const authUrl =
      'https://app.hubspot.com/oauth/authorize' +
      `?client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&state=${state}`;

    // Redirige al usuario a HubSpot
    res.writeHead(302, { Location: authUrl });
    res.end();

  } catch (err) {
    console.error('Error in auth endpoint:', err);
    res.status(500).json({ error: err.message });
  }
}
