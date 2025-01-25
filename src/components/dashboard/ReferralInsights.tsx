import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Clock, CheckCircle } from 'lucide-react';
import { ReferralService } from '../../lib/referralService';

interface DailyStats {
  date: string;
  total: number;
  active: number;
  pending: number;
}

interface ConversionRate {
  period: string;
  rate: number;
  total: number;
  converted: number;
}

export function ReferralInsights() {
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [conversionRates, setConversionRates] = useState<ConversionRate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      
      // Fetch daily stats for the last 30 days
      const dailyStatsData = await ReferralService.getDailyStats(30);
      setDailyStats(dailyStatsData);

      // Calculate conversion rates for different periods
      const periods = [
        { name: 'Last 7 Days', days: 7 },
        { name: 'Last 30 Days', days: 30 },
        { name: 'All Time', days: 365 }
      ];

      const conversionData = periods.map(period => {
        const periodStats = dailyStatsData.slice(-period.days);
        const total = periodStats.reduce((sum, day) => sum + day.total, 0);
        const converted = periodStats.reduce((sum, day) => sum + day.active, 0);

        return {
          period: period.name,
          rate: total > 0 ? (converted / total) * 100 : 0,
          total,
          converted
        };
      });

      setConversionRates(conversionData);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
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
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Referral Insights</h3>

        {/* Growth Chart */}
        <div className="mb-8">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Growth Trend</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dailyStats}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#6366F1"
                  name="Total"
                />
                <Line
                  type="monotone"
                  dataKey="active"
                  stroke="#10B981"
                  name="Active"
                />
                <Line
                  type="monotone"
                  dataKey="pending"
                  stroke="#F59E0B"
                  name="Pending"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Rates */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4">Conversion Rates</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {conversionRates.map((rate) => (
              <div
                key={rate.period}
                className="bg-gray-50 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {rate.period === 'Last 7 Days' ? (
                      <TrendingUp className="h-5 w-5 text-indigo-500" />
                    ) : rate.period === 'Last 30 Days' ? (
                      <Users className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-blue-500" />
                    )}
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      {rate.period}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm font-medium text-gray-900">
                      {rate.rate.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {rate.converted} converted out of {rate.total} referrals
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
