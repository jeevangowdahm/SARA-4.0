import React, { useState, useEffect } from 'react';
import { SaraApiClient } from '../../lib/sara/api/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<'identifier' | 'otp'>('identifier');
  const [identifier, setIdentifier] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [cooldown, setCooldown] = useState<number>(0);

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!isOpen) return null;

  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg('Please enter your 10-digit mobile number or email address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setStatusMsg('');

    try {
      const res = await SaraApiClient.requestOtp(identifier.trim());
      if (res.success) {
        setStep('otp');
        setStatusMsg(res.message);
        if (res.cooldownSeconds) setCooldown(res.cooldownSeconds);
        else setCooldown(60);
      } else {
        setErrorMsg(res.message || 'Could not send OTP.');
        if (res.cooldownSeconds) setCooldown(res.cooldownSeconds);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error requesting OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otpCode.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await SaraApiClient.verifyOtp(identifier.trim(), otpCode.trim());
      if (res.success) {
        onSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.message || 'Incorrect verification code.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setStatusMsg('Signing in with demo verified account (+91 9876543210)...');

    try {
      const demoId = '9876543210';
      setIdentifier(demoId);
      const reqRes = await SaraApiClient.requestOtp(demoId);
      const code = reqRes.devOtp || '123456';
      const verifyRes = await SaraApiClient.verifyOtp(demoId, code);

      if (verifyRes.success) {
        onSuccess(verifyRes.user);
        onClose();
      } else {
        setErrorMsg(verifyRes.message || 'Demo login failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed. Make sure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101B34]/70 backdrop-blur-md animate-fade-in">
      <div className="bg-surface-container-lowest rounded-3xl border border-secondary/20 shadow-2xl max-w-md w-full p-6 space-y-4 animate-fade-in-up relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-secondary/15 blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-secondary to-teal-700 flex items-center justify-center text-on-secondary shadow-md shadow-secondary/25 animate-pulse-glow">
              <span className="material-symbols-outlined text-[22px]">lock</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-base font-bold text-primary-container">
                {step === 'identifier' ? 'Sign In / Register with SARA' : 'Enter Verification Code'}
              </h2>
              <span className="text-xs text-on-surface-variant flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block animate-ping" />
                <span>Real OTP Authentication via SMTP</span>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-primary-container text-lg font-bold p-1 rounded-lg hover:bg-surface-container transition-colors"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-error-container/20 border border-error/30 rounded-xl text-error text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {statusMsg && (
          <div className="p-3 bg-secondary/10 border border-secondary/30 rounded-xl text-secondary text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{statusMsg}</span>
          </div>
        )}

        {/* STEP 1: Phone / Email input */}
        {step === 'identifier' && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <p className="text-xs text-on-surface-variant">
              Enter your mobile number or email address. We will send you a genuine 6-digit OTP code to verify your identity.
            </p>

            <div>
              <label className="block text-xs font-semibold text-primary-container mb-1">
                Mobile Number or Email
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. jeevangowdahm6@gmail.com or 9876543210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/60 bg-surface text-on-surface text-sm focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                disabled={isLoading}
                autoFocus
              />
              <div className="flex items-center justify-between pt-1.5 text-[11px] text-on-surface-variant">
                <span>Real-time Clerk & SMTP Email Dispatch</span>
                <button
                  type="button"
                  onClick={() => setIdentifier('jeevangowdahm6@gmail.com')}
                  className="text-secondary font-semibold hover:underline"
                >
                  Fill jeevangowdahm6@gmail.com
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !identifier.trim()}
              className="w-full py-2.5 rounded-xl bg-secondary text-on-secondary font-semibold text-sm hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                  <span>Sending OTP...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-outline-variant/40"></div>
              <span className="flex-shrink mx-2 text-[10px] text-on-surface-variant uppercase font-bold">Or</span>
              <div className="flex-grow border-t border-outline-variant/40"></div>
            </div>

            <button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/60 text-primary-container font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px] text-secondary">bolt</span>
              <span>Instant Demo Sign In (+91 9876543210)</span>
            </button>
          </form>
        )}

        {/* STEP 2: Enter OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-xs text-on-surface-variant flex items-start gap-2.5">
              <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">mark_email_read</span>
              <div>
                <span>Verification code sent to <strong>{identifier}</strong> via secure SMTP. Please check your email inbox and enter the 6-digit code below.</span>
                <div className="text-[11px] text-on-surface-variant/80 mt-1">
                  Valid for 5 minutes. Check spam folder if not immediately visible.
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary-container mb-1">
                6-Digit Security Code (OTP)
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/60 bg-surface text-on-surface text-center tracking-[0.3em] font-mono text-lg font-bold focus:border-secondary focus:ring-1 focus:ring-secondary outline-none shadow-inner"
                disabled={isLoading}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otpCode.length !== 6}
              className="w-full py-2.5 rounded-xl bg-secondary text-on-secondary font-semibold text-sm hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify & Sign In</span>
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-2 text-xs text-on-surface-variant">
              <button
                type="button"
                onClick={() => setStep('identifier')}
                className="hover:text-primary-container underline"
              >
                Change number
              </button>

              <button
                type="button"
                onClick={() => handleRequestOtp()}
                disabled={cooldown > 0 || isLoading}
                className="hover:text-secondary disabled:opacity-50"
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

