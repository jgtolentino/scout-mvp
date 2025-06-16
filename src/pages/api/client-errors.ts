// Client Error Logging API Endpoint
// Safely handles client-side error reporting for production monitoring

export interface ClientError {
  type: string;
  message: string;
  timestamp: string;
  session: string;
  version: string;
  userAgent?: string;
  url?: string;
}

export default function handler(req: any, res: any) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const error: ClientError = req.body;
    
    // Validate required fields
    if (!error.type || !error.message || !error.timestamp) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Log sanitized error (in production, this could go to monitoring service)
    console.log('Client Error Report:', {
      type: error.type,
      message: error.message,
      timestamp: error.timestamp,
      session: error.session || 'anonymous',
      version: error.version || 'unknown'
    });

    // In production, you might send to monitoring service like Sentry, LogRocket, etc.
    // await monitoringService.logError(error);

    // Return success response
    res.status(200).json({ 
      status: 'received',
      id: `error_${Date.now()}`,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('Error logging client error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}