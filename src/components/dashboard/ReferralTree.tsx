import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Users } from 'lucide-react';
import { ReferralService } from '../../lib/referralService';

interface TreeNode {
  id: string;
  referrer_id: string;
  referred_email: string;
  status: 'pending' | 'active' | 'inactive';
  created_at: string;
  total_rewards: number;
  last_active?: string;
  depth: number;
  children?: TreeNode[];
}

export function ReferralTree() {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0,
    totalRewards: 0,
  });
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const [treeData, statsData] = await Promise.all([
        ReferralService.getReferralTree(),
        ReferralService.getReferralStats()
      ]);

      // Transform flat tree data into hierarchical structure
      const transformedData = transformTreeData(treeData);
      setTreeData(transformedData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const transformTreeData = (flatData: any[]): TreeNode[] => {
    const nodeMap = new Map<string, TreeNode>();
    const rootNodes: TreeNode[] = [];

    // First pass: Create all nodes
    flatData.forEach(item => {
      nodeMap.set(item.id, { ...item, children: [] });
    });

    // Second pass: Build tree structure
    flatData.forEach(item => {
      const node = nodeMap.get(item.id)!;
      if (item.depth === 1) {
        rootNodes.push(node);
      } else {
        const parentNode = Array.from(nodeMap.values()).find(
          n => n.referred_email === item.referrer_id
        );
        if (parentNode) {
          parentNode.children = parentNode.children || [];
          parentNode.children.push(node);
        }
      }
    });

    return rootNodes;
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const renderNode = (node: TreeNode, isLast: boolean = false) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800'
    };

    return (
      <div key={node.id} className="ml-6">
        <div className="flex items-center py-2">
          {hasChildren ? (
            <button
              onClick={() => toggleNode(node.id)}
              className="p-1 hover:bg-gray-100 rounded-full mr-2"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
          ) : (
            <div className="w-6 mr-2" />
          )}
          
          <div className="flex-1 flex items-center">
            <Users className="w-5 h-5 text-gray-400 mr-2" />
            <div>
              <div className="text-sm font-medium text-gray-900">
                {node.referred_email}
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span className={`px-2 py-0.5 rounded-full ${statusColors[node.status]}`}>
                  {node.status}
                </span>
                <span>•</span>
                <span>
                  Joined {new Date(node.created_at).toLocaleDateString()}
                </span>
                {node.total_rewards > 0 && (
                  <>
                    <span>•</span>
                    <span>${node.total_rewards.toFixed(2)} earned</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="border-l border-gray-200">
            {node.children!.map((child, index) =>
              renderNode(child, index === node.children!.length - 1)
            )}
          </div>
        )}
      </div>
    );
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
      {/* Stats Header */}
      <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Referral Network</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-500">Total Referrals</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">{stats.total}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Active</div>
            <div className="mt-1 text-2xl font-semibold text-green-600">{stats.active}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Pending</div>
            <div className="mt-1 text-2xl font-semibold text-yellow-600">{stats.pending}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Inactive</div>
            <div className="mt-1 text-2xl font-semibold text-gray-600">{stats.inactive}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Total Earnings</div>
            <div className="mt-1 text-2xl font-semibold text-indigo-600">
              ${stats.totalRewards.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Tree View */}
      <div className="px-4 py-5 sm:p-6">
        {treeData.length > 0 ? (
          <div className="-ml-6">
            {treeData.map((node, index) =>
              renderNode(node, index === treeData.length - 1)
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No referrals yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start growing your network by inviting others to join.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
