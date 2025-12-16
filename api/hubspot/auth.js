import crypto from 'crypto';

export default function handler(req, res) {
  const clientId = process.env.HUBSPOT_CLIENT_ID;
  const redirectUri = 'https://hubspot-oauth-server.vercel.app/api/hubspot/callback';

  const scopes = [
    'oauth',
    'crm.objects.contacts.read',
    'crm.objects.deals.read',
    'crm.objects.owners.read'
  ].join(' ');

  const state = crypto.randomUUID();

  const authUrl =
    'https://app.hubspot.com/oauth/authorize' +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&state=${state}`;

  res.redirect(authUrl);
}

