import React, { useEffect, useState } from 'react';
import { Award, ChevronRight, Star, Shield, Users } from 'lucide-react';
import { ReferralService, ReferralTier } from '../../lib/referralService';

interface UserTierInfo {
  currentTier: ReferralTier;
  activeReferrals: number;
  nextTier: ReferralTier | null;
  referralsToNextTier: number;
}

export function ReferralTiers() {
  const [tiers, setTiers] = useState<ReferralTier[]>([]);
  const [userTierInfo, setUserTierInfo] = useState<UserTierInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTierData();
  }, []);

  const fetchTierData = async () => {
    try {
      // Fetch all tiers
      const tiersData = await ReferralService.getAllTiers();
      
      // Fetch current tier and stats
      const currentTier = await ReferralService.getCurrentTier();
      const stats = await ReferralService.getReferralStats();
      
      if (tiersData && currentTier) {
        const nextTierIndex = tiersData.findIndex(t => t.id === currentTier.id) + 1;
        const nextTier = nextTierIndex < tiersData.length ? tiersData[nextTierIndex] : null;
        
        setTiers(tiersData);
        setUserTierInfo({
          currentTier,
          activeReferrals: stats.active,
          nextTier,
          referralsToNextTier: nextTier ? nextTier.min_referrals - stats.active : 0,
        });
      }
    } catch (error) {
      console.error('Error fetching tier data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierIcon = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'platinum':
        return <Award className="w-6 h-6 text-indigo-600" />;
      case 'gold':
        return <Star className="w-6 h-6 text-yellow-600" />;
      case 'silver':
        return <Shield className="w-6 h-6 text-gray-400" />;
      default:
        return <Users className="w-6 h-6 text-orange-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Current Tier Status */}
      {userTierInfo && (
        <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Current Tier: {userTierInfo.currentTier.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                You have {userTierInfo.activeReferrals} active referrals
              </p>
            </div>
            <div className="flex-shrink-0">
              {getTierIcon(userTierInfo.currentTier.name)}
            </div>
          </div>

          {userTierInfo.nextTier && (
            <div className="mt-4">
              <div className="relative">
                <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                  <div
                    style={{
                      width: `${(userTierInfo.activeReferrals / userTierInfo.nextTier.min_referrals) * 100}%`,
                    }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600"
                  />
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {userTierInfo.referralsToNextTier} more referrals until{' '}
                <span className="font-medium">{userTierInfo.nextTier.name}</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tier List */}
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Referral Tiers</h3>
        <div className="space-y-4">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative rounded-lg border ${
                userTierInfo?.currentTier.id === tier.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200'
              } p-4`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getTierIcon(tier.name)}
                  <div className="ml-4">
                    <h4 className="text-base font-medium text-gray-900">{tier.name}</h4>
                    <p className="text-sm text-gray-500">
                      {tier.min_referrals} referrals required
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {tier.reward_multiplier}x Rewards
                  </p>
                  <p className="text-xs text-gray-500">
                    multiplier
                  </p>
                </div>
              </div>

              {/* Benefits */}
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Benefits</h5>
                <ul className="space-y-2">
                  {tier.benefits.perks.map((perk, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <ChevronRight className="w-4 h-4 text-indigo-600 mr-2" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>

              {userTierInfo?.currentTier.id === tier.id && (
                <div className="absolute top-0 right-0 -mt-2 -mr-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Current Tier
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
