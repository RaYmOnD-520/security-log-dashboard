import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaRobot, FaSpinner, FaExclamationTriangle } from 'react-icons/fa'

function ThreatSummary({ analysisData }) {
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleGenerateSummary = async () => {
    setIsLoading(true)
    setError(null)
    setSummary(null)

    try {
      const response = await fetch('/api/summarise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to generate summary')
      }

      const result = await response.json()
      setSummary(result.summary)
    } catch (err) {
      setError(err.message || 'Failed to generate AI summary. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-500/10 p-3 rounded-lg">
            <FaRobot className="text-green-500 text-2xl" />
          </div>
          <h3 className="text-xl font-semibold text-white">AI Threat Analysis</h3>
        </div>
        <button
          onClick={handleGenerateSummary}
          disabled={isLoading}
          className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
            isLoading
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/50'
          } text-white`}
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <FaRobot />
              <span>Generate AI Summary</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <motion.div
          className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <FaExclamationTriangle className="text-red-500 text-xl mt-0.5" />
          <div>
            <p className="text-red-400 font-medium mb-1">Error</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </motion.div>
      )}

      {summary && (
        <motion.div
          className="bg-slate-700/50 border border-slate-600 rounded-lg p-5"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start gap-3">
            <div className="bg-green-500/20 p-2 rounded-lg mt-1">
              <FaRobot className="text-green-400 text-lg" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-400 font-medium mb-2">Claude AI Analysis</p>
              <p className="text-gray-200 leading-relaxed">{summary}</p>
            </div>
          </div>
        </motion.div>
      )}

      {!summary && !error && !isLoading && (
        <div className="text-center py-8">
          <FaRobot className="text-6xl text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Click "Generate AI Summary" to get an AI-powered threat analysis</p>
          <p className="text-gray-500 text-sm mt-2">Powered by Claude AI</p>
        </div>
      )}
    </motion.div>
  )
}

export default ThreatSummary
