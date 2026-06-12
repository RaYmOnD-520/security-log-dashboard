import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FaSearch, FaShieldAlt, FaExclamationTriangle, FaInfoCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa'

function EventsTable({ events = [] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const eventsPerPage = 10

  // Filter events based on search term
  const filteredEvents = useMemo(() => {
    if (!searchTerm.trim()) return events
    const term = searchTerm.toLowerCase()
    return events.filter(event =>
      event.severity?.toLowerCase().includes(term) ||
      event.message?.toLowerCase().includes(term) ||
      event.ip_address?.toLowerCase().includes(term) ||
      event.threat_type?.toLowerCase().includes(term)
    )
  }, [events, searchTerm])

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage)
  const indexOfLastEvent = currentPage * eventsPerPage
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const getSeverityConfig = (severity) => {
    const configs = {
      critical: {
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        badgeBg: 'bg-red-500',
        textColor: 'text-red-400',
        icon: FaExclamationTriangle
      },
      high: {
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        badgeBg: 'bg-orange-500',
        textColor: 'text-orange-400',
        icon: FaExclamationTriangle
      },
      warning: {
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        badgeBg: 'bg-yellow-500',
        textColor: 'text-yellow-400',
        icon: FaInfoCircle
      },
      info: {
        bgColor: 'bg-slate-800/50',
        borderColor: 'border-slate-700',
        badgeBg: 'bg-blue-500',
        textColor: 'text-blue-400',
        icon: FaShieldAlt
      }
    }
    return configs[severity] || configs.info
  }

  if (events.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Security Events</h2>
        <div className="text-center py-12">
          <FaShieldAlt className="text-6xl text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No security events to display</p>
          <p className="text-gray-500 text-sm mt-2">Upload a log file to begin analysis</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">
          Security Events ({filteredEvents.length})
        </h2>
        {/* Search Input */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1) // Reset to first page on search
            }}
            className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors duration-200"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Timestamp</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Severity</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Source IP</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Event Type</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Description</th>
            </tr>
          </thead>
          <tbody>
            {currentEvents.map((event, index) => {
              const config = getSeverityConfig(event.severity)
              const Icon = config.icon

              return (
                <motion.tr
                  key={event.id}
                  className={`border-b ${config.borderColor} ${config.bgColor} hover:bg-slate-700/50 transition-colors duration-200`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <td className="py-3 px-4 text-gray-300 text-sm font-mono">
                    {event.timestamp}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Icon className={`${config.textColor}`} />
                      <span className={`px-3 py-1 ${config.badgeBg} text-white text-xs font-semibold rounded-full uppercase`}>
                        {event.severity}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-300 text-sm font-mono">
                    {event.ip_address}
                  </td>
                  <td className="py-3 px-4">
                    {event.threat_type ? (
                      <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded border border-red-500/30">
                        {event.threat_type}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-300 text-sm max-w-md truncate">
                    {event.message}
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-gray-400 text-sm">
            Showing {indexOfFirstEvent + 1} to {Math.min(indexOfLastEvent, filteredEvents.length)} of {filteredEvents.length} events
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                currentPage === 1
                  ? 'bg-slate-700 text-gray-500 cursor-not-allowed'
                  : 'bg-slate-700 text-white hover:bg-green-500'
              }`}
            >
              <FaChevronLeft />
            </button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    currentPage === i + 1
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                currentPage === totalPages
                  ? 'bg-slate-700 text-gray-500 cursor-not-allowed'
                  : 'bg-slate-700 text-white hover:bg-green-500'
              }`}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default EventsTable
