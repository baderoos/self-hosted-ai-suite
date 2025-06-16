/**
 * Create Stripe Checkout Session
 * 
 * This file contains the logic for creating a Stripe checkout session.
 * It should be deployed as a serverless function or API endpoint.
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Create a Stripe checkout session for subscription
 */
export async function createCheckoutSession(req, res) {
  try {
    const { workspaceId, planId } = req.body;
    
    if (!workspaceId || !planId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Get workspace details
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('name, slug')
      .eq('id', workspaceId)
      .single();
      
    if (workspaceError) {
      console.error('Error fetching workspace:', workspaceError);
      return res.status(404).json({ error: 'Workspace not found' });
    }
    
    // Check if workspace already has a subscription
    const { data: existingSubscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('workspace_id', workspaceId)
      .single();
      
    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      console.error('Error checking existing subscription:', subscriptionError);
      return res.status(500).json({ error: 'Failed to check existing subscription' });
    }
    
    // Set the price ID based on the plan
    let priceId;
    switch (planId) {
      case 'creator':
        priceId = process.env.STRIPE_CREATOR_PRICE_ID;
        break;
      case 'pro':
        priceId = process.env.STRIPE_PRO_PRICE_ID;
        break;
      case 'enterprise':
        priceId = process.env.STRIPE_ENTERPRISE_PRICE_ID;
        break;
      default:
        return res.status(400).json({ error: 'Invalid plan ID' });
    }
    
    // Create or retrieve the customer
    let customerId = existingSubscription?.stripe_customer_id;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: workspace.name,
        metadata: {
          workspace_id: workspaceId
        }
      });
      
      customerId = customer.id;
    }
    
    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/settings/billing?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/settings/billing?canceled=true`,
      client_reference_id: workspaceId,
      subscription_data: {
        metadata: {
          workspace_id: workspaceId
        }
      }
    });
    
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ error: error.message });
  }
}