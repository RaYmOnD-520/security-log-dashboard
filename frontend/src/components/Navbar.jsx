import { FaShieldAlt } from 'react-icons/fa'

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-[#0f172a] border-b border-gray-800 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo */}
          <div className="flex items-center gap-3">
            <FaShieldAlt className="text-green-500 text-2xl" />
            <span className="text-xl font-bold text-green-500">SecureLog</span>
          </div>

          {/* Right side - Dashboard label and status */}
          <div className="flex items-center gap-6">
            <span className="text-gray-300 font-medium">Dashboard</span>
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                <div className="absolute top-0 left-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></div>
              </div>
              <span className="text-sm text-green-500 font-medium">System Active</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
