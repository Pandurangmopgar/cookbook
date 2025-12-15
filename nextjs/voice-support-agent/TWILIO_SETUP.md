# Twilio Setup Guide

Complete guide to configure Twilio for the Voice Support Agent.

## 1. Create Twilio Account

1. Go to [twilio.com](https://www.twilio.com/) and sign up
2. Verify your email and phone number
3. Complete the onboarding wizard

## 2. Get a Phone Number

1. Go to [Console → Phone Numbers → Buy a Number](https://console.twilio.com/us1/develop/phone-numbers/manage/search)
2. Search for a number with **Voice** capability
3. Purchase the number (~$1/month)

## 3. Get API Credentials

1. Go to [Console → Account Info](https://console.twilio.com/)
2. Copy your:
   - **Account SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Auth Token**: Click "Show" to reveal

## 4. Configure Webhooks

### For Inbound Calls

1. Go to [Console → Phone Numbers → Manage → Active Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming)
2. Click on your phone number
3. Scroll to **Voice Configuration**
4. Set:
   - **A Call Comes In**: Webhook
   - **URL**: `https://YOUR_NGROK_URL/api/twilio/inbound`
   - **HTTP Method**: POST

### For Call Status Updates

5. Under **Call Status Changes**:
   - **URL**: `https://YOUR_NGROK_URL/api/twilio/status`
   - **HTTP Method**: POST

6. Click **Save Configuration**

## 5. Test with ngrok

### Start ngrok

```bash
ngrok http 3000
```

You'll see output like:
```
Forwarding    https://abc123.ngrok.io -> http://localhost:3000
```

### Update Environment

Add to `.env.local`:
```env
NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io
```

### Update Twilio Webhooks

Replace `YOUR_NGROK_URL` with your actual ngrok URL in the Twilio console.

## 6. Test Inbound Call

1. Start your server: `npx tsx server.ts`
2. Call your Twilio number from any phone
3. You should hear "Please wait while I connect you to our AI support agent"
4. The AI agent will greet you!

## 7. Test Outbound Call

1. Open `http://localhost:3000`
2. Enter a phone number (your personal phone)
3. Click "Call"
4. Answer the call on your phone
5. Talk to the AI agent!

## Troubleshooting

### "Application error" when calling

- Check ngrok is running
- Verify webhook URLs are correct
- Check server logs for errors

### "No audio from agent"

- Verify `GOOGLE_API_KEY` is set
- Check Gemini API quota
- Look for WebSocket errors in server logs

### "Call disconnects immediately"

- Check Twilio console for error logs
- Verify TwiML is being returned correctly
- Test webhook URL directly: `curl -X POST https://your-ngrok-url/api/twilio/inbound`

## Production Setup

For production, replace ngrok with your actual domain:

1. Deploy to a server with WebSocket support (Railway, Render, AWS)
2. Update `NEXT_PUBLIC_APP_URL` to your production URL
3. Update Twilio webhooks to production URLs
4. Consider using Twilio's TwiML Bins for fallback

## Cost Breakdown

| Item | Cost |
|------|------|
| Phone Number | ~$1/month |
| Inbound Calls | ~$0.0085/min |
| Outbound Calls | ~$0.014/min |
| Carrier Fees | ~$0.003/min |

Example: 100 minutes of calls ≈ $2-3/month
