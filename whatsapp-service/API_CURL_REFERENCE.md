# WhatsApp Baileys Service - Complete API Reference (71 Features)

## Base URL
```bash
BASE_URL="http://localhost:3000/api"
INSTANCE_ID="your-instance-id"
```

---

## Instance Management (6 Features)

### 1. Create Instance
```bash
curl -X POST "$BASE_URL/instance/create" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My WhatsApp Instance"
  }'
```

### 2. List Instances
```bash
curl "$BASE_URL/instance/list"
```

### 3. Get Instance
```bash
curl "$BASE_URL/instance/$INSTANCE_ID"
```

### 4. Get QR Code
```bash
curl "$BASE_URL/instance/$INSTANCE_ID/qr"
```

### 5. Get Instance Status
```bash
curl "$BASE_URL/instance/$INSTANCE_ID/status"
```

### 6. Delete Instance
```bash
curl -X DELETE "$BASE_URL/instance/$INSTANCE_ID"
```

### 7. Logout Instance
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/logout"
```

---

## Core Messaging (8 Features)

### 8. Send Text Message
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/send/text" \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "1234567890@s.whatsapp.net",
    "text": "Hello, World!"
  }'
```

### 9. Send Image
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/send/media" \
  -F "jid=1234567890@s.whatsapp.net" \
  -F "type=image" \
  -F "caption=Check this out!" \
  -F "file=@/path/to/image.jpg"
```

### 10. Send Video
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/send/media" \
  -F "jid=1234567890@s.whatsapp.net" \
  -F "type=video" \
  -F "caption=Watch this!" \
  -F "file=@/path/to/video.mp4"
```

### 11. Send Audio
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/send/media" \
  -F "jid=1234567890@s.whatsapp.net" \
  -F "type=audio" \
  -F "file=@/path/to/audio.mp3"
```

### 12. Send Document
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/send/media" \
  -F "jid=1234567890@s.whatsapp.net" \
  -F "type=document" \
  -F "file=@/path/to/document.pdf"
```

### 13. Send Location
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/send/location" \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "1234567890@s.whatsapp.net",
    "latitude": 37.7749,
    "longitude": -122.4194
  }'
```

### 14. Send Reaction
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/send/reaction" \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "1234567890@s.whatsapp.net",
    "messageId": "MESSAGE_ID",
    "emoji": "👍"
  }'
```

### 15. Delete Message
```bash
curl -X DELETE "$BASE_URL/instance/$INSTANCE_ID/message" \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "1234567890@s.whatsapp.net",
    "messageId": "MESSAGE_ID"
  }'
```

---

## Enhanced Messaging - Phase 1 (7 Features)

### 16. Send Reply/Quote
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/send/reply" \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "1234567890@s.whatsapp.net",
    "text": "This is a reply",
    "quotedMessageId": "MESSAGE_ID_TO_QUOTE"
  }'
```

### 17. Send Mention
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/send/mention" \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "123456789-987654321@g.us",
    "text": "Hello @user1 and @user2!",
    "mentions": [
      "1234567890@s.whatsapp.net",
      "0987654321@s.whatsapp.net"
    ]
  }'
```

### 18. Forward Message
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/message/forward" \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "1234567890@s.whatsapp.net",
    "messageId": "MESSAGE_ID_TO_FORWARD",
    "fromJid": "SOURCE_JID"
  }'
```

### 19. Edit Message
```bash
curl -X PUT "$BASE_URL/instance/$INSTANCE_ID/message/edit" \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "1234567890@s.whatsapp.net",
    "messageId": "MESSAGE_ID",
    "newText": "Updated message text"
  }'
```

### 20. Pin Message
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/message/pin" \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "1234567890@s.whatsapp.net",
    "messageId": "MESSAGE_ID"
  }'
```

### 21. Unpin Message
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/message/unpin" \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "1234567890@s.whatsapp.net",
    "messageId": "MESSAGE_ID"
  }'
```

### 22. Send ViewOnce Media
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/send/viewonce" \
  -F "jid=1234567890@s.whatsapp.net" \
  -F "mediaType=image" \
  -F "caption=This disappears after viewing" \
  -F "file=@/path/to/image.jpg"
```

### 23. Send Poll
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/send/poll" \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "123456789-987654321@g.us",
    "pollName": "What is your favorite color?",
    "options": ["Red", "Blue", "Green", "Yellow"],
    "selectableCount": 1
  }'
```

---

## Media Operations (4 Features)

### 24. Download Media
```bash
curl "$BASE_URL/instance/$INSTANCE_ID/media/MESSAGE_ID/download?jid=1234567890@s.whatsapp.net" \
  --output downloaded_media.jpg
```

### 25. Generate Thumbnail
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/media/thumbnail" \
  -F "file=@/path/to/image.jpg" \
  -F "width=200" \
  -F "height=200" \
  --output thumbnail.jpg
```

### 26. Optimize Image
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/media/optimize" \
  -F "file=@/path/to/image.jpg" \
  -F "quality=85" \
  --output optimized.jpg
```

---

## Chat Management (8 Features)

### 27. Archive Chat
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/chat/archive" \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "1234567890@s.whatsapp.net",
    "archive": true
  }'
```

### 28. Mute Chat
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/chat/mute" \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "1234567890@s.whatsapp.net",
    "duration": 86400
  }'
```

### 29. Mark Chat as Read
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/chat/read" \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "1234567890@s.whatsapp.net",
    "read": true
  }'
```

### 30. Pin Chat
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/chat/pin" \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "1234567890@s.whatsapp.net",
    "pin": true
  }'
```

### 31. Delete Chat
```bash
curl -X DELETE "$BASE_URL/instance/$INSTANCE_ID/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "1234567890@s.whatsapp.net"
  }'
```

### 32. Star Message
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/chat/star" \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "1234567890@s.whatsapp.net",
    "messageId": "MESSAGE_ID",
    "star": true
  }'
```

### 33. Set Disappearing Messages
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/chat/disappearing" \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "1234567890@s.whatsapp.net",
    "duration": 86400
  }'
```

### 34. Get Chat History
```bash
curl "$BASE_URL/instance/$INSTANCE_ID/chat/history?jid=1234567890@s.whatsapp.net&limit=50"
```

---

## Presence & Status (7 Features)

### 35. Update Presence
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/presence/update" \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "1234567890@s.whatsapp.net",
    "presence": "available"
  }'
```

### 36. Set Typing Indicator
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/presence/typing" \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "1234567890@s.whatsapp.net",
    "isTyping": true
  }'
```

### 37. Set Online Status
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/presence/online" \
  -H "Content-Type: application/json" \
  -d '{
    "online": true
  }'
```

---

## Profile Management (7 Features)

### 38. Update Profile Name
```bash
curl -X PUT "$BASE_URL/instance/$INSTANCE_ID/profile/name" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My New Name"
  }'
```

### 39. Update Profile Status
```bash
curl -X PUT "$BASE_URL/instance/$INSTANCE_ID/profile/status" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Hey there! I am using WhatsApp"
  }'
```

### 40. Update Profile Picture
```bash
curl -X PUT "$BASE_URL/instance/$INSTANCE_ID/profile/picture" \
  -F "file=@/path/to/profile.jpg"
```

### 41. Get Profile Picture
```bash
curl "$BASE_URL/instance/$INSTANCE_ID/profile/picture?jid=1234567890@s.whatsapp.net"
```

---

## Privacy Settings (9 Features)

### 42. Block User
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/privacy/block" \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "1234567890@s.whatsapp.net"
  }'
```

### 43. Unblock User
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/privacy/unblock" \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "1234567890@s.whatsapp.net"
  }'
```

### 44. Get Block List
```bash
curl "$BASE_URL/instance/$INSTANCE_ID/privacy/blocklist"
```

### 45. Update Privacy Settings
```bash
curl -X PUT "$BASE_URL/instance/$INSTANCE_ID/privacy/settings" \
  -H "Content-Type: application/json" \
  -d '{
    "lastSeen": "contacts",
    "online": "all",
    "profilePhoto": "contacts",
    "status": "contacts",
    "readReceipts": true,
    "groupAdd": "contacts"
  }'
```

### 46. Get Privacy Settings
```bash
curl "$BASE_URL/instance/$INSTANCE_ID/privacy/settings"
```

---

## Broadcast & Stories (3 Features)

### 47. Send Broadcast
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/broadcast/send" \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": [
      "1234567890@s.whatsapp.net",
      "0987654321@s.whatsapp.net"
    ],
    "message": {
      "text": "Broadcast message to all!"
    }
  }'
```

### 48. Send Status/Story (Text)
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/status/send" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "content": "My status update",
    "backgroundColor": "#FF5733",
    "font": 1
  }'
```

### 49. Send Status/Story (Media)
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/status/send" \
  -F "type=image" \
  -F "caption=Check out my story!" \
  -F "file=@/path/to/image.jpg"
```

---

## Group Management (8 Features)

### 50. Create Group
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/group/create" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "My Group",
    "participants": [
      "1234567890@s.whatsapp.net",
      "0987654321@s.whatsapp.net"
    ]
  }'
```

### 51. List Groups
```bash
curl "$BASE_URL/instance/$INSTANCE_ID/groups"
```

### 52. Get Group Info
```bash
curl "$BASE_URL/instance/$INSTANCE_ID/group/GROUP_JID"
```

### 53. Update Group Subject
```bash
curl -X PUT "$BASE_URL/instance/$INSTANCE_ID/group/GROUP_JID/subject" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Updated Group Name"
  }'
```

### 54. Update Group Description
```bash
curl -X PUT "$BASE_URL/instance/$INSTANCE_ID/group/GROUP_JID/description" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "This is the group description"
  }'
```

### 55. Add/Remove Participants
```bash
# Add participants
curl -X PUT "$BASE_URL/instance/$INSTANCE_ID/group/GROUP_JID/participants" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add",
    "participants": ["1234567890@s.whatsapp.net"]
  }'

# Remove participants
curl -X PUT "$BASE_URL/instance/$INSTANCE_ID/group/GROUP_JID/participants" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "remove",
    "participants": ["1234567890@s.whatsapp.net"]
  }'
```

### 56. Promote/Demote Admins
```bash
# Promote to admin
curl -X PUT "$BASE_URL/instance/$INSTANCE_ID/group/GROUP_JID/participants" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "promote",
    "participants": ["1234567890@s.whatsapp.net"]
  }'

# Demote from admin
curl -X PUT "$BASE_URL/instance/$INSTANCE_ID/group/GROUP_JID/participants" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "demote",
    "participants": ["1234567890@s.whatsapp.net"]
  }'
```

### 57. Leave Group
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/group/GROUP_JID/leave"
```

### 58. Get Group Invite Code
```bash
curl "$BASE_URL/instance/$INSTANCE_ID/group/GROUP_JID/invite"
```

---

## Utilities (8 Features)

### 59. Check Number Exists
```bash
curl "$BASE_URL/instance/$INSTANCE_ID/utils/check-number?number=1234567890"
```

### 60. Validate JID
```bash
curl "$BASE_URL/instance/$INSTANCE_ID/utils/validate-jid?jid=1234567890@s.whatsapp.net"
```

### 61. Format Number to JID
```bash
curl "$BASE_URL/instance/$INSTANCE_ID/utils/format-number?number=1234567890"
```

### 62. Get Device Info
```bash
curl "$BASE_URL/instance/$INSTANCE_ID/utils/device-info"
```

---

## Advanced Features - Phase 2 (6 Features)

### 63. Send Link Preview
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/advanced/link-preview" \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "1234567890@s.whatsapp.net",
    "text": "Check out this link:",
    "url": "https://example.com",
    "title": "Example Website",
    "description": "This is an example"
  }'
```

### 64. Send Sticker
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/advanced/sticker" \
  -F "jid=1234567890@s.whatsapp.net" \
  -F "file=@/path/to/sticker.webp"
```

### 65. Search Messages
```bash
curl "$BASE_URL/instance/$INSTANCE_ID/advanced/search?query=hello&jid=1234567890@s.whatsapp.net&limit=50"
```

### 66. Export Chat
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/advanced/export" \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "1234567890@s.whatsapp.net",
    "format": "json"
  }'
```

---

## Health & Monitoring (2 Features)

### 67. Health Check
```bash
curl "$BASE_URL/health"
```

### 68. Get Messages
```bash
curl "$BASE_URL/instance/$INSTANCE_ID/messages?jid=1234567890@s.whatsapp.net&limit=50"
```

---

## Additional Features (3)

### 69. Get Connection State
```bash
curl "$BASE_URL/instance/$INSTANCE_ID/status"
```

### 70. Reject Call
```bash
# Handled automatically by the service
# Configure in connection.ts event handlers
```

### 71. Logout and Clear Session
```bash
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/logout"
```

---

## Testing Script

Save this as `test_all_features.sh`:

```bash
#!/bin/bash

# Configuration
BASE_URL="http://localhost:3000/api"
INSTANCE_ID=""

# Create instance first
echo "Creating instance..."
RESPONSE=$(curl -s -X POST "$BASE_URL/instance/create" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Instance"}')

INSTANCE_ID=$(echo $RESPONSE | jq -r '.data.instanceId')
echo "Instance ID: $INSTANCE_ID"

# Wait for QR scan
echo "Scan QR code..."
curl "$BASE_URL/instance/$INSTANCE_ID/qr"

# Test messaging
echo "Testing text message..."
curl -X POST "$BASE_URL/instance/$INSTANCE_ID/send/text" \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "1234567890@s.whatsapp.net",
    "text": "Test message"
  }'

# Add more tests as needed...
```

---

## Rate Limits

- **General:** 60 requests/minute per instance
- **Messages:** 30 messages/minute
- **Media:** 10 uploads/minute
- **Auth:** 5 attempts/15 minutes

---

## Response Format

All endpoints return JSON in this format:

```json
{
  "success": true,
  "data": {
    "messageId": "...",
    "timestamp": "..."
  }
}
```

Error format:
```json
{
  "error": "Error message",
  "statusCode": 400,
  "timestamp": "2025-01-01T00:00:00.000Z",
  "path": "/api/..."
}
```

---

**Total Features: 71**
**Production Ready: ✅**
