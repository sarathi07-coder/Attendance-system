# WhatsApp Web Automation Service

A Node.js service that automates WhatsApp message sending using WhatsApp Web and Selenium/Puppeteer.

## Features

- **QR Code Authentication**: One-time WhatsApp Web login
- **Session Persistence**: Stays logged in across restarts
- **Single Message**: Send message to one recipient
- **Bulk Messages**: Send messages to multiple recipients
- **REST API**: Easy integration with backend

## Setup

### 1. Install Dependencies

```bash
cd whatsapp-service
npm install
```

### 2. Start the Service

```bash
npm start
```

### 3. Authenticate with WhatsApp

1. Visit `http://localhost:3001/qr` to get QR code
2. Scan QR code with WhatsApp on your phone
3. Service will stay authenticated

## API Endpoints

### Health Check
```bash
GET /health
```

Response:
```json
{
  "status": "running",
  "whatsappReady": true,
  "needsQR": false
}
```

### Get QR Code
```bash
GET /qr
```

### Send Single Message
```bash
POST /send-message
Content-Type: application/json

{
  "phone": "919876543210",
  "message": "Hello from Attendance System!"
}
```

Response:
```json
{
  "success": true,
  "message": "Message sent successfully",
  "recipient": "919876543210"
}
```

### Send Bulk Messages
```bash
POST /send-bulk
Content-Type: application/json

{
  "messages": [
    {
      "phone": "919876543210",
      "message": "Dear Parent, your child was absent today."
    },
    {
      "phone": "919123456789",
      "message": "Dear Student, you were marked absent."
    }
  ]
}
```

Response:
```json
{
  "success": true,
  "results": [...],
  "total": 2,
  "sent": 2,
  "failed": 0
}
```

### Logout
```bash
POST /logout
```

## Phone Number Format

- **With country code**: `919876543210` (India)
- **Without country code**: `9876543210` (auto-adds 91)
- **With +**: `+919876543210` (auto-formatted)

## Docker Deployment

```bash
docker build -t whatsapp-service .
docker run -p 3001:3001 -v whatsapp_session:/app/whatsapp-session whatsapp-service
```

## Important Notes

1. **First Time Setup**: You must scan QR code once
2. **Session Persistence**: Session saved in `whatsapp-session/` folder
3. **Rate Limiting**: 2-second delay between bulk messages
4. **WhatsApp Limits**: Don't send too many messages quickly (risk of ban)

## Troubleshooting

### QR Code Not Showing
- Check if service is running: `curl http://localhost:3001/health`
- Restart service: `npm start`

### Messages Not Sending
- Check WhatsApp is authenticated: `GET /health`
- Verify phone number format
- Check WhatsApp Web is not open elsewhere

### Session Lost
- Delete `whatsapp-session/` folder
- Restart service and scan QR code again
