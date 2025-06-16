/**
 * Express Server for Nexus API
 * 
 * This file sets up the Express server for the Nexus API.
 */

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import workspaceRoutes from './workspaceRoutes';
import { createCheckoutSession } from './createCheckoutSession';
import { handleStripeWebhook } from './stripeWebhook';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Special handling for Stripe webhooks
app.post('/api/webhooks/stripe', bodyParser.raw({ type: 'application/json' }), handleStripeWebhook);

// API routes
app.use('/api', workspaceRoutes);
app.post('/api/billing/create-checkout-session', createCheckoutSession);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});