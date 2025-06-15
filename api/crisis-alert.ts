import twilio from 'twilio';
import type { Request, Response } from 'express';

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const twilioWhatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

// Validate environment variables
if (!accountSid || !authToken || !twilioPhoneNumber || !twilioWhatsappNumber) {
  console.error('Missing required Twilio environment variables');
  process.exit(1);
}

const client = twilio(accountSid, authToken);

const crisisAlertHandler = async (req: Request, res: Response) => {
  try {
    const { username, latitude, longitude } = req.body;
    console.log('Received crisis alert request:', { username, latitude, longitude });

    if (!username || !latitude || !longitude) {
      console.error('Missing required fields:', { username, latitude, longitude });
      res.status(400).json({ 
        success: false,
        message: 'Missing required fields' 
      });
      return;
    }

    const emergencyMessage = `Your Friend needs help reach out to them asap. Location: https://maps.google.com/?q=${latitude},${longitude}`;
    console.log('Sending emergency messages:', emergencyMessage);

    // Get recipient numbers from environment variable
    const recipients = process.env.EMERGENCY_RECIPIENTS?.split(',') || [];
    
    if (recipients.length === 0) {
      throw new Error('No emergency recipients configured');
    }

    // Send SMS to all recipients
    const smsPromises = recipients.map(to => 
      client.messages.create({
        body: emergencyMessage,
        from: twilioPhoneNumber,
        to
      })
    );
    const smsMessages = await Promise.all(smsPromises);
    console.log('SMS messages sent successfully:', smsMessages.map(msg => msg.sid));

    // Send WhatsApp to all recipients
    const whatsappPromises = recipients.map(to => 
      client.messages.create({
        body: emergencyMessage,
        from: twilioWhatsappNumber,
        to: `whatsapp:${to}`
      })
    );
    const whatsappMessages = await Promise.all(whatsappPromises);
    console.log('WhatsApp messages sent successfully:', whatsappMessages.map(msg => msg.sid));

    res.status(200).json({ 
      success: true,
      message: 'Crisis alerts sent successfully',
      smsMessageIds: smsMessages.map(msg => msg.sid),
      whatsappMessageIds: whatsappMessages.map(msg => msg.sid)
    });
  } catch (error) {
    console.error('Failed to send crisis alerts:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to send crisis alerts',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export default crisisAlertHandler; 