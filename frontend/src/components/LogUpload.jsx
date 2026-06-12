import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FaUpload, FaFile, FaSpinner, FaExclamationTriangle } from 'react-icons/fa'

function LogUpload({ onAnalysisComplete }) {
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState(null)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    setError(null)
    const droppedFile = e.dataTransfer.files[0]
    validateAndSetFile(droppedFile)
  }, [])

  const handleFileSelect = useCallback((e) => {
    const selectedFile = e.target.files[0]
    validateAndSetFile(selectedFile)
  }, [])

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return
    const validExtensions = ['.log', '.txt']
    const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase()
    if (!validExtensions.includes(fileExtension)) {
      setError('Invalid file type. Please upload .log or .txt files only.')
      setFile(null)
      return
    }
    setFile(selectedFile)
    setError(null)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleAnalyze = async () => {
    if (!file) return
    setIsAnalyzing(true)
    setError(null)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const response = await fetch('/api/analyse', {
        method: 'POST',
        body: formData
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Analysis failed')
      }
      const result = await response.json()
      onAnalysisComplete(result)
      setFile(null)
    } catch (err) {
      setError(err.message || 'Failed to analyze log file. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Upload Security Logs</h2>
      <motion.div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
          isDragging
            ? 'border-green-500 bg-green-500/10'
            : 'border-slate-600 hover:border-green-500/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {!file ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <FaUpload className="text-5xl text-gray-400" />
            </div>
            <div>
              <p className="text-gray-300 font-medium mb-2">
                Drag and drop your log file here
              </p>
              <p className="text-gray-500 text-sm mb-4">or</p>
              <label className="inline-block">
                <input
                  type="file"
                  className="hidden"
                  accept=".log,.txt"
                  onChange={handleFileSelect}
                />
                <span className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg cursor-pointer transition-colors duration-200 inline-block">
                  Browse Files
                </span>
              </label>
            </div>
            <p className="text-gray-500 text-xs">Supports .log and .txt files</p>
          </div>
        ) : (
          <motion.div
            className="space-y-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-center gap-3 text-green-500">
              <FaFile className="text-3xl" />
              <div className="text-left">
                <p className="font-medium text-white">{file.name}</p>
                <p className="text-sm text-gray-400">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors duration-200"
            >
              Remove file
            </button>
          </motion.div>
        )}
      </motion.div>

      {error && (
        <motion.div
          className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <FaExclamationTriangle className="text-red-500 text-xl" />
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      {file && (
        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-3 ${
              isAnalyzing
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/50'
            } text-white`}
          >
            {isAnalyzing ? (
              <>
                <FaSpinner className="animate-spin text-xl" />
                <span>Analyzing Logs...</span>
              </>
            ) : (
              <>
                <FaUpload />
                <span>Analyse Logs</span>
              </>
            )}
          </button>
        </motion.div>
      )}
    </div>
  )
}

export default LogUpload
