// Centraliza constantes globais (Supabase, BFF, storage keys, paleta Excel BI).

export const SUPABASE_URL = 'https://mzedoasnrmrpfpgweljj.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_VvRVsHUnNObPX4OVo5GbxQ_aMhHHz5X';

export const API_BASE = (window.__RL_CONFIG__ && window.__RL_CONFIG__.API_BASE) || 'http://localhost:3000/api';
export const AI_EDGE_URL = SUPABASE_URL + '/functions/v1/ai-insight';

export const STORAGE_KEY = (uid) => `rl_analyses_${uid}`;
export const SESSION_KEY = 'rl_session_v4';
export const USERS_KEY = 'rl_users_v4';

export const CHART_COLORS = {
  txt2: '#9B9AB8',
  txt3: '#5A5975',
  grid: '#1E1E2E',
  x: '#7B6FFF',
  y: '#00D4A0',
  acc: '#FF6B6B',
  acc2: '#FFB347',
  scatter: 'rgba(123,111,255,.7)',
  scatter2: 'rgba(0,212,160,.6)',
  ideal: 'rgba(0,212,160,.5)',
  diag: 'rgba(255,255,255,.2)',
};

export const QR_COLORS = {
  '0.1':  { line:'#FF6B6B' },
  '0.25': { line:'#FFB347' },
  '0.5':  { line:'#00D4A0' },
  '0.75': { line:'#7B6FFF' },
  '0.9':  { line:'#C864FF' },
};

// Paleta Excel BI (xlsx-js-style — RGB sem #)
export const XC = {
  H_DARK:   '1E1E2E',
  H_PURPLE: '7B6FFF',
  H_GREEN:  '00A87A',
  H_RED:    'C0392B',
  H_BLUE:   '1A5276',
  H_TEAL:   '117A65',
  H_ORANGE: 'B7770D',
  H_GRAY:   '2C3E50',
  WHITE:    'FFFFFF',
  LIGHT:    'ECF0F1',
  ROW_ALT:  'F2F4F8',
  ROW_BASE: 'FFFFFF',
  ROW_WARN: 'FEF9E7',
  ROW_CRIT: 'FDEDEC',
  ROW_GOOD: 'EAFAF1',
  KPI_BG:   'EBF5FB',
  SECTION:  'D6EAF8',
  BRD:      'BDC3C7',
};
