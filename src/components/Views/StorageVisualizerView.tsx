import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useEunomiaStore } from '../../store/useEunomiaStore';

export const StorageVisualizerView: React.FC = () => {
  const { storageCategories } = useEunomiaStore();

  const totalLogical = 345.9; // MB
  const physicalCAS = 297.0; // MB
  const dedupSavings = 48.9; // MB
  const dedupPercentage = ((dedupSavings / totalLogical) * 100).toFixed(1);

  return (
    <div style={{ padding: '28px', height: '100%', overflowY: 'auto' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: '32px', fontWeight: 700, lineHeight: 1.1, marginBottom: '6px' }}>
            Storage Visualiser
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Content-addressed block space breakdown & SHA-256 deduplication analytics.
          </p>
        </div>
        <button 
          className="btn-secondary"
          onClick={() => alert('Refreshing CAS storage block indices...')}
        >
          <RefreshCw size={14} /> Refresh Analytics
        </button>
      </div>

      {/* Metric Statistics Callout Strip */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '28px'
        }}
      >
        <div className="rule-all" style={{ padding: '20px', backgroundColor: 'var(--bg-panel)' }}>
          <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TOTAL LOGICAL SIZE</span>
          <h2 className="font-serif" style={{ fontSize: '32px', fontWeight: 700 }}>{totalLogical} MB</h2>
          <p className="font-mono" style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Sum of uncompressed user files</p>
        </div>

        <div className="rule-all" style={{ padding: '20px', backgroundColor: 'var(--bg-panel)' }}>
          <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PHYSICAL CAS STORAGE</span>
          <h2 className="font-serif" style={{ fontSize: '32px', fontWeight: 700, color: 'var(--accent-copper)' }}>{physicalCAS} MB</h2>
          <p className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-copper)' }}>Unique SHA-256 content blobs</p>
        </div>

        <div className="rule-all" style={{ padding: '20px', backgroundColor: 'var(--bg-panel)' }}>
          <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>DEDUPLICATION SAVINGS</span>
          <h2 className="font-serif" style={{ fontSize: '32px', fontWeight: 700, color: 'var(--accent-olive)' }}>{dedupPercentage}%</h2>
          <p className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-olive)' }}>{dedupSavings} MB disk space saved</p>
        </div>
      </div>

      {/* Hierarchical Mineral Treemap Grid */}
      <div style={{ marginBottom: '28px' }}>
        <h3 className="font-serif" style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>
          CAS Storage Allocation Treemap
        </h3>

        <div 
          className="rule-all"
          style={{
            height: '240px',
            display: 'grid',
            gridTemplateColumns: '42% 36% 22%',
            backgroundColor: 'var(--bg-panel)'
          }}
        >
          {/* Block 1: Media */}
          <div 
            style={{
              backgroundColor: 'var(--accent-copper)',
              color: '#E4DDD3',
              padding: '20px',
              borderRight: 'var(--border-rule)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <span className="font-mono" style={{ fontSize: '10px', opacity: 0.8 }}>42% CAPACITY</span>
              <h4 className="font-serif" style={{ fontSize: '20px', fontWeight: 700 }}>Media & Datasets</h4>
            </div>
            <span className="font-mono" style={{ fontSize: '14px', fontWeight: 700 }}>184.2 MB (2 Files)</span>
          </div>

          {/* Block 2: Documents */}
          <div 
            style={{
              backgroundColor: 'var(--accent-bronze)',
              color: '#11161D',
              padding: '20px',
              borderRight: 'var(--border-rule)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <span className="font-mono" style={{ fontSize: '10px', opacity: 0.8 }}>36% CAPACITY</span>
              <h4 className="font-serif" style={{ fontSize: '20px', fontWeight: 700 }}>Documents & PDF</h4>
            </div>
            <span className="font-mono" style={{ fontSize: '14px', fontWeight: 700 }}>106.5 MB (4 Files)</span>
          </div>

          {/* Block 3: Split Stack (Code & Dedup) */}
          <div style={{ display: 'grid', gridTemplateRows: '55% 45%' }}>
            <div 
              style={{
                backgroundColor: 'var(--accent-plum)',
                color: '#E4DDD3',
                padding: '12px',
                borderBottom: 'var(--border-rule)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <span className="font-serif" style={{ fontSize: '14px', fontWeight: 700 }}>Code & Text (12%)</span>
              <span className="font-mono" style={{ fontSize: '11px' }}>4.2 MB</span>
            </div>
            <div 
              style={{
                backgroundColor: 'var(--accent-olive)',
                color: '#E4DDD3',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <span className="font-serif" style={{ fontSize: '14px', fontWeight: 700 }}>Dedup Savings (10%)</span>
              <span className="font-mono" style={{ fontSize: '11px' }}>48.9 MB Saved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <h3 className="font-serif" style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>
        Detailed Storage Categories
      </h3>
      <div className="rule-all" style={{ backgroundColor: 'var(--bg-canvas)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr className="rule-b" style={{ backgroundColor: 'var(--bg-panel)', fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.05em' }}>
              <th style={{ padding: '10px 16px' }}>CATEGORY</th>
              <th style={{ padding: '10px 16px' }}>DESCRIPTION</th>
              <th style={{ padding: '10px 16px' }}>FILES</th>
              <th style={{ padding: '10px 16px' }}>SIZE</th>
              <th style={{ padding: '10px 16px', textAlign: 'right' }}>ALLOCATION</th>
            </tr>
          </thead>
          <tbody>
            {storageCategories.map((cat) => (
              <tr key={cat.id} className="rule-b-light row-hover">
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: cat.color, border: 'var(--border-rule)' }} />
                    {cat.name}
                  </div>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{cat.description}</td>
                <td className="font-mono" style={{ padding: '12px 16px' }}>{cat.fileCount} items</td>
                <td className="font-mono" style={{ padding: '12px 16px', fontWeight: 600 }}>{cat.sizeFormatted}</td>
                <td className="font-mono" style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700 }}>
                  {cat.percentage}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
