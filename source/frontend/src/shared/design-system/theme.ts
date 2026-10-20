// Design tokens cho ConfigProvider — nguồn duy nhất cho mọi quyết định màu sắc,
// typography, spacing và motion của app.
// Sửa tại đây để thay đổi áp dụng toàn bộ app.

import type { ThemeConfig } from 'antd';

export const appTheme: ThemeConfig = {
  token: {
    // ── Brand ─────────────────────────────────────────────────────────────────
    colorPrimary: '#1677ff',      // AntD blue — phù hợp enterprise context
    colorBgBase: '#fafafa',       // Off-white ấm, không pure white
    colorBgContainer: '#ffffff',  // Card backgrounds

    // ── Typography ────────────────────────────────────────────────────────────
    // Body face: Plus Jakarta Sans (humanist, readable at dense layouts)
    // Fallback to Inter/system-ui cho máy chưa load font
    fontFamily:
      "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 14,       // body
    fontSizeLG: 16,     // large labels
    fontSizeXL: 20,     // small headings
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    lineHeight: 1.5714, // ≈ 22px at 14px — comfortable for dense text

    // ── Spacing (8px base) ─────────────────────────────────────────────────────
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    paddingContentHorizontal: 16,
    paddingContentVertical: 12,
    paddingLG: 24,
    paddingMD: 16,
    paddingSM: 12,
    paddingXS: 8,

    // ── Motion — Emil Kowalski: purposeful, < 300ms ──────────────────────────
    // Durations
    motionDurationFast: '0.1s',   // Button :active, instant feedback
    motionDurationMid: '0.2s',    // Tooltips, small popovers
    motionDurationSlow: '0.25s',  // Modals, drawers, complex transitions

    // Easings
    // Entrance: snappy ease-out (feels immediate, decelerates to rest)
    motionEaseOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    // In-out: for elements that both enter and exit in same motion
    motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  components: {
    // ── Button: tactile feedback ──────────────────────────────────────────────
    Button: {
      fontWeight: 500,
      // :active scale handled globally via motion.css
    },

    // ── Table: dense but readable ──────────────────────────────────────────────
    Table: {
      headerBg: '#f5f5f5',
      headerColor: 'rgba(0,0,0,0.65)',
      headerSortActiveBg: '#ebebeb',
      rowHoverBg: '#f0f7ff',
      borderColor: '#f0f0f0',
      cellPaddingBlock: 12,
      cellPaddingInline: 16,
    },

    // ── Layout: sidebar + header ───────────────────────────────────────────────
    Layout: {
      siderBg: '#ffffff',
      headerBg: '#001529',
      headerHeight: 56,
      bodyBg: '#f5f5f5',
    },

    // ── Card: clean, not heavy ─────────────────────────────────────────────────
    Card: {
      paddingLG: 20,
      headerBg: 'transparent',
      headerFontSize: 16,
      headerFontSizeSM: 14,
    },

    // ── Modal: generous, focused ────────────────────────────────────────────────
    Modal: {
      paddingContentHorizontalLG: 24,
    },

    // ── Form: clear labels ─────────────────────────────────────────────────────
    Form: {
      labelFontSize: 14,
      labelColor: 'rgba(0,0,0,0.85)',
      itemMarginBottom: 20,
    },

    // ── Menu: sidebar nav ─────────────────────────────────────────────────────
    Menu: {
      itemBorderRadius: 6,
      itemMarginInline: 8,
    },
  },
};
