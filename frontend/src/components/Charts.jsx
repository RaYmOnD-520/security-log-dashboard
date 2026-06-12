import { useMemo } from 'react'
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

function Charts({ events = [] }) {
  // Process timeline data - group by hour
  const timelineData = useMemo(() => {
    if (!events.length) return []

    const hourlyData = {}

    events.forEach(event => {
      const timestamp = event.timestamp || ''
      const hour = timestamp.substring(11, 13) + ':00' // Extract hour (HH:00)

      if (!hourlyData[hour]) {
        hourlyData[hour] = { time: hour, threats: 0, clean: 0 }
      }

      if (event.severity === 'CRITICAL' || event.severity === 'HIGH') {
        hourlyData[hour].threats++
      } else {
        hourlyData[hour].clean++
      }
    })

    return Object.values(hourlyData).sort((a, b) => a.time.localeCompare(b.time))
  }, [events])

  // Process threat breakdown data
  const threatBreakdown = useMemo(() => {
    if (!events.length) return []

    const breakdown = {
      'Failed Login': 0,
      'SQL Injection': 0,
      'Port Scan': 0,
      'Brute Force': 0,
      'Clean': 0
    }

    events.forEach(event => {
      const threatType = event.threat_type || 'normal'

      if (threatType === 'failed_login') {
        breakdown['Failed Login']++
      } else if (threatType === 'sql_injection') {
        breakdown['SQL Injection']++
      } else if (threatType === 'port_scan') {
        breakdown['Port Scan']++
      } else if (threatType === 'brute_force') {
        breakdown['Brute Force']++
      } else {
        breakdown['Clean']++
      }
    })

    return Object.entries(breakdown)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }))
  }, [events])

  const THREAT_COLORS = {
    'Failed Login': '#ef4444',
    'SQL Injection': '#f97316',
    'Port Scan': '#eab308',
    'Brute Force': '#a855f7',
    'Clean': '#22c55e'
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm font-medium mb-2">{payload[0].payload.time}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const PieCustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm font-medium">{payload[0].name}</p>
          <p className="text-sm" style={{ color: payload[0].payload.fill }}>
            Count: {payload[0].value}
          </p>
        </div>
      )
    }
    return null
  }

  if (!events.length) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Threat Timeline Chart */}
      <motion.div
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Threat Timeline</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={timelineData}>
            <defs>
              <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorClean" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="threats"
              stroke="#ef4444"
              fillOpacity={1}
              fill="url(#colorThreats)"
              name="Threats"
            />
            <Area
              type="monotone"
              dataKey="clean"
              stroke="#22c55e"
              fillOpacity={1}
              fill="url(#colorClean)"
              name="Clean Events"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Threat Breakdown Chart */}
      <motion.div
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Threat Breakdown</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={threatBreakdown}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={90}
              fill="#8884d8"
              dataKey="value"
            >
              {threatBreakdown.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={THREAT_COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip content={<PieCustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry) => (
                <span style={{ color: '#e2e8f0', fontSize: '14px' }}>
                  {value} ({entry.payload.value})
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}

export default Charts
