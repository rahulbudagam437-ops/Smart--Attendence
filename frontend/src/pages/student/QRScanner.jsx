import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { studentService } from '../../services/attendanceService';
import Modal from '../../components/Modal';
import { useToast } from '../../components/Toast';
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  RotateCw,
  StopCircle,
  Play
} from 'lucide-react';

const QRScanner = () => {
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [manualToken, setManualToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successRecord, setSuccessRecord] = useState(null);
  const [lastScannedCode, setLastScannedCode] = useState(null);

  const scannerRef = useRef(null);
  const html5QrCodeInstance = useRef(null);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      stopCameraScanner();
    };
  }, []);

  const startCameraScanner = async () => {
    setCameraError(null);
    try {
      if (!html5QrCodeInstance.current) {
        html5QrCodeInstance.current = new Html5Qrcode("qr-reader-container");
      }

      setScannerActive(true);

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      };

      await html5QrCodeInstance.current.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanFailure
      );
    } catch (err) {
      console.error("Camera start error:", err);
      setCameraError(err.message || 'Camera permission denied or camera device not found.');
      setScannerActive(false);
      addToast('Camera could not be activated. You can enter the session token manually.', 'error');
    }
  };

  const stopCameraScanner = async () => {
    if (html5QrCodeInstance.current && html5QrCodeInstance.current.isScanning) {
      try {
        await html5QrCodeInstance.current.stop();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setScannerActive(false);
  };

  const onScanSuccess = (decodedText) => {
    // Prevent duplicate triggers
    if (submitting || decodedText === lastScannedCode) return;
    setLastScannedCode(decodedText);
    stopCameraScanner();
    submitToken(decodedText);
  };

  const onScanFailure = (error) => {
    // Normal continuous frame search; suppress noise
  };

  const submitToken = async (token) => {
    if (!token.trim()) {
      addToast('Please provide a valid session token', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await studentService.scanAttendance(token.trim());
      if (res.success && res.data) {
        setSuccessRecord(res.data);
        addToast('Attendance marked successfully!', 'success');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to verify attendance token';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    submitToken(manualToken);
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title">Scan Attendance QR Code</h1>
        <p className="page-subtitle">Align the classroom projection QR code within the scanner viewfinder</p>
      </div>

      {/* Main Viewfinder Card */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
        <div
          id="qr-reader-container"
          style={{
            width: '100%',
            maxWidth: '380px',
            minHeight: '280px',
            margin: '0 auto 1.25rem',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            backgroundColor: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            border: '2px solid var(--primary-700)'
          }}
        >
          {!scannerActive && (
            <div style={{ padding: '2rem', color: '#94a3b8' }}>
              <Camera size={48} style={{ margin: '0 auto 0.75rem', color: '#38bdf8' }} />
              <div style={{ fontWeight: 600, color: 'var(--white)', marginBottom: '0.25rem' }}>
                Camera Ready
              </div>
              <div style={{ fontSize: '0.75rem' }}>
                Tap the button below to request camera access and scan
              </div>
            </div>
          )}
        </div>

        {cameraError && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            fontSize: '0.8125rem',
            marginBottom: '1rem',
            textAlign: 'left'
          }}>
            <strong>Camera Notice:</strong> {cameraError}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
          {!scannerActive ? (
            <button onClick={startCameraScanner} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
              <Play size={18} />
              <span>Launch Camera Scanner</span>
            </button>
          ) : (
            <button onClick={stopCameraScanner} className="btn btn-danger" style={{ padding: '0.75rem 1.5rem' }}>
              <StopCircle size={18} />
              <span>Stop Scanner</span>
            </button>
          )}
        </div>
      </div>

      {/* Manual Input Fallback Card (Crucial for desktop demo / testing) */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <KeyRound size={18} color="var(--primary-600)" />
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-900)' }}>
            Manual Token Submission
          </h2>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>
          If camera access is unavailable on this device, paste or enter the active session token shown by your professor:
        </p>

        <form onSubmit={handleManualSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Paste session token (e.g. DEMO-ACTIVE-TOKEN-2026)"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-indigo"
            style={{ width: '100%', padding: '0.75rem' }}
          >
            {submitting ? 'Verifying Token...' : 'Submit Session Token'}
          </button>
        </form>
      </div>

      {/* Successful Attendance Confirmation Modal */}
      <Modal
        isOpen={!!successRecord}
        onClose={() => {
          setSuccessRecord(null);
          navigate('/student/dashboard');
        }}
        title="Attendance Successfully Recorded!"
        maxWidth="480px"
      >
        {successRecord && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#dcfce7',
              color: '#16a34a',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
              Check-In Confirmed!
            </h3>

            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '1.25rem' }}>
              Your attendance has been validated on the institution server and stored in MySQL database.
            </p>

            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              textAlign: 'left',
              fontSize: '0.875rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              marginBottom: '1.5rem'
            }}>
              <div><strong>Course:</strong> {successRecord.subjectName}</div>
              <div><strong>Class:</strong> {successRecord.className}</div>
              <div><strong>Status:</strong> <span className="badge badge-present">{successRecord.status}</span></div>
              <div><strong>Timestamp:</strong> {new Date(successRecord.markedAt).toLocaleString()}</div>
              <div><strong>Verification:</strong> <code>{successRecord.method}</code></div>
            </div>

            <button
              onClick={() => {
                setSuccessRecord(null);
                navigate('/student/dashboard');
              }}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default QRScanner;
