'use client';

import React, { useState } from 'react';
import type { AuthCase, RuleResult, RuleStatus } from '../types';

interface Props {
  caseData: AuthCase;
}

export default function RulesPanel({ caseData }: Props) {
  const [filter, setFilter] = useState<'all' | RuleStatus>('all');
  const [expandedRule, setExpandedRule] = useState<string | null>(null);

  const rules = caseData.ruleResults || [];
  const filteredRules = filter === 'all' ? rules : rules.filter(r => r.status === filter);

  const passCount = rules.filter(r => r.status === 'pass').length;
  const warnCount = rules.filter(r => r.status === 'warn').length;
  const failCount = rules.filter(r => r.status === 'fail').length;

  const riskBadgeColors = {
    low: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', text: '#34d399', label: 'LOW RISK' },
    medium: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#fbbf24', label: 'MEDIUM RISK' },
    high: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#f87171', label: 'HIGH RISK' },
  }[caseData.riskLevel || 'low'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header & Risk Gauge */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 10,
        padding: '14px 16px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🛡️</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Rules & Risk Assessment</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Deterministic engine · Policy & IRDAI compliance</div>
            </div>
          </div>
          <div style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.06em',
            padding: '3px 8px',
            borderRadius: 6,
            background: riskBadgeColors.bg,
            border: `1px solid ${riskBadgeColors.border}`,
            color: riskBadgeColors.text,
          }}>
            {riskBadgeColors.label}
          </div>
        </div>

        {/* Quick summary metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 12 }}>
          <div style={{ background: 'rgba(16,185,129,0.06)', borderRadius: 6, padding: '6px 8px', textAlign: 'center', border: '1px solid rgba(16,185,129,0.15)' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>{passCount}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Passed</div>
          </div>
          <div style={{ background: 'rgba(245,158,11,0.06)', borderRadius: 6, padding: '6px 8px', textAlign: 'center', border: '1px solid rgba(245,158,11,0.15)' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b' }}>{warnCount}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Warnings</div>
          </div>
          <div style={{ background: 'rgba(239,68,68,0.06)', borderRadius: 6, padding: '6px 8px', textAlign: 'center', border: '1px solid rgba(239,68,68,0.15)' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#ef4444' }}>{failCount}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Blockers</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 6, padding: '2px', background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
        {[
          { key: 'all', label: `All (${rules.length})` },
          { key: 'fail', label: `Fail (${failCount})` },
          { key: 'warn', label: `Warn (${warnCount})` },
          { key: 'pass', label: `Pass (${passCount})` },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key as typeof filter)}
            style={{
              flex: 1,
              padding: '5px 0',
              fontSize: 11,
              fontWeight: 600,
              borderRadius: 6,
              background: filter === item.key ? 'rgba(59,130,246,0.2)' : 'transparent',
              color: filter === item.key ? '#60a5fa' : 'var(--text-muted)',
              border: filter === item.key ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Rules list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filteredRules.map(rule => {
          const isExpanded = expandedRule === rule.ruleId;
          const statusColors: Record<RuleStatus, { icon: string; text: string; bg: string; border: string }> = {
            pass: { icon: '✓', text: '#10b981', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.2)' },
            warn: { icon: '⚠️', text: '#f59e0b', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)' },
            fail: { icon: '✕', text: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)' },
            info: { icon: 'ℹ', text: '#60a5fa', bg: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.2)' },
          };
          const style = statusColors[rule.status] || statusColors.info;

          return (
            <div
              key={rule.ruleId}
              style={{
                background: style.bg,
                border: `1px solid ${style.border}`,
                borderRadius: 8,
                padding: '10px 12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onClick={() => setExpandedRule(isExpanded ? null : rule.ruleId)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 700,
                    color: style.text,
                    background: 'rgba(0,0,0,0.25)',
                  }}>
                    {style.icon}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>
                    [{rule.ruleId}] {rule.name}
                  </span>
                </div>
                {rule.amountImpact !== undefined && rule.amountImpact !== 0 && (
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: 'JetBrains Mono, monospace',
                    color: rule.amountImpact < 0 ? '#ef4444' : '#10b981',
                    background: 'rgba(0,0,0,0.3)',
                    padding: '2px 6px',
                    borderRadius: 4,
                  }}>
                    {rule.amountImpact < 0 ? `-₹${Math.abs(rule.amountImpact).toLocaleString('en-IN')}` : `+₹${rule.amountImpact.toLocaleString('en-IN')}`}
                  </span>
                )}
              </div>

              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>
                {rule.message}
              </div>

              {/* Citation badge / expand detail */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: '#38bdf8' }}>§ Citation:</span> {rule.citation.type} — {rule.citation.ref}
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {isExpanded ? '▲ less' : '▼ more'}
                </span>
              </div>

              {isExpanded && (
                <div style={{
                  marginTop: 8,
                  padding: '8px 10px',
                  background: 'rgba(0,0,0,0.35)',
                  borderRadius: 6,
                  fontSize: 11,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  borderLeft: `2px solid ${style.text}`,
                }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Regulatory / Clause Detail:</div>
                  <div><strong>Reference:</strong> {rule.citation.ref} ({rule.citation.type})</div>
                  <div style={{ marginTop: 4 }}>
                    <strong>Engine Action:</strong> {
                      rule.status === 'fail'
                        ? 'Requires desk notification and immediate financial counseling. Clinical care cannot be delayed.'
                        : rule.status === 'warn'
                        ? 'Flagged for reviewer sign-off prior to pre-auth submission.'
                        : 'Rule passed. Verified against patient policy & clinical evidence.'
                    }
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Financial Impact Breakdown if available */}
      {caseData.estimate && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 8,
          padding: '12px 14px',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>💰</span> Estimated Financial Breakdown
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Total Estimated Bill:</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)', fontWeight: 600 }}>
                ₹{caseData.estimate.totalBilled.toLocaleString('en-IN')}
              </span>
            </div>
            {caseData.estimate.breakdown && caseData.estimate.breakdown.map((b, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: b.payable < b.billed ? '#f59e0b' : 'var(--text-secondary)' }}>
                <span>{b.label}:</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  ₹{b.payable.toLocaleString('en-IN')} {b.payable < b.billed && `(billed ₹${b.billed.toLocaleString('en-IN')})`}
                </span>
              </div>
            ))}
            <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span style={{ color: '#10b981' }}>Est. Insurer Payable:</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#10b981' }}>
                ₹{(caseData.estimate.insurerApproved ?? caseData.estimate.totalPayable).toLocaleString('en-IN')}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span style={{ color: '#ef4444' }}>Est. Patient Liability:</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#ef4444' }}>
                ₹{(caseData.estimate.patientPayable ?? caseData.estimate.patientLiability).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
