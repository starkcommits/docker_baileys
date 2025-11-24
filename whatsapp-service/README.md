# WhatsApp Baileys Service

A containerized WhatsApp integration service built with Baileys library for Frappe Docker setup.

## Features

- 🔐 **Multi-device Authentication** - QR code and pairing code support
- 💬 **Complete Messaging** - Text, images, videos, audio, documents, location, contacts
- 👥 **Group Management** - Create, manage participants, update settings
- 🔄 **Event Webhooks** - Real-time notifications to Frappe backend
- 📦 **Multi-instance Support** - Run multiple WhatsApp accounts
- 💾 **Persistent Storage** - PostgreSQL database for sessions and messages
- 🐳 **Docker Ready** - Fully containerized with health checks

## Quick Start

### 1. Build and Start Services

```bash
# From the project root
docker compose up -d whatsapp-db whatsapp-baileys
```

### 2. Check Service Status

```bash
# View logs
docker compose logs -f whatsapp-baileys

# Check health
curl http://localhost:3000/api/health
```

### 3. Create WhatsApp Instance

```bash
curl -X POST http://localhost:3000/api/instance/create \
  -H "Content-Type: application/json" \
  -d '{"name": "my-whatsapp"}'
```

### 4. Get QR Code

```bash
curl http://localhost:3000/api/instance/{instanceId}/qr
```

Scan the QR code with WhatsApp mobile app (Linked Devices).

## API Endpoints

### Instance Management

- `POST /api/instance/create` - Create new instance
- `GET /api/instance/list` - List all instances
- `GET /api/instance/:id` - Get instance details
- `GET /api/instance/:id/qr` - Get QR code for authentication
- `GET /api/instance/:id/status` - Get connection status
- `DELETE /api/instance/:id` - Delete instance
- `POST /api/instance/:id/logout` - Logout from WhatsApp

### Messaging

- `POST /api/instance/:id/send/text` - Send text message
  ```json
  { "jid": "1234567890@s.whatsapp.net", "text": "Hello!" }
  ```

- `POST /api/instance/:id/send/media` - Send media (multipart/form-data)
  - Fields: `jid`, `type` (image/video/audio/document), `caption`, `file`

- `POST /api/instance/:id/send/location` - Send location
  ```json
  { "jid": "...", "latitude": 37.7749, "longitude": -122.4194 }
  ```

- `POST /api/instance/:id/send/reaction` - React to message
  ```json
  { "jid": "...", "messageId": "...", "emoji": "👍" }
  ```

- `GET /api/instance/:id/messages?jid=...&limit=50` - Get message history
- `DELETE /api/instance/:id/message` - Delete message

### Group Management

- `POST /api/instance/:id/group/create` - Create group
  ```json
  { "subject": "My Group", "participants": ["1234@s.whatsapp.net"] }
  ```

- `GET /api/instance/:id/groups` - List all groups
- `GET /api/instance/:id/group/:groupJid` - Get group info
- `PUT /api/instance/:id/group/:groupJid/subject` - Update group name
- `PUT /api/instance/:id/group/:groupJid/description` - Update description
- `PUT /api/instance/:id/group/:groupJid/participants` - Manage participants
  ```json
  { "action": "add|remove|promote|demote", "participants": ["..."] }
  ```

- `POST /api/instance/:id/group/:groupJid/leave` - Leave group
- `GET /api/instance/:id/group/:groupJid/invite` - Get invite code

## JID Format

- **Individual**: `{phone_number}@s.whatsapp.net` (e.g., `1234567890@s.whatsapp.net`)
- **Group**: `{group_id}@g.us`

Phone numbers should include country code without `+` or spaces.

## Webhooks

The service sends webhooks to the configured `WEBHOOK_URL` for:

- `message.received` - New incoming message
- `message.status` - Message status update (sent, delivered, read)
- `connection.update` - Connection status changes

Webhook payload:
```json
{
  "instanceId": "instance_...",
  "event": "message.received",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP server port |
| `DB_HOST` | `whatsapp-db` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `whatsapp` | Database name |
| `DB_USER` | `whatsapp` | Database user |
| `DB_PASSWORD` | `whatsapp_password` | Database password |
| `LOG_LEVEL` | `info` | Logging level |
| `WEBHOOK_URL` | - | Frappe webhook endpoint |
| `AUTH_DIR` | `/app/auth_info` | Auth state directory |
| `MEDIA_DIR` | `/app/media` | Media files directory |

## Development

### Local Development

```bash
cd whatsapp-service

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run in development mode
npm run dev
```

### Build TypeScript

```bash
npm run build
```

### Production

```bash
npm start
```

## Architecture

```
whatsapp-service/
├── src/
│   ├── api/
│   │   ├── controllers/    # Request handlers
│   │   └── routes.ts       # API routes
│   ├── database/
│   │   ├── client.ts       # PostgreSQL client
│   │   └── schema.sql      # Database schema
│   ├── whatsapp/
│   │   ├── connection.ts   # Baileys connection manager
│   │   ├── messages.ts     # Message operations
│   │   └── groups.ts       # Group operations
│   ├── utils/
│   │   ├── logger.ts       # Logging utility
│   │   └── webhooks.ts     # Webhook dispatcher
│   └── index.ts            # Application entry point
├── Dockerfile
├── package.json
└── tsconfig.json
```

## Troubleshooting

### QR Code Not Appearing

- Check instance status: `GET /api/instance/:id/status`
- View logs: `docker compose logs whatsapp-baileys`
- Ensure instance is in `qr` or `connecting` state

### Connection Issues

- Verify database is healthy: `docker compose ps whatsapp-db`
- Check network connectivity between containers
- Ensure WhatsApp account is not logged in elsewhere

### Message Not Sending

- Verify instance is connected: status should be `connected`
- Check JID format (include `@s.whatsapp.net` for individuals)
- Ensure phone number has WhatsApp account

## Security Notes

⚠️ **Important**: This service uses WhatsApp's unofficial API through Baileys library.

- Not officially endorsed by WhatsApp
- Account may be banned for spam/bulk messaging
- Use responsibly and comply with WhatsApp Terms of Service
- Recommended for personal/small business use only

## License

MIT
