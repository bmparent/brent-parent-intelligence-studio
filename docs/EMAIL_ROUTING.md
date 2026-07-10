# Cloudflare Email Routing

Eidos Works uses Cloudflare Email Routing so public aliases at `eidos-works.com` can forward to Brent's existing inbox without adding a paid mailbox subscription.

## Required aliases

| Alias | Use |
| --- | --- |
| `hello@eidos-works.com` | Main public contact |
| `projects@eidos-works.com` | Project forms and inquiries |
| `snapshot@eidos-works.com` | Snapshot support and order review |
| `billing@eidos-works.com` | Payment and billing support |
| `bmp@eidos-works.com` | Brent's direct/operator address |

## Setup

1. Open Cloudflare Dashboard → `eidos-works.com` → Email → Email Routing.
2. Verify the existing destination inbox. Do not create routes until Cloudflare shows the destination as verified.
3. Review every existing routing rule and preserve it.
4. Create each alias above as a custom address forwarding to the verified destination.
5. Send a test message to every alias from an unrelated email account and confirm delivery.
6. Keep the destination inbox in `DESTINATION_FORWARD_EMAIL` only in secure environment configuration; never commit it.

Cloudflare Email Routing handles inbound forwarding. It does not send transactional form confirmations or Snapshot delivery messages. The current site therefore uses an honest inquiry `mailto:` fallback unless a verified Apps Script or existing webhook delivery path is configured.

No email routes were changed automatically from this repository.
