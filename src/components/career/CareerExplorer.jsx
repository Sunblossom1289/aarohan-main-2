import React, { useState, useMemo } from 'react';
import { CAREER_MAP_DATA } from './constants';
import CareerDetail from './CareerDetail';

const STYLES = `
  @keyframes ce-fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes ce-scaleIn {
    from { opacity: 0; transform: scale(0.96); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes ce-pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
  .ce-fade-up { animation: ce-fadeUp 0.5s ease-out both; }
  .ce-scale-in { animation: ce-scaleIn 0.4s ease-out both; }

  .ce-card {
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  }
  .ce-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 40px -12px rgba(0,0,0,0.12);
  }
  .ce-btn {
    transition: all 0.2s ease;
  }
  .ce-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  .ce-cluster-card .ce-overlay {
    transition: opacity 0.4s ease;
  }
  .ce-cluster-card:hover .ce-overlay {
    opacity: 0.75;
  }
  .ce-cluster-card:hover .ce-arrow {
    transform: translateX(4px);
  }
  .ce-arrow {
    transition: transform 0.2s ease;
  }
  .ce-role-row {
    transition: all 0.2s ease;
  }
  .ce-role-row:hover {
    background: #f8fafc;
    border-color: #c7d2fe;
  }
  .ce-role-row:hover .ce-role-arrow {
    opacity: 1;
    transform: translateX(0);
  }
`;

const Breadcrumb = ({ items }) => (
  <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
    {items.map((item, i) => (
      <React.Fragment key={i}>
        {i > 0 && <span style={{ color: '#cbd5e1', fontSize: '12px' }}>/</span>}
        {item.onClick ? (
          <button
            onClick={item.onClick}
            className="ce-btn"
            style={{
              fontSize: '13px', fontWeight: 600, color: '#6366f1',
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0',
            }}
          >
            {item.label}
          </button>
        ) : (
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </nav>
);

const BackButton = ({ onClick, label = 'Back' }) => (
  <button
    onClick={onClick}
    className="ce-btn"
    style={{
      display: 'inline-flex', alignItems: 'center', gap: '8px',
      padding: '10px 20px', background: 'white', border: '1px solid #e2e8f0',
      borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#475569',
      cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}
  >
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    {label}
  </button>
);

const CareerExplorer = ({ onNavigate }) => {
  const [view, setView] = useState('home');
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [selectedBucket, setSelectedBucket] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  const totalRoles = useMemo(() =>
    CAREER_MAP_DATA.clusters.reduce((sum, c) => sum + c.buckets.reduce((s, b) => s + b.roles.length, 0), 0),
  []);

  // --- 1. Home / Landing ---
  if (view === 'home') {
    return (
      <main role="main" style={{
        position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px',
        background: '#0f172a', overflow: 'hidden', color: 'white',
      }}>
        <style>{STYLES}</style>

        {/* Background */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <img
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }}
            alt=""
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0.5) 0%, rgba(15,23,42,0.85) 70%, #0f172a 100%)' }} />
        </div>

        <div className="ce-fade-up" style={{ position: 'relative', zIndex: 10, maxWidth: '720px' }}>
          <span style={{
            display: 'inline-block', fontSize: '12px', fontWeight: 700, letterSpacing: '0.2em',
            color: '#a5b4fc', textTransform: 'uppercase', marginBottom: '24px',
            background: 'rgba(99,102,241,0.15)', padding: '8px 20px', borderRadius: '8px',
          }}>
            Career Encyclopedia
          </span>

          <h1 style={{ fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', fontWeight: 800, lineHeight: 1.08, margin: '0 0 24px 0', letterSpacing: '-0.02em', color: 'white' }}>
            Discover Your{' '}
            <span style={{
              background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Future Career
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#94a3b8', lineHeight: 1.7, margin: '0 0 40px 0', maxWidth: '520px', marginLeft: 'auto', marginRight: 'auto' }}>
            Explore {CAREER_MAP_DATA.clusters.length} industries and {totalRoles}+ career paths. 
            Find the role that matches your strengths and ambitions.
          </p>

          <button
            onClick={() => setView('map')}
            className="ce-btn"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '16px 40px', background: '#6366f1', color: 'white',
              borderRadius: '14px', fontSize: '16px', fontWeight: 700,
              border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 24px rgba(99,102,241,0.4)',
            }}
          >
            Start Exploring
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          {/* Stats row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', marginTop: '56px', flexWrap: 'wrap' }}>
            {[
              { value: `${CAREER_MAP_DATA.clusters.length}`, label: 'Industries' },
              { value: `${totalRoles}+`, label: 'Career Roles' },
              { value: '4', label: 'Archetypes' },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>{stat.value}</div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '28px', animation: 'ce-pulse 2s ease-in-out infinite' }}>
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </main>
    );
  }

  // --- 2. Cluster Grid (World Map) ---
  if (view === 'map') {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <style>{STYLES}</style>

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px 80px' }}>
          {/* Header */}
          <header style={{ marginBottom: '48px' }}>
            <div style={{ marginBottom: '32px' }}>
              <BackButton onClick={() => onNavigate && onNavigate('/')} label="Home" />
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
              Explore Industries
            </h2>
            <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '540px', lineHeight: 1.6, margin: 0 }}>
              {CAREER_MAP_DATA.clusters.length} industries with {totalRoles}+ career paths across technology, engineering, finance, healthcare, and more.
            </p>
          </header>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {CAREER_MAP_DATA.clusters.map((cluster, index) => {
              const roleCount = cluster.buckets.reduce((s, b) => s + b.roles.length, 0);
              return (
                <div
                  key={cluster.id}
                  className="ce-cluster-card ce-card ce-fade-up"
                  onClick={() => { setSelectedCluster(cluster); setView('cluster'); }}
                  style={{
                    position: 'relative', height: '340px', borderRadius: '20px', overflow: 'hidden',
                    cursor: 'pointer', backgroundColor: '#1e293b',
                    boxShadow: '0 4px 20px -4px rgba(0,0,0,0.12)',
                    animationDelay: `${index * 0.07}s`,
                  }}
                >
                  <img
                    src={cluster.themeImage} alt={cluster.name}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div className="ce-overlay" style={{
                    position: 'absolute', inset: 0, opacity: 0.65,
                    background: 'linear-gradient(180deg, transparent 0%, rgba(15,23,42,0.4) 40%, rgba(15,23,42,0.92) 100%)',
                  }} />

                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px', color: 'white' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>{cluster.icon}</div>
                    <h3 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px 0', color: 'white' }}>{cluster.name}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                      {cluster.description}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                          {cluster.buckets.length} specializations
                        </span>
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                          {roleCount} roles
                        </span>
                      </div>
                      <span className="ce-arrow" style={{ fontSize: '18px', color: 'rgba(255,255,255,0.6)' }}>→</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- 3. Cluster Detail (Specializations) ---
  if (view === 'cluster' && selectedCluster) {
    const roleCount = selectedCluster.buckets.reduce((s, b) => s + b.roles.length, 0);

    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <style>{STYLES}</style>

        {/* Compact hero */}
        <div style={{ position: 'relative', height: '280px', overflow: 'hidden', backgroundColor: '#0f172a' }}>
          <img
            src={selectedCluster.themeImage} alt="" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }}
            onError={(e) => { e.target.style.opacity = '0'; }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0.4) 0%, rgba(15,23,42,0.85) 100%)' }} />

          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%', left: 0, right: 0 }}>
            <div style={{ position: 'absolute', top: '24px', left: '32px' }}>
              <BackButton onClick={() => setView('map')} label="All Industries" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
              <span style={{ fontSize: '40px' }}>{selectedCluster.icon}</span>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.01em' }}>
                {selectedCluster.name}
              </h2>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: 500, margin: 0 }}>
              {selectedCluster.buckets.length} specializations · {roleCount} career roles
            </p>
          </div>
        </div>

        {/* Specialization cards */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px 80px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: '0 0 8px 0' }}>
            Choose a Specialization
          </h3>
          <p style={{ color: '#64748b', fontSize: '15px', margin: '0 0 32px 0', lineHeight: 1.6 }}>
            Each area groups related career roles. Pick one to see specific positions.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {selectedCluster.buckets.map((bucket, index) => (
              <div
                key={bucket.id}
                className="ce-card ce-fade-up"
                onClick={() => { setSelectedBucket(bucket); setView('bucket'); }}
                style={{
                  background: 'white', border: '1px solid #e5e7eb', padding: '28px', borderRadius: '16px',
                  cursor: 'pointer', animationDelay: `${index * 0.07}s`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                    {bucket.name}
                  </h4>
                  <span style={{
                    fontSize: '12px', fontWeight: 700, color: '#6366f1', background: '#eef2ff',
                    padding: '4px 10px', borderRadius: '6px',
                  }}>
                    {bucket.roles.length} {bucket.roles.length === 1 ? 'role' : 'roles'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                  {bucket.roles.slice(0, 4).map(r => (
                    <span key={r.id} style={{
                      fontSize: '12px', background: '#f9fafb', border: '1px solid #f3f4f6',
                      padding: '5px 10px', borderRadius: '6px', color: '#4b5563', fontWeight: 500,
                    }}>
                      {r.title}
                    </span>
                  ))}
                  {bucket.roles.length > 4 && (
                    <span style={{ fontSize: '12px', padding: '5px 4px', color: '#9ca3af', fontWeight: 500 }}>
                      +{bucket.roles.length - 4} more
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6366f1', fontWeight: 600, fontSize: '13px' }}>
                  View roles <span className="ce-arrow" style={{ fontSize: '14px' }}>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- 4. Bucket Detail (Roles List) ---
  if (view === 'bucket' && selectedBucket) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <style>{STYLES}</style>

        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px 80px' }}>
          {/* Breadcrumb + Back */}
          <div style={{ marginBottom: '12px' }}>
            <BackButton onClick={() => setView('cluster')} label="Back" />
          </div>

          <Breadcrumb items={[
            { label: 'Industries', onClick: () => setView('map') },
            { label: selectedCluster?.name, onClick: () => setView('cluster') },
            { label: selectedBucket.name },
          ]} />

          <header style={{ marginTop: '24px', marginBottom: '40px', paddingBottom: '32px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '24px' }}>{selectedCluster?.icon}</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>{selectedCluster?.name}</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              {selectedBucket.name}
            </h2>
            <p style={{ color: '#6b7280', fontSize: '15px', margin: '8px 0 0 0' }}>
              {selectedBucket.roles.length} career {selectedBucket.roles.length === 1 ? 'role' : 'roles'} in this specialization
            </p>
          </header>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {selectedBucket.roles.map((role, index) => (
              <div
                key={role.id}
                className="ce-role-row ce-fade-up"
                onClick={() => { setSelectedRole(role); setView('role'); }}
                style={{
                  background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb',
                  padding: '24px 28px', cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  animationDelay: `${index * 0.06}s`,
                  display: 'flex', flexDirection: 'column', gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 6px 0' }}>{role.title}</h4>
                    <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{role.description}</p>
                  </div>
                  <span className="ce-role-arrow" style={{
                    opacity: 0, transform: 'translateX(-4px)', transition: 'all 0.2s ease',
                    fontSize: '20px', color: '#6366f1', flexShrink: 0, marginTop: '2px',
                  }}>→</span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: '#eef2ff', padding: '6px 12px', borderRadius: '8px',
                  }}>
                    <span style={{ fontSize: '12px', color: '#4338ca', fontWeight: 600 }}>Entry:</span>
                    <span style={{ fontSize: '13px', color: '#3730a3', fontWeight: 700 }}>{role.startingSalary}</span>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: '#fefce8', padding: '6px 12px', borderRadius: '8px',
                  }}>
                    <span style={{ fontSize: '12px', color: '#a16207', fontWeight: 600 }}>Senior:</span>
                    <span style={{ fontSize: '13px', color: '#92400e', fontWeight: 700 }}>{role.seniorSalary}</span>
                  </div>
                  {role.skills?.slice(0, 3).map(skill => (
                    <span key={skill} style={{
                      fontSize: '12px', color: '#4b5563', background: '#f3f4f6',
                      padding: '5px 10px', borderRadius: '6px', fontWeight: 500,
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- 5. Role Detail ---
  if (view === 'role' && selectedRole) {
    return <CareerDetail career={selectedRole} onBack={() => setView('bucket')} />;
  }

  return null;
};

export default CareerExplorer;