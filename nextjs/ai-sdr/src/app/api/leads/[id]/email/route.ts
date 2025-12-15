import { NextRequest, NextResponse } from 'next/server';
import { getLeadById, addInteraction, updateLead } from '@/lib/store';
import { getLeadContext, storeLeadInteraction } from '@/lib/memory';
import { generateEmail } from '@/lib/gemini';
import { sendEmail } from '@/lib/gmail';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { emailType = 'cold' } = await request.json();
    
    const lead = getLeadById(id);
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Get context from MemoryStack
    const context = await getLeadContext(id, `${lead.name} ${lead.company} interactions emails`);

    // Generate personalized email with Gemini
    const email = await generateEmail(
      { name: lead.name, company: lead.company, title: lead.title },
      context,
      emailType
    );

    return NextResponse.json({ email });
  } catch (error) {
    console.error('Failed to generate email:', error);
    return NextResponse.json({ error: 'Failed to generate email' }, { status: 500 });
  }
}

// Send email via Gmail
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { subject, body, sendReal = false } = await request.json();
    
    // Ensure sendReal is a boolean (could be string "true" from form data)
    const shouldSendReal = sendReal === true || sendReal === 'true';
    
    console.log('📧 Email PUT request:', { id, subject: subject?.substring(0, 50), sendReal, shouldSendReal });
    console.log('📧 GMAIL_REFRESH_TOKEN present:', !!process.env.GMAIL_REFRESH_TOKEN);
    console.log('📧 GMAIL_REFRESH_TOKEN value prefix:', process.env.GMAIL_REFRESH_TOKEN?.substring(0, 10));
    
    const lead = getLeadById(id);
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    console.log('📧 Lead found:', { email: lead.email, name: lead.name });

    let emailResult = null;
    
    // Actually send email if requested
    if (shouldSendReal) {
      console.log('📧 Attempting to send real email to:', lead.email);
      try {
        emailResult = await sendEmail({
          to: lead.email,
          subject,
          body,
          leadName: lead.name,
        });
        console.log('📧 Email result:', emailResult);
      } catch (emailError) {
        console.error('❌ Email send failed:', emailError);
        return NextResponse.json({ 
          error: 'Failed to send email', 
          details: emailError instanceof Error ? emailError.message : 'Unknown error' 
        }, { status: 500 });
      }
    } else {
      console.log('📧 Skipping real send - sendReal:', sendReal, 'shouldSendReal:', shouldSendReal);
    }

    // Log interaction
    const interaction = addInteraction(id, {
      type: 'email',
      direction: 'outbound',
      subject,
      content: body,
    });

    // Store in MemoryStack
    await storeLeadInteraction(id, {
      type: 'email',
      summary: `Sent email: "${subject}" - ${body.substring(0, 100)}...`,
    });

    // Update lead status
    if (lead.status === 'new') {
      updateLead(id, { status: 'contacted' });
    }

    return NextResponse.json({ 
      success: true, 
      interaction,
      emailSent: !!emailResult,
      messageId: emailResult?.messageId,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
