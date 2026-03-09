'use client'
import React, { useState, useEffect, useRef } from 'react'

interface TimerDialProps {
  onDateChange: (dateString: string) => void;
  initialDate?: string;
}

const UNITS = ['Minutes', 'Hours', 'Days', 'Months', 'Years'];
// Generate quantities 1 to 60
const QUANTITIES = Array.from({ length: 60 }, (_, i) => (i + 1).toString());

export default function TimerDial({ onDateChange, initialDate }: TimerDialProps) {
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit]         = useState('Years');
  const [manualMode, setManualMode] = useState(false);
  const [manualDate, setManualDate] = useState(() => {
    if (initialDate) {
      // Create local ISO string matching the time to avoid timezone offset issues in input type="datetime-local"
      const d = new Date(initialDate);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    }
    const d = new Date(); d.setFullYear(d.getFullYear() + 1);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });

  // Recompute date whenever dial changes
  useEffect(() => {
    if (manualMode) return;
    const now = new Date();
    const q = parseInt(quantity, 10);
    if (isNaN(q)) return;

    if (unit === 'Minutes') now.setMinutes(now.getMinutes() + q);
    else if (unit === 'Hours') now.setHours(now.getHours() + q);
    else if (unit === 'Days') now.setDate(now.getDate() + q);
    else if (unit === 'Months') now.setMonth(now.getMonth() + q);
    else if (unit === 'Years') now.setFullYear(now.getFullYear() + q);

    onDateChange(now.toISOString());
  }, [quantity, unit, manualMode, onDateChange]);

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualDate(e.target.value);
    const d = new Date(e.target.value);
    if (!isNaN(d.getTime())) {
      onDateChange(d.toISOString());
    }
  };

  // Simple scroll snap simulation for dial (in a real app, uses specialized libraries or touch events)
  return (
    <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontFamily: 'var(--display)', fontSize: '18px', fontWeight: 500, color: 'var(--text-main)', margin: 0 }}>
          Delivery Time
        </h3>
        <button 
          onClick={() => setManualMode(!manualMode)}
          style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'var(--body)', fontSize: '13px' }}
        >
          {manualMode ? 'Use Dial' : 'Manual Date'}
        </button>
      </div>

      {manualMode ? (
        <input 
          type="datetime-local" 
          value={manualDate}
          onChange={handleManualChange}
          className="input-modern"
          style={{ width: '100%', padding: '12px', boxSizing: 'border-box' }}
        />
      ) : (
        <div style={{ position: 'relative', display: 'flex', gap: '16px', height: '180px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '10px' }}>
          {/* Highlight Center Row */}
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '40px', transform: 'translateY(-50%)', background: 'var(--border)', borderRadius: '8px', pointerEvents: 'none', zIndex: 0 }} />
          
          <div style={{ flex: 1, position: 'relative', zIndex: 1, overflowY: 'auto', scrollBehavior: 'smooth', scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch' }} className="no-scrollbar">
            {/* Pad top to allow scrolling */}
            <div style={{ height: '70px' }} />
            {QUANTITIES.map((q) => (
              <div 
                key={q} 
                onClick={() => setQuantity(q)}
                style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', scrollSnapAlign: 'center', cursor: 'pointer', fontFamily: 'var(--body)', fontSize: quantity === q ? '24px' : '16px', fontWeight: quantity === q ? 600 : 400, color: quantity === q ? 'var(--text-main)' : 'var(--text-faint)', transition: 'all 0.2s ease' }}
              >
                {q}
              </div>
            ))}
            <div style={{ height: '70px' }} />
          </div>

          <div style={{ flex: 1, position: 'relative', zIndex: 1, overflowY: 'auto', scrollBehavior: 'smooth', scrollSnapType: 'y mandatory' }} className="no-scrollbar">
            <div style={{ height: '70px' }} />
            {UNITS.map((u) => (
              <div 
                key={u} 
                onClick={() => setUnit(u)}
                style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', scrollSnapAlign: 'center', cursor: 'pointer', fontFamily: 'var(--body)', fontSize: unit === u ? '20px' : '16px', fontWeight: unit === u ? 500 : 400, color: unit === u ? 'var(--text-main)' : 'var(--text-faint)', transition: 'all 0.2s ease' }}
              >
                {u}
              </div>
            ))}
            <div style={{ height: '70px' }} />
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html:`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
