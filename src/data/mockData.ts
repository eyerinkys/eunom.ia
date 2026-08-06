import type { FileItem, FolderItem, StorageCategory, ActivityLog, GraphNode } from '../types/eunomia';

export const INITIAL_FOLDERS: FolderItem[] = [
  { id: 'root', name: 'ROOT', parentId: null, path: '/', itemCount: 6, modifiedAt: '2026-08-06 09:12' },
  { id: 'physics', name: 'PHYSICS_RESEARCH', parentId: 'root', path: '/PHYSICS_RESEARCH', itemCount: 4, modifiedAt: '2026-08-05 14:30' },
  { id: 'chemistry', name: 'CHEMISTRY_LABS', parentId: 'root', path: '/CHEMISTRY_LABS', itemCount: 2, modifiedAt: '2026-08-01 11:20' },
  { id: 'historical', name: 'HISTORICAL_ARCHIVES', parentId: 'root', path: '/HISTORICAL_ARCHIVES', itemCount: 3, modifiedAt: '2026-07-28 16:45' }
];

export const INITIAL_FILES: FileItem[] = [
  {
    id: 'f1',
    name: 'Quantum_Metrology_Paper_2026.md',
    folderId: 'physics',
    path: '/PHYSICS_RESEARCH/Quantum_Metrology_Paper_2026.md',
    type: 'markdown',
    extension: '.md',
    sizeFormatted: '18.4 KB',
    sizeBytes: 18841,
    owner: 'Researcher Aris',
    modifiedAt: '2026-08-06 09:41',
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    parentHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    provenanceStatus: 'VALID',
    versionCount: 3,
    authorSignature: 'SIG_RSA4096_ED25519_OK_0x82A1',
    opfsCached: true,
    contentSnippet: '# Quantum Metrology in Cryogenic Environments\n\n## Abstract\nWe present phase estimation limits using entangled photons in N-path interferometry...',
    versions: [
      {
        id: 'v3',
        version: 'v3',
        timestamp: '2026-08-06 09:41',
        sizeFormatted: '18.4 KB',
        sizeBytes: 18841,
        author: 'Aris Thorne',
        commitNote: 'Final peer review revisions & cryptographic signature seal',
        hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        parentHash: 'b4a2c9183d6a45e99811f0a1c3b5e4d2a1b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5',
        contentSnippet: '# Quantum Metrology in Cryogenic Environments\n\nFinal revised edition with verified experimental margins.'
      },
      {
        id: 'v2',
        version: 'v2',
        timestamp: '2026-08-04 16:15',
        sizeFormatted: '16.1 KB',
        sizeBytes: 16486,
        author: 'Aris Thorne',
        commitNote: 'Added interferometry equations & phase noise analysis',
        hash: 'b4a2c9183d6a45e99811f0a1c3b5e4d2a1b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5',
        parentHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
        contentSnippet: '# Quantum Metrology in Cryogenic Environments\n\nIncludes phase noise equations.'
      },
      {
        id: 'v1',
        version: 'v1',
        timestamp: '2026-08-01 10:00',
        sizeFormatted: '11.8 KB',
        sizeBytes: 12083,
        author: 'Aris Thorne',
        commitNote: 'Initial draft upload to CAS storage',
        hash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
        parentHash: '0000000000000000000000000000000000000000000000000000000000000000',
        contentSnippet: '# Quantum Metrology\nInitial draft.'
      }
    ]
  },
  {
    id: 'f2',
    name: 'Spectroscopy_Raw_Data.csv',
    folderId: 'physics',
    path: '/PHYSICS_RESEARCH/Spectroscopy_Raw_Data.csv',
    type: 'code',
    extension: '.csv',
    sizeFormatted: '4.2 MB',
    sizeBytes: 4404019,
    owner: 'Lab Station 4',
    modifiedAt: '2026-08-05 14:30',
    hash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
    provenanceStatus: 'VALID',
    versionCount: 1,
    authorSignature: 'SIG_HARDWARE_HSM_0x992B',
    opfsCached: true,
    versions: [
      {
        id: 'v1',
        version: 'v1',
        timestamp: '2026-08-05 14:30',
        sizeFormatted: '4.2 MB',
        sizeBytes: 4404019,
        author: 'Lab Station 4',
        commitNote: 'Direct instrument dump',
        hash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
        parentHash: '0000000000000000000000000000000000000000000000000000000000000000'
      }
    ]
  },
  {
    id: 'f3',
    name: 'Interferometer_Diagram.pdf',
    folderId: 'physics',
    path: '/PHYSICS_RESEARCH/Interferometer_Diagram.pdf',
    type: 'pdf',
    extension: '.pdf',
    sizeFormatted: '12.8 MB',
    sizeBytes: 13421772,
    owner: 'Dr. Elena Rostova',
    modifiedAt: '2026-08-03 11:05',
    hash: 'f9e8d7c6b5a432109876543210fedcba9876543210fedcba9876543210fedcba',
    provenanceStatus: 'VALID',
    versionCount: 2,
    authorSignature: 'SIG_ED25519_ROSTOVA_OK',
    opfsCached: false,
    versions: [
      {
        id: 'v2',
        version: 'v2',
        timestamp: '2026-08-03 11:05',
        sizeFormatted: '12.8 MB',
        sizeBytes: 13421772,
        author: 'Elena Rostova',
        commitNote: 'Vector schematic update with beam splitters',
        hash: 'f9e8d7c6b5a432109876543210fedcba9876543210fedcba9876543210fedcba',
        parentHash: '11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff'
      }
    ]
  },
  {
    id: 'f4',
    name: 'Modified_Protocol_Draft.md',
    folderId: 'physics',
    path: '/PHYSICS_RESEARCH/Modified_Protocol_Draft.md',
    type: 'markdown',
    extension: '.md',
    sizeFormatted: '45.1 KB',
    sizeBytes: 46182,
    owner: 'External Guest',
    modifiedAt: '2026-08-05 18:22',
    hash: 'deadbeef1234567890badbeef00112233445566778899aabbccddeeff0011223',
    provenanceStatus: 'TAMPERED',
    versionCount: 2,
    authorSignature: 'SIG_INVALID_HASH_MISMATCH',
    opfsCached: false,
    contentSnippet: 'CRITICAL WARNING: Unverified edits detected in step 4 block hash calculation.',
    versions: [
      {
        id: 'v2',
        version: 'v2',
        timestamp: '2026-08-05 18:22',
        sizeFormatted: '45.1 KB',
        sizeBytes: 46182,
        author: 'External Guest',
        commitNote: 'Unverified modification without signature key',
        hash: 'deadbeef1234567890badbeef00112233445566778899aabbccddeeff0011223',
        parentHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'
      }
    ]
  },
  {
    id: 'f5',
    name: 'Organic_Synthesis_Protocol.pdf',
    folderId: 'chemistry',
    path: '/CHEMISTRY_LABS/Organic_Synthesis_Protocol.pdf',
    type: 'pdf',
    extension: '.pdf',
    sizeFormatted: '3.6 MB',
    sizeBytes: 3774873,
    owner: 'Prof. Miller',
    modifiedAt: '2026-08-01 11:20',
    hash: '556677889900aabbccddeeff11223344556677889900aabbccddeeff11223344',
    provenanceStatus: 'VALID',
    versionCount: 1,
    authorSignature: 'SIG_MILLER_DEPT_OK',
    opfsCached: true,
    versions: []
  },
  {
    id: 'f6',
    name: 'NMR_Spectra_Archive.tar.gz',
    folderId: 'chemistry',
    path: '/CHEMISTRY_LABS/NMR_Spectra_Archive.tar.gz',
    type: 'archive',
    extension: '.gz',
    sizeFormatted: '184.2 MB',
    sizeBytes: 193146880,
    owner: 'Prof. Miller',
    modifiedAt: '2026-07-29 09:10',
    hash: '9900aabbccddeeff11223344556677889900aabbccddeeff1122334455667788',
    provenanceStatus: 'VALID',
    versionCount: 1,
    authorSignature: 'SIG_MILLER_DEPT_OK',
    opfsCached: true,
    versions: []
  },
  {
    id: 'f7',
    name: 'Manuscript_Transcripts_1924.pdf',
    folderId: 'historical',
    path: '/HISTORICAL_ARCHIVES/Manuscript_Transcripts_1924.pdf',
    type: 'pdf',
    extension: '.pdf',
    sizeFormatted: '84.5 MB',
    sizeBytes: 88604672,
    owner: 'Archivist Sarah',
    modifiedAt: '2026-07-28 16:45',
    hash: '3344556677889900aabbccddeeff11223344556677889900aabbccddeeff1122',
    provenanceStatus: 'VALID',
    versionCount: 1,
    authorSignature: 'SIG_SARAH_ARCHIVE_OK',
    opfsCached: false,
    versions: []
  }
];

export const STORAGE_CATEGORIES: StorageCategory[] = [
  {
    id: 'docs',
    name: 'Documents & Manuscripts',
    sizeFormatted: '106.5 MB',
    sizeBytes: 111673344,
    percentage: 36,
    color: '#A66F2C', // Warm Bronze
    fileCount: 4,
    description: 'PDF reports, Markdown papers, and transcribed records'
  },
  {
    id: 'media',
    name: 'Media & Datasets',
    sizeFormatted: '184.2 MB',
    sizeBytes: 193146880,
    percentage: 42,
    color: '#5C7A70', // Oxidised Copper
    fileCount: 2,
    description: 'Spectroscopy CSVs, NMR archives, and diagrams'
  },
  {
    id: 'code',
    name: 'Code & Text',
    sizeFormatted: '4.2 MB',
    sizeBytes: 4404019,
    percentage: 12,
    color: '#8C7389', // Muted Plum
    fileCount: 8,
    description: 'Scripts, configurations, and raw logs'
  },
  {
    id: 'dedup',
    name: 'Deduplication Savings',
    sizeFormatted: '48.9 MB',
    sizeBytes: 51275366,
    percentage: 10,
    color: '#5B634B', // Muted Olive
    fileCount: 14,
    description: 'Identical block hashes deduplicated across CAS storage'
  }
];

export const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: 'act-1',
    type: 'provenance_verified',
    title: 'Cryptographic Provenance Verified',
    description: 'Full SHA-256 chain seal validated for Quantum_Metrology_Paper_2026.md',
    timestamp: '2026-08-06 09:41',
    statusBadge: 'VALIDATED',
    fileId: 'f1'
  },
  {
    id: 'act-2',
    type: 'version_created',
    title: 'New Version Created (v3)',
    description: 'Peer review revisions signed with RSA-4096 key',
    timestamp: '2026-08-06 09:40',
    statusBadge: 'COMPLETED',
    fileId: 'f1'
  },
  {
    id: 'act-3',
    type: 'upload',
    title: 'CAS Blob Ingestion',
    description: 'Spectroscopy_Raw_Data.csv hashed & written to local storage',
    timestamp: '2026-08-05 14:30',
    statusBadge: 'HASH OK',
    fileId: 'f2'
  },
  {
    id: 'act-4',
    type: 'tamper_detected',
    title: 'Tamper Alert Detected',
    description: 'Hash mismatch on Modified_Protocol_Draft.md revision',
    timestamp: '2026-08-05 18:22',
    statusBadge: 'TAMPER WARNING',
    fileId: 'f4'
  }
];

export const INITIAL_GRAPH_NODES: GraphNode[] = [
  { id: 'gn-root', label: 'ROOT ARCHIVE', type: 'folder', path: '/', status: 'VALID', depth: 0, x: 400, y: 50 },
  { id: 'gn-physics', label: 'PHYSICS_RESEARCH', type: 'folder', path: '/PHYSICS_RESEARCH', status: 'VALID', depth: 1, parentId: 'gn-root', x: 200, y: 150 },
  { id: 'gn-chem', label: 'CHEMISTRY_LABS', type: 'folder', path: '/CHEMISTRY_LABS', status: 'VALID', depth: 1, parentId: 'gn-root', x: 600, y: 150 },
  { id: 'gn-f1', label: 'Quantum_Metrology.md', type: 'file', path: '/PHYSICS_RESEARCH/Quantum_Metrology_Paper_2026.md', status: 'VALID', size: '18.4 KB', depth: 2, parentId: 'gn-physics', x: 100, y: 270 },
  { id: 'gn-f1-v3', label: 'v3 (0x82A1)', type: 'version', path: 'Version 3', status: 'VALID', depth: 3, parentId: 'gn-f1', x: 100, y: 370 },
  { id: 'gn-f2', label: 'Spectroscopy.csv', type: 'file', path: '/PHYSICS_RESEARCH/Spectroscopy_Raw_Data.csv', status: 'VALID', size: '4.2 MB', depth: 2, parentId: 'gn-physics', x: 280, y: 270 },
  { id: 'gn-f4', label: 'Modified_Protocol.md', type: 'file', path: '/PHYSICS_RESEARCH/Modified_Protocol_Draft.md', status: 'TAMPERED', size: '45.1 KB', depth: 2, parentId: 'gn-physics', x: 420, y: 270 },
  { id: 'gn-f5', label: 'Organic_Synthesis.pdf', type: 'file', path: '/CHEMISTRY_LABS/Organic_Synthesis_Protocol.pdf', status: 'VALID', size: '3.6 MB', depth: 2, parentId: 'gn-chem', x: 600, y: 270 }
];
