'use client';

import { useState } from 'react';
import type { AuthCase } from '../types';
import { useStore } from '../store/useStore';

interface Props {
  caseData: AuthCase;
}

export default function DocumentViewer({ caseData }: Props) {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(caseData.documents[0]?.id ?? null);
  const [uploadMode, setUploadMode] = useState(false);
  const [uploadContent, setUploadContent] = useState('');
  const [uploadTitle, setUploadTitle] = useState('Troponin I Lab Report');
  const { uploadDocument } = useStore();

  const selectedDoc = caseData.documents.find(d => d.id === selectedDocId);

  // Highlight evidence spans in the document
  const getHighlightedContent = (doc: typeof selectedDoc) => {
    if (!doc) return '';
    const facts = caseData.extractedFacts.filter(f => f.evidence.docId === doc.id);
    if (facts.length === 0) return doc.content;

    let content = doc.content;
    // Simple evidence highlighting - wrap found snippets
    facts.forEach(fact => {
      const snippet = fact.evidence.snippet;
      if (snippet && content.includes(snippet)) {
        const colorMap = { high: '#3b82f6', medium: '#f59e0b', low: '#ef4444' };
        const color = colorMap[fact.confidence];
        content = content.replace(
          snippet,
          `<mark style="background:${color}22;border-bottom:2px solid ${color};border-radius:2px;padding:0 2px;cursor:pointer" title="${fact.field}: ${fact.value}">${snippet}</mark>`
        );
      }
    });
    return content;
  };

  const handleUpload = () => {
    const content = uploadContent || `MERIDIAN PATHOLOGY LABORATORY
Test Report – ${uploadTitle}
Date: ${new Date().toLocaleDateString('en-IN')}
Patient: [REDACTED]

TEST: High-Sensitivity Troponin I (hs-TnI)
Result: 2.4 ng/mL
Reference Range: < 0.04 ng/mL
Status: ⚠️ CRITICALLY ELEVATED (60× upper limit of normal)

INTERPRETATION: Markedly elevated hs-TnI confirms NSTEMI. Inpatient CCU management and urgent angiography are medically necessary.

Laboratory Director: Dr. Priya Bose, MD Pathology`;

    uploadDocument(caseData.id, uploadTitle, content, 'lab_report');
    setUploadMode(false);
    setUploadContent('');
  };

  const docTypeIcons: Record<string, string> = {
    admission_note: '📋', discharge_summary: '📄', lab_report: '🧪',
    imaging: '🔬', prescription: '💊', policy_card: '🪪',
    id_proof: '🪪', referral: '↗️', consent: '✍️', handwritten_note: '✏️',
  };

  return (
    <div>
      {/* Document list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
        {caseData.documents.map(doc => (
          <button
            key={doc.id}
            onClick={() => setSelectedDocId(doc.id)}
            style={{
              background: selectedDocId === doc.id ? 'rgba(59,130,246,0.15)' : 'var(--bg-surface)',
              border: `1px solid ${selectedDocId === doc.id ? 'rgba(59,130,246,0.4)' : 'var(--border-subtle)'}`,
              borderRadius: 6,
              padding: '6px 10px',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 14 }}>{docTypeIcons[doc.type] || '📄'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: selectedDocId === doc.id ? '#60a5fa' : 'var(--text-secondary)', lineHeight: 1.3 }}>
                {doc.title}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                {new Date(doc.uploadedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                {doc.isImage && ' · 📸 Image'}
              </div>
            </div>
            {/* Evidence count badge */}
            {(() => {
              const count = caseData.extractedFacts.filter(f => f.evidence.docId === doc.id).length;
              return count > 0 ? (
                <span style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                  {count}
                </span>
              ) : null;
            })()}
          </button>
        ))}

        {/* Upload new document */}
        {!uploadMode ? (
          <button
            onClick={() => setUploadMode(true)}
            style={{
              background: 'transparent',
              border: '1px dashed var(--border)',
              borderRadius: 6,
              padding: '6px 10px',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: 11,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            + Upload Document
            {caseData.id === 'CASE-003' && (
              <span style={{ color: '#f59e0b', fontSize: 10 }}>← Troponin report here</span>
            )}
          </button>
        ) : (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
            <input
              value={uploadTitle}
              onChange={e => setUploadTitle(e.target.value)}
              style={{ width: '100%', marginBottom: 6, fontSize: 11 }}
              placeholder="Document title"
            />
            <textarea
              value={uploadContent}
              onChange={e => setUploadContent(e.target.value)}
              style={{ width: '100%', height: 60, fontSize: 10, resize: 'none', marginBottom: 6 }}
              placeholder="Paste document content (or leave blank for synthetic troponin report)"
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn-primary" style={{ fontSize: 11, padding: '4px 10px' }} onClick={handleUpload}>Upload</button>
              <button className="btn-secondary" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => setUploadMode(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Document content viewer */}
      {selectedDoc && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
            {docTypeIcons[selectedDoc.type]} {selectedDoc.type.replace(/_/g, ' ').toUpperCase()}
            {selectedDoc.isImage && <span style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', borderRadius: 4, padding: '1px 5px', fontSize: 9 }}>MULTIMODAL</span>}
          </div>

          {selectedDoc.isImage ? (
            <div style={{ background: 'linear-gradient(135deg, #1a2236, #0d1117)', borderRadius: 8, padding: 16, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#79c0ff', whiteSpace: 'pre-wrap', border: '1px dashed #2d5080' }}>
              📷 Scanned Handwritten Note (Multimodal)
              <br /><br />
              {selectedDoc.content}
            </div>
          ) : (
            <div
              style={{ fontSize: 11, lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', maxHeight: 300, overflowY: 'auto' }}
              dangerouslySetInnerHTML={{ __html: getHighlightedContent(selectedDoc) }}
            />
          )}

          {/* Extracted facts from this document */}
          {(() => {
            const facts = caseData.extractedFacts.filter(f => f.evidence.docId === selectedDoc.id);
            if (facts.length === 0) return null;
            return (
              <div style={{ marginTop: 10, borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>EXTRACTED FACTS</div>
                {facts.map((fact, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3,
                      background: fact.confidence === 'high' ? 'rgba(16,185,129,0.15)' : fact.confidence === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                      color: fact.confidence === 'high' ? '#10b981' : fact.confidence === 'medium' ? '#f59e0b' : '#ef4444',
                      flexShrink: 0,
                    }}>
                      {fact.confidence.toUpperCase()}
                    </span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{fact.field}: </span>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{fact.value}</span>
                      {fact.needsDeskConfirmation && (
                        <span style={{ marginLeft: 6, fontSize: 9, color: '#f59e0b', fontWeight: 700 }}>⚠️ CONFIRM</span>
                      )}
                      {fact.code && <span style={{ fontSize: 10, color: '#60a5fa', marginLeft: 6 }}>{fact.code}</span>}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
