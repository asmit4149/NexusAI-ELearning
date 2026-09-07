import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Loader2, CheckCircle, XCircle, Award, Calendar, User, BookOpen, ShieldCheck } from 'lucide-react';

const CertificateVerify = () => {
  const { credentialId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        const res = await axios.get(`/api/certificates/verify/${credentialId}`);
        setCertificate(res.data.data);
      } catch (error) {
        console.error('Failed to verify certificate', error);
        setError('Invalid Certificate ID or Certificate not found.');
      } finally {
        setLoading(false);
      }
    };
    if (credentialId) {
      verifyCertificate();
    }
  }, [credentialId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
          <p className="mt-4 text-slate-500">Verifying credential...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="mb-8 text-center">
        <Link to="/" className="inline-block flex items-center justify-center gap-2 mb-6">
          <div className="rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 p-1.5 shadow-lg">
             <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Nexus<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-purple-500">AI</span> Credential Verification
          </span>
        </Link>
      </div>

      {error || !certificate ? (
        <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl border border-red-200 dark:border-red-900/30 p-10 text-center shadow-xl">
          <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Verification Failed</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">{error}</p>
          <Link to="/" className="inline-flex justify-center items-center rounded-xl bg-slate-100 dark:bg-slate-700 px-6 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
            Return Home
          </Link>
        </div>
      ) : (
        <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-primary-500 to-purple-600 p-8 text-center relative">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            <div className="mx-auto w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 border border-white/30 shadow-inner">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 relative z-10">Verified Certificate</h2>
            <p className="text-primary-100 relative z-10">This credential is authentic and verified by NexusAI.</p>
          </div>
          
          <div className="p-8 sm:p-12 space-y-8">
            <div className="text-center border-b border-slate-100 dark:border-slate-700 pb-8">
              <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold mb-2">Proudly Awarded To</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{certificate.user?.name || 'Student'}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg">
                  <BookOpen className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">For successfully completing</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white leading-tight mt-1">{certificate.course?.title || 'Course'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-0.5 bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Issued On</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white leading-tight mt-1">
                    {new Date(certificate.issuedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 sm:col-span-2 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="mt-0.5 bg-slate-200 dark:bg-slate-700 p-2 rounded-lg">
                  <Award className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Credential ID</p>
                  <p className="text-lg font-mono font-bold text-slate-900 dark:text-white leading-tight mt-1 tracking-wider">{certificate.credentialId}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateVerify;
