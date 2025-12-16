export default async function handler(req, res) {
  try {
    const { code, state: userId } = req.query;

    if (!code || !userId) {
      return res.status(400).send('Missing code or user ID');
    }

    // 1. Intercambia el code por tokens en HubSpot
    const tokenRes = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.HUBSPOT_CLIENT_ID,
        client_secret: process.env.HUBSPOT_CLIENT_SECRET,
        redirect_uri: 'https://hubspot-oauth-server.vercel.app/api/hubspot/callback',
        code
      })
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return res.status(500).send('Failed to get HubSpot tokens');
    }

    // 2. Envía tokens a Base44
    const base44Res = await fetch('https://sales-climber-ef437b1b.base44.app/api/functions/hubspotCallback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        hubspot_access_token: tokenData.access_token,
        hubspot_refresh_token: tokenData.refresh_token,
        hubspot_expires_at: Date.now() + tokenData.expires_in * 1000
      })
    });

    if (!base44Res.ok) {
      const errText = await base44Res.text();
      return res.status(500).send('Error sending tokens to Base44: ' + errText);
    }

    // 3. Mensaje final al usuario
    res.send('HubSpot connected. You can close this window.');

  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).send('Internal Server Error: ' + error.message);
  }
}
