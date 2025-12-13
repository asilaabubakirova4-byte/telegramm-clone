import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import { authApi } from '../services/auth.service'
import { AxiosError } from 'axios'

const countryCodes = [
  { code: 'UZ', dial: '+998', name: 'Uzbekistan' },
  { code: 'RU', dial: '+7', name: 'Russia' },
  { code: 'US', dial: '+1', name: 'United States' },
  { code: 'GB', dial: '+44', name: 'United Kingdom' },
  { code: 'DE', dial: '+49', name: 'Germany' },
  { code: 'TR', dial: '+90', name: 'Turkey' },
  { code: 'KZ', dial: '+7', name: 'Kazakhstan' },
  { code: 'TJ', dial: '+992', name: 'Tajikistan' },
  { code: 'KG', dial: '+996', name: 'Kyrgyzstan' },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setAuth, setLoading, setError, isLoading, error, clearError } = useAuthStore()
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0])
  const [showDropdown, setShowDropdown] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 5) return `${numbers.slice(0, 2)} ${numbers.slice(2)}`
    if (numbers.length <= 7) return `${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5)}`
    return `${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5, 7)} ${numbers.slice(7, 9)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fullPhone = selectedCountry.dial + phoneNumber.replace(/\s/g, '')
    
    try {
      setLoading(true)
      clearError()
      const response = await authApi.register({
        phone: fullPhone,
        firstName,
        lastName: lastName || undefined,
      })
      setAuth(response.user, response.token)
      navigate('/chat')
    } catch (err) {
      const axiosError = err as AxiosError<{ error: string }>
      setError(axiosError.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = phoneNumber.length >= 9 && firstName.trim().length >= 2

  return (
    <div className="min-h-screen bg-[#0e1621] flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="text-center mb-6">
        <div className="w-24 h-24 mx-auto mb-4 bg-[#3390ec] rounded-full flex items-center justify-center shadow-lg shadow-[#3390ec]/30">
          <svg className="w-14 h-14 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/>
          </svg>
        </div>
        <h1 className="text-3xl font-semibold text-white mb-2">Telegram</h1>
        <p className="text-[#6c7883] text-base">Create your account</p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#6c7883] text-sm ml-1 mb-2">First Name</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6c7883]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full bg-[#242f3d] border border-[#3d4d5c] rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-[#6c7883] focus:outline-none focus:border-[#3390ec] transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-[#6c7883] text-sm ml-1 mb-2">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Optional"
                className="w-full bg-[#242f3d] border border-[#3d4d5c] rounded-xl px-4 py-3.5 text-white placeholder-[#6c7883] focus:outline-none focus:border-[#3390ec] transition-colors"
              />
            </div>
          </div>

          {/* Phone Number Section */}
          <div className="space-y-2">
            <label className="block text-[#6c7883] text-sm ml-1">Phone Number</label>
            
            <div className="flex gap-2">
              {/* Country Code Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 bg-[#242f3d] hover:bg-[#2b3848] border border-[#3d4d5c] rounded-xl px-4 py-3.5 text-white transition-colors min-w-[120px]"
                >
                  <span className="text-sm font-medium">{selectedCountry.code}</span>
                  <span className="text-[#6c7883]">{selectedCountry.dial}</span>
                  <svg className={`w-4 h-4 text-[#6c7883] ml-auto transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-[#242f3d] border border-[#3d4d5c] rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                    {countryCodes.map((country) => (
                      <button
                        key={country.code + country.dial}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(country)
                          setShowDropdown(false)
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2b3848] transition-colors text-left ${
                          selectedCountry.code === country.code ? 'bg-[#3390ec]/20' : ''
                        }`}
                      >
                        <span className="text-white font-medium">{country.code}</span>
                        <span className="text-[#6c7883] text-sm flex-1">{country.name}</span>
                        <span className="text-[#6c7883] text-sm">{country.dial}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Phone Input */}
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6c7883]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="XX XXX XX XX"
                  className="w-full bg-[#242f3d] border border-[#3d4d5c] rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-[#6c7883] focus:outline-none focus:border-[#3390ec] transition-colors"
                  maxLength={12}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="w-full bg-[#3390ec] hover:bg-[#2b7fd4] disabled:bg-[#3390ec]/50 disabled:cursor-not-allowed text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-base mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign Up
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* End-to-end encrypted */}
        <div className="flex items-center justify-center gap-2 mt-6 text-[#6c7883] text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          End-to-end encrypted
        </div>

        {/* Terms */}
        <p className="text-center mt-6 text-[#6c7883] text-sm">
          By signing up, you agree to our{' '}
          <a href="#" className="text-[#3390ec] hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-[#3390ec] hover:underline">Privacy Policy</a>
        </p>

        {/* Login link */}
        <p className="text-center mt-4 text-[#6c7883]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#3390ec] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
