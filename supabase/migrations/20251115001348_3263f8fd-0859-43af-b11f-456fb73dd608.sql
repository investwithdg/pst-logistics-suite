-- Add webhook config for quote acceptance
INSERT INTO webhook_config (webhook_name, webhook_type, description, is_active)
VALUES (
  'hubspot-quote-accepted',
  'edge-function',
  'Syncs quote acceptance to HubSpot to create contact and deal',
  false
)
ON CONFLICT (webhook_name) DO NOTHING;