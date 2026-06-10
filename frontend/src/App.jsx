import Navbar from './components/Navbar'
import { FaExclamationTriangle, FaCheckCircle, FaExclamationCircle, FaDatabase } from 'react-icons/fa'

function App() {
  const stats = [
    {
      title: 'Total Events',
      value: '0',
      icon: FaDatabase,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Threats Detected',
      value: '0',
      icon: FaExclamationTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    },
    {
      title: 'Warnings',
      value: '0',
      icon: FaExclamationCircle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      title: 'Clean Events',
      value: '0',
      icon: FaCheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    }
  ]

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar />

      <main className="pt-24 px-6 pb-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 hover:border-green-500/50 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-2">{stat.title}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-4 rounded-lg`}>
                  <stat.icon className="text-2xl" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard Content Area */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Security Events</h2>
          <div className="text-center py-12">
            <p className="text-gray-400">No security events to display</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
