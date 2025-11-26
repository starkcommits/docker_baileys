# Enhanced Messaging Features - API Documentation

## New Features Added

### 1. Reply/Quote Messages
Send a message as a reply to another message.

**Endpoint:** `POST /api/instance/:id/send/reply`

**Request Body:**
```json
{
  "jid": "1234567890@s.whatsapp.net",
  "text": "This is a reply",
  "quotedMessageId": "MESSAGE_ID_TO_QUOTE"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/instance/INSTANCE_ID/send/reply \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "1234567890@s.whatsapp.net",
    "text": "Thanks for the info!",
    "quotedMessageId": "3EB0123456789ABCDEF"
  }'
```

---

### 2. Mention Users
Mention users in a message using @mentions.

**Endpoint:** `POST /api/instance/:id/send/mention`

**Request Body:**
```json
{
  "jid": "GROUP_JID@g.us",
  "text": "Hey @1234567890 and @0987654321, check this out!",
  "mentions": ["1234567890@s.whatsapp.net", "0987654321@s.whatsapp.net"]
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/instance/INSTANCE_ID/send/mention \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "120363012345678901@g.us",
    "text": "@1234567890 please review this",
    "mentions": ["1234567890@s.whatsapp.net"]
  }'
```

---

### 3. Forward Messages
Forward an existing message to another chat.

**Endpoint:** `POST /api/instance/:id/message/forward`

**Request Body:**
```json
{
  "toJid": "0987654321@s.whatsapp.net",
  "messageId": "MESSAGE_ID_TO_FORWARD",
  "fromJid": "1234567890@s.whatsapp.net"
}
```

---

### 4. Edit Messages
Edit a previously sent message (new WhatsApp feature).

**Endpoint:** `PUT /api/instance/:id/message/edit`

**Request Body:**
```json
{
  "jid": "1234567890@s.whatsapp.net",
  "messageId": "MESSAGE_ID",
  "newText": "Updated message text"
}
```

**Example:**
```bash
curl -X PUT http://localhost:3000/api/instance/INSTANCE_ID/message/edit \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "1234567890@s.whatsapp.net",
    "messageId": "3EB0123456789ABCDEF",
    "newText": "Corrected message"
  }'
```

---

### 5. Pin Messages
Pin a message in a chat.

**Endpoint:** `POST /api/instance/:id/message/pin`

**Request Body:**
```json
{
  "jid": "1234567890@s.whatsapp.net",
  "messageId": "MESSAGE_ID",
  "duration": 86400
}
```

**Duration Options:**
- `86400` - 24 hours
- `604800` - 7 days
- `2592000` - 30 days

**Example:**
```bash
curl -X POST http://localhost:3000/api/instance/INSTANCE_ID/message/pin \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "120363012345678901@g.us",
    "messageId": "3EB0123456789ABCDEF",
    "duration": 604800
  }'
```

---

### 6. Unpin Messages
Unpin a previously pinned message.

**Endpoint:** `POST /api/instance/:id/message/unpin`

**Request Body:**
```json
{
  "jid": "1234567890@s.whatsapp.net",
  "messageId": "MESSAGE_ID"
}
```

---

### 7. ViewOnce Messages
Send images or videos that can only be viewed once.

**Endpoint:** `POST /api/instance/:id/send/viewonce`

**Request Body:** (multipart/form-data)
- `jid` - Recipient JID
- `file` - Image or video file
- `mediaType` - "image" or "video"
- `caption` - Optional caption

**Example:**
```bash
curl -X POST http://localhost:3000/api/instance/INSTANCE_ID/send/viewonce \
  -F "jid=1234567890@s.whatsapp.net" \
  -F "mediaType=image" \
  -F "caption=Check this out!" \
  -F "file=@/path/to/image.jpg"
```

---

## Usage Examples

### Reply to a Message in Frappe
```python
import requests

def send_whatsapp_reply(instance_id, jid, text, quoted_message_id):
    url = f"http://whatsapp-baileys:3000/api/instance/{instance_id}/send/reply"
    payload = {
        "jid": jid,
        "text": text,
        "quotedMessageId": quoted_message_id
    }
    response = requests.post(url, json=payload)
    return response.json()

# Usage
send_whatsapp_reply(
    "instance_123",
    "1234567890@s.whatsapp.net",
    "Thanks for your order!",
    "3EB0123456789ABCDEF"
)
```

### Mention Users in Group
```python
def mention_users_in_group(instance_id, group_jid, text, user_numbers):
    url = f"http://whatsapp-baileys:3000/api/instance/{instance_id}/send/mention"
    
    # Convert numbers to JIDs
    mentions = [f"{num}@s.whatsapp.net" for num in user_numbers]
    
    payload = {
        "jid": group_jid,
        "text": text,
        "mentions": mentions
    }
    response = requests.post(url, json=payload)
    return response.json()

# Usage
mention_users_in_group(
    "instance_123",
    "120363012345678901@g.us",
    "@1234567890 @0987654321 Meeting at 3 PM",
    ["1234567890", "0987654321"]
)
```

### Edit a Message
```python
def edit_message(instance_id, jid, message_id, new_text):
    url = f"http://whatsapp-baileys:3000/api/instance/{instance_id}/message/edit"
    payload = {
        "jid": jid,
        "messageId": message_id,
        "newText": new_text
    }
    response = requests.put(url, json=payload)
    return response.json()
```

### Send ViewOnce Image
```python
def send_viewonce_image(instance_id, jid, image_path, caption=""):
    url = f"http://whatsapp-baileys:3000/api/instance/{instance_id}/send/viewonce"
    
    with open(image_path, 'rb') as f:
        files = {'file': f}
        data = {
            'jid': jid,
            'mediaType': 'image',
            'caption': caption
        }
        response = requests.post(url, files=files, data=data)
    
    return response.json()
```

---

## Webhook Events

### New Events for Enhanced Messages

**message.edited**
```json
{
  "instanceId": "instance_123",
  "event": "message.edited",
  "data": {
    "jid": "1234567890@s.whatsapp.net",
    "messageId": "3EB0123456789ABCDEF",
    "oldText": "Original text",
    "newText": "Updated text",
    "editedAt": "2024-11-24T16:45:00Z"
  }
}
```

**message.pinned**
```json
{
  "instanceId": "instance_123",
  "event": "message.pinned",
  "data": {
    "jid": "120363012345678901@g.us",
    "messageId": "3EB0123456789ABCDEF",
    "duration": 86400,
    "pinnedAt": "2024-11-24T16:45:00Z"
  }
}
```

**message.mentioned**
```json
{
  "instanceId": "instance_123",
  "event": "message.received",
  "data": {
    "jid": "120363012345678901@g.us",
    "messageId": "3EB0123456789ABCDEF",
    "text": "@1234567890 check this",
    "mentions": ["1234567890@s.whatsapp.net"],
    "fromMe": false
  }
}
```

---

## Notes

- **Message IDs**: You can get message IDs from webhook events or from the response when sending messages
- **JID Format**: 
  - Individual: `1234567890@s.whatsapp.net`
  - Group: `120363012345678901@g.us`
- **Edit Limitations**: Messages can only be edited within 15 minutes of sending
- **Pin Duration**: Pinned messages automatically unpin after the specified duration
- **ViewOnce**: Recipients can only view the media once, then it disappears

---

## Testing

Test these features from inside the container:

```bash
# Reply to a message
docker compose exec whatsapp-baileys sh -c '
  wget -qO- --post-data="{
    \"jid\": \"YOUR_NUMBER@s.whatsapp.net\",
    \"text\": \"This is a reply\",
    \"quotedMessageId\": \"MESSAGE_ID\"
  }" --header="Content-Type: application/json" \
  http://localhost:3000/api/instance/INSTANCE_ID/send/reply
'

# Mention users
docker compose exec whatsapp-baileys sh -c '
  wget -qO- --post-data="{
    \"jid\": \"GROUP_JID@g.us\",
    \"text\": \"@1234567890 hello\",
    \"mentions\": [\"1234567890@s.whatsapp.net\"]
  }" --header="Content-Type: application/json" \
  http://localhost:3000/api/instance/INSTANCE_ID/send/mention
'
```
