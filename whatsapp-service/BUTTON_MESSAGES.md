# WhatsApp Button Messages Guide

## Overview

WhatsApp supports three types of interactive button messages:

1. **Quick Reply Buttons** - Simple buttons (up to 3)
2. **Template Buttons** - URL, Call, and Quick Reply buttons
3. **List Messages** - Dropdown menu with multiple options

## 1. Quick Reply Buttons

Simple buttons that send a reply when clicked. **Maximum 3 buttons**.

### API Endpoint
```
POST /api/instance/{instanceId}/send/buttons
```

### Request Body
```json
{
  "jid": "1234567890@s.whatsapp.net",
  "text": "Choose an option:",
  "buttons": [
    { "id": "btn1", "text": "Option 1" },
    { "id": "btn2", "text": "Option 2" },
    { "id": "btn3", "text": "Option 3" }
  ],
  "footer": "Optional footer text"
}
```

### Example: OTP Message
```bash
curl -X POST http://whatsapp-baileys:3000/api/instance/INSTANCE_ID/send/buttons \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "1234567890@s.whatsapp.net",
    "text": "Your OTP is: 123456",
    "buttons": [
      { "id": "copy_otp", "text": "📋 Copy OTP" }
    ],
    "footer": "Valid for 5 minutes"
  }'
```

### Example: Confirmation Message
```json
{
  "jid": "1234567890@s.whatsapp.net",
  "text": "Confirm your order?",
  "buttons": [
    { "id": "confirm", "text": "✅ Confirm" },
    { "id": "cancel", "text": "❌ Cancel" }
  ],
  "footer": "Total: $99.99"
}
```

## 2. Template Buttons

Advanced buttons with URL and phone call actions.

### API Endpoint
```
POST /api/instance/{instanceId}/send/template-buttons
```

### Button Types
- `quick_reply` - Simple reply button
- `url` - Opens a URL
- `call` - Makes a phone call

### Request Body
```json
{
  "jid": "1234567890@s.whatsapp.net",
  "text": "Welcome to our service!",
  "buttons": [
    {
      "type": "url",
      "text": "Visit Website",
      "url": "https://example.com"
    },
    {
      "type": "call",
      "text": "Call Support",
      "phoneNumber": "+1234567890"
    },
    {
      "type": "quick_reply",
      "text": "Get Started",
      "id": "start"
    }
  ],
  "footer": "We're here to help!"
}
```

### Example: Recharge Message
```bash
curl -X POST http://whatsapp-baileys:3000/api/instance/INSTANCE_ID/send/template-buttons \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "1234567890@s.whatsapp.net",
    "text": "Your balance is low!",
    "buttons": [
      {
        "type": "url",
        "text": "💰 Recharge Now",
        "url": "https://example.com/recharge"
      },
      {
        "type": "quick_reply",
        "text": "Check Balance",
        "id": "check_balance"
      }
    ],
    "footer": "Current balance: $5.00"
  }'
```

### Example: App Download
```json
{
  "jid": "1234567890@s.whatsapp.net",
  "text": "Download our app for better experience!",
  "buttons": [
    {
      "type": "url",
      "text": "📱 Download App",
      "url": "https://play.google.com/store/apps/details?id=com.example"
    },
    {
      "type": "call",
      "text": "📞 Call Us",
      "phoneNumber": "+1234567890"
    }
  ],
  "footer": "Available on Android & iOS"
}
```

## 3. List Messages

Dropdown menu with multiple sections and options.

### API Endpoint
```
POST /api/instance/{instanceId}/send/list
```

### Request Body
```json
{
  "jid": "1234567890@s.whatsapp.net",
  "text": "Choose a service:",
  "buttonText": "View Options",
  "sections": [
    {
      "title": "Popular Services",
      "rows": [
        {
          "id": "service1",
          "title": "Service 1",
          "description": "Description of service 1"
        },
        {
          "id": "service2",
          "title": "Service 2",
          "description": "Description of service 2"
        }
      ]
    },
    {
      "title": "Other Services",
      "rows": [
        {
          "id": "service3",
          "title": "Service 3",
          "description": "Description of service 3"
        }
      ]
    }
  ],
  "footer": "Select from the list"
}
```

### Example: Product Catalog
```bash
curl -X POST http://whatsapp-baileys:3000/api/instance/INSTANCE_ID/send/list \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "1234567890@s.whatsapp.net",
    "text": "Browse our products:",
    "buttonText": "📋 View Products",
    "sections": [
      {
        "title": "Electronics",
        "rows": [
          { "id": "laptop", "title": "Laptop", "description": "$999 - High performance" },
          { "id": "phone", "title": "Smartphone", "description": "$699 - Latest model" }
        ]
      },
      {
        "title": "Accessories",
        "rows": [
          { "id": "case", "title": "Phone Case", "description": "$19.99 - Protective" },
          { "id": "charger", "title": "Fast Charger", "description": "$29.99 - USB-C" }
        ]
      }
    ],
    "footer": "Free shipping on orders over $50"
  }'
```

### Example: Support Menu
```json
{
  "jid": "1234567890@s.whatsapp.net",
  "text": "How can we help you?",
  "buttonText": "🆘 Get Help",
  "sections": [
    {
      "title": "Account Issues",
      "rows": [
        { "id": "reset_password", "title": "Reset Password", "description": "Forgot your password?" },
        { "id": "update_profile", "title": "Update Profile", "description": "Change your details" }
      ]
    },
    {
      "title": "Billing",
      "rows": [
        { "id": "view_invoice", "title": "View Invoice", "description": "Download your bills" },
        { "id": "payment_issue", "title": "Payment Issue", "description": "Report a problem" }
      ]
    },
    {
      "title": "Other",
      "rows": [
        { "id": "contact_support", "title": "Contact Support", "description": "Talk to an agent" }
      ]
    }
  ],
  "footer": "We're here 24/7"
}
```

## Handling Button Responses

When a user clicks a button, you'll receive a webhook with the button ID:

```json
{
  "instanceId": "instance_...",
  "event": "message.received",
  "data": {
    "messageType": "buttonsResponseMessage",
    "selectedButtonId": "btn1",
    "selectedDisplayText": "Option 1"
  }
}
```

### Example: Processing Button Clicks in Frappe

```python
@frappe.whitelist(allow_guest=True)
def webhook():
    data = frappe.request.get_json()
    
    if data.get('event') == 'message.received':
        message_data = data.get('data', {})
        
        # Handle button response
        if message_data.get('messageType') == 'buttonsResponseMessage':
            button_id = message_data.get('selectedButtonId')
            
            if button_id == 'copy_otp':
                # User clicked "Copy OTP"
                pass
            elif button_id == 'confirm':
                # User confirmed order
                pass
            elif button_id == 'recharge':
                # User wants to recharge
                pass
```

## Best Practices

### ✅ DO:
- Use clear, action-oriented button text
- Keep button text short (max 20 characters)
- Use emojis to make buttons more appealing
- Provide context in the main message text
- Use footer for additional info (pricing, validity, etc.)

### ❌ DON'T:
- Don't use more than 3 quick reply buttons
- Don't make button text too long
- Don't use buttons for simple yes/no (use quick replies instead)
- Don't mix too many button types in one message

## Limitations

| Feature | Limit |
|---------|-------|
| Quick Reply Buttons | Max 3 buttons |
| Template Buttons | Max 3 buttons (any combination) |
| List Sections | Max 10 sections |
| List Rows per Section | Max 10 rows |
| Button Text Length | ~20 characters |
| List Title Length | ~24 characters |
| List Description | ~72 characters |

## Common Use Cases

### 1. OTP Verification
```json
{
  "text": "Your OTP: 123456",
  "buttons": [{ "id": "copy", "text": "📋 Copy OTP" }]
}
```

### 2. Order Confirmation
```json
{
  "text": "Order #12345 confirmed!",
  "buttons": [
    { "type": "url", "text": "Track Order", "url": "https://..." },
    { "type": "quick_reply", "text": "View Receipt", "id": "receipt" }
  ]
}
```

### 3. Customer Support
```json
{
  "text": "How can we help?",
  "buttonText": "Select Issue",
  "sections": [
    {
      "title": "Common Issues",
      "rows": [
        { "id": "refund", "title": "Request Refund" },
        { "id": "track", "title": "Track Order" }
      ]
    }
  ]
}
```

### 4. Appointment Booking
```json
{
  "text": "Book your appointment:",
  "buttonText": "📅 Select Time",
  "sections": [
    {
      "title": "Morning Slots",
      "rows": [
        { "id": "9am", "title": "9:00 AM", "description": "Available" },
        { "id": "10am", "title": "10:00 AM", "description": "Available" }
      ]
    },
    {
      "title": "Afternoon Slots",
      "rows": [
        { "id": "2pm", "title": "2:00 PM", "description": "Available" }
      ]
    }
  ]
}
```

## Testing

Test from inside the container:

```bash
# Quick Reply Buttons
docker compose exec whatsapp-baileys sh -c '
  wget -qO- --post-data="{
    \"jid\": \"YOUR_NUMBER@s.whatsapp.net\",
    \"text\": \"Test buttons\",
    \"buttons\": [{\"id\":\"test\",\"text\":\"Click Me\"}]
  }" --header="Content-Type: application/json" \
  http://localhost:3000/api/instance/INSTANCE_ID/send/buttons
'

# Template Buttons
docker compose exec whatsapp-baileys sh -c '
  wget -qO- --post-data="{
    \"jid\": \"YOUR_NUMBER@s.whatsapp.net\",
    \"text\": \"Test template\",
    \"buttons\": [{
      \"type\":\"url\",
      \"text\":\"Visit\",
      \"url\":\"https://google.com\"
    }]
  }" --header="Content-Type: application/json" \
  http://localhost:3000/api/instance/INSTANCE_ID/send/template-buttons
'
```

## Troubleshooting

### Buttons Not Showing
- Ensure WhatsApp is updated to latest version
- Some older Android versions don't support buttons
- Check if message was sent successfully (check logs)

### Button Clicks Not Received
- Verify webhook URL is configured correctly
- Check webhook handler is processing button responses
- Look for `buttonsResponseMessage` in webhook data

### Invalid Button Format
- Check button array structure
- Verify button IDs are unique
- Ensure button text is not empty

---

**Note**: Button messages are part of WhatsApp Business API features. They work with regular WhatsApp accounts but are primarily designed for business use cases.
