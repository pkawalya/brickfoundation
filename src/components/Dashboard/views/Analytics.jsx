import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Analytics() {
  const { user } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState({
    labels: [],
    datasets: [],
  });
  const [taskStatusData, setTaskStatusData] = useState({
    labels: [],
    datasets: [],
  });
  const [documentStats, setDocumentStats] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [user]);

  async function fetchAnalyticsData() {
    try {
      // Fetch activity data for the past 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: activities } = await supabase
        .from('activity_log')
        .select('created_at, activity_type')
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at');

      // Process activity data
      const activityByDate = {};
      activities?.forEach((activity) => {
        const date = new Date(activity.created_at).toLocaleDateString();
        activityByDate[date] = (activityByDate[date] || 0) + 1;
      });

      setActivityData({
        labels: Object.keys(activityByDate),
        datasets: [
          {
            label: 'Daily Activities',
            data: Object.values(activityByDate),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
          },
        ],
      });

      // Fetch task status distribution
      const { data: tasks } = await supabase
        .from('tasks')
        .select('status')
        .eq('user_id', user.id);

      const taskStatusCount = {
        pending: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
      };

      tasks?.forEach((task) => {
        taskStatusCount[task.status] = (taskStatusCount[task.status] || 0) + 1;
      });

      setTaskStatusData({
        labels: Object.keys(taskStatusCount),
        datasets: [
          {
            data: Object.values(taskStatusCount),
            backgroundColor: [
              'rgb(255, 205, 86)',
              'rgb(54, 162, 235)',
              'rgb(75, 192, 192)',
              'rgb(255, 99, 132)',
            ],
          },
        ],
      });

      // Fetch document statistics
      const { data: documents } = await supabase
        .from('documents')
        .select('status, file_type')
        .eq('user_id', user.id);

      const docTypeCount = {};
      documents?.forEach((doc) => {
        docTypeCount[doc.file_type] = (docTypeCount[doc.file_type] || 0) + 1;
      });

      setDocumentStats({
        labels: Object.keys(docTypeCount),
        datasets: [
          {
            label: 'Documents by Type',
            data: Object.values(docTypeCount),
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          },
        ],
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 h-64"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          View insights about your activity and usage patterns.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Activity Timeline */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Activity Timeline
          </h2>
          <div className="h-64">
            <Line
              data={activityData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Task Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Task Status Distribution
          </h2>
          <div className="h-64">
            <Doughnut
              data={taskStatusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>

        {/* Document Statistics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Documents by Type
          </h2>
          <div className="h-64">
            <Bar
              data={documentStats}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Quick Statistics
          </h2>
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Activities
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {activityData.datasets[0]?.data.reduce((a, b) => a + b, 0) || 0}
              </dd>
            </div>
            <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Completion Rate
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {taskStatusData.datasets[0]?.data[2]
                  ? Math.round(
                      (taskStatusData.datasets[0].data[2] /
                        taskStatusData.datasets[0].data.reduce(
                          (a, b) => a + b,
                          0
                        )) *
                        100
                    )
                  : 0}
                %
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
