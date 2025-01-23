import React from 'react';
import { Users, Gift, DollarSign } from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';

export function UserDashboard() {
  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">My Dashboard</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Stats Grid */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">My Referrals</dt>
                      <dd className="text-lg font-medium text-gray-900">3</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Earnings</dt>
                      <dd className="text-lg font-medium text-gray-900">$30</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Gift className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Raffle Entries</dt>
                      <dd className="text-lg font-medium text-gray-900">2</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Referral Tree */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  My Referral Tree
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-center">
                  {/* Placeholder for referral tree visualization */}
                  <div className="text-center text-gray-500">
                    <Users className="mx-auto h-12 w-12" />
                    <p className="mt-2">Your referral tree will appear here</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Earnings */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Earnings
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="flow-root">
                  <ul role="list" className="-mb-8">
                    {[
                      {
                        type: 'Referral Bonus',
                        amount: '$10',
                        date: '2 days ago'
                      },
                      {
                        type: 'Referral Bonus',
                        amount: '$10',
                        date: '5 days ago'
                      },
                      {
                        type: 'Referral Bonus',
                        amount: '$10',
                        date: '1 week ago'
                      }
                    ].map((earning, idx) => (
                      <li key={idx}>
                        <div className="relative pb-8">
                          {idx !== 2 ? (
                            <span
                              className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                              aria-hidden="true"
                            />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                                <DollarSign className="h-4 w-4 text-white" />
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-gray-500">
                                  {earning.type}
                                  <span className="font-medium text-gray-900 ml-2">
                                    {earning.amount}
                                  </span>
                                </p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                <time>{earning.date}</time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}