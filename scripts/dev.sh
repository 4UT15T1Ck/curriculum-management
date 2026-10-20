#!/usr/bin/env bash
# Khởi động backend và frontend song song.
# Chạy từ bất kỳ đâu trong repo: bash scripts/dev.sh
# Yêu cầu: bash, pnpm đã cài global.

set -euo pipefail

# Resolve project root (thư mục chứa scripts/)
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND="$REPO_ROOT/source/backend"
FRONTEND="$REPO_ROOT/source/frontend"

# ── Kiểm tra điều kiện ────────────────────────────────────────────────────────
[[ -d "$BACKEND" ]]  || { echo "❌ Không tìm thấy: $BACKEND"; exit 1; }
[[ -d "$FRONTEND" ]] || { echo "❌ Không tìm thấy: $FRONTEND"; exit 1; }
command -v pnpm >/dev/null 2>&1 || {
  echo "❌ pnpm chưa được cài. Xem: https://pnpm.io/installation"
  exit 1
}

# ── Cleanup khi thoát ────────────────────────────────────────────────────────
cleanup() {
  echo ""
  echo "⏹  Dừng tất cả tiến trình..."
  # Dùng kill 0 để kill toàn bộ process group
  kill "$be_pid" "$fe_pid" 2>/dev/null || true
  wait "$be_pid" "$fe_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# ── Thông báo ─────────────────────────────────────────────────────────────────
echo "╔══════════════════════════════════════════╗"
echo "║  Quản lý Chương trình đào tạo — Dev      ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "  🔵 Backend  → http://localhost:3000"
echo "  🟢 Frontend → http://localhost:5173"
echo ""
echo "  Ctrl+C để dừng cả hai."
echo ""

# ── Chạy song song ────────────────────────────────────────────────────────────
# Prefix mỗi dòng log với nhãn màu để phân biệt
(cd "$BACKEND"  && pnpm dev 2>&1 | sed $'s/^/\033[34m[BE]\033[0m /') &
be_pid=$!

(cd "$FRONTEND" && pnpm dev 2>&1 | sed $'s/^/\033[32m[FE]\033[0m /') &
fe_pid=$!

# Chờ cả hai, exit ngay nếu một trong hai crash
wait "$be_pid" "$fe_pid"
