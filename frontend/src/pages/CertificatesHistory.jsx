import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Award, Download, Copy, ExternalLink, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const CertificatesHistory = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/certificates', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCertificates(res.data?.data || []);
      } catch (error) {
        console.error('Failed to load certificates', error);
        toast.error('Failed to load your certificates');
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  const handleDownload = async (courseId, courseTitle) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/certificates/${courseId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate_${courseTitle.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading certificate', error);
      toast.error('Error downloading certificate');
    }
  };

  const handleCopyLink = (credentialId) => {
    const url = `${window.location.origin}/verify/${credentialId}`;
    navigator.clipboard.writeText(url);
    toast.success('Verification link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary-500" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl flex items-center gap-3">
              <Award className="text-amber-500 h-8 w-8" />
              My Certificates
            </h1>
            <p className="mt-3 text-lg text-slate-500 dark:text-slate-400">
              View and manage the certificates you've earned from completing courses.
            </p>
          </div>
        </div>

        {certificates.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <Award className="mx-auto h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Certificates Yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Complete a course to earn your first certificate!</p>
            <Link to="/courses" className="inline-flex justify-center items-center rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-500">
              Explore Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map(cert => (
              <div key={cert._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 p-6 flex flex-col justify-end relative overflow-hidden">
                   <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1 text-white text-xs font-medium">
                     <CheckCircle size={14} /> Verified
                   </div>
                   <h3 className="text-white font-bold text-xl line-clamp-1">{cert.course?.title || 'Course'}</h3>
                </div>
                <div className="p-6">
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-1 flex justify-between">
                    <span>Issued On:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {new Date(cert.issuedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex justify-between">
                    <span>Credential ID:</span>
                    <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-700 dark:text-slate-300">
                      {cert.credentialId}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => handleDownload(cert.course?._id, cert.course?.title)}
                      className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Download size={16} /> Download PDF
                    </button>
                    <button 
                      onClick={() => handleCopyLink(cert.credentialId)}
                      className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Copy size={16} /> Copy Verification Link
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificatesHistory;
