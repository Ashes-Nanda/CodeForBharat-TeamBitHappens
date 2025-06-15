import express from 'express';
import type { Request, Response, Router, RequestHandler } from 'express';
import cors from 'cors';
import twilio from 'twilio';
import dotenv from 'dotenv';
import crisisAlertHandler from './api/crisis-alert';

// Load environment variables
dotenv.config();

const app = express();
const router: Router = express.Router();
const port = process.env.PORT || 3001;

// Twilio configuration
const accountSid = "YOUR_API_KEY";
const authToken = "YOUR_API_KEY";
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const twilioWhatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

// Validate environment variables
if (!accountSid || !authToken || !twilioPhoneNumber || !twilioWhatsappNumber) {
  console.error('Missing required Twilio environment variables');
  process.exit(1);
}

const client = twilio(accountSid, authToken);

// Configure CORS
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:3000',
  'https://zenith-frontend-1.netlify.app',
  'https://*.netlify.app',
  'https://zenith-main.vercel.app',
  'https://www.zenith-landing.tech',
  'https://zenith-ai.tech'
];

// CORS middleware configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowedOrigins or matches a pattern
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = new RegExp(allowed.replace('*', '.*'));
        return pattern.test(origin);
      }
      return allowed === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Mount the crisis-alert endpoint
router.post('/crisis-alert', crisisAlertHandler);

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    success: true,
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Root path handler
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Zenith Crisis Alert API',
    version: '1.0.0',
    endpoints: {
      crisisAlert: 'POST /api/crisis-alert',
      health: 'GET /api/health'
    }
  });
});

// Mount router
app.use('/api', router);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  console.log('404 Not Found:', req.method, req.url);
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.url,
    method: req.method
  });
});

// Start server
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Available endpoints:');
  console.log('- GET /');
  console.log('- POST /api/crisis-alert');
  console.log('- GET /api/health');
});

// Handle server shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
}); 