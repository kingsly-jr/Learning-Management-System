import React, { useRef, useState } from 'react';

// Fonts from Google Fonts
// Parisienne   -> student name
// Great Vibes  -> instructor signature
const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Parisienne&family=Great+Vibes&display=swap';

function loadFonts() {
  if (!document.getElementById('cert-fonts')) {
    const link = document.createElement('link');
    link.id = 'cert-fonts';
    link.rel = 'stylesheet';
    link.href = GOOGLE_FONTS_URL;
    document.head.appendChild(link);
  }
}

export default function CertificateGenerator({ enrollment, user, onClose }) {
  const certRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  loadFonts();

  // Pull data from enrollment/course object and user object
  const studentName  = enrollment?.studentName || user?.username || user?.sub || 'Student Name';
  const courseTitle  = enrollment?.courseTitle || enrollment?.title || 'Course Title';
  const categoryName = enrollment?.categoryName || 'Uncategorized';
  const instructorName = enrollment?.instructorName || 'Instructor';
  const completedAt  = enrollment?.completedAt
    ? new Date(enrollment.completedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Dynamic imports so they only load when needed
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const canvas = await html2canvas(certRef.current, {
        scale: 3,           // 3x resolution for crisp PDF
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 3, canvas.height / 3],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 3, canvas.height / 3);
      pdf.save(`Certificate_${studentName.replace(/\s+/g, '_')}_${courseTitle.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Certificate download failed:', err);
      alert('Could not generate PDF. Make sure html2canvas and jspdf are installed:\n\nnpm install html2canvas jspdf');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      zIndex: 9999, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '20px',
      overflowY: 'auto'
    }}>
      {/* Cert preview */}
      <div
        ref={certRef}
        style={{
          position: 'relative',
          width: '900px',
          height: '638px',
          maxWidth: '100%',
          flexShrink: 0,
          userSelect: 'none',
        }}
      >
        {/* Background image — the user's custom certificate */}
        <img
          src="/certificate-template.png"
          alt="Certificate Background"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          crossOrigin="anonymous"
        />

        {/* ── Student Name (Parisienne, large golden italic) ── */}
        <div style={{
          position: 'absolute',
          top: '43.5%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: "'Parisienne', cursive",
          fontSize: '62px',
          color: '#c8960c',
          whiteSpace: 'nowrap',
          textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
          letterSpacing: '1px',
        }}>
          {studentName}
        </div>

        {/* ── Body text: course, category, date ── */}
        <div style={{
          position: 'absolute',
          top: '60%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
          fontSize: '15.5px',
          color: '#e0e0e0', // Light text for dark background
          textAlign: 'center',
          lineHeight: '1.7',
          width: '580px',
        }}>
          For successfully completing the course{' '}
          <strong style={{ color: '#c8960c' }}>"{courseTitle}"</strong>{' '}in<br />
          the{' '}
          <strong style={{ color: '#c8960c' }}>"{categoryName}"</strong>{' '}
          category on LearnSphere.<br />
          Issued on{' '}
          <strong style={{ color: '#c8960c' }}>{completedAt}</strong>.
        </div>

        {/* ── Instructor Signature Block (Left) ── */}
        <div style={{
          position: 'absolute',
          top: '77%',
          left: '26%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '220px',
        }}>
          <div style={{
            fontFamily: "'Great Vibes', cursive",
            fontSize: '36px',
            color: '#ffffff',
            whiteSpace: 'nowrap',
            marginBottom: '4px'
          }}>
            {instructorName}
          </div>
          <div style={{ width: '100%', height: '2px', backgroundColor: '#a3a3a3', marginBottom: '10px' }} />
          <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", fontSize: '15px', color: '#a3a3a3' }}>
            Course Instructor
          </div>
        </div>

        {/* ── Director of Learning Block (Right) ── */}
        <div style={{
          position: 'absolute',
          top: '77%',
          left: '74%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '220px',
        }}>
          <div style={{
            fontFamily: "'Great Vibes', cursive",
            fontSize: '36px',
            color: '#ffffff',
            whiteSpace: 'nowrap',
            marginBottom: '4px'
          }}>
            Kingsly
          </div>
          <div style={{ width: '100%', height: '2px', backgroundColor: '#a3a3a3', marginBottom: '10px' }} />
          <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", fontSize: '15px', color: '#a3a3a3' }}>
            Director of Learning
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <button
          className="btn btn-primary"
          onClick={handleDownload}
          disabled={downloading}
          style={{ minWidth: '180px' }}
        >
          {downloading ? '⏳ Generating PDF…' : '⬇️ Download Certificate'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={onClose}
        >
          ✕ Close
        </button>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '10px' }}>
        Place your certificate template image at: <code>frontend/public/certificate-template.png</code>
      </p>
    </div>
  );
}
