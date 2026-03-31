import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { VendorCardData } from './VendorCard';

type Vendor = VendorCardData & { closesAt?: string };

// Approximate SF coordinates mapped to percentage positions on the mock map grid
const VENDOR_POSITIONS: Record<number | string, { x: number; y: number }> = {
  1: { x: 34, y: 58 }, // Marco's — Mission District
  2: { x: 62, y: 38 }, // Bao House — SoMa
  3: { x: 22, y: 68 }, // La Cocina — Castro
  4: { x: 72, y: 22 }, // Niko's — Financial District
  5: { x: 36, y: 52 }, // El Fuego — Mission District
  6: { x: 28, y: 72 }, // Doña Rosa — 24th Street
  7: { x: 38, y: 64 }, // Esquina — Dolores Park
};

interface MapViewProps {
  vendors: Vendor[];
  height?: number;
  fullWidth?: boolean;
}

export function MapView({ vendors, height = 520, fullWidth = false }: MapViewProps) {
  const [selectedId, setSelectedId] = useState<number | string | null>(null);
  const [zoom, setZoom] = useState(14);
  const navigate = useNavigate();

  const selected = vendors.find((v) => v.id === selectedId) ?? null;

  return (
    <div style={{ display: 'flex', gap: 0, height, width: '100%', borderRadius: fullWidth ? 0 : 16, overflow: 'hidden', border: fullWidth ? 'none' : '1px solid #E8E6E1', borderTop: fullWidth ? '1px solid #E8E6E1' : undefined }}>
      {/* Sidebar */}
      <div style={{ background: '#fff', borderRight: '1px solid #E8E6E1', display: 'flex', flexDirection: 'column', gap: 0, overflowY: 'auto', width: 280 }}>
        {vendors.map((vendor) => (
          <button
            key={vendor.id}
            onClick={() => setSelectedId(vendor.id === selectedId ? null : vendor.id)}
            style={{
              alignItems: 'center',
              background: selectedId === vendor.id ? '#FFF4EE' : 'transparent',
              border: 'none',
              borderBottom: '1px solid #F0EDE7',
              borderLeft: selectedId === vendor.id ? '3px solid #FF6B2C' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              gap: 12,
              padding: '14px 16px',
              textAlign: 'left',
            }}
          >
            <div style={{ alignItems: 'center', background: vendor.bgColor, borderRadius: 8, color: '#fff', display: 'flex', flexShrink: 0, fontSize: 9, fontWeight: 800, height: 44, justifyContent: 'center', letterSpacing: 1, width: 44 }}>
              {vendor.label.slice(0, 4)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#1C1917', fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vendor.name}</div>
              <div style={{ color: '#9C9890', fontSize: 12, marginTop: 2 }}>{vendor.location} · {vendor.distance}</div>
              <div style={{ alignItems: 'center', display: 'flex', gap: 6, marginTop: 4 }}>
                <span style={{ color: '#1C1917', fontSize: 11, fontWeight: 600 }}>{vendor.rating}</span>
                <span style={{ background: vendor.open ? '#E8F5E9' : '#F0EDE7', borderRadius: 4, color: vendor.open ? '#2D9F6F' : '#9C9890', fontSize: 10, fontWeight: 600, padding: '2px 6px' }}>
                  {vendor.open ? 'Open' : 'Closed'}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Map canvas */}
      <div style={{ background: 'linear-gradient(90deg,#ede8df 47%,#f7f4ee 47%,#f7f4ee 53%,#ede8df 53%), linear-gradient(#ede8df 46%,#f7f4ee 46%,#f7f4ee 54%,#ede8df 54%)', backgroundSize: '80px 80px', flex: 1, position: 'relative' }}>
        {/* Zoom controls */}
        <div style={{ background: '#fff', border: '1px solid #E8E6E1', borderRadius: 8, bottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'absolute', right: 16, zIndex: 10 }}>
          <button onClick={() => setZoom((z) => Math.min(z + 1, 20))} style={{ background: 'none', border: 'none', borderBottom: '1px solid #E8E6E1', color: '#1C1917', cursor: 'pointer', fontSize: 18, fontWeight: 700, lineHeight: 1, padding: '8px 12px' }}>+</button>
          <button onClick={() => setZoom((z) => Math.max(z - 1, 8))} style={{ background: 'none', border: 'none', color: '#1C1917', cursor: 'pointer', fontSize: 18, fontWeight: 700, lineHeight: 1, padding: '8px 12px' }}>−</button>
        </div>

        {/* You are here dot */}
        <div style={{ background: '#4285F4', border: '3px solid #fff', borderRadius: '50%', bottom: '34%', boxShadow: '0 2px 6px rgba(66,133,244,0.5)', height: 14, position: 'absolute', right: '42%', width: 14, zIndex: 5 }} />

        {/* Vendor pins */}
        {vendors.map((vendor) => {
          const pos = VENDOR_POSITIONS[vendor.id] ?? { x: 50, y: 50 };
          const isSelected = selectedId === vendor.id;
          return (
            <button
              key={vendor.id}
              onClick={() => {
                if (isSelected) {
                  navigate(`/vendor?id=${vendor.id}`);
                } else {
                  setSelectedId(vendor.id);
                }
              }}
              style={{
                alignItems: 'center',
                background: isSelected ? '#FF6B2C' : vendor.open ? '#1C1917' : '#9C9890',
                border: isSelected ? '2px solid #fff' : '2px solid rgba(255,255,255,0.6)',
                borderRadius: 999,
                boxShadow: isSelected ? '0 4px 12px rgba(255,107,44,0.5)' : '0 2px 6px rgba(0,0,0,0.2)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 10,
                fontWeight: 700,
                left: `${pos.x}%`,
                padding: isSelected ? '6px 12px' : '5px 10px',
                position: 'absolute',
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                zIndex: isSelected ? 20 : 10,
              }}
            >
              {isSelected ? vendor.name : vendor.label}
            </button>
          );
        })}

        {/* Selected vendor popup */}
        {selected && (
          <div style={{ background: '#fff', border: '1px solid #E8E6E1', borderRadius: 12, bottom: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', left: 16, maxWidth: 280, padding: 16, position: 'absolute', zIndex: 30 }}>
            <div style={{ color: '#9C9890', fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>{selected.cuisine} · {selected.location}</div>
            <div style={{ color: '#1C1917', fontSize: 16, fontWeight: 800, marginTop: 4 }}>{selected.name}</div>
            <div style={{ alignItems: 'center', display: 'flex', gap: 8, marginTop: 6 }}>
              <span style={{ color: '#1C1917', fontSize: 13, fontWeight: 600 }}>★ {selected.rating}</span>
              <span style={{ color: '#9C9890', fontSize: 13 }}>{selected.distance}</span>
              <span style={{ background: selected.open ? '#E8F5E9' : '#F0EDE7', borderRadius: 4, color: selected.open ? '#2D9F6F' : '#9C9890', fontSize: 11, fontWeight: 600, padding: '2px 6px' }}>
                {selected.open ? (selected.closesAt ? `Open · closes ${selected.closesAt}` : 'Open') : 'Closed'}
              </span>
            </div>
            <Link
              to={`/vendor?id=${selected.id}`}
              className="link-reset"
              style={{ background: '#FF6B2C', borderRadius: 8, color: '#fff', display: 'block', fontSize: 13, fontWeight: 700, marginTop: 12, padding: '9px 0', textAlign: 'center' }}
            >
              View Menu
            </Link>
          </div>
        )}

        {/* Zoom level indicator */}
        <div style={{ bottom: 12, fontSize: 11, left: '50%', opacity: 0.4, position: 'absolute', transform: 'translateX(-50%)', color: '#1C1917' }}>
          Zoom {zoom}
        </div>
      </div>
    </div>
  );
}
