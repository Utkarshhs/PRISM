import { create } from 'zustand';
import { MOCK_ALERTS } from '../mock/data';

const useStore = create((set, get) => ({
  // ── Active selections ──
  activeProductId: 'prod-001',
  activeFeature: null,       // null = show all
  activePlatform: 'all',     // 'all' | 'amazon' | 'flipkart' | 'jiomart' | 'brand'

  // ── Data ──
  dashboardData: null,
  allProducts: [],
  reviews: [],
  reviewsTotal: 0,
  reviewsPage: 1,
  alerts: MOCK_ALERTS,

  // ── UI state ──
  isLoadingDashboard: false,
  isAlertPanelOpen: false,
  isSidebarOpen: true,
  showLanding: true,

  // ── Actions ──
  setActiveProduct: (productId) =>
    set({ activeProductId: productId, activeFeature: null }),

  setActiveFeature: (feature) =>
    set((state) => ({
      activeFeature: state.activeFeature === feature ? null : feature,
    })),

  setActivePlatform: (platform) =>
    set({ activePlatform: platform }),

  setDashboardData: (data) =>
    set({ dashboardData: data, isLoadingDashboard: false }),

  setAllProducts: (products) =>
    set({ allProducts: products }),

  setReviews: (reviews, total, page) =>
    set({ reviews, reviewsTotal: total, reviewsPage: page }),

  setIsLoadingDashboard: (v) =>
    set({ isLoadingDashboard: v }),

  toggleAlertPanel: () =>
    set((state) => ({ isAlertPanelOpen: !state.isAlertPanelOpen })),

  addAlert: (alert) =>
    set((state) => ({ alerts: [alert, ...state.alerts] })),

  dismissAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.filter((a) => a.alert_id !== alertId),
    })),

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setShowLanding: (v) =>
    set({ showLanding: v }),
}));

export default useStore;
