/**
 * API to initiate outbound calls
 */

import { NextRequest, NextResponse } from 'next/server';
import { makeOutboundCall, normalizePhoneNumber } from '@/lib/twilio';
import { addCall } from '@/lib/call-store';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, customerId } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const customerIdToUse = customerId || normalizedPhone;

    // Webhook URL for when the call connects
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const webhookUrl = `${appUrl}/api/twilio/outbound-connect?customerId=${encodeURIComponent(customerIdToUse)}`;

    console.log(`📞 Initiating outbound call to ${normalizedPhone}`);

    const callSid = await makeOutboundCall(normalizedPhone, webhookUrl);

    // Track the call
    addCall({
      callSid,
      customerId: customerIdToUse,
      customerPhone: normalizedPhone,
      direction: 'outbound',
      status: 'ringing',
      startTime: new Date(),
      transcript: [],
    });

    return NextResponse.json({
      success: true,
      callSid,
      message: `Calling ${normalizedPhone}...`,
    });
  } catch (error) {
    console.error('Error making outbound call:', error);
    return NextResponse.json(
      { error: 'Failed to initiate call' },
      { status: 500 }
    );
  }
}
