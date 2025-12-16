export default async function handler(req, res) {
  const { code, state: userId } = req.query;

  if (!code || !userId) {
    return res.status(400).send('Missing code or state');
  }

  try {
    // Intercambia el code por access & refresh tokens
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

    if (!tokenRes.ok) {
      console.error('Failed to exchange code for token:', tokenData);
      return res.status(500).send('Error exchanging code for token');
    }

    // Envía tokens a Base44
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
      console.error('Failed to send tokens to Base44:', errText);
      return res.status(500).send('Error sending tokens to Base44');
    }

    // ✅ Todo correcto, cerramos la ventana automáticamente
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <script>
        alert('HubSpot connected successfully!');
        window.close();
      </script>
      <p>If the window does not close automatically, you can close it manually.</p>
    `);

  } catch (err) {
    console.error('Callback error:', err);
    res.status(500).send('Unexpected error');
  }
}
