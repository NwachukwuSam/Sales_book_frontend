
import { 
  TrendingUp, 
  BarChart3, 
  DollarSign, 
  CreditCard,
  Package,
  History,
  ArrowUp,
  ShoppingCart
} from 'lucide-react';
import TopNav from '../components/TopNav';

const AdminDashboard = () => {
  const stats = [
    {
      title: "Total Sales",
      value: "¥450,200",
      change: "+22.4% vs last week",
      icon: <DollarSign className="h-6 w-6" />,
      color: "bg-blue-500"
    },
    {
      title: "Total POS Services",
      value: "¥187,600",
      change: "+5.3% vs last week",
      icon: <CreditCard className="h-6 w-6" />,
      color: "bg-green-500"
    },
    {
      title: "Cash Total",
      value: "¥450,200",
      change: "+8.1% increase",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "bg-purple-500"
    }
  ];

  const quickLinks = [
    { 
      title: "POS", 
      description: "Start a new sale or POS transaction.",
      icon: <ShoppingCart className="h-6 w-6" />,
      link: "#pos"
    },
    { 
      title: "Inventory", 
      description: "Manage items, view stock levels and new inventory.",
      icon: <Package className="h-6 w-6" />,
      link: "#inventory"
    },
    { 
      title: "Sales History", 
      description: "View and filter all customer purchases.",
      icon: <History className="h-6 w-6" />,
      link: "#sales-history"
    },
    { 
      title: "POS Services History", 
      description: "View withdrawals, transfers, deposits",
      icon: <BarChart3 className="h-6 w-6" />,
      link: "#pos-history"
    }
  ];

  const paymentMethods = [
    { name: "Cash", percentage: 40, color: "bg-blue-500", value: "¥485,720" },
    { name: "UBA POS", percentage: 35, color: "bg-green-500", value: "¥425,005" },
    { name: "Wema POS", percentage: 25, color: "bg-purple-500", value: "¥303,575" }
  ];

  const salesData = [
    { day: "Jan 4", value: 20000 },
    { day: "Jan 5", value: 35000 },
    { day: "Jan 6", value: 45000 },
    { day: "Jan 7", value: 60000 },
    { day: "Jan 8", value: 55000 },
    { day: "Jan 9", value: 70000 },
    { day: "Jan 10", value: 80000 }
  ];

  const maxSalesValue = Math.max(...salesData.map(d => d.value));

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <TopNav/>
      <header className="mb-7 mt-6">
        <p className="text-gray-600 mt-2">Here's what's happening with your store today.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Stats Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</h3>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg text-white`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  {stat.change}
                </div>
              </div>
            ))}
          </div>

          {/* Sales Over Time Chart */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Sales Over Time</h3>
                <div className="flex items-center mt-2">
                  <span className="text-2xl font-bold text-gray-800">¥1,800,800</span>
                  <span className="ml-4 text-green-600 text-sm font-medium flex items-center">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    Gained ¥720,000 this month
                  </span>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <span className="text-gray-700 font-medium">Monthly</span>
              </div>
            </div>

            {/* Chart */}
            <div className="mt-8">
              <div className="flex items-end h-48 space-x-2">
                {salesData.map((data, index) => {
                  const height = (data.value / maxSalesValue) * 100;
                  return (
                    <div key={index} className="flex flex-col items-center flex-1 group">
                      <div className="text-xs text-gray-500 mb-2">{data.day}</div>
                      <div 
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-700 group-hover:scale-105"
                        style={{ height: `${height}%` }}
                      />
                      <div className="text-xs text-gray-700 mt-2 font-medium">
                        ¥{(data.value / 1000).toFixed(0)}k
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Y-axis labels */}
              <div className="flex justify-between text-xs text-gray-500 mt-4">
                <span>80k</span>
                <span>60k</span>
                <span>40k</span>
                <span>20k</span>
                <span>0k</span>
              </div>
            </div>

            {/* Cash Performance */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-gray-700 font-medium">Cash Jan, 2023</h4>
                  <p className="text-sm text-gray-500">Monthly performance</p>
                </div>
                <div className="text-green-600 font-semibold flex items-center">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  14.2%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Payment Method Breakdown */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Payment Method Breakdown</h3>
              <p className="text-2xl font-bold text-gray-800 mt-2">¥1,214,300</p>
            </div>

            <div className="space-y-4">
              {paymentMethods.map((method, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">{method.name}</span>
                    <span className="text-gray-800 font-semibold">{method.value}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${method.color} rounded-full transition-all duration-500`}
                      style={{ width: `${method.percentage}%` }}
                    />
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {method.percentage}%
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center space-x-4">
              {paymentMethods.map((method, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${method.color} mr-2`} />
                  <span className="text-sm text-gray-600">{method.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-4">
              {quickLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.link}
                  className="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 text-left group"
                >
                  <div className="bg-blue-100 p-3 rounded-lg text-blue-600 mr-4 group-hover:bg-blue-200 group-hover:text-blue-700 transition-colors">
                    {link.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 group-hover:text-blue-700">{link.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;