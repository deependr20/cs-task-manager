'use client';

import { useState } from 'react';

// Simple amount-to-words for Indian Rupees (handles integers and common ranges)
function amountToWords(num) {
  const n = Math.floor(Number(num));
  if (n === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  function toWordsLessThanThousand(x) {
    if (x === 0) return '';
    if (x < 20) return ones[x];
    if (x < 100) return tens[Math.floor(x / 10)] + (x % 10 ? ' ' + ones[x % 10] : '');
    return ones[Math.floor(x / 100)] + ' Hundred' + (x % 100 ? ' ' + toWordsLessThanThousand(x % 100) : '');
  }
  if (n < 1000) return toWordsLessThanThousand(n);
  if (n < 100000) return toWordsLessThanThousand(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + toWordsLessThanThousand(n % 1000) : '');
  if (n < 10000000) return toWordsLessThanThousand(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + amountToWords(n % 100000) : '');
  if (n < 1000000000) return toWordsLessThanThousand(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + amountToWords(n % 10000000) : '');
  return n.toLocaleString('en-IN') + ' (Rupees)';
}

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '________');
const inr = (n) => (Number(n) ? Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '');

const TEMPLATE_PDF_URL = '/Memo%20of%20Fees_Draft.pdf';

// Template UI colours/layout (from MemoOfFees)
const styles = {
  pageBg: { background: '#e8e4dd' },
  sheet: {
    maxWidth: 780,
    margin: '0 auto',
    background: '#fff',
    boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
    padding: '48px 56px 64px',
    color: '#111',
  },
  brandName: { fontSize: 24, fontWeight: 700, color: '#c0612b', letterSpacing: '0.02em' },
  brandSub: { fontSize: 13, color: '#c0612b', fontStyle: 'italic', marginTop: 2 },
  headerBorder: { borderBottom: '2.5px solid #c0612b', paddingBottom: 12, marginBottom: 24 },
  contact: { textAlign: 'right', fontSize: 12, lineHeight: 1.9, color: '#444' },
  tableTh: { border: '1.5px solid #222', padding: '8px 12px', fontWeight: 700, fontSize: 14, background: '#f7f3ee' },
  tableTd: { border: '1.5px solid #222', padding: '12px', verticalAlign: 'top' },
  totalTd: { border: '1.5px solid #222', padding: '10px 12px', fontSize: 15, fontWeight: 700 },
};

export default function MemoPreview({ memo, onClose }) {
  const [downloading, setDownloading] = useState(false);
  if (!memo) return null;
  const amountNum = Number(memo.amount) || 0;
  const amountWords = amountToWords(amountNum);
  const memoDateStr = formatDate(memo.memoDate);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = 20;
      const brandColor = [192, 97, 43]; // #c0612b
      const amtColW = 36;
      const col1W = pageW - 2 * margin - amtColW;
      const borderW = 0.6; // ~1.5px

      // ─── Header (match image exactly) ───
      doc.setTextColor(...brandColor);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Manish Patidar & Co.', margin, y);
      y += 7;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'italic');
      doc.text('Company Secretaries', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 51, 51);
      doc.setFontSize(9);
      doc.text('+91 9999950459', pageW - margin, 20, { align: 'right' });
      doc.text('csmanishpatidar@gmail.com', pageW - margin, 26, { align: 'right' });
      doc.text('www.mpcorp.in', pageW - margin, 32, { align: 'right' });
      y += 4;
      doc.setDrawColor(...brandColor);
      doc.setLineWidth(0.75);
      doc.line(margin, y + 3, pageW - margin, y + 3);
      y += 16;

      // ─── Recipient (labels bold where needed, values on underline) ───
      doc.setTextColor(17, 17, 17);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Name of Company', margin, y);
      doc.setFont('helvetica', 'normal');
      const cName = memo.companyName || '';
      doc.text(cName, margin + 48, y);
      doc.setDrawColor(85, 85, 85);
      doc.setLineWidth(0.2);
      doc.line(margin + 48, y + 1.5, pageW - margin, y + 1.5);
      y += 8;
      doc.text('Address', margin, y);
      doc.line(margin + 22, y + 1.5, pageW - margin, y + 1.5);
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.text('Kind Attention:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text('Mr/Mrs/ ' + (memo.sentTo || ''), margin + 40, y);
      doc.line(margin + 40, y + 1.5, pageW - margin, y + 1.5);
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.text('Email:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.line(margin + 18, y + 1.5, pageW - margin, y + 1.5);
      y += 14;

      // ─── Memo No + Date (bold values with underline) ───
      doc.text('Memo No. ', margin, y);
      doc.setFont('helvetica', 'bold');
      doc.text(memo.memoNo || '_______________', margin + 24, y);
      doc.line(margin + 24, y + 1.5, margin + 70, y + 1.5);
      doc.setFont('helvetica', 'normal');
      doc.setFont('helvetica', 'bold');
      doc.text('Date: ' + memoDateStr, pageW - margin, y, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      y += 12;

      // ─── Table: header (#f5f5f5, bold, centered), 1.5px borders ───
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, y, col1W, 9, 'F');
      doc.rect(pageW - margin - amtColW, y, amtColW, 9, 'F');
      doc.setDrawColor(34, 34, 34);
      doc.setLineWidth(borderW);
      doc.rect(margin, y, col1W, 9);
      doc.rect(pageW - margin - amtColW, y, amtColW, 9);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('PARTICULARS', margin + col1W / 2, y + 6, { align: 'center' });
      doc.text('AMOUNT (INR)', pageW - margin - amtColW / 2, y + 6, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      y += 9;

      // Row 1: Professional Fee(s)
      doc.rect(margin, y, col1W, 32);
      doc.rect(pageW - margin - amtColW, y, amtColW, 32);
      const particulars = (memo.particulars || '____________').substring(0, 75);
      doc.setFontSize(10);
      doc.text('1. Professional Fee(s) toward ' + particulars, margin + 4, y + 6);
      doc.setFontSize(9);
      doc.setTextColor(68, 68, 68);
      doc.text('a) _______________________', margin + 6, y + 13);
      doc.text('b) _______________________', margin + 6, y + 19);
      doc.text('c) _______________________', margin + 6, y + 25);
      doc.setTextColor(0, 0, 0);
      doc.text(amountNum ? inr(amountNum) : '', pageW - margin - 3, y + 18, { align: 'right' });
      y += 32;

      // Row 2: Reimbursement
      doc.rect(margin, y, col1W, 26);
      doc.rect(pageW - margin - amtColW, y, amtColW, 26);
      doc.setFontSize(10);
      doc.text('2. Reimbursement of Statutory Fee(s) paid on the behalf of the Company:-', margin + 4, y + 5);
      doc.setFontSize(9);
      doc.setTextColor(68, 68, 68);
      doc.text('a) _______________________', margin + 6, y + 12);
      doc.text('b) _______________________', margin + 6, y + 18);
      doc.text('c) _______________________', margin + 6, y + 24);
      doc.setTextColor(0, 0, 0);
      y += 26;

      // Total row (bold, Total centered, Rs. amount right)
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, y, col1W, 11, 'F');
      doc.rect(pageW - margin - amtColW, y, amtColW, 11, 'F');
      doc.rect(margin, y, col1W, 11);
      doc.rect(pageW - margin - amtColW, y, amtColW, 11);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Total', margin + col1W / 2, y + 7.5, { align: 'center' });
      doc.text(amountNum ? 'Rs. ' + inr(amountNum) : '\u2014', pageW - margin - 3, y + 7.5, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      y += 16;

      // ─── Amount in words (italic + bold, amount underlined) ───
      doc.setFont('times', 'italic');
      doc.setFontSize(11);
      const words = amountNum ? amountToWords(amountNum) : '________';
      doc.text('(Rupees in words ', margin, y);
      const wordsX = margin + doc.getTextWidth('(Rupees in words ');
      doc.text(words + ' only)', wordsX, y);
      doc.setDrawColor(85, 85, 85);
      doc.setLineWidth(0.15);
      doc.line(wordsX, y + 1.2, wordsX + doc.getTextWidth(words), y + 1.2);
      doc.setFont('helvetica', 'normal');
      y += 14;

      // ─── Mode of Payment (bold heading; (a) Wire transfers underlined; (b) Phone Pay underlined; bold phone no) ───
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Mode of Payment:', margin, y);
      doc.setFont('helvetica', 'normal');
      y += 6;
      doc.setFontSize(9);
      doc.text('(a) ', margin, y);
      doc.text('Wire transfers', margin + 5, y);
      doc.setDrawColor(0, 0, 0);
      doc.line(margin + 5, y + 1, margin + 5 + doc.getTextWidth('Wire transfers'), y + 1);
      y += 5;
      doc.text('Remit the amount by wire transfer to the credit of Current Account No. 140161900002255', margin, y, { maxWidth: pageW - 2 * margin });
      y += 5;
      doc.text('RTGS/NEFT IFSC:YESB0001401] in the name of MANISH PATIDAR & Co. held with Yes Bank,', margin, y, { maxWidth: pageW - 2 * margin });
      y += 5;
      doc.text('Hoshangabad Road branch -462026 OR', margin, y);
      y += 7;
      doc.text('(b) ', margin, y);
      const phonePayW = doc.getTextWidth('Phone Pay');
      doc.text('Phone Pay', margin + 5, y);
      doc.line(margin + 5, y + 1, margin + 5 + phonePayW, y + 1);
      const transferW = doc.getTextWidth(' Transfer the amount to ');
      doc.text(' Transfer the amount to ', margin + 5 + phonePayW, y);
      doc.setFont('helvetica', 'bold');
      doc.text('Phone Pe no. 9999950459.', margin + 5 + phonePayW + transferW, y);
      doc.setFont('helvetica', 'normal');
      y += 14;

      // ─── Signatory (right-aligned, line then text) ───
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.line(pageW - margin - 40, y, pageW - margin, y);
      y += 6;
      doc.setFontSize(11);
      doc.text('Authorised Signatory', pageW - margin, y, { align: 'right' });

      doc.save('Memo-' + (memo.memoNo || 'fees') + '.pdf');
    } catch (err) {
      console.error('PDF download failed:', err);
      alert('Download failed. Please run npm install jspdf and try again.');
    } finally {
      setDownloading(false);
    }
  };

  const underlineVal = { borderBottom: '1px solid #555', display: 'inline-block', minWidth: 180 };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4" style={{ ...styles.pageBg, fontFamily: "'Times New Roman', Times, serif" }} onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div style={{ maxWidth: 780, margin: '0 auto 20px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={downloading}
            style={{
              background: '#c0612b', color: '#fff', border: 'none', borderRadius: 8,
              padding: '10px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            ⬇ {downloading ? 'Generating…' : 'Download / Print PDF'}
          </button>
          <a
            href={TEMPLATE_PDF_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8,
              padding: '10px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none',
            }}
          >
            👁 Open template PDF
          </a>
        </div>
        <button type="button" onClick={onClose} style={{ background: '#444', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 14, cursor: 'pointer' }} aria-label="Close">
          ✕ Close
        </button>
      </div>

      {/* Memo sheet – template UI */}
      <div style={{ ...styles.sheet, marginBottom: 32 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', ...styles.headerBorder }}>
          <div>
            <div style={styles.brandName}>Manish Patidar & Co.</div>
            <div style={styles.brandSub}>Company Secretaries</div>
          </div>
          <div style={styles.contact}>
            <div>✆ +91 9999950459</div>
            <div>✉ csmanishpatidar@gmail.com</div>
            <div>🌐 www.mpcorp.in</div>
          </div>
        </div>

        {/* Recipient */}
        <div style={{ marginBottom: 18, fontSize: 14, lineHeight: 2.2 }}>
          <div><strong>Name of Company</strong> <span style={underlineVal}>{memo.companyName || '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}</span></div>
          <div>Address <span style={underlineVal}>{'\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}</span></div>
          <div><strong>Kind Attention:</strong> Mr/Mrs/ <span style={underlineVal}>{memo.sentTo || '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}</span></div>
          <div><strong>Email:</strong> <span style={underlineVal}>{'\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}</span></div>
        </div>

        {/* Memo No + Date */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16, fontSize: 14 }}>
          <div>Memo No. <strong>{memo.memoNo || '_______________'}</strong></div>
          <div style={{ fontWeight: 700 }}>Date: {formatDate(memo.memoDate)}</div>
        </div>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
          <thead>
            <tr>
              <th style={{ ...styles.tableTh, textAlign: 'left', width: '72%' }}>PARTICULARS</th>
              <th style={{ ...styles.tableTh, textAlign: 'center' }}>AMOUNT (INR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ ...styles.tableTd, padding: '12px 12px 18px' }}>
                <div style={{ fontSize: 14 }}>1.&nbsp; Professional Fee(s) toward {memo.particulars || '____________'}</div>
                <div style={{ fontSize: 12, color: '#444', marginTop: 5, paddingLeft: 12 }}>a) _______________________</div>
                <div style={{ fontSize: 12, color: '#444', marginTop: 2, paddingLeft: 12 }}>b) _______________________</div>
                <div style={{ fontSize: 12, color: '#444', marginTop: 2, paddingLeft: 12 }}>c) _______________________</div>
              </td>
              <td style={{ ...styles.tableTd, textAlign: 'right', fontSize: 14 }}>{amountNum ? inr(amountNum) : ''}</td>
            </tr>
            <tr>
              <td style={{ ...styles.tableTd, padding: '12px 12px 18px' }}>
                <div style={{ fontSize: 14 }}>2.&nbsp; Reimbursement of Statutory Fee(s) paid on the behalf of the Company:-</div>
                <div style={{ fontSize: 12, color: '#444', marginTop: 5, paddingLeft: 12 }}>a) _______________________</div>
                <div style={{ fontSize: 12, color: '#444', marginTop: 2, paddingLeft: 12 }}>b) _______________________</div>
                <div style={{ fontSize: 12, color: '#444', marginTop: 2, paddingLeft: 12 }}>c) _______________________</div>
              </td>
              <td style={{ ...styles.tableTd, textAlign: 'right', fontSize: 14 }}></td>
            </tr>
            <tr style={{ fontWeight: 700 }}>
              <td style={{ ...styles.totalTd, textAlign: 'center' }}>Total</td>
              <td style={{ ...styles.totalTd, textAlign: 'right', color: '#1a3a5c' }}>{amountNum ? `₹ ${inr(amountNum)}` : '—'}</td>
            </tr>
          </tbody>
        </table>

        {/* Amount in words */}
        <div style={{ fontStyle: 'italic', fontWeight: 700, fontSize: 14, marginBottom: 18 }}>
          (Rupees in words{' '}
          <span style={{ borderBottom: '1px solid #555', paddingBottom: 1 }}>{amountNum ? amountToWords(amountNum) : '________'}</span>
          {' '}only)
        </div>

        {/* Mode of payment */}
        <div style={{ fontSize: 13, lineHeight: 1.95, marginBottom: 40 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Mode of Payment:</div>
          <div>
            <u>(a) Wire transfers</u>
            <br />
            Remit the amount by wire transfer to the credit of Current Account No. 140161900002255 RTGS/
            NEFT IFSC:YESB0001401] in the name of MANISH PATIDAR & Co. held with Yes Bank, Hoshangabad
            Road branch -462026 OR
          </div>
          <div style={{ marginTop: 6 }}>
            (b) <u>Phone Pay</u> Transfer the amount to <strong>Phone Pe no. 9999950459.</strong>
          </div>
        </div>

        {/* Signatory */}
        <div style={{ textAlign: 'right', fontSize: 14, marginTop: 24 }}>
          <div>________________</div>
          <div>Authorised Signatory</div>
        </div>

        {/* Meta footer */}
        <div style={{ marginTop: 28, paddingTop: 12, borderTop: '1px solid #ddd', fontSize: 11, color: '#666' }}>
          Sent by: {memo.sentBy?.name || '–'} · Follow up: {formatDate(memo.followUpDate)} · Payment: {formatDate(memo.paymentDate)} · Status: {memo.status}
        </div>
      </div>
    </div>
  );
}

export { TEMPLATE_PDF_URL };
