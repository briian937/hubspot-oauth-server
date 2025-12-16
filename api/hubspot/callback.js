export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Missing code');
  }

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

  // 👇 aquí luego lo enviaremos a Base44
  console.log('HubSpot tokens:', data);

  res.send('HubSpot connected. You can close this window.');
}

