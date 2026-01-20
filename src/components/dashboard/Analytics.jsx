
import React from 'react';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';
import TopNav from '../TopNav';

const Analytics = () => {
  return (
    <div className="p-6">
        <TopNav/>
      <header className="mb-8">
        
        
        <p className="text-gray-600 mt-2">Deep insights and performance metrics</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stats Cards */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-2">¥1,250,000</h3>
              <p className="text-green-600 text-sm mt-2">+12.5% from last month</p>
            </div>
            <DollarSign className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Users</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-2">1,245</h3>
              <p className="text-blue-600 text-sm mt-2">+8.2% from last month</p>
            </div>
            <Users className="h-10 w-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Growth Rate</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-2">24.7%</h3>
              <p className="text-purple-600 text-sm mt-2">+3.2% from last month</p>
            </div>
            <TrendingUp className="h-10 w-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Transactions</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-2">8,456</h3>
              <p className="text-orange-600 text-sm mt-2">+15.3% from last month</p>
            </div>
            <BarChart3 className="h-10 w-10 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Detailed Analytics</h2>
        <p className="text-gray-600">
          Advanced analytics and reporting features will be implemented here.
          This section will include charts, graphs, and detailed metrics about
          your business performance.
        </p>
      </div>
    </div>
  );
};

export default Analytics;