-- Add 'quote-accepted' Make.com webhook to webhook_config if missing
INSERT INTO public.webhook_config (webhook_name, webhook_type, description, is_active)
VALUES ('quote-accepted', 'make-webhook', 'Quote accepted -> create contact and deal', true)
ON CONFLICT (webhook_name) DO UPDATE
SET webhook_type = EXCLUDED.webhook_type,
    description = EXCLUDED.description,
    is_active = true,
    updated_at = now();


