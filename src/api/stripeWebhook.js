/**
 * Stripe Webhook Handler
 * 
 * This file contains the logic for handling Stripe webhook events.
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
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  
  let event;
  
  try {
    // Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error(`Error handling webhook: ${err.message}`);
    return res.status(500).send(`Server Error: ${err.message}`);
  }
}

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutSessionCompleted(session) {
  // Get the customer and subscription details
  const customer = await stripe.customers.retrieve(session.customer);
  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  
  // Get the workspace ID from the client_reference_id
  const workspaceId = session.client_reference_id;
  
  if (!workspaceId) {
    console.error('No workspace ID found in client_reference_id');
    return;
  }
  
  // Get the plan ID from the subscription
  const planId = subscription.items.data[0].plan.product;
  const product = await stripe.products.retrieve(planId);
  const planName = product.metadata.plan_id || 'creator'; // Default to creator if not specified
  
  // Update or create subscription record in database
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      workspace_id: workspaceId,
      stripe_customer_id: customer.id,
      stripe_subscription_id: subscription.id,
      plan_id: planName,
      status: subscription.status,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
  if (error) {
    console.error('Error updating subscription in database:', error);
    throw error;
  }
}

/**
 * Handle customer.subscription.updated event
 */
async function handleSubscriptionUpdated(subscription) {
  // Find the workspace by stripe_subscription_id
  const { data: subscriptionData, error: findError } = await supabase
    .from('subscriptions')
    .select('workspace_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();
    
  if (findError) {
    console.error('Error finding subscription in database:', findError);
    return;
  }
  
  if (!subscriptionData) {
    console.error(`No subscription found with ID: ${subscription.id}`);
    return;
  }
  
  // Get the plan ID from the subscription
  const planId = subscription.items.data[0].plan.product;
  const product = await stripe.products.retrieve(planId);
  const planName = product.metadata.plan_id || 'creator';
  
  // Update subscription record in database
  const { error } = await supabase
    .from('subscriptions')
    .update({
      plan_id: planName,
      status: subscription.status,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('workspace_id', subscriptionData.workspace_id);
    
  if (error) {
    console.error('Error updating subscription in database:', error);
    throw error;
  }
}

/**
 * Handle customer.subscription.deleted event
 */
async function handleSubscriptionDeleted(subscription) {
  // Find the workspace by stripe_subscription_id
  const { data: subscriptionData, error: findError } = await supabase
    .from('subscriptions')
    .select('workspace_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();
    
  if (findError) {
    console.error('Error finding subscription in database:', findError);
    return;
  }
  
  if (!subscriptionData) {
    console.error(`No subscription found with ID: ${subscription.id}`);
    return;
  }
  
  // Update subscription record in database
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('workspace_id', subscriptionData.workspace_id);
    
  if (error) {
    console.error('Error updating subscription in database:', error);
    throw error;
  }
}

/**
 * Handle invoice.payment_succeeded event
 */
async function handleInvoicePaymentSucceeded(invoice) {
  if (!invoice.subscription) return;
  
  // Find the workspace by stripe_subscription_id
  const { data: subscriptionData, error: findError } = await supabase
    .from('subscriptions')
    .select('workspace_id')
    .eq('stripe_subscription_id', invoice.subscription)
    .single();
    
  if (findError) {
    console.error('Error finding subscription in database:', findError);
    return;
  }
  
  if (!subscriptionData) {
    console.error(`No subscription found with ID: ${invoice.subscription}`);
    return;
  }
  
  // Update subscription record in database
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('workspace_id', subscriptionData.workspace_id);
    
  if (error) {
    console.error('Error updating subscription in database:', error);
    throw error;
  }
}

/**
 * Handle invoice.payment_failed event
 */
async function handleInvoicePaymentFailed(invoice) {
  if (!invoice.subscription) return;
  
  // Find the workspace by stripe_subscription_id
  const { data: subscriptionData, error: findError } = await supabase
    .from('subscriptions')
    .select('workspace_id')
    .eq('stripe_subscription_id', invoice.subscription)
    .single();
    
  if (findError) {
    console.error('Error finding subscription in database:', findError);
    return;
  }
  
  if (!subscriptionData) {
    console.error(`No subscription found with ID: ${invoice.subscription}`);
    return;
  }
  
  // Update subscription record in database
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString()
    })
    .eq('workspace_id', subscriptionData.workspace_id);
    
  if (error) {
    console.error('Error updating subscription in database:', error);
    throw error;
  }
}