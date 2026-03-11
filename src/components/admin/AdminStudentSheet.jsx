import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { API_BASE_URL } from '../../utils/config';

const AUTO_REFRESH_INTERVAL = 15000;

// ── Reusable Query Toolbar ──
function QueryToolbar({ headers, columnFilters, setColumnFilters, globalSearch, setGlobalSearch, quickFilters, activeQuickFilters, toggleQuickFilter, clearAll, resultCount, totalCount, lastUpdated, onRefresh, onExport, hiddenCols, toggleCol }) {
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const activeFilterCount = Object.values(columnFilters).filter(v => v).length + activeQuickFilters.length + (globalSearch ? 1 : 0);

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '13px' }}></i>
            <input type="text" placeholder="Search all columns..." value={globalSearch} onChange={e => setGlobalSearch(e.target.value)}
              style={{ padding: '8px 12px 8px 32px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', width: '240px', background: '#fff' }} />
            {globalSearch && <button onClick={() => setGlobalSearch('')} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '14px' }}>✕</button>}
          </div>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowColumnPicker(!showColumnPicker)} style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fas fa-columns"></i> Columns
            </button>
            {showColumnPicker && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowColumnPicker(false)} />
                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: '8px 0', zIndex: 100, minWidth: '200px', maxHeight: '320px', overflowY: 'auto' }}>
                  {headers.map((h, i) => (
                    <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '13px', color: '#334155' }}>
                      <input type="checkbox" checked={!hiddenCols.has(i)} onChange={() => toggleCol(i)} style={{ accentColor: '#2563eb' }} />
                      {h}
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
          <button onClick={onExport} style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="fas fa-download"></i> Export CSV
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            <strong style={{ color: '#1e293b' }}>{resultCount}</strong> of {totalCount}
            {lastUpdated && <span style={{ marginLeft: '8px', fontSize: '11px' }}>• {lastUpdated.toLocaleTimeString()}</span>}
          </span>
          <button className="btn btn-primary" onClick={onRefresh} style={{ padding: '7px 14px', fontSize: '13px' }} title="Refresh now">🔄</button>
        </div>
      </div>

      {quickFilters.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {quickFilters.map((qf, i) => {
            const isActive = activeQuickFilters.includes(qf.id);
            return (
              <button key={i} onClick={() => toggleQuickFilter(qf.id)}
                style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: '1px solid', transition: 'all 0.15s',
                  background: isActive ? qf.color + '18' : '#fff', color: isActive ? qf.color : '#64748b', borderColor: isActive ? qf.color : '#e2e8f0' }}>
                {qf.icon} {qf.label}
              </button>
            );
          })}
        </div>
      )}

      {activeFilterCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600 }}>
            <i className="fas fa-filter" style={{ marginRight: '4px' }}></i>
            {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
          </span>
          <button onClick={clearAll} style={{ fontSize: '12px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Clear all</button>
        </div>
      )}
    </div>
  );
}

// ── Column filter row under headers ──
function ColumnFilterRow({ headers, columnFilters, setColumnFilters, rows, hiddenCols }) {
  const uniqueVals = useMemo(() => {
    const map = {};
    headers.forEach((_, i) => {
      if (hiddenCols.has(i)) return;
      const vals = new Set();
      rows.forEach(row => { const v = (row[i] || '').trim(); if (v) vals.add(v); });
      map[i] = [...vals].sort();
    });
    return map;
  }, [headers, rows, hiddenCols]);

  return (
    <tr>
      <th style={thFilterStyle}></th>
      {headers.map((_, i) => {
        if (hiddenCols.has(i)) return null;
        const vals = uniqueVals[i] || [];
        const isDropdown = vals.length > 0 && vals.length <= 25;
        return (
          <th key={i} style={thFilterStyle}>
            {isDropdown ? (
              <select value={columnFilters[i] || ''} onChange={e => setColumnFilters(prev => ({ ...prev, [i]: e.target.value }))}
                style={{ width: '100%', padding: '4px 6px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '11px', background: columnFilters[i] ? '#eff6ff' : '#fff', color: '#334155', cursor: 'pointer' }}>
                <option value="">All</option>
                {vals.map(v => <option key={v} value={v}>{v.length > 28 ? v.slice(0, 28) + '…' : v}</option>)}
              </select>
            ) : (
              <input type="text" placeholder="Filter..." value={columnFilters[i] || ''} onChange={e => setColumnFilters(prev => ({ ...prev, [i]: e.target.value }))}
                style={{ width: '100%', padding: '4px 6px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '11px', background: columnFilters[i] ? '#eff6ff' : '#fff', color: '#334155' }} />
            )}
          </th>
        );
      })}
    </tr>
  );
}

const thFilterStyle = { padding: '4px 6px', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' };

function exportCSV(headers, rows, hiddenCols, filename) {
  const visibleIndices = headers.map((_, i) => i).filter(i => !hiddenCols.has(i));
  const visibleHeaders = visibleIndices.map(i => headers[i]);
  const csvRows = [visibleHeaders.map(h => `"${h}"`).join(','), ...rows.map(row => visibleIndices.map(i => `"${(row[i] || '').replace(/"/g, '""')}"`).join(','))];
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  URL.revokeObjectURL(url);
}

// ════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════
export function AdminStudentSheet() {
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const [columnFilters, setColumnFilters] = useState({});
  const [sortCol, setSortCol] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [hiddenCols, setHiddenCols] = useState(new Set([0]));
  const [activeQuickFilters, setActiveQuickFilters] = useState([]);
  const intervalRef = useRef(null);

  const fetchData = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/admin-data/students`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) { setHeaders(data.headers || []); setRows(data.rows || []); setTotal(data.total || 0); setLastUpdated(new Date()); }
      else { setError(data.error || 'Failed to fetch student data'); }
    } catch (err) { setError('Network error: ' + err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(true); intervalRef.current = setInterval(() => fetchData(false), AUTO_REFRESH_INTERVAL); return () => clearInterval(intervalRef.current); }, [fetchData]);

  const handleSort = (colIdx) => { if (sortCol === colIdx) setSortAsc(!sortAsc); else { setSortCol(colIdx); setSortAsc(true); } };
  const toggleCol = (i) => { setHiddenCols(prev => { const next = new Set(prev); next.has(i) ? next.delete(i) : next.add(i); return next; }); };

  // Quick filters: col indices — 0=ID,1=Name,2=Phone,3=Email,4=School,5=Grade,6=Reg,7=RegDate,8=Profile,9=Aptitude,10=Personality,11=Interest,12=Sessions,13=Program,14=Updated
  const quickFilters = [
    { id: 'profile-yes', label: 'Profile Done', icon: '✅', color: '#16a34a', col: 8, value: 'Yes' },
    { id: 'profile-no', label: 'Profile Pending', icon: '⏳', color: '#d97706', col: 8, value: 'No' },
    { id: 'aptitude-done', label: 'Aptitude Done', icon: '🧠', color: '#2563eb', col: 9, value: '✅ Completed' },
    { id: 'personality-done', label: 'Personality Done', icon: '🎭', color: '#7c3aed', col: 10, value: '✅ Completed' },
    { id: 'interest-done', label: 'Interest Done', icon: '💡', color: '#0891b2', col: 11, value: '✅ Completed' },
    { id: 'has-sessions', label: 'Has Sessions', icon: '📅', color: '#059669', col: 12, match: v => parseInt(v) > 0 },
  ];

  const toggleQuickFilter = (id) => { setActiveQuickFilters(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]); };
  const clearAll = () => { setGlobalSearch(''); setColumnFilters({}); setActiveQuickFilters([]); };

  const filteredRows = useMemo(() => {
    return rows.filter(row => {
      if (globalSearch) { const q = globalSearch.toLowerCase(); if (!row.some(cell => (cell || '').toLowerCase().includes(q))) return false; }
      for (const [colStr, val] of Object.entries(columnFilters)) { if (!val) continue; const col = parseInt(colStr); if (!(row[col] || '').toLowerCase().includes(val.toLowerCase())) return false; }
      for (const qfId of activeQuickFilters) { const qf = quickFilters.find(q => q.id === qfId); if (!qf) continue; const cv = row[qf.col] || ''; if (qf.match ? !qf.match(cv) : cv !== qf.value) return false; }
      return true;
    }).sort((a, b) => { if (sortCol === null) return 0; const va = (a[sortCol] || '').toLowerCase(), vb = (b[sortCol] || '').toLowerCase(); return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va); });
  }, [rows, globalSearch, columnFilters, activeQuickFilters, sortCol, sortAsc]);

  if (loading && rows.length === 0) return <div style={{ textAlign: 'center', padding: '60px 20px' }}><div className="spinner" style={{ margin: '0 auto 16px' }}></div><p style={{ color: 'var(--color-text-secondary)' }}>Loading student data...</p></div>;
  if (error && rows.length === 0) return <div className="card" style={{ textAlign: 'center', padding: '40px' }}><p style={{ color: '#dc2626', marginBottom: '16px' }}>⚠️ {error}</p><button className="btn btn-primary" onClick={() => fetchData(true)}>Retry</button></div>;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '8px' }}>
        <h1 className="page-title">📊 Student Journey Tracker</h1>
        <p className="page-subtitle">Live from database</p>
      </div>

      <QueryToolbar headers={headers} columnFilters={columnFilters} setColumnFilters={setColumnFilters} globalSearch={globalSearch} setGlobalSearch={setGlobalSearch}
        quickFilters={quickFilters} activeQuickFilters={activeQuickFilters} toggleQuickFilter={toggleQuickFilter} clearAll={clearAll}
        resultCount={filteredRows.length} totalCount={total} lastUpdated={lastUpdated} onRefresh={() => fetchData(false)}
        onExport={() => exportCSV(headers, filteredRows, hiddenCols, 'student_journey')} hiddenCols={hiddenCols} toggleCol={toggleCol} />

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr>
                <th style={thStyle}>#</th>
                {headers.map((h, i) => hiddenCols.has(i) ? null : (
                  <th key={i} style={{ ...thStyle, cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort(i)}>
                    {h}{sortCol === i && <span style={{ marginLeft: '4px' }}>{sortAsc ? '▲' : '▼'}</span>}
                  </th>
                ))}
              </tr>
              <ColumnFilterRow headers={headers} columnFilters={columnFilters} setColumnFilters={setColumnFilters} rows={rows} hiddenCols={hiddenCols} />
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr><td colSpan={headers.length + 1 - hiddenCols.size} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  {globalSearch || Object.values(columnFilters).some(v => v) || activeQuickFilters.length
                    ? <div><div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div><div style={{ fontWeight: 500 }}>No matching records</div><button onClick={clearAll} style={{ marginTop: '10px', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px' }}>Clear filters</button></div>
                    : 'No student data available'}
                </td></tr>
              ) : filteredRows.map((row, rowIdx) => (
                <tr key={rowIdx} style={{ borderBottom: '1px solid var(--color-border, #eee)' }}>
                  <td style={tdStyle}>{rowIdx + 1}</td>
                  {headers.map((_, colIdx) => hiddenCols.has(colIdx) ? null : <td key={colIdx} style={tdStyle}>{formatCell(row[colIdx], colIdx, globalSearch, columnFilters[colIdx])}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ marginTop: '10px', fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>Auto-refreshes every 15s • Live from MongoDB • Click column headers to sort • Use filters below headers</div>
    </div>
  );
}

function formatCell(value, colIdx, globalSearch, colFilter) {
  if (!value) return <span style={{ color: '#ccc' }}>—</span>;
  const highlight = globalSearch || colFilter || '';
  if (highlight) {
    const idx = value.toLowerCase().indexOf(highlight.toLowerCase());
    if (idx >= 0) return <span>{value.slice(0, idx)}<mark style={{ background: '#fef08a', padding: '0 1px', borderRadius: '2px' }}>{value.slice(idx, idx + highlight.length)}</mark>{value.slice(idx + highlight.length)}</span>;
  }
  return value;
}

const thStyle = { padding: '10px 8px', textAlign: 'left', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3px', color: '#475569', background: '#f8fafc', borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap' };
const tdStyle = { padding: '9px 8px', whiteSpace: 'nowrap', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' };
