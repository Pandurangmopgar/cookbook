/**
 * Twilio client utilities
 */

import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER!;

export const twilioClient = twilio(accountSid, authToken);

/**
 * Make an outbound call
 */
export async function makeOutboundCall(
  toNumber: string,
  webhookUrl: string
): Promise<string> {
  const call = await twilioClient.calls.create({
    to: toNumber,
    from: twilioPhoneNumber,
    url: webhookUrl,
  });

  return call.sid;
}

/**
 * Generate TwiML for connecting to media stream
 */
export function generateMediaStreamTwiML(websocketUrl: string, customerId: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Please wait while I connect you to our AI support agent.</Say>
  <Connect>
    <Stream url="${websocketUrl}">
      <Parameter name="customerId" value="${customerId}" />
    </Stream>
  </Connect>
</Response>`;
}

/**
 * Generate TwiML for speech-based conversation (more reliable than raw audio streaming)
 */
export function generateConversationTwiML(
  gatherUrl: string, 
  greeting: string,
  customerId: string
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">${greeting}</Say>
  <Gather input="speech" action="${gatherUrl}?customerId=${encodeURIComponent(customerId)}" speechTimeout="auto" language="en-US">
    <Say voice="Polly.Joanna">I'm listening.</Say>
  </Gather>
  <Say voice="Polly.Joanna">I didn't hear anything. Goodbye!</Say>
</Response>`;
}

/**
 * Generate TwiML for continuing conversation
 */
export function generateContinueTwiML(
  gatherUrl: string,
  response: string,
  customerId: string
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">${escapeXml(response)}</Say>
  <Gather input="speech" action="${gatherUrl}?customerId=${encodeURIComponent(customerId)}" speechTimeout="auto" language="en-US">
  </Gather>
  <Say voice="Polly.Joanna">Is there anything else I can help you with?</Say>
  <Gather input="speech" action="${gatherUrl}?customerId=${encodeURIComponent(customerId)}" speechTimeout="3" language="en-US">
  </Gather>
  <Say voice="Polly.Joanna">Thank you for calling. Goodbye!</Say>
</Response>`;
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate TwiML for a simple response
 */
export function generateSayTwiML(message: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>${message}</Say>
</Response>`;
}

/**
 * Normalize phone number to E.164 format
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Add + prefix if not present
  if (!phone.startsWith('+')) {
    // Assume US number if 10 digits
    if (digits.length === 10) {
      return `+1${digits}`;
    }
    return `+${digits}`;
  }
  
  return `+${digits}`;
}
