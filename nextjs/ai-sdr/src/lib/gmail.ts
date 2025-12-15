import { google } from 'googleapis';

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  leadName: string;
}

class GmailClient {
  private oauth2Client: any = null;
  private gmail: any = null;

  private ensureInitialized(): void {
    if (this.gmail) return;

    // Get credentials from environment variables
    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'https://memorystack.app/auth/callback';
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error('Missing Gmail OAuth credentials. Set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN in .env.local');
    }

    console.log('🔧 Gmail Client Init:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasRedirectUri: !!redirectUri,
      hasRefreshToken: !!refreshToken,
      refreshTokenPrefix: refreshToken?.substring(0, 15),
    });

    this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    this.oauth2Client.setCredentials({ refresh_token: refreshToken });
    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  async sendEmail({ to, subject, body, leadName }: EmailOptions): Promise<{ success: boolean; messageId?: string }> {
    try {
      console.log('📧 sendEmail called with:', { to, subject: subject?.substring(0, 50), bodyLength: body?.length });
      
      this.ensureInitialized();

      const fromEmail = process.env.GMAIL_FROM_EMAIL || 'AI SDR <hello@memorystack.app>';
      const replyTo = process.env.GMAIL_REPLY_TO_EMAIL || 'support@memorystack.app';
      const sdrName = process.env.SDR_NAME || 'Alex';
      const companyName = process.env.COMPANY_NAME || 'MemoryStack';

      console.log('📧 Email config:', { fromEmail, replyTo, sdrName, companyName });

      const html = formatEmailHtml(body, sdrName, companyName);
      
      const messageParts = [
        `From: ${fromEmail}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        `Reply-To: ${replyTo}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        '',
        html,
      ];

      const message = messageParts.join('\r\n');
      const encodedEmail = Buffer.from(message, 'utf-8')
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      console.log('📧 Calling Gmail API...');
      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: encodedEmail },
      });

      console.log('✅ Email sent via Gmail:', response.data.id, 'Full response:', JSON.stringify(response.data));
      return { success: true, messageId: response.data.id };
    } catch (error: any) {
      console.error('❌ Gmail send error:', error);
      console.error('❌ Error details:', error?.response?.data || error?.message || 'Unknown error');
      throw error;
    }
  }
}

function formatEmailHtml(body: string, sdrName: string, companyName: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="white-space: pre-wrap;">${body.replace(/\n/g, '<br>')}</div>
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
    <p style="margin: 0;">${sdrName}</p>
    <p style="margin: 5px 0; color: #888;">${companyName}</p>
  </div>
</body>
</html>`;
}

// Singleton instance
let _gmailClient: GmailClient | null = null;

export function getGmailClient(): GmailClient {
  if (!_gmailClient) {
    _gmailClient = new GmailClient();
  }
  return _gmailClient;
}

export async function sendEmail(options: EmailOptions) {
  return getGmailClient().sendEmail(options);
}
