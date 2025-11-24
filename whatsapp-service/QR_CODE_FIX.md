# WhatsApp QR Code "Couldn't Link Device" - Fix Guide

## Problem Analysis

The "Couldn't link device" error when scanning QR codes is caused by:

### 1. **QR Code Expiration** (Most Common)
- WhatsApp QR codes expire after **20 seconds**
- The library generates new QR codes automatically, but you need to refresh to see them
- Network delays can cause the QR to expire before you scan it

### 2. **Connection Instability**
- WebSocket connection to WhatsApp servers drops intermittently
- Causes: Network issues, DNS resolution delays, firewall/proxy interference

### 3. **Rate Limiting**
- WhatsApp may temporarily block connection attempts if too many QR codes are generated
- Usually resolves after 5-10 minutes

## What Was Fixed

### ✅ Improvements Made to Connection

1. **Removed Deprecated Option**
   - Removed `printQRInTerminal: true` (was causing warnings)

2. **Added Connection Stability Settings**
   ```typescript
   connectTimeoutMs: 60000,        // 60s timeout (was default 20s)
   defaultQueryTimeoutMs: 60000,   // 60s for queries
   keepAliveIntervalMs: 30000,     // Keep connection alive every 30s
   retryRequestDelayMs: 500,       // Retry failed requests after 500ms
   maxMsgRetryCount: 5,            // Retry up to 5 times
   ```

3. **Better Reconnection Logic**
   - Exponential backoff: 1s for restart, 5s for errors
   - Better error logging to identify issues

4. **Browser Identification**
   - Added proper browser info: `['WhatsApp Baileys', 'Chrome', '120.0.0']`

## How to Successfully Scan QR Code

### Method 1: Quick Scan (Recommended)

1. **Get the QR code immediately after creation**:
   ```bash
   # Create instance
   INSTANCE_ID=$(docker compose exec whatsapp-baileys sh -c '
     wget -qO- --post-data="{\"name\":\"my-whatsapp\"}" \
       --header="Content-Type: application/json" \
       http://localhost:3000/api/instance/create | 
     grep -o "instance_[^\"]*"
   ')
   
   # Get QR code (do this within 20 seconds!)
   docker compose exec whatsapp-baileys sh -c "
     wget -qO- http://localhost:3000/api/instance/$INSTANCE_ID/qr
   "
   ```

2. **Open the QR code data URL in browser**:
   - Copy the `qrCode` value (starts with `data:image/png;base64,`)
   - Paste into browser address bar
   - Scan immediately with WhatsApp app

3. **Scan within 20 seconds!**

### Method 2: Continuous Refresh

The QR code auto-refreshes every ~20 seconds. Keep refreshing the endpoint:

```bash
# Keep getting fresh QR codes
while true; do
  docker compose exec whatsapp-baileys sh -c '
    wget -qO- http://localhost:3000/api/instance/INSTANCE_ID/qr
  '
  sleep 15
done
```

### Method 3: Use Pairing Code (Alternative)

WhatsApp also supports pairing codes (8-digit number) instead of QR:
- This feature needs to be implemented in the Baileys library
- More reliable than QR codes
- Currently not implemented in our service

## Troubleshooting

### If You Get "Couldn't Link Device"

1. **Wait 5 minutes** - You may be rate-limited
2. **Delete and recreate the instance**:
   ```bash
   docker compose exec whatsapp-baileys sh -c '
     wget -qO- -X DELETE http://localhost:3000/api/instance/INSTANCE_ID
   '
   ```
3. **Check network connectivity**:
   ```bash
   docker compose exec whatsapp-baileys ping -c 3 web.whatsapp.com
   ```

### If Connection Keeps Dropping

Check logs for errors:
```bash
docker compose logs whatsapp-baileys | grep -i error
```

Common errors:
- `ENOTFOUND web.whatsapp.com` - DNS issue
- `WebSocket Error` - Network/firewall blocking
- `Connection timeout` - Slow network

### If QR Never Appears

1. Check instance status:
   ```bash
   docker compose exec whatsapp-baileys sh -c '
     wget -qO- http://localhost:3000/api/instance/list
   '
   ```
   
2. Status should be `"qr"` - if it's `"connecting"`, wait a few seconds

3. If stuck in `"connecting"`, restart:
   ```bash
   docker compose restart whatsapp-baileys
   ```

## Best Practices

### ✅ DO:
- Scan QR code within 10-15 seconds of generation
- Have WhatsApp app ready before requesting QR
- Use a stable internet connection
- Keep the instance running after successful connection

### ❌ DON'T:
- Generate multiple QR codes rapidly (rate limiting)
- Wait too long to scan (20s expiration)
- Use VPN/proxy that blocks WhatsApp
- Restart container while scanning

## Current Status

After the fixes:
- ✅ Connection timeout increased to 60s
- ✅ Keep-alive enabled (30s intervals)
- ✅ Better retry logic with exponential backoff
- ✅ Deprecated warnings removed
- ✅ Improved error logging

**The QR code generation is working correctly** - the "Couldn't link device" error is due to timing/network issues, not the library itself.

## Quick Test

```bash
# 1. Create instance
docker compose exec whatsapp-baileys sh -c '
  wget -qO- --post-data="{\"name\":\"test\"}" \
    --header="Content-Type: application/json" \
    http://localhost:3000/api/instance/create
'

# 2. Get instance ID from response, then get QR
docker compose exec whatsapp-baileys sh -c '
  wget -qO- http://localhost:3000/api/instance/INSTANCE_ID/qr
'

# 3. Copy the qrCode value and paste in browser
# 4. Scan within 20 seconds!
```

## Alternative: Access via Web UI

You could build a simple web UI to display the QR code:

```html
<!DOCTYPE html>
<html>
<body>
  <img id="qr" src="" alt="QR Code">
  <script>
    async function refreshQR() {
      const response = await fetch('http://whatsapp-baileys:3000/api/instance/INSTANCE_ID/qr');
      const data = await response.json();
      document.getElementById('qr').src = data.data.qrCode;
    }
    refreshQR();
    setInterval(refreshQR, 15000); // Refresh every 15s
  </script>
</body>
</html>
```

This would auto-refresh the QR code before it expires!
