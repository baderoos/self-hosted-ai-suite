import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { 
  CreditCard, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Zap, 
  ArrowRight, 
  Shield, 
  Users, 
  Database, 
  FileText, 
  Video, 
  Image, 
  Cpu, 
  ExternalLink
} from 'lucide-react';

interface PlanFeature {
  name: string;
  creator: string | number;
  pro: string | number;
  enterprise: string | number;
}

export function BillingPage() {
  const { activeWorkspace, subscription } = useWorkspace();
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  
  const plans = [
    {
      id: 'creator',
      name: 'Creator',
      description: 'Perfect for individual creators and small projects',
      price: '$19',
      period: 'month',
      color: 'from-blue-500 to-cyan-500',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Advanced features for professional content creators',
      price: '$49',
      period: 'month',
      color: 'from-purple-500 to-pink-500',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Custom solutions for teams and organizations',
      price: '$199',
      period: 'month',
      color: 'from-amber-500 to-orange-500',
      popular: false
    }
  ];

  const features: PlanFeature[] = [
    { name: 'Team Members', creator: '1', pro: '5', enterprise: 'Unlimited' },
    { name: 'Workspaces', creator: '1', pro: '3', enterprise: 'Unlimited' },
    { name: 'Storage', creator: '10 GB', pro: '100 GB', enterprise: '1 TB' },
    { name: 'AI Video Generation', creator: '10/mo', pro: '50/mo', enterprise: 'Unlimited' },
    { name: 'AI Workflow Runs', creator: '20/mo', pro: '100/mo', enterprise: 'Unlimited' },
    { name: 'Content Library Size', creator: '100 items', pro: '1,000 items', enterprise: 'Unlimited' },
    { name: 'Max Video Length', creator: '5 min', pro: '30 min', enterprise: 'Unlimited' },
    { name: 'Max Video Resolution', creator: '720p', pro: '1080p', enterprise: '4K' },
    { name: 'Priority Support', creator: '✓', pro: '✓', enterprise: '✓' },
    { name: 'Custom AI Models', creator: '✗', pro: '✓', enterprise: '✓' },
    { name: 'API Access', creator: '✗', pro: '✓', enterprise: '✓' },
    { name: 'Advanced Analytics', creator: '✗', pro: '✓', enterprise: '✓' },
    { name: 'White Labeling', creator: '✗', pro: '✗', enterprise: '✓' },
    { name: 'Dedicated Account Manager', creator: '✗', pro: '✗', enterprise: '✓' }
  ];

  const usageMetrics = [
    { 
      name: 'AI Video Generation', 
      used: 8, 
      limit: subscription?.plan_id === 'creator' ? 10 : subscription?.plan_id === 'pro' ? 50 : -1,
      icon: Video,
      color: 'blue'
    },
    { 
      name: 'AI Workflow Runs', 
      used: 15, 
      limit: subscription?.plan_id === 'creator' ? 20 : subscription?.plan_id === 'pro' ? 100 : -1,
      icon: Cpu,
      color: 'purple'
    },
    { 
      name: 'Storage Used', 
      used: subscription?.plan_id === 'creator' ? 3.2 : subscription?.plan_id === 'pro' ? 28.5 : 125.8, 
      limit: subscription?.plan_id === 'creator' ? 10 : subscription?.plan_id === 'pro' ? 100 : 1024,
      unit: 'GB',
      icon: Database,
      color: 'emerald'
    },
    { 
      name: 'Team Members', 
      used: 3, 
      limit: subscription?.plan_id === 'creator' ? 1 : subscription?.plan_id === 'pro' ? 5 : -1,
      icon: Users,
      color: 'amber'
    }
  ];

  const createCheckoutSession = async (planId: string) => {
    if (!activeWorkspace) return;
    
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call your backend API
      // const response = await fetch('/api/billing/create-checkout-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ workspaceId: activeWorkspace.id, planId })
      // });
      // const data = await response.json();
      // window.location.href = data.url;
      
      // For demo purposes, we'll just simulate a redirect
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCheckoutUrl(`https://checkout.stripe.com/c/pay/cs_test_${Math.random().toString(36).substring(2, 15)}`);
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'trialing': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'canceled': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'past_due': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'text-neutral-600 bg-neutral-100 dark:bg-neutral-700 dark:text-neutral-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'trialing': return Clock;
      case 'canceled': return AlertTriangle;
      case 'past_due': return AlertTriangle;
      default: return CheckCircle;
    }
  };

  if (!activeWorkspace) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard size={24} className="text-neutral-500" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
            No Active Workspace
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Please select or create a workspace to manage billing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex items-center space-x-4 mb-4">
          <motion.div 
            className="w-16 h-16 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-3xl flex items-center justify-center"
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(245, 158, 11, 0.5)",
                "0 0 40px rgba(245, 158, 11, 0.8)",
                "0 0 20px rgba(245, 158, 11, 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <CreditCard size={32} className="text-white" />
          </motion.div>
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white">
              Billing & Subscription
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Manage your subscription and billing details for {activeWorkspace.name}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Current Subscription */}
      <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
          Current Subscription
        </h2>
        
        {subscription ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                  Current Plan
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-neutral-900 dark:text-white capitalize">
                    {subscription.plan_id} Plan
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                    {subscription.status}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                  Status
                </p>
                <div className="flex items-center space-x-2">
                  {React.createElement(getStatusIcon(subscription.status), {
                    size: 16,
                    className: subscription.status === 'active' ? 'text-emerald-500' : 
                              subscription.status === 'trialing' ? 'text-blue-500' : 'text-amber-500'
                  })}
                  <span className="text-neutral-900 dark:text-white">
                    {subscription.status === 'active' ? 'Active subscription' :
                     subscription.status === 'trialing' ? 'Trial period' :
                     subscription.status === 'canceled' ? 'Canceled' : 'Payment issue'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {subscription.trial_end && (
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                    Trial Ends
                  </p>
                  <div className="flex items-center space-x-2">
                    <Clock size={16} className="text-blue-500" />
                    <span className="text-neutral-900 dark:text-white">
                      {new Date(subscription.trial_end).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
              
              {subscription.current_period_end && (
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                    Next Billing Date
                  </p>
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-neutral-500" />
                    <span className="text-neutral-900 dark:text-white">
                      {new Date(subscription.current_period_end).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <motion.button
                onClick={() => createCheckoutSession(subscription.plan_id === 'creator' ? 'pro' : 'enterprise')}
                className="px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:from-primary-700 hover:to-secondary-700 transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
              >
                <Zap size={16} />
                <span>{subscription.plan_id === 'enterprise' ? 'Contact Sales' : 'Upgrade Plan'}</span>
              </motion.button>
              
              <motion.button
                className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Manage Payment
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard size={24} className="text-neutral-500" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
              No Active Subscription
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Choose a plan to get started with Nexus
            </p>
            
            <div className="flex justify-center">
              <motion.button
                onClick={() => createCheckoutSession('creator')}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl hover:from-primary-700 hover:to-secondary-700 transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
              >
                <Zap size={20} />
                <span>{isLoading ? 'Processing...' : 'Choose a Plan'}</span>
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* Usage Metrics */}
      {subscription && (
        <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
            Usage & Limits
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {usageMetrics.map((metric) => (
              <div key={metric.name} className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-2 rounded-lg bg-${metric.color}-100 dark:bg-${metric.color}-900/30`}>
                    <metric.icon size={16} className={`text-${metric.color}-600 dark:text-${metric.color}-400`} />
                  </div>
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {metric.name}
                  </span>
                </div>
                
                <div className="mb-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      {metric.used}{metric.unit ? ` ${metric.unit}` : ''} used
                    </span>
                    <span className="text-neutral-600 dark:text-neutral-400">
                      {metric.limit === -1 ? 'Unlimited' : `${metric.limit}${metric.unit ? ` ${metric.unit}` : ''} limit`}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-${metric.color}-500`}
                      style={{ width: `${metric.limit === -1 ? 15 : (metric.used / metric.limit) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {metric.limit !== -1 && metric.used > metric.limit * 0.8 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center space-x-1">
                    <AlertTriangle size={12} />
                    <span>Approaching limit</span>
                  </p>
                )}
                
                {metric.limit === -1 && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                    <CheckCircle size={12} />
                    <span>Unlimited with your plan</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
          Available Plans
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              className={`rounded-xl border-2 ${
                subscription?.plan_id === plan.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-neutral-200 dark:border-neutral-700'
              } overflow-hidden`}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {plan.popular && (
                <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-center py-1 text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
                  {plan.description}
                </p>
                
                <div className="mb-6">
                  <span className="text-3xl font-bold text-neutral-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-neutral-600 dark:text-neutral-400">
                    /{plan.period}
                  </span>
                </div>
                
                <motion.button
                  onClick={() => createCheckoutSession(plan.id)}
                  className={`w-full py-2 rounded-lg font-medium ${
                    subscription?.plan_id === plan.id
                      ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                      : 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-700 hover:to-secondary-700'
                  } transition-colors flex items-center justify-center space-x-2`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={subscription?.plan_id === plan.id || isLoading}
                >
                  {subscription?.plan_id === plan.id ? (
                    <>
                      <CheckCircle size={16} />
                      <span>Current Plan</span>
                    </>
                  ) : (
                    <>
                      {plan.id === 'enterprise' ? (
                        <>
                          <ExternalLink size={16} />
                          <span>Contact Sales</span>
                        </>
                      ) : (
                        <>
                          <Zap size={16} />
                          <span>{isLoading ? 'Processing...' : 'Select Plan'}</span>
                        </>
                      )}
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Feature Comparison */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-neutral-200 dark:border-neutral-700">
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">Feature</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Creator
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Pro
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Enterprise
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr 
                  key={feature.name} 
                  className={`${
                    index % 2 === 0 ? 'bg-neutral-50/50 dark:bg-neutral-800/50' : ''
                  } hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors`}
                >
                  <td className="px-4 py-3 text-neutral-900 dark:text-white">
                    {feature.name}
                  </td>
                  <td className="px-4 py-3 text-center text-neutral-700 dark:text-neutral-300">
                    {feature.creator === '✓' ? (
                      <CheckCircle size={16} className="text-emerald-500 mx-auto" />
                    ) : feature.creator === '✗' ? (
                      <X size={16} className="text-neutral-400 mx-auto" />
                    ) : (
                      feature.creator
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-neutral-700 dark:text-neutral-300">
                    {feature.pro === '✓' ? (
                      <CheckCircle size={16} className="text-emerald-500 mx-auto" />
                    ) : feature.pro === '✗' ? (
                      <X size={16} className="text-neutral-400 mx-auto" />
                    ) : (
                      feature.pro
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-neutral-700 dark:text-neutral-300">
                    {feature.enterprise === '✓' ? (
                      <CheckCircle size={16} className="text-emerald-500 mx-auto" />
                    ) : feature.enterprise === '✗' ? (
                      <X size={16} className="text-neutral-400 mx-auto" />
                    ) : (
                      feature.enterprise
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Checkout Redirect Modal */}
      <AnimatePresence>
        {checkoutUrl && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-neutral-800 rounded-2xl p-6 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                Complete Your Subscription
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                You'll be redirected to Stripe to complete your subscription. Once completed, you'll be returned to your workspace.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setCheckoutUrl(null)}
                  className="flex-1 px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                >
                  Cancel
                </button>
                <a
                  href={checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:from-primary-700 hover:to-secondary-700 transition-colors text-center"
                >
                  Proceed to Checkout
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Calendar(props: any) {
  return <Clock {...props} />;
}