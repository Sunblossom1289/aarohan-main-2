import React, { useState, useEffect } from 'react';
import { CAREER_MAP_DATA } from './constants';

const DETAIL_STYLES = `
  @keyframes cd-fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  .cd-fade-up { animation: cd-fadeUp 0.45s ease-out both; }
  .cd-btn { transition: all 0.2s ease; }
  .cd-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
  .cd-archetype { transition: all 0.25s ease; }
  .cd-archetype:hover { transform: translateY(-2px); }
  .cd-input:focus { outline: none; border-color: #818cf8; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
`;

const ArchetypeSelector = ({ suitability, onSelect, selectedId }) => (
  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
    {suitability.map((item) => {
      const archetype = CAREER_MAP_DATA.archetypes.find(a => a.id === item.archetypeId);
      if (!archetype) return null;
      const isSelected = selectedId === archetype.id;
      const matchPct = Math.round(item.relevance * 100);

      return (
        <button
          key={item.archetypeId}
          className="cd-archetype"
          onClick={() => onSelect(archetype)}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 20px', borderRadius: '12px', cursor: 'pointer',
            background: isSelected ? '#eef2ff' : 'white',
            border: isSelected ? '2px solid #6366f1' : '1px solid #e5e7eb',
            boxShadow: isSelected ? '0 4px 12px rgba(99,102,241,0.12)' : '0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          <span style={{ fontSize: '24px' }}>{archetype.icon}</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: isSelected ? '#4338ca' : '#1e293b' }}>
              {archetype.name}
            </div>
            <div style={{ fontSize: '12px', color: isSelected ? '#6366f1' : '#9ca3af', fontWeight: 600 }}>
              {matchPct}% match
            </div>
          </div>
        </button>
      );
    })}
  </div>
);

const CareerDetail = ({ career, onBack }) => {
  const suitability = career.suitability || [];
  const initialChar = suitability.length > 0
    ? CAREER_MAP_DATA.archetypes.find(c => c.id === suitability[0].archetypeId)
    : { id: 'unknown', name: 'Explorer', strength: 'Curiosity', icon: '🧭' };

  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [selectedChar, setSelectedChar] = useState(initialChar);

  useEffect(() => {
    if (selectedChar) fetchInsight(selectedChar.name);
  }, [career.id, selectedChar]);

  const fetchInsight = async (charName) => {
    setLoading(true);
    setTimeout(() => {
      setInsight(`As a ${charName}, you possess natural talents that align perfectly with ${career.title}. Your ${selectedChar?.strength?.toLowerCase() || 'skills'} will be your greatest asset in this field. Success comes from combining your innate abilities with dedicated skill development.`);
      setLoading(false);
    }, 800);
  };

  const handleAsk = async () => {
    if (!chatQuestion) return;
    setLoading(true);
    setTimeout(() => {
      setChatResponse(`Great question about ${career.title}! This career requires dedication and continuous learning. Focus on building strong fundamentals in ${career.skills?.[0] || 'core skills'} and ${career.skills?.[1] || 'technologies'}. Network with professionals and work on real projects to gain experience.`);
      setLoading(false);
    }, 800);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 110, overflowY: 'auto', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style>{DETAIL_STYLES}</style>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e5e7eb', padding: '16px 24px',
        display: 'flex', alignItems: 'center', gap: '16px',
      }}>
        <button
          onClick={onBack}
          className="cd-btn"
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', background: '#f9fafb', border: '1px solid #e5e7eb',
            borderRadius: '10px', fontSize: '14px', fontWeight: 600,
            color: '#475569', cursor: 'pointer',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </button>
        <div style={{ height: '20px', width: '1px', background: '#e5e7eb' }} />
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>{career.title}</h2>
      </header>

      <main className="cd-fade-up" style={{ maxWidth: '880px', margin: '0 auto', padding: '32px 24px 120px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* Overview card */}
        <section style={{
          background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb',
          padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <p style={{ fontSize: '20px', fontWeight: 600, color: '#1e293b', lineHeight: 1.5, margin: '0 0 28px 0' }}>
            {career.description}
          </p>

          {/* Salary */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
            <div style={{
              flex: 1, minWidth: '200px', background: '#eef2ff', border: '1px solid #e0e7ff',
              borderRadius: '12px', padding: '20px',
            }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Entry-Level Salary</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#3730a3' }}>{career.startingSalary}</div>
            </div>
            <div style={{
              flex: 1, minWidth: '200px', background: '#fffbeb', border: '1px solid #fef3c7',
              borderRadius: '12px', padding: '20px',
            }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#a16207', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Senior Level (10yr)</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#92400e' }}>{career.seniorSalary}</div>
            </div>
          </div>

          {/* Skills + Education grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {/* Skills */}
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '24px', border: '1px solid #f1f5f9' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 16px 0' }}>
                Key Skills
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {career.skills?.map(skill => (
                  <span key={skill} style={{
                    background: 'white', padding: '6px 14px', borderRadius: '8px',
                    fontSize: '13px', fontWeight: 600, color: '#4338ca',
                    border: '1px solid #e0e7ff',
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Education */}
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '24px', border: '1px solid #f1f5f9' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 16px 0' }}>
                Education Path
              </h4>
              <p style={{ fontSize: '15px', color: '#374151', fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
                {career.educationPath}
              </p>
            </div>
          </div>
        </section>

        {/* Archetype Compatibility */}
        {suitability.length > 0 && (
          <section style={{
            background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb',
            padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>
              Personality Fit
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px 0', lineHeight: 1.5 }}>
              Select an archetype to see how your personality type maps to this role.
            </p>

            <ArchetypeSelector
              suitability={suitability}
              onSelect={(char) => setSelectedChar(char)}
              selectedId={selectedChar?.id}
            />

            {/* Insight */}
            <div style={{
              marginTop: '24px', padding: '24px', borderRadius: '12px',
              background: '#f5f3ff', border: '1px solid #ede9fe',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px' }}>{selectedChar?.icon}</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#5b21b6' }}>{selectedChar?.name}</span>
                <span style={{ fontSize: '12px', color: '#7c3aed', fontWeight: 500 }}>— {selectedChar?.strength}</span>
              </div>
              <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
                {loading ? 'Generating insight...' : (insight || 'Select an archetype above to see your personalized insight.')}
              </p>
            </div>
          </section>
        )}

        {/* Ask about this career */}
        <section style={{
          background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb',
          padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>
            Ask About This Career
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 20px 0' }}>
            Have a specific question? Ask and get guidance.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={chatQuestion}
              onChange={(e) => setChatQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              placeholder={`e.g., What's a typical day like as a ${career.title}?`}
              className="cd-input"
              style={{
                flex: 1, minWidth: '260px', background: '#f9fafb',
                border: '1px solid #e5e7eb', borderRadius: '12px',
                padding: '14px 20px', fontSize: '15px', color: '#1e293b',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            />
            <button
              onClick={handleAsk}
              disabled={loading || !chatQuestion}
              className="cd-btn"
              style={{
                background: '#6366f1', color: 'white', borderRadius: '12px',
                padding: '14px 28px', fontWeight: 700, fontSize: '14px',
                border: 'none', cursor: 'pointer',
                opacity: (loading || !chatQuestion) ? 0.5 : 1,
              }}
            >
              {loading ? 'Thinking...' : 'Ask'}
            </button>
          </div>

          {chatResponse && (
            <div className="cd-fade-up" style={{
              marginTop: '20px', padding: '20px', borderRadius: '12px',
              background: '#f9fafb', border: '1px solid #f3f4f6',
            }}>
              <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.7, margin: 0 }}>
                {chatResponse}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default CareerDetail;