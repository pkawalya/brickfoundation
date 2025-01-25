import React, { useState } from 'react';
import { Copy, Mail, Share2, Check } from 'lucide-react';
import { ReferralService } from '../../lib/referralService';

export function ReferralShare() {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleShare = async (method: 'email' | 'copy' | 'share') => {
    try {
      setLoading(true);
      await ReferralService.shareReferralLink(method);
      
      if (method === 'copy') {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error('Error sharing referral link:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900">Share Your Referral Link</h3>
        <p className="mt-1 text-sm text-gray-500">
          Invite others to join and earn rewards for each successful referral
        </p>
        
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button
            onClick={() => handleShare('copy')}
            disabled={loading}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </>
            )}
          </button>
          
          <button
            onClick={() => handleShare('email')}
            disabled={loading}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Mail className="w-4 h-4 mr-2" />
            Send Email
          </button>
          
          {navigator.share && (
            <button
              onClick={() => handleShare('share')}
              disabled={loading}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </button>
          )}
        </div>

        <div className="mt-6">
          <div className="rounded-md bg-indigo-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Share2 className="h-5 w-5 text-indigo-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-indigo-800">Pro Tips</h3>
                <div className="mt-2 text-sm text-indigo-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Share your link on social media to reach more people</li>
                    <li>Personalize your invitation message for better response</li>
                    <li>Follow up with pending referrals to encourage sign-ups</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
