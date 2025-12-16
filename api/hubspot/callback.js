export default async function handler(req, res) {
  try {
    const { code, state: userId } = req.query;

    if (!code || !userId) {
      return res.status(400).send('Missing code or userId');
    }

    // Intercambia el code por tokens
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

    const data = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error('Error fetching tokens from HubSpot:', data);
      return res.status(500).send('Failed to get tokens from HubSpot');
    }

    // Envía los tokens a Base44
    const base44Res = await fetch('https://sales-climber-ef437b1b.base44.app/api/functions/hubspotCallback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        hubspot_access_token: data.access_token,
        hubspot_refresh_token: data.refresh_token,
        hubspot_expires_at: Date.now() + data.expires_in * 1000
      })
    });

    const base44Data = await base44Res.json();

    if (!base44Res.ok) {
      console.error('Error sending tokens to Base44:', base44Data);
      return res.status(500).send('Error sending tokens to Base44');
    }

    // Todo ok
    res.send('HubSpot connected. You can close this window.');

  } catch (err) {
    console.error('Callback error:', err);
    res.status(500).send('Internal Server Error');
  }
}
