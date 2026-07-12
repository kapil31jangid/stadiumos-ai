import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DashboardProvider, useDashboard } from '../features/dashboard/shared/DashboardContext';

// Mock supabase client to avoid network/configuration issues in tests
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
  isSupabaseConfigured: false,
}));

// Mock hot-toast to avoid DOM rendering overhead
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// A test consumer component to inspect context values and trigger actions
const TestConsumer: React.FC = () => {
  const context = useDashboard();
  
  return (
    <div>
      <div data-testid="language">{context.language}</div>
      <div data-testid="weather">{context.weather}</div>
      <div data-testid="matchPhase">{context.matchPhase}</div>
      <div data-testid="activeTab">{context.activeTab}</div>
      <div data-testid="user-role">{context.user?.role || 'none'}</div>
      <div data-testid="notif-count">{context.notifications.length}</div>
      
      <button 
        data-testid="btn-set-lang" 
        onClick={() => context.setLanguage('es')}
      >
        Set Spanish
      </button>
      
      <button 
        data-testid="btn-set-weather" 
        onClick={() => context.setWeather('Rainy')}
      >
        Set Rainy
      </button>

      <button 
        data-testid="btn-set-phase" 
        onClick={() => context.setMatchPhase('FIRST_HALF')}
      >
        Set First Half
      </button>

      <button 
        data-testid="btn-switch-role" 
        onClick={() => context.handleJudgeAutoLogin('volunteer')}
      >
        Switch to Volunteer
      </button>

      <button 
        data-testid="btn-add-notif" 
        onClick={() => context.addNotification('Test system alert', 'volunteer', 'warning')}
      >
        Add Warning Notif
      </button>
    </div>
  );
};

describe('DashboardContext System', () => {
  it('initializes with correct default values', () => {
    render(
      <DashboardProvider>
        <TestConsumer />
      </DashboardProvider>
    );

    expect(screen.getByTestId('language').textContent).toBe('en');
    expect(screen.getByTestId('weather').textContent).toBe('Clear');
    expect(screen.getByTestId('matchPhase').textContent).toBe('PRE_MATCH');
    expect(screen.getByTestId('activeTab').textContent).toBe('dashboard');
  });

  it('updates language correctly', async () => {
    render(
      <DashboardProvider>
        <TestConsumer />
      </DashboardProvider>
    );

    const btn = screen.getByTestId('btn-set-lang');
    await act(async () => {
      btn.click();
    });

    expect(screen.getByTestId('language').textContent).toBe('es');
  });

  it('updates weather correctly', async () => {
    render(
      <DashboardProvider>
        <TestConsumer />
      </DashboardProvider>
    );

    const btn = screen.getByTestId('btn-set-weather');
    await act(async () => {
      btn.click();
    });

    expect(screen.getByTestId('weather').textContent).toBe('Rainy');
  });

  it('updates match phase and transitions state correctly', async () => {
    render(
      <DashboardProvider>
        <TestConsumer />
      </DashboardProvider>
    );

    const btn = screen.getByTestId('btn-set-phase');
    await act(async () => {
      btn.click();
    });

    expect(screen.getByTestId('matchPhase').textContent).toBe('FIRST_HALF');
  });

  it('performs role switching and updates profile state', async () => {
    render(
      <DashboardProvider>
        <TestConsumer />
      </DashboardProvider>
    );

    const btn = screen.getByTestId('btn-switch-role');
    await act(async () => {
      btn.click();
    });

    expect(screen.getByTestId('user-role').textContent).toBe('volunteer');
  });

  it('adds and lists notifications correctly', async () => {
    render(
      <DashboardProvider>
        <TestConsumer />
      </DashboardProvider>
    );

    const btn = screen.getByTestId('btn-add-notif');
    await act(async () => {
      btn.click();
    });

    expect(parseInt(screen.getByTestId('notif-count').textContent || '0', 10)).toBeGreaterThanOrEqual(1);
  });
});
