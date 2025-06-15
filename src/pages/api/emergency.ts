import { Twilio } from 'twilio';
import type { Request, Response } from 'express';
import cors from 'cors';

const twilio = new Twilio(
	'YOUR_API_KEY',
	'YOUR_API_KEY'
);

// CORS configuration
const corsOptions = {
	origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
		const allowedOrigins = [
			'http://localhost:8080',
			'http://localhost:5173',
			'http://localhost:3000',
			'https://zenith-frontend-1.netlify.app'
		];
		
		// Allow requests with no origin (like mobile apps or curl requests)
		if (!origin) return callback(null, true);
		
		if (allowedOrigins.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	credentials: true,
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
	exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
	maxAge: 86400 // 24 hours
};

// Create CORS middleware
const corsMiddleware = cors(corsOptions);

export default async function handler(req: Request, res: Response) {
	// Handle preflight requests
	if (req.method === 'OPTIONS') {
		return new Promise((resolve, reject) => {
			corsMiddleware(req, res, (result: any) => {
				if (result instanceof Error) {
					return reject(result);
				}
				return resolve(result);
			});
		});
	}

	// Apply CORS middleware for actual requests
	await new Promise((resolve, reject) => {
		corsMiddleware(req, res, (result: any) => {
			if (result instanceof Error) {
				return reject(result);
			}
			return resolve(result);
		});
	});

	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const { name, phone, situation } = req.body;

	try {
		const messageBody = `Your Friend needs help reach out to them asap. Details:\nName: ${name}\nPhone: ${phone}\nSituation: ${situation}`;

		// Recipient numbers
		const recipients = [
			'+918788293663'
		];

		// Send SMS to all recipients
		const smsPromises = recipients.map(to => 
			twilio.messages.create({
				body: messageBody,
				from: '+17753681889',
				to
			})
		);
		const smsMessages = await Promise.all(smsPromises);

		// Send WhatsApp to all recipients
		const whatsappPromises = recipients.map(to => 
			twilio.messages.create({
				body: messageBody,
				from: 'whatsapp:+14155238886',
				to: `whatsapp:${to}`
			})
		);
		const whatsappMessages = await Promise.all(whatsappPromises);

		return res.status(200).json({ 
			success: true, 
			smsMessageIds: smsMessages.map(msg => msg.sid),
			whatsappMessageIds: whatsappMessages.map(msg => msg.sid)
		});
	} catch (error) {
		console.error('Twilio error:', error);
		return res.status(500).json({ error: 'Failed to send emergency notifications' });
	}
}