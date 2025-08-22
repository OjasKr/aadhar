import React, { useState } from "react";
import axios from "axios";
import {
  CheckCircle,
  XCircle,
  Shield,
  Smartphone,
  Hash,
  Loader2,
} from "lucide-react";

const AadhaarVerification = () => {
  const [step, setStep] = useState("aadhaar"); // 'aadhaar', 'otp', 'success', 'error'
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatAadhaar = (value) => {
    const cleaned = value.replace(/\s/g, "");
    const formatted = cleaned.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3");
    return formatted;
  };

  const handleAadhaarChange = (e) => {
    const value = e.target.value.replace(/\s/g, "");
    if (value.length <= 12 && /^\d*$/.test(value)) {
      setAadhaarNumber(value);
    }
  };

  const handleSendOTP = async () => {
    if (aadhaarNumber.length !== 12) {
      setError("Please enter a valid 12-digit Aadhaar number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "https://aadhar-uc3d.onrender.com/send-otp",
        {
          aadhaar: aadhaarNumber,
        }
      );

      const result = response.data;

      if (!result.success) {
        setError(result.message || "Failed to send OTP");
        return;
      }

      if (result.mobile) {
        setMobile(result.mobile);
      }

      setStep("otp");
    } catch (err) {
      console.error("Network error:", err);
      setError(
        err.response?.data?.message ||
          "Network error. Please check if the server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "https://aadhar-uc3d.onrender.com/verify-otp",
        {
          otp,
        }
      );

      const result = response.data;

      if (!result.success) {
        setError(result.message || "OTP verification failed");
        return;
      }

      setStep("success");
    } catch (err) {
      console.error("Network error:", err);
      setError(
        err.response?.data?.message || "Network error during verification"
      );
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("aadhaar");
    setAadhaarNumber("");
    setOtp("");
    setMobile("");
    setError("");
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Aadhaar Verification
          </h1>
          <p className="text-gray-600">Secure identity verification with OTP</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Progress Indicator */}
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center space-x-2 ${
                  step === "aadhaar"
                    ? "text-blue-600"
                    : step === "otp" || step === "success"
                    ? "text-green-500"
                    : "text-gray-400"
                }`}
              >
                <Hash className="w-4 h-4" />
                <span className="text-sm font-medium">Aadhaar</span>
              </div>
              <div className="flex-1 h-px bg-gray-200 relative">
                <div
                  className={`absolute inset-0 bg-blue-600 transition-all duration-300 ${
                    step === "otp" || step === "success" ? "w-full" : "w-0"
                  }`}
                ></div>
              </div>
              <div
                className={`flex items-center space-x-2 ${
                  step === "otp"
                    ? "text-blue-600"
                    : step === "success"
                    ? "text-green-500"
                    : "text-gray-400"
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-sm font-medium">OTP</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Aadhaar Input Step */}
            {step === "aadhaar" && (
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="aadhaar"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Enter your 12-digit Aadhaar number
                  </label>
                  <input
                    type="text"
                    id="aadhaar"
                    value={formatAadhaar(aadhaarNumber)}
                    onChange={handleAadhaarChange}
                    placeholder="1234 5678 9012"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono tracking-wider"
                    maxLength={14}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    We'll send an OTP to your registered mobile number
                  </p>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleSendOTP}
                  disabled={loading || aadhaarNumber.length !== 12}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <span>Send OTP</span>
                  )}
                </button>
              </div>
            )}

            {/* OTP Input Step */}
            {step === "otp" && (
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="otp"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Enter 6-digit OTP
                  </label>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={handleOtpChange}
                    placeholder="123456"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-xl font-mono tracking-widest"
                    maxLength={6}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    OTP sent to your registered mobile number
                    {mobile && <span className="font-medium"> {mobile}</span>}
                  </p>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={handleReset}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 focus:ring-4 focus:ring-gray-200 transition-all duration-200"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleVerifyOTP}
                    disabled={loading || otp.length !== 6}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Verify OTP</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Success Step */}
            {step === "success" && (
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Verification Successful!
                  </h3>
                  <p className="text-gray-600">
                    Your Aadhaar identity has been successfully verified.
                  </p>
                  {mobile && (
                    <p className="text-sm text-gray-500 mt-2">
                      Verified mobile: {mobile}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleReset}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all duration-200"
                >
                  Verify Another Aadhaar
                </button>
              </div>
            )}

            {/* Error Step */}
            {step === "error" && (
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Verification Failed
                  </h3>
                  <p className="text-gray-600">
                    There was an error during the verification process. Please
                    try again.
                  </p>
                  {error && (
                    <p className="text-sm text-red-600 mt-2">{error}</p>
                  )}
                </div>
                <button
                  onClick={handleReset}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 focus:ring-4 focus:ring-red-200 transition-all duration-200"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Secure verification powered by Twilio OTP
          </p>
        </div>
      </div>
    </div>
  );
};

export default AadhaarVerification;
