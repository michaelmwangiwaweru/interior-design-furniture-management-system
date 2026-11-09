import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card, Row, Col, Button, Spinner, Alert, Badge, Form,
  ButtonGroup, Table, ProgressBar, Tooltip as BSTooltip,
  OverlayTrigger, Modal, Nav,
} from "react-bootstrap";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, RadialBarChart, RadialBar, FunnelChart, Funnel,
  LabelList, ScatterChart, Scatter, ZAxis, ReferenceLine, Treemap,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

/* =========================================================================
   CONFIGURATION
   ========================================================================= */
const API_BASE = "http://localhost:9193/api";
const ENDPOINTS = {
  catalog: `${API_BASE}/catalog`,
  orders: `${API_BASE}/orders`,
  sales: `${API_BASE}/sales`,
  customerServices: `${API_BASE}/customer-services`,
  inventory: `${API_BASE}/inventory`,
};

// Configurable thresholds — clearly marked, not fabricated business data
const CONFIG = {
  lowStockThreshold: 5,          // units in inventory balance below which a material is low-stock
  outOfStockThreshold: 0,        // units <= this are out-of-stock
  targetMonthlyRevenue: 0,       // 0 = target not set (display N/A on scorecard)
  targetCollectionRate: 80,      // %
  targetCompletionRate: 85,      // %
  targetDeliveryRate: 70,        // %
};

const C = {
  navy: "#0f172a", navy2: "#172554", blue: "#1d4ed8", blue2: "#3b82f6",
  sky: "#0ea5e9", cyan: "#06b6d4", emerald: "#059669", green: "#10b981",
  lime: "#84cc16", amber: "#d97706", amber2: "#f59e0b", orange: "#ea580c",
  red: "#dc2626", rose: "#e11d48", purple: "#7c3aed", violet: "#8b5cf6",
  pink: "#db2777", slate: "#475569", slate2: "#64748b", slate3: "#94a3b8",
  bg: "#f1f5f9", card: "#ffffff", border: "#e2e8f0",
};

const PALETTE = [
  C.blue, C.emerald, C.amber2, C.purple, C.cyan, C.orange,
  C.pink, C.sky, C.lime, C.rose, C.violet, C.green,
];

/* =========================================================================
   UTILITIES
   ========================================================================= */
const num = (v) => (v === null || v === undefined || v === "" ? 0 : Number(v) || 0);
const fmt = (v) => num(v).toLocaleString("en-KE");
const money = (v) => `KSh ${num(v).toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
const moneyFull = (v) => `KSh ${num(v).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const compact = (v) => {
  const n = num(v);
  const a = Math.abs(n);
  if (a >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (a >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (a >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
};
const pct = (v) => `${num(v).toFixed(1)}%`;
const safeDiv = (a, b) => (b === 0 ? 0 : a / b);
// Percentage change is undefined when there is no previous-period baseline.
// Return null instead of inventing 100% growth when previous value is zero.
const changePct = (cur, prev) => (prev <= 0 ? null : ((cur - prev) / prev) * 100);
const parseDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};
const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const monthLabel = (d) => d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
const weekKey = (d) => {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const wk = Math.ceil((((t - y) / 86400000) + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(wk).padStart(2, "0")}`;
};
const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/* =========================================================================
   REUSABLE UI ATOMS
   ========================================================================= */
const NA = ({ text = "N/A — data not available" }) => (
  <span style={{ color: C.slate3, fontSize: 12, fontStyle: "italic" }}>{text}</span>
);

const KpiCard = ({
  label, value, subtitle, accent, icon, change, changeLabel,
  invertChange, unavailable, tooltip,
}) => {
  const hasChange = change !== undefined && change !== null && !unavailable;
  const positive = invertChange ? change <= 0 : change >= 0;
  const changeColor = !hasChange || change === 0 ? C.slate2 : positive ? C.emerald : C.red;

  const inner = (
    <Card className="h-100 border-0 executive-kpi" style={{
      borderRadius: 14, background: C.card,
      boxShadow: "0 2px 12px rgba(15,23,42,0.05)",
      border: `1px solid ${C.border}`, position: "relative", overflow: "hidden",
      opacity: unavailable ? 0.75 : 1,
    }}>
      <div style={{ height: 4, background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />
      <Card.Body className="p-3 p-md-4">
        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              color: C.slate2, fontSize: 11, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8,
            }}>
              {label}
            </div>
            <div style={{
              fontSize: "clamp(18px, 2.1vw, 26px)", fontWeight: 800,
              color: unavailable ? C.slate3 : C.navy, lineHeight: 1.1,
              overflowWrap: "anywhere", letterSpacing: "-0.5px",
            }}>
              {unavailable ? "N/A" : value}
            </div>
            {subtitle && (
              <div style={{ color: C.slate2, fontSize: 12, marginTop: 6 }}>
                {unavailable ? "Field missing in database" : subtitle}
              </div>
            )}
          </div>
          <div style={{
            width: 42, height: 42, minWidth: 42, borderRadius: 11,
            background: `${accent}14`, color: accent,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20,
          }}>
            {icon}
          </div>
        </div>
        {hasChange && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 11, fontWeight: 700, color: changeColor,
            background: positive ? "#ecfdf5" : "#fef2f2",
            padding: "4px 9px", borderRadius: 20, marginTop: 6,
          }}>
            {change === 0 ? "—" : change > 0 ? "▲" : "▼"}{" "}
            {Math.abs(change).toFixed(1)}%
            {changeLabel && (
              <span style={{ color: C.slate2, fontWeight: 500 }}>{" "}{changeLabel}</span>
            )}
          </span>
        )}
      </Card.Body>
    </Card>
  );

  return tooltip ? (
    <OverlayTrigger placement="top" overlay={<BSTooltip>{tooltip}</BSTooltip>}>
      <div style={{ height: "100%" }}>{inner}</div>
    </OverlayTrigger>
  ) : inner;
};

const SectionHeader = ({ number, title, subtitle, question, action }) => (
  <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3 mt-2">
    <div style={{ minWidth: 0 }}>
      <div className="d-flex align-items-center gap-2 mb-1">
        <span style={{
          background: C.navy, color: "#fff", fontSize: 10, fontWeight: 800,
          padding: "3px 8px", borderRadius: 6, letterSpacing: 1,
        }}>{number}</span>
        <h5 className="mb-0" style={{ fontWeight: 800, color: C.navy, fontSize: 17, letterSpacing: "-0.3px" }}>
          {title}
        </h5>
      </div>
      {subtitle && <div style={{ color: C.slate2, fontSize: 12.5, marginLeft: 2 }}>{subtitle}</div>}
      {question && (
        <div style={{ color: C.blue, fontSize: 12, marginTop: 4, fontWeight: 600, fontStyle: "italic" }}>
          ❓ {question}
        </div>
      )}
    </div>
    {action}
  </div>
);

const InsightCard = ({ type = "info", title, body, action, question }) => {
  const cfg = {
    success: { bg: "#f0fdf4", border: "#86efac", icon: "✅", color: "#166534" },
    warning: { bg: "#fffbeb", border: "#fcd34d", icon: "⚠️", color: "#92400e" },
    danger: { bg: "#fef2f2", border: "#fca5a5", icon: "🔴", color: "#991b1b" },
    info: { bg: "#eff6ff", border: "#93c5fd", icon: "💡", color: "#1e40af" },
    na: { bg: "#f8fafc", border: "#cbd5e1", icon: "❔", color: "#475569" },
  }[type] || { bg: "#f1f5f9", border: "#cbd5e1", icon: "ℹ️", color: "#334155" };

  return (
    <div style={{
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      borderRadius: 10, padding: "12px 14px", marginBottom: 10,
    }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ fontSize: 16 }}>{cfg.icon}</span>
        <div style={{ flex: 1 }}>
          {question && (
            <div style={{ fontSize: 10.5, color: cfg.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>
              {question}
            </div>
          )}
          <div style={{ fontWeight: 700, color: cfg.color, fontSize: 12.5, marginBottom: 3 }}>
            {title}
          </div>
          <div style={{ color: "#475569", fontSize: 12, lineHeight: 1.45 }}>{body}</div>
          {action && (
            <div style={{ color: cfg.color, fontSize: 11.5, marginTop: 6, fontWeight: 600 }}>
              → Action: {action}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ChartTooltip = ({ active, payload, label, currency, suffix }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(15,23,42,0.96)", color: "#fff", borderRadius: 10,
      padding: "10px 14px", boxShadow: "0 12px 32px rgba(0,0,0,0.3)",
      fontSize: 12, backdropFilter: "blur(8px)",
    }}>
      {label && <div style={{ fontWeight: 700, marginBottom: 6, color: "#e2e8f0" }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginTop: 3 }}>
          <span style={{ color: p.color || "#94a3b8" }}>{p.name || p.dataKey}</span>
          <span style={{ fontWeight: 700 }}>
            {currency ? money(num(p.value)) : fmt(p.value)}{suffix || ""}
          </span>
        </div>
      ))}
    </div>
  );
};

/* =========================================================================
   MAIN DASHBOARD
   ========================================================================= */
const ExecutiveDashboard = () => {
  const [data, setData] = useState({
    catalog: [], orders: [], sales: [], customerServices: [], inventory: [],
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [range, setRange] = useState("12m");
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState("overview");
  const [drill, setDrill] = useState(null); // drill-down modal

  /* ---------- FETCH ---------- */
  const fetchAll = useCallback(async () => {
    setRefreshing(true);
    const out = {}; const errs = {};
    await Promise.all(Object.entries(ENDPOINTS).map(async ([k, url]) => {
      try {
        const r = await fetch(url);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        out[k] = Array.isArray(j) ? j : [];
      } catch (e) {
        out[k] = [];
        errs[k] = e.message;
      }
    }));
    setData(out); setErrors(errs);
    setLastUpdated(new Date());
    setLoading(false); setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchAll();
    const t = setInterval(fetchAll, 180000);
    return () => clearInterval(t);
  }, [fetchAll]);

  /* ---------- DATE RANGE FILTER ---------- */
  const filtered = useMemo(() => {
    if (range === "all") return data;
    const now = new Date();
    const months = range === "3m" ? 3 : range === "6m" ? 6 : range === "12m" ? 12 : 24;
    const cutoff = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
    const within = (r) => {
      const d = parseDate(r.date);
      return d && d >= cutoff;
    };
    return {
      catalog: data.catalog,
      orders: data.orders.filter(within),
      sales: data.sales.filter(within),
      customerServices: data.customerServices.filter(within),
      inventory: data.inventory.filter(within),
    };
  }, [data, range]);

  /* ---------- CORE METRICS ---------- */
  const metrics = useMemo(() => {
    const sales = filtered.sales;
    const orders = filtered.orders;

    const revenue = sales.reduce((s, r) => s + num(r.totalPrice), 0);
    const units = sales.reduce((s, r) => s + num(r.quantity), 0);
    const avgTicket = safeDiv(revenue, sales.length);

    const ordersValue = orders.reduce((s, o) => s + num(o.totalPrice), 0);
    const collected = orders.reduce((s, o) => s + num(o.deposit), 0);
    const outstanding = orders.reduce((s, o) => s + num(o.balance), 0);
    const avgOrderValue = safeDiv(ordersValue, orders.length);

    const completedOrders = orders.filter(
      (o) => String(o.status || "").toLowerCase() === "completed"
    ).length;
    const cancelledOrders = orders.filter(
      (o) => String(o.status || "").toLowerCase() === "cancelled"
    ).length;
    const inProgressOrders = orders.length - completedOrders - cancelledOrders;

    const collectionRate = safeDiv(collected, ordersValue) * 100;
    const completionRate = safeDiv(completedOrders, orders.length) * 100;

    const deliveredSales = sales.filter(
      (s) => String(s.delivered || "").toLowerCase() === "delivered"
    ).length;
    const deliveryRate = safeDiv(deliveredSales, sales.length) * 100;

    const paidSales = sales.filter(
      (s) => String(s.paymentStatus || "").toLowerCase() === "paid"
    ).length;
    const paidRate = safeDiv(paidSales, sales.length) * 100;

    // MoM revenue trend
    const now = new Date();
    const thisMonth = sales.filter((s) => {
      const d = parseDate(s.date);
      return d && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).reduce((s, r) => s + num(r.totalPrice), 0);
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = sales.filter((s) => {
      const d = parseDate(s.date);
      return d && d.getFullYear() === prevMonthDate.getFullYear() && d.getMonth() === prevMonthDate.getMonth();
    }).reduce((s, r) => s + num(r.totalPrice), 0);
    const revenueMoM = changePct(thisMonth, prevMonth);

    return {
      revenue, units, avgTicket,
      ordersValue, collected, outstanding, avgOrderValue,
      completedOrders, cancelledOrders, inProgressOrders,
      collectionRate, completionRate, deliveryRate, paidRate,
      thisMonth, prevMonth, revenueMoM,
      salesCount: sales.length,
      ordersCount: orders.length,
    };
  }, [filtered]);

  /* ---------- MISSING FIELD DETECTION ---------- */
  const capabilities = useMemo(() => {
    const sampleCatalog = filtered.catalog[0] || {};
    const sampleSales = filtered.sales[0] || {};
    const sampleInventory = filtered.inventory[0] || {};
    return {
      hasCostPrice:
        "costPrice" in sampleCatalog || "cost_price" in sampleCatalog ||
        "buyingPrice" in sampleCatalog || "cost" in sampleCatalog,
      hasInventoryUnitPrice:
        "unitPrice" in sampleInventory || "costPrice" in sampleInventory,
      hasMinStock:
        "minStock" in sampleInventory || "reorderLevel" in sampleInventory,
      hasPaymentMethod:
        "paymentMethod" in sampleSales || "method" in sampleSales,
      hasExpenses: false, // no expenses endpoint configured
    };
  }, [filtered]);

  /* ---------- PREVIOUS PERIOD COMPARISON ---------- */
  const comparison = useMemo(() => {
    if (range === "all") return null;
    const now = new Date();
    const months = range === "3m" ? 3 : range === "6m" ? 6 : range === "12m" ? 12 : 24;
    const curStart = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
    const prevStart = new Date(now.getFullYear(), now.getMonth() - months * 2 + 1, 1);

    const filterBy = (arr, start, end) =>
      arr.filter((r) => {
        const d = parseDate(r.date);
        return d && d >= start && (!end || d < end);
      });

    const curSales = filterBy(data.sales, curStart);
    const prevSales = filterBy(data.sales, prevStart, curStart);
    const curOrders = filterBy(data.orders, curStart);
    const prevOrders = filterBy(data.orders, prevStart, curStart);

    return {
      revenue: changePct(
        curSales.reduce((s, r) => s + num(r.totalPrice), 0),
        prevSales.reduce((s, r) => s + num(r.totalPrice), 0)
      ),
      salesCount: changePct(curSales.length, prevSales.length),
      ordersCount: changePct(curOrders.length, prevOrders.length),
      orderValue: changePct(
        curOrders.reduce((s, o) => s + num(o.totalPrice), 0),
        prevOrders.reduce((s, o) => s + num(o.totalPrice), 0)
      ),
    };
  }, [data, range]);

  /* ---------- MONTHLY TREND ---------- */
  const monthlyTrend = useMemo(() => {
    const map = {};
    const ensure = (d) => {
      const k = monthKey(d);
      if (!map[k]) map[k] = { key: k, label: monthLabel(d), revenue: 0, orders: 0, orderValue: 0, services: 0, units: 0 };
      return map[k];
    };
    filtered.sales.forEach((s) => {
      const d = parseDate(s.date); if (!d) return;
      const m = ensure(d);
      m.revenue += num(s.totalPrice);
      m.units += num(s.quantity);
    });
    filtered.orders.forEach((o) => {
      const d = parseDate(o.date); if (!d) return;
      const m = ensure(d);
      m.orders += 1;
      m.orderValue += num(o.totalPrice);
    });
    filtered.customerServices.forEach((c) => {
      const d = parseDate(c.date); if (!d) return;
      ensure(d).services += 1;
    });
    return Object.values(map).sort((a, b) => a.key.localeCompare(b.key));
  }, [filtered]);

  /* ---------- DAILY TREND (last 30 days) ---------- */
  const dailyTrend = useMemo(() => {
    const map = {};
    const cutoff = new Date(Date.now() - 30 * 86400000);
    filtered.sales.forEach((s) => {
      const d = parseDate(s.date); if (!d || d < cutoff) return;
      const k = dayKey(d);
      if (!map[k]) map[k] = { key: k, label: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }), revenue: 0, count: 0 };
      map[k].revenue += num(s.totalPrice);
      map[k].count += 1;
    });
    return Object.values(map).sort((a, b) => a.key.localeCompare(b.key));
  }, [filtered.sales]);

  /* ---------- WEEKLY TREND ---------- */
  const weeklyTrend = useMemo(() => {
    const map = {};
    filtered.sales.forEach((s) => {
      const d = parseDate(s.date); if (!d) return;
      const k = weekKey(d);
      if (!map[k]) map[k] = { key: k, label: k.split("-")[1], revenue: 0, count: 0 };
      map[k].revenue += num(s.totalPrice);
      map[k].count += 1;
    });
    return Object.values(map).sort((a, b) => a.key.localeCompare(b.key)).slice(-12);
  }, [filtered.sales]);

  /* ---------- YEARLY TREND ---------- */
  const yearlyTrend = useMemo(() => {
    const map = {};
    filtered.sales.forEach((s) => {
      const d = parseDate(s.date); if (!d) return;
      const k = String(d.getFullYear());
      if (!map[k]) map[k] = { key: k, label: k, revenue: 0, count: 0 };
      map[k].revenue += num(s.totalPrice);
      map[k].count += 1;
    });
    return Object.values(map).sort((a, b) => a.key.localeCompare(b.key));
  }, [filtered.sales]);

  /* ---------- PRODUCT ANALYTICS ---------- */
  const productStats = useMemo(() => {
    const map = {};
    filtered.sales.forEach((s) => {
      const key = (s.itemSold || "Unnamed").trim();
      if (!map[key]) map[key] = { name: key, revenue: 0, units: 0, count: 0 };
      map[key].revenue += num(s.totalPrice);
      map[key].units += num(s.quantity);
      map[key].count += 1;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [filtered.sales]);

  const topProducts = productStats.slice(0, 10);

  /* ---------- CATEGORY ANALYTICS ---------- */
  const categoryStats = useMemo(() => {
    // Map product name -> category via catalog
    const productCat = {};
    filtered.catalog.forEach((c) => {
      if (c.name) productCat[c.name.trim().toLowerCase()] = (c.category || "Uncategorized").trim();
    });
    const map = {};
    filtered.sales.forEach((s) => {
      const name = (s.itemSold || "").trim().toLowerCase();
      const cat = productCat[name] || "Uncategorized";
      if (!map[cat]) map[cat] = { name: cat, revenue: 0, units: 0, count: 0 };
      map[cat].revenue += num(s.totalPrice);
      map[cat].units += num(s.quantity);
      map[cat].count += 1;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [filtered.sales, filtered.catalog]);

  /* ---------- ORDER STATUS ---------- */
  const orderStatusData = useMemo(() => {
    const map = {};
    filtered.orders.forEach((o) => {
      const k = o.status || "Unknown";
      map[k] = (map[k] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered.orders]);

  /* ---------- PRODUCTION FUNNEL ---------- */
  const productionFunnel = useMemo(() => {
    const stages = ["Cutting", "Assembly", "Finishing"];
    const out = stages.map((stage) => ({
      name: stage,
      value: filtered.orders.filter((o) => String(o.stage || "").toLowerCase() === stage.toLowerCase()).length,
    }));
    out.push({
      name: "Completed",
      value: filtered.orders.filter((o) => String(o.status || "").toLowerCase() === "completed").length,
    });
    return out;
  }, [filtered.orders]);

  /* ---------- OVERDUE ORDERS ---------- */
  const overdueOrders = useMemo(() => {
    const now = new Date();
    return filtered.orders.filter((o) => {
      if (String(o.status || "").toLowerCase() === "completed") return false;
      const due = parseDate(o.expectedFinishDate);
      return due && due < now;
    });
  }, [filtered.orders]);

  /* ---------- ORDER FULFILMENT TIME ---------- */
  const fulfilmentTime = useMemo(() => {
    const durations = [];
    filtered.orders.forEach((o) => {
      const start = parseDate(o.date);
      const end = parseDate(o.actualCompletionDate);
      if (start && end && end >= start) {
        durations.push((end - start) / 86400000);
      }
    });
    if (durations.length === 0) return null;
    const sum = durations.reduce((a, b) => a + b, 0);
    return {
      avg: sum / durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      count: durations.length,
    };
  }, [filtered.orders]);

  /* ---------- INVENTORY ---------- */
  const inventoryStats = useMemo(() => {
    const map = {};
    filtered.inventory.forEach((r) => {
      const k = (r.materialName || "Unknown").trim();
      if (!map[k]) map[k] = { name: k, out: 0, balance: 0, units: r.units || "", records: 0 };
      map[k].out += num(r.quantityOut);
      map[k].balance += num(r.balance);
      map[k].records += 1;
    });
    const arr = Object.values(map).sort((a, b) => b.balance - a.balance);
    const lowStock = arr.filter((m) => m.balance > CONFIG.outOfStockThreshold && m.balance <= CONFIG.lowStockThreshold);
    const outOfStock = arr.filter((m) => m.balance <= CONFIG.outOfStockThreshold);
    return { items: arr, lowStock, outOfStock };
  }, [filtered.inventory]);

  /* ---------- CUSTOMER ANALYTICS ---------- */
  const customerStats = useMemo(() => {
    // Two views: registered customers (from sales records) and named customers
    const map = {};
    filtered.sales.forEach((s) => {
      const name = (s.customerName || "").trim();
      const phone = (s.phoneNo || "").trim();
      if (!name && !phone) return;
      const key = (name || phone).toLowerCase();
      if (!map[key]) map[key] = {
        name: name || "Unnamed",
        phone,
        orders: 0, revenue: 0, firstDate: null, lastDate: null, items: new Set(),
      };
      const c = map[key];
      c.orders += 1;
      c.revenue += num(s.totalPrice);
      if (s.itemSold) c.items.add(s.itemSold.trim());
      const d = parseDate(s.date);
      if (d) {
        if (!c.firstDate || d < c.firstDate) c.firstDate = d;
        if (!c.lastDate || d > c.lastDate) c.lastDate = d;
      }
    });
    const arr = Object.values(map).map((c) => ({ ...c, itemCount: c.items.size }))
      .sort((a, b) => b.revenue - a.revenue);
    const returning = arr.filter((c) => c.orders > 1).length;
    const newCustomers = arr.filter((c) => c.orders === 1).length;
    const totalRevenue = arr.reduce((s, c) => s + c.revenue, 0);
    const avgSpend = safeDiv(totalRevenue, arr.length);
    return {
      total: arr.length, returning, newCustomers, avgSpend, top: arr.slice(0, 8), all: arr,
    };
  }, [filtered.sales]);

  /* ---------- STAFF PERFORMANCE ---------- */
  const staffStats = useMemo(() => {
    const map = {};
    filtered.sales.forEach((s) => {
      const p = (s.salesPerson || "Unassigned").trim();
      if (!map[p]) map[p] = { name: p, revenue: 0, salesCount: 0, units: 0 };
      map[p].revenue += num(s.totalPrice);
      map[p].salesCount += 1;
      map[p].units += num(s.quantity);
    });
    const arr = Object.values(map).sort((a, b) => b.revenue - a.revenue);
    const total = arr.reduce((s, r) => s + r.revenue, 0);
    return arr.map((p) => ({ ...p, share: safeDiv(p.revenue, total) * 100 }));
  }, [filtered.sales]);

  /* ---------- CUSTOMER SERVICES ---------- */
  const serviceStats = useMemo(() => {
    const total = filtered.customerServices.length;
    const resolved = filtered.customerServices.filter((c) => c.feedback && c.feedback.trim() !== "").length;
    return { total, resolved, unresolved: total - resolved, resolutionRate: safeDiv(resolved, total) * 100 };
  }, [filtered.customerServices]);

  /* ---------- PAYMENT METHOD BREAKDOWN (only if field exists) ---------- */
  const paymentMethodData = useMemo(() => {
    if (!capabilities.hasPaymentMethod) return null;
    const map = {};
    filtered.sales.forEach((s) => {
      const k = s.paymentMethod || s.method || "Unknown";
      map[k] = (map[k] || 0) + num(s.totalPrice);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered.sales, capabilities.hasPaymentMethod]);

  /* ---------- PAYMENT STATUS DISTRIBUTION ---------- */
  const paymentStatusData = useMemo(() => {
    const map = {};
    filtered.sales.forEach((s) => {
      const k = s.paymentStatus || "Not specified";
      map[k] = (map[k] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered.sales]);

  /* ---------- BUSINESS INSIGHTS ---------- */
  const insights = useMemo(() => {
    const arr = [];

    // 1. Restock urgency
    if (inventoryStats.outOfStock.length > 0) {
      arr.push({
        type: "danger",
        question: "What needs restocking?",
        title: `${inventoryStats.outOfStock.length} material(s) are out of stock`,
        body: `${inventoryStats.outOfStock.slice(0, 3).map((m) => m.name).join(", ")}${inventoryStats.outOfStock.length > 3 ? " and more" : ""} have zero balance.`,
        action: "Raise a restock purchase order today to avoid production delays.",
      });
    }
    if (inventoryStats.lowStock.length > 0) {
      arr.push({
        type: "warning",
        question: "Which materials need attention?",
        title: `${inventoryStats.lowStock.length} material(s) are low in stock (≤ ${CONFIG.lowStockThreshold} units)`,
        body: `${inventoryStats.lowStock.slice(0, 3).map((m) => m.name).join(", ")} are near depletion.`,
        action: "Schedule restocking before the next production cycle.",
      });
    }

    // 2. Revenue trend
    if (metrics.revenueMoM !== null && metrics.revenueMoM > 5) {
      arr.push({
        type: "success", question: "Are sales increasing?",
        title: `Revenue is trending up ${metrics.revenueMoM.toFixed(1)}% MoM`,
        body: `This month generated ${money(metrics.thisMonth)} vs ${money(metrics.prevMonth)} last month.`,
        action: "Maintain momentum — increase stock of best sellers.",
      });
    } else if (metrics.revenueMoM !== null && metrics.revenueMoM < -5) {
      arr.push({
        type: "danger", question: "Are sales decreasing?",
        title: `Revenue is trending down ${Math.abs(metrics.revenueMoM).toFixed(1)}% MoM`,
        body: `This month generated ${money(metrics.thisMonth)} vs ${money(metrics.prevMonth)} last month.`,
        action: "Review pricing, run promotions, or contact inactive customers.",
      });
    }

    // 3. Collection rate
    if (metrics.collectionRate < CONFIG.targetCollectionRate) {
      arr.push({
        type: "warning", question: "How much cash has actually been collected?",
        title: `Collection rate is ${pct(metrics.collectionRate)} — below ${CONFIG.targetCollectionRate}% target`,
        body: `${money(metrics.outstanding)} is outstanding across ${metrics.ordersCount} orders.`,
        action: "Follow up on outstanding balances with customers who have pending payments.",
      });
    } else {
      arr.push({
        type: "success", question: "How healthy is cash collection?",
        title: `Collection rate is strong at ${pct(metrics.collectionRate)}`,
        body: `${money(metrics.collected)} collected; ${money(metrics.outstanding)} outstanding.`,
      });
    }

    // 4. Order backlog
    if (metrics.inProgressOrders > metrics.completedOrders) {
      arr.push({
        type: "warning", question: "Are we keeping up with orders?",
        title: "Order backlog is growing",
        body: `${metrics.inProgressOrders} orders still in progress vs ${metrics.completedOrders} completed.`,
        action: "Review workshop capacity and assign additional staff to production.",
      });
    }

    // 5. Overdue orders
    if (overdueOrders.length > 0) {
      arr.push({
        type: "danger", question: "Which orders are overdue?",
        title: `${overdueOrders.length} order(s) past expected finish date`,
        body: `Combined order value: ${money(overdueOrders.reduce((s, o) => s + num(o.totalPrice), 0))}.`,
        action: "Contact those customers with a recovery plan and prioritize their completion.",
      });
    }

    // 6. Best seller
    if (topProducts.length > 0) {
      arr.push({
        type: "info", question: "What should we promote?",
        title: `Top product: ${topProducts[0].name}`,
        body: `Generated ${money(topProducts[0].revenue)} across ${topProducts[0].count} sales (${fmt(topProducts[0].units)} units).`,
        action: "Feature prominently in marketing and ensure stock availability.",
      });
    }

    // 7. Concentration risk
    if (staffStats.length > 0 && staffStats[0].share > 60) {
      arr.push({
        type: "warning", question: "Any team risk?",
        title: `${staffStats[0].name} handles ${staffStats[0].share.toFixed(1)}% of revenue`,
        body: "High concentration creates continuity risk if this person is unavailable.",
        action: "Cross-train other staff and redistribute some accounts.",
      });
    }

    // 8. Profitability — always N/A if no cost data
    if (!capabilities.hasCostPrice) {
      arr.push({
        type: "na", question: "What is our gross profit?",
        title: "Gross profit cannot be calculated",
        body: "The catalog table has no cost price field, and there is no expenses table configured.",
        action: "Add a `costPrice` column to the catalog and expose it via the API to enable profit analytics.",
      });
    }

    // 9. Customer analytics
    if (customerStats.total > 0) {
      arr.push({
        type: "info", question: "Who are our best customers?",
        title: `${customerStats.total} unique customers · ${customerStats.returning} returning`,
        body: `Top customer: ${customerStats.top[0]?.name} — ${money(customerStats.top[0]?.revenue)}. Average spend: ${money(customerStats.avgSpend)}.`,
        action: customerStats.returning < customerStats.newCustomers
          ? "Introduce a loyalty scheme to convert first-time buyers into repeat customers."
          : "Continue nurturing repeat customers — they drive the majority of revenue.",
      });
    }

    return arr;
  }, [metrics, inventoryStats, overdueOrders, topProducts, staffStats, customerStats, capabilities]);

  /* ---------- SCORECARD ---------- */
  const scorecard = useMemo(() => [
    { label: "Revenue Growth (MoM)", value: metrics.revenueMoM, target: 5, unit: "%", na: metrics.revenueMoM === null },
    { label: "Collection Rate", value: metrics.collectionRate, target: CONFIG.targetCollectionRate, unit: "%", na: false },
    { label: "Order Completion", value: metrics.completionRate, target: CONFIG.targetCompletionRate, unit: "%", na: false },
    { label: "Delivery Rate", value: metrics.deliveryRate, target: CONFIG.targetDeliveryRate, unit: "%", na: false },
    { label: "Service Resolution", value: serviceStats.resolutionRate, target: 80, unit: "%", na: false },
    { label: "Gross Profit Margin", value: null, target: 30, unit: "%", na: true },
  ], [metrics, serviceStats]);

  /* ---------- DRILL-DOWN ---------- */
  const openDrill = (kind, payload) => setDrill({ kind, payload });

  /* =========================================================================
     EXPORTS
     ========================================================================= */
  const rangeLabel = {
    "3m": "Last 3 Months", "6m": "Last 6 Months",
    "12m": "Last 12 Months", "24m": "Last 24 Months", all: "All Time",
  }[range];

  const exportPDF = () => {
    const doc = new jsPDF("landscape", "mm", "a4");
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();

    // Cover
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pw, ph, "F");
    doc.setFillColor(29, 78, 216);
    doc.rect(0, ph - 60, pw, 60, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text("WHITEWISE INTERIOR FURNITURE", 20, 40);
    doc.setFontSize(38); doc.setFont("helvetica", "bold");
    doc.text("Executive", 20, 80);
    doc.setFontSize(32); doc.text("Business Review", 20, 98);
    doc.setFontSize(12); doc.setFont("helvetica", "normal");
    doc.setTextColor(203, 213, 225);
    doc.text("Board-Ready Performance Report", 20, 118);
    doc.setDrawColor(148, 163, 184); doc.setLineWidth(0.4);
    doc.line(20, 130, 90, 130);
    doc.setFontSize(11); doc.setTextColor(255, 255, 255);
    doc.text(`Reporting Period: ${rangeLabel}`, 20, ph - 45);
    doc.text(`Generated: ${new Date().toLocaleString("en-GB")}`, 20, ph - 38);
    doc.text("Prepared for: Board of Directors", 20, ph - 31);

    // Executive Summary
    doc.addPage();
    autoTable(doc, {
      startY: 20, theme: "plain",
      head: [["EXECUTIVE SUMMARY"]],
      body: [[`Performance overview for ${rangeLabel.toLowerCase()}. Data gaps are clearly flagged.`]],
      headStyles: { fontSize: 20, fontStyle: "bold", textColor: [15, 23, 42] },
      bodyStyles: { fontSize: 11, textColor: [71, 85, 105] },
    });

    autoTable(doc, {
      startY: 40,
      head: [["Metric", "Value", "Status / Context"]],
      body: [
        ["Total Revenue", moneyFull(metrics.revenue), `${metrics.salesCount} transactions`],
        ["Average Ticket", moneyFull(metrics.avgTicket), "Per sales transaction"],
        ["Orders Booked", fmt(metrics.ordersCount), `${money(metrics.ordersValue)} total value`],
        ["Completed Orders", fmt(metrics.completedOrders), `${pct(metrics.completionRate)} completion`],
        ["Payments Collected", money(metrics.collected), `${pct(metrics.collectionRate)} collection rate`],
        ["Outstanding Payments", money(metrics.outstanding), "Pending collection"],
        ["Order Completion Rate", pct(metrics.completionRate), `${CONFIG.targetCompletionRate}% target`],
        ["Delivery Rate", pct(metrics.deliveryRate), `${CONFIG.targetDeliveryRate}% target`],
        ["Customer Services", fmt(serviceStats.total), `${pct(serviceStats.resolutionRate)} resolved`],
        ["Total Inventory Balance", fmt(inventoryStats.items.reduce((s, m) => s + m.balance, 0)), "Units across all materials"],
        ["Low-Stock Materials", fmt(inventoryStats.lowStock.length), `Balance ≤ ${CONFIG.lowStockThreshold}`],
        ["Out-of-Stock Materials", fmt(inventoryStats.outOfStock.length), "Balance = 0"],
        ["Total Inventory Value", "N/A", "Cost price not captured in inventory"],
        ["Gross Profit", "N/A", "Cost price missing on catalog"],
        ["Gross Profit Margin", "N/A", "Cost price missing on catalog"],
        ["Net Profit", "N/A", "No expenses table"],
        ["Payment Methods", "N/A", "paymentMethod field missing"],
      ],
      theme: "striped",
      headStyles: { fillColor: [29, 78, 216], fontSize: 10 },
      bodyStyles: { fontSize: 9.5 },
      columnStyles: { 0: { fontStyle: "bold" } },
    });

    // Monthly trend
    let y = doc.lastAutoTable.finalY + 8;
    doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
    doc.text("Month-over-Month Performance", 14, y);
    autoTable(doc, {
      startY: y + 4,
      head: [["Month", "Revenue", "Orders", "Order Value", "Units Sold"]],
      body: monthlyTrend.map((m) => [m.label, fmt(m.revenue), m.orders, fmt(m.orderValue), fmt(m.units)]),
      theme: "grid",
      headStyles: { fillColor: [5, 150, 105], fontSize: 10 },
      bodyStyles: { fontSize: 9 },
    });

    // Top products
    y = doc.lastAutoTable.finalY + 8;
    doc.text("Top 10 Products by Revenue", 14, y);
    autoTable(doc, {
      startY: y + 4,
      head: [["Rank", "Product", "Revenue", "Units", "Transactions", "Gross Profit"]],
      body: topProducts.map((p, i) => [i + 1, p.name, fmt(p.revenue), fmt(p.units), p.count, "N/A"]),
      theme: "striped",
      headStyles: { fillColor: [124, 58, 237], fontSize: 10 },
      bodyStyles: { fontSize: 9 },
    });

    // Staff
    y = doc.lastAutoTable.finalY + 8;
    if (y > ph - 60) { doc.addPage(); y = 20; }
    doc.text("Sales Team Performance", 14, y);
    autoTable(doc, {
      startY: y + 4,
      head: [["Rank", "Team Member", "Revenue", "Transactions", "Share %"]],
      body: staffStats.map((p, i) => [i + 1, p.name, fmt(p.revenue), p.salesCount, pct(p.share)]),
      theme: "striped",
      headStyles: { fillColor: [217, 119, 6], fontSize: 10 },
      bodyStyles: { fontSize: 9 },
    });

    // Inventory
    y = doc.lastAutoTable.finalY + 8;
    if (y > ph - 60) { doc.addPage(); y = 20; }
    doc.text("Inventory — Low and Out of Stock", 14, y);
    autoTable(doc, {
      startY: y + 4,
      head: [["Material", "Quantity Out", "Balance", "Status"]],
      body: [...inventoryStats.outOfStock.map((m) => [m.name, m.out, m.balance, "OUT OF STOCK"]),
             ...inventoryStats.lowStock.map((m) => [m.name, m.out, m.balance, "LOW"])],
      theme: "grid",
      headStyles: { fillColor: [220, 38, 38], fontSize: 10 },
      bodyStyles: { fontSize: 9 },
    });

    // Insights
    doc.addPage();
    doc.setFontSize(16); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
    doc.text("Board Insights & Recommended Actions", 14, 20);
    let iy = 30;
    insights.forEach((ins, i) => {
      if (iy > ph - 40) { doc.addPage(); iy = 20; }
      const colors = {
        success: [220, 252, 231], warning: [254, 243, 199],
        danger: [254, 226, 226], info: [219, 234, 254], na: [241, 245, 249],
      }[ins.type] || [241, 245, 249];
      doc.setFillColor(...colors);
      doc.rect(14, iy - 5, pw - 28, 22, "F");
      doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
      doc.text(`${i + 1}. ${ins.title}`, 18, iy + 2);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(71, 85, 105);
      const lines = doc.splitTextToSize(ins.body, pw - 40);
      doc.text(lines, 18, iy + 7);
      if (ins.action) {
        doc.setFont("helvetica", "italic");
        doc.text(`→ ${ins.action}`, 18, iy + 12 + lines.length * 4);
      }
      iy += Math.max(26, 14 + lines.length * 4);
    });

    // Footers
    const pages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.3);
      doc.line(14, ph - 12, pw - 14, ph - 12);
      doc.setFontSize(8); doc.setTextColor(148, 163, 184);
      doc.text("Whitewise Interior Furniture — Confidential", 14, ph - 7);
      doc.text(`Page ${i} of ${pages}`, pw - 14, ph - 7, { align: "right" });
    }
    doc.save(`Executive_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ["WHITEWISE INTERIOR FURNITURE"],
      ["Executive Business Dashboard"],
      [`Generated: ${new Date().toLocaleString()}`],
      [`Period: ${rangeLabel}`],
      [],
      ["KPI", "Value", "Status / Context"],
      ["Total Revenue (KSh)", metrics.revenue, `${metrics.salesCount} transactions`],
      ["Average Ticket (KSh)", metrics.avgTicket, "Per sale"],
      ["Orders Booked (KSh)", metrics.ordersValue, `${metrics.ordersCount} orders`],
      ["Collected (KSh)", metrics.collected, `${pct(metrics.collectionRate)} rate`],
      ["Outstanding (KSh)", metrics.outstanding, "Pending"],
      ["Completed Orders", metrics.completedOrders, pct(metrics.completionRate)],
      ["Cancelled Orders", metrics.cancelledOrders, ""],
      ["In Progress", metrics.inProgressOrders, ""],
      ["Delivery Rate %", metrics.deliveryRate, ""],
      ["Customer Services", serviceStats.total, pct(serviceStats.resolutionRate)],
      ["Low-Stock Materials", inventoryStats.lowStock.length, `≤ ${CONFIG.lowStockThreshold}`],
      ["Out-of-Stock Materials", inventoryStats.outOfStock.length, "Balance = 0"],
      ["Total Inventory Value", "N/A", "Cost price not captured"],
      ["Gross Profit", "N/A", "Cost price not captured"],
      ["Net Profit", "N/A", "No expenses table"],
    ]), "Executive Summary");

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      monthlyTrend.map((m) => ({
        Month: m.label, Revenue: m.revenue, Orders: m.orders,
        "Order Value": m.orderValue, "Units Sold": m.units, Services: m.services,
      }))
    ), "Monthly Trend");

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      dailyTrend.map((d) => ({ Date: d.label, Revenue: d.revenue, Sales: d.count }))
    ), "Daily Trend");

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      weeklyTrend.map((w) => ({ Week: w.label, Revenue: w.revenue, Sales: w.count }))
    ), "Weekly Trend");

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      yearlyTrend.map((y) => ({ Year: y.label, Revenue: y.revenue, Sales: y.count }))
    ), "Yearly Trend");

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      topProducts.map((p, i) => ({
        Rank: i + 1, Product: p.name, Revenue: p.revenue,
        Units: p.units, Transactions: p.count, "Gross Profit": "N/A",
      }))
    ), "Top Products");

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      categoryStats.map((c) => ({
        Category: c.name, Revenue: c.revenue, Units: c.units, Sales: c.count,
      }))
    ), "Categories");

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      staffStats.map((p, i) => ({
        Rank: i + 1, "Team Member": p.name, Revenue: p.revenue,
        Transactions: p.salesCount, Units: p.units, "Share %": p.share.toFixed(2),
      }))
    ), "Staff Performance");

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      customerStats.all.map((c, i) => ({
        Rank: i + 1, Customer: c.name, Phone: c.phone,
        Orders: c.orders, Revenue: c.revenue,
        "First Purchase": c.firstDate?.toISOString().slice(0, 10) || "",
        "Last Purchase": c.lastDate?.toISOString().slice(0, 10) || "",
        "Distinct Items": c.itemCount,
      }))
    ), "Customers");

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      inventoryStats.items.map((m) => ({
        Material: m.name, "Quantity Out": m.out, Balance: m.balance,
        Units: m.units, Records: m.records,
        Status: m.balance <= 0 ? "OUT OF STOCK" : m.balance <= CONFIG.lowStockThreshold ? "LOW" : "OK",
      }))
    ), "Inventory");

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      insights.map((i, idx) => ({
        "#": idx + 1, Question: i.question || "", Type: i.type.toUpperCase(),
        Finding: i.title, Detail: i.body, "Recommended Action": i.action || "",
      }))
    ), "Insights");

    XLSX.writeFile(wb, `Executive_Dashboard_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  /* =========================================================================
     RENDER HELPERS
     ========================================================================= */
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: C.bg, display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <Spinner animation="border" style={{ color: C.blue, width: 60, height: 60 }} />
        <div style={{ marginTop: 20, color: C.navy, fontWeight: 700, fontSize: 15 }}>
          Loading executive analytics...
        </div>
      </div>
    );
  }

  const renderDrill = () => {
    if (!drill) return null;
    const { kind, payload } = drill;
    let title = "", body = null;

    if (kind === "product") {
      const p = payload;
      title = `${p.name} — Detail`;
      const rows = filtered.sales.filter((s) => (s.itemSold || "").trim() === p.name);
      body = (
        <Table size="sm" responsive hover>
          <thead><tr><th>Date</th><th>Customer</th><th>Phone</th><th>Qty</th><th>Unit</th><th>Total</th><th>Salesperson</th></tr></thead>
          <tbody>
            {rows.map((s, i) => (
              <tr key={i}>
                <td>{s.date || "—"}</td>
                <td>{s.customerName || "—"}</td>
                <td>{s.phoneNo || "—"}</td>
                <td>{s.quantity}</td>
                <td>{money(s.unitPrice)}</td>
                <td><strong>{money(s.totalPrice)}</strong></td>
                <td>{s.salesPerson || "—"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      );
    } else if (kind === "customer") {
      const c = payload;
      title = `${c.name} — Purchase History`;
      const rows = filtered.sales.filter((s) => {
        const nameMatch = (s.customerName || "").toLowerCase() === c.name.toLowerCase();
        const phoneMatch = c.phone && (s.phoneNo || "") === c.phone;
        return nameMatch || phoneMatch;
      });
      body = (
        <>
          <div className="mb-3" style={{ fontSize: 13 }}>
            <strong>Total spent:</strong> {money(c.revenue)} · <strong>Orders:</strong> {c.orders}
            {c.phone && <> · <strong>Phone:</strong> {c.phone}</>}
          </div>
          <Table size="sm" responsive hover>
            <thead><tr><th>Date</th><th>Item</th><th>Qty</th><th>Total</th><th>Payment</th><th>Delivery</th></tr></thead>
            <tbody>
              {rows.map((s, i) => (
                <tr key={i}>
                  <td>{s.date || "—"}</td>
                  <td>{s.itemSold || "—"}</td>
                  <td>{s.quantity}</td>
                  <td><strong>{money(s.totalPrice)}</strong></td>
                  <td>{s.paymentStatus || "—"}</td>
                  <td>{s.delivered || "—"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      );
    } else if (kind === "material") {
      const m = payload;
      title = `${m.name} — Inventory Movement`;
      const rows = filtered.inventory.filter((r) => (r.materialName || "").trim() === m.name);
      body = (
        <Table size="sm" responsive hover>
          <thead><tr><th>Date</th><th>Issued To</th><th>Purpose</th><th>Qty Out</th><th>Balance</th><th>Approved</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.date || "—"}</td>
                <td>{r.issuedTo || "—"}</td>
                <td>{r.purpose || "—"}</td>
                <td>{r.quantityOut}</td>
                <td>{r.balance}</td>
                <td>{r.approvedBy || "—"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      );
    }

    return (
      <Modal show onHide={() => setDrill(null)} size="lg" centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: 16, fontWeight: 700 }}>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{body}</Modal.Body>
      </Modal>
    );
  };

  /* =========================================================================
     MAIN RENDER
     ========================================================================= */
  return (
    <div className="executive-dashboard" style={{
      minHeight: "100vh", background: C.bg,
      padding: "clamp(12px, 2vw, 24px)", color: "#1e293b",
    }}>
      <style>{`
        .executive-kpi { transition: all .25s ease; }
        .executive-kpi:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(15,23,42,0.1) !important; }
        .exec-tabs .btn { border-radius: 8px; font-size: 12.5px; font-weight: 600; padding: 7px 14px; }
        .exec-select { border-radius: 8px !important; font-size: 13px !important; font-weight: 600 !important; border-color: ${C.border} !important; min-height: 38px; min-width: 140px; }
        .card:hover { box-shadow: 0 8px 24px rgba(15,23,42,0.08); }
        @media print { .no-print { display: none !important; } @page { size: A4 landscape; margin: 10mm; } }
      `}</style>

      <div style={{ maxWidth: 1900, margin: "0 auto" }}>
        {/* HEADER */}
        <div style={{
          background: `linear-gradient(125deg, ${C.navy} 0%, ${C.navy2} 55%, ${C.blue} 100%)`,
          borderRadius: 16, padding: "clamp(18px, 2.5vw, 28px) clamp(20px, 3vw, 32px)",
          color: "#fff", marginBottom: 20, position: "relative", overflow: "hidden",
          boxShadow: "0 12px 32px rgba(15,23,42,0.18)",
        }}>
          <div className="d-flex flex-column flex-xl-row justify-content-between align-items-xl-center gap-3">
            <div>
              <div style={{
                fontSize: 10.5, fontWeight: 700, letterSpacing: 2.5,
                color: "#93c5fd", textTransform: "uppercase", marginBottom: 6,
              }}>
                WHITEWISE INTERIOR FURNITURE · BOARD REPORT
              </div>
              <h1 className="mb-2" style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, letterSpacing: "-0.8px", lineHeight: 1.1 }}>
                Executive Performance Dashboard
              </h1>
              <div className="d-flex flex-wrap align-items-center gap-3" style={{ fontSize: 12.5, color: "#cbd5e1" }}>
                <span>📊 {rangeLabel}</span>
                <span>🕒 {lastUpdated?.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                <span style={{ color: refreshing ? "#fbbf24" : "#34d399", fontWeight: 700 }}>
                  {refreshing ? "◉ Syncing" : "● Live"}
                </span>
              </div>
            </div>
            <div className="d-flex flex-wrap gap-2 no-print">
              <Form.Select value={range} onChange={(e) => setRange(e.target.value)} className="exec-select" style={{ background: "rgba(255,255,255,0.95)" }}>
                <option value="3m">Last 3 Months</option>
                <option value="6m">Last 6 Months</option>
                <option value="12m">Last 12 Months</option>
                <option value="24m">Last 24 Months</option>
                <option value="all">All Time</option>
              </Form.Select>
              <Button variant="outline-light" size="sm" onClick={fetchAll} disabled={refreshing} style={{ borderRadius: 8, fontWeight: 600, fontSize: 12.5 }}>
                {refreshing ? "Refreshing..." : "🔄 Refresh"}
              </Button>
              <Button variant="warning" size="sm" onClick={exportPDF} style={{ borderRadius: 8, fontWeight: 700, fontSize: 12.5, color: C.navy }}>
                📄 Board PDF
              </Button>
              <Button variant="success" size="sm" onClick={exportExcel} style={{ borderRadius: 8, fontWeight: 700, fontSize: 12.5 }}>
                📊 Excel
              </Button>
              <Button variant="light" size="sm" onClick={() => window.print()} style={{ borderRadius: 8, fontWeight: 600, fontSize: 12.5 }}>
                🖨️ Print
              </Button>
            </div>
          </div>
        </div>

        {/* DATA QUALITY BANNER */}
        {(!capabilities.hasCostPrice || !capabilities.hasPaymentMethod || !capabilities.hasInventoryUnitPrice) && (
          <Alert variant="info" className="mb-3 no-print" style={{ borderRadius: 10, fontSize: 12.5 }}>
            <strong>ℹ️ Data availability notice:</strong>{" "}
            {!capabilities.hasCostPrice && <>Gross profit & margin unavailable (no <code>costPrice</code> on catalog). </>}
            {!capabilities.hasInventoryUnitPrice && <>Inventory value unavailable (no <code>unitPrice</code> on inventory). </>}
            {!capabilities.hasPaymentMethod && <>Payment-method breakdown unavailable (no <code>paymentMethod</code> on sales). </>}
            <span style={{ color: C.slate2 }}>These sections are clearly marked N/A.</span>
          </Alert>
        )}

        {Object.keys(errors).length > 0 && (
          <Alert variant="warning" className="mb-3 no-print" style={{ borderRadius: 10, fontSize: 13 }}>
            <strong>⚠️ Partial data:</strong>{" "}
            {Object.entries(errors).map(([k, v]) => `${k} (${v})`).join(" · ")}
          </Alert>
        )}

        {/* TABS */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 no-print">
          <ButtonGroup className="exec-tabs">
            {[
              ["overview", "📊 Overview"],
              ["sales", "💰 Sales"],
              ["profit", "📈 Profitability"],
              ["inventory", "📦 Inventory"],
              ["customers", "👥 Customers"],
              ["orders", "📋 Orders"],
              ["payments", "💳 Payments"],
              ["staff", "🧑‍💼 Staff"],
              ["insights", "💡 Insights"],
            ].map(([k, label]) => (
              <Button key={k} variant={tab === k ? "primary" : "outline-secondary"} onClick={() => setTab(k)}>
                {label}
              </Button>
            ))}
          </ButtonGroup>
          {comparison && (
            <div style={{ fontSize: 12, color: C.slate2, background: "#fff", padding: "7px 14px", borderRadius: 8, border: `1px solid ${C.border}` }}>
              📈 <strong style={{ color: C.navy }}>vs Previous:</strong>{" "}
              <span style={{
                color: comparison.revenue === null ? C.slate3 : comparison.revenue >= 0 ? C.emerald : C.red,
                fontWeight: 700,
              }}>
                {comparison.revenue === null
                  ? "N/A — no previous-period revenue baseline"
                  : `${comparison.revenue >= 0 ? "▲" : "▼"} ${Math.abs(comparison.revenue).toFixed(1)}% revenue`}
              </span>
            </div>
          )}
        </div>

        {/* ==================== OVERVIEW ==================== */}
        {tab === "overview" && (
          <>
            <SectionHeader number="01" title="Executive KPI Summary"
              subtitle="High-level business health at a glance"
              question="How is the business performing overall?" />

            <Row className="g-3 mb-4">
              <Col xs={12} sm={6} xl={3}>
                <KpiCard label="Total Sales Revenue" value={money(metrics.revenue)}
                  subtitle={`${metrics.salesCount} transactions · avg ${money(metrics.avgTicket)}`}
                  accent={C.emerald} icon="💰" change={comparison ? comparison.revenue : metrics.revenueMoM}
                  changeLabel="vs prev" tooltip="Sum of all sales.totalPrice in selected period. Growth is unavailable when the previous period has zero revenue." />
              </Col>
              <Col xs={12} sm={6} xl={3}>
                <KpiCard label="Gross Profit" value="—" unavailable
                  subtitle="Cost price missing"
                  accent={C.purple} icon="📈"
                  tooltip="Requires costPrice field on catalog and no-profit calculation possible without it" />
              </Col>
              <Col xs={12} sm={6} xl={3}>
                <KpiCard label="Orders Booked" value={fmt(metrics.ordersCount)}
                  subtitle={`${money(metrics.ordersValue)} · avg ${money(metrics.avgOrderValue)}`}
                  accent={C.blue} icon="📋" change={comparison?.ordersCount}
                  changeLabel="vs prev"
                  tooltip="Count of orders in selected period" />
              </Col>
              <Col xs={12} sm={6} xl={3}>
                <KpiCard label="Completed Orders" value={fmt(metrics.completedOrders)}
                  subtitle={`${pct(metrics.completionRate)} completion · ${metrics.inProgressOrders} in progress`}
                  accent={C.cyan} icon="✅"
                  tooltip="Orders with status = Completed" />
              </Col>
            </Row>

            <Row className="g-3 mb-4">
              <Col xs={12} sm={6} xl={3}>
                <KpiCard label="Payments Collected" value={money(metrics.collected)}
                  subtitle={`${pct(metrics.collectionRate)} collection rate`}
                  accent={C.amber2} icon="🏦"
                  tooltip="Sum of orders.deposit" />
              </Col>
              <Col xs={12} sm={6} xl={3}>
                <KpiCard label="Outstanding Payments" value={money(metrics.outstanding)}
                  subtitle={`${metrics.ordersCount} orders with balance`}
                  accent={C.orange} icon="⏳"
                  tooltip="Sum of orders.balance" />
              </Col>
              <Col xs={12} sm={6} xl={3}>
                <KpiCard label="Total Inventory Value" value="—" unavailable
                  subtitle="Unit price missing"
                  accent={C.pink} icon="📦"
                  tooltip="Requires unitPrice or costPrice field on inventory" />
              </Col>
              <Col xs={12} sm={6} xl={3}>
                <KpiCard label="Low / Out-of-Stock" value={`${inventoryStats.lowStock.length} / ${inventoryStats.outOfStock.length}`}
                  subtitle={`≤ ${CONFIG.lowStockThreshold} units is low`}
                  accent={C.red} icon="🚨"
                  tooltip={`Low stock threshold configurable at CONFIG.lowStockThreshold (currently ${CONFIG.lowStockThreshold})`} />
              </Col>
            </Row>

            <Row className="g-3 mb-4">
              <Col xs={12} sm={6} xl={3}>
                <KpiCard label="Sales Growth (MoM)"
                  value={metrics.revenueMoM === null
                    ? "N/A"
                    : `${metrics.revenueMoM >= 0 ? "+" : ""}${metrics.revenueMoM.toFixed(1)}%`}
                  subtitle={metrics.revenueMoM === null
                    ? `This month: ${money(metrics.thisMonth)} · No previous-month revenue baseline`
                    : `This month: ${money(metrics.thisMonth)} · Last month: ${money(metrics.prevMonth)}`}
                  accent={metrics.revenueMoM === null ? C.slate3 : metrics.revenueMoM >= 0 ? C.emerald : C.red}
                  icon={metrics.revenueMoM === null ? "📊" : metrics.revenueMoM >= 0 ? "📈" : "📉"} />
              </Col>
              <Col xs={12} sm={6} xl={3}>
                <KpiCard label="Average Ticket" value={money(metrics.avgTicket)}
                  subtitle="Per sales transaction"
                  accent={C.sky} icon="🎯" />
              </Col>
              <Col xs={12} sm={6} xl={3}>
                <KpiCard label="Unique Customers" value={fmt(customerStats.total)}
                  subtitle={`${customerStats.returning} returning · ${customerStats.newCustomers} new`}
                  accent={C.violet} icon="👥" />
              </Col>
              <Col xs={12} sm={6} xl={3}>
                <KpiCard label="Customer Services" value={fmt(serviceStats.total)}
                  subtitle={`${pct(serviceStats.resolutionRate)} resolved`}
                  accent={C.pink} icon="🎧" />
              </Col>
            </Row>

            <Row className="g-3 mb-4">
              <Col xs={12} lg={8}>
                <Card className="border-0 h-100" style={{ borderRadius: 14, boxShadow: "0 2px 12px rgba(15,23,42,0.05)" }}>
                  <Card.Body className="p-3 p-md-4">
                    <h6 className="mb-3" style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>
                      Monthly Revenue & Order Value Trend
                    </h6>
                    {monthlyTrend.length === 0 ? <NA text="No sales data for selected period" /> : (
                      <ResponsiveContainer width="100%" height={320}>
                        <ComposedChart data={monthlyTrend}>
                          <defs>
                            <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={C.blue} stopOpacity={0.35} />
                              <stop offset="95%" stopColor={C.blue} stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.slate2 }} />
                          <YAxis yAxisId="left" tick={{ fontSize: 11, fill: C.slate2 }} tickFormatter={compact} />
                          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: C.slate2 }} />
                          <Tooltip content={<ChartTooltip currency />} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke={C.blue} strokeWidth={2.5} fill="url(#revG)" />
                          <Area yAxisId="left" type="monotone" dataKey="orderValue" name="Order Value" stroke={C.emerald} strokeWidth={2.5} fill="none" strokeDasharray="5 5" />
                          <Bar yAxisId="right" dataKey="orders" name="Orders" fill={C.amber2} barSize={14} radius={[4, 4, 0, 0]} opacity={0.75} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    )}
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} lg={4}>
                <Card className="border-0 h-100" style={{ borderRadius: 14, boxShadow: "0 2px 12px rgba(15,23,42,0.05)" }}>
                  <Card.Body className="p-3 p-md-4">
                    <h6 className="mb-3" style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>
                      Revenue Composition
                    </h6>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={[
                          { name: "Collected", value: metrics.collected },
                          { name: "Outstanding", value: metrics.outstanding },
                        ]} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={58} outerRadius={88} paddingAngle={3}>
                          <Cell fill={C.emerald} />
                          <Cell fill={C.amber2} />
                        </Pie>
                        <Tooltip content={<ChartTooltip currency />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="text-center mt-2" style={{ fontSize: 12 }}>
                      <div><strong style={{ color: C.emerald }}>{money(metrics.collected)}</strong> collected</div>
                      <div><strong style={{ color: C.amber2 }}>{money(metrics.outstanding)}</strong> outstanding</div>
                      <div style={{ color: C.slate2, marginTop: 4 }}>{pct(metrics.collectionRate)} collection rate</div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}

        {/* ==================== SALES ==================== */}
        {tab === "sales" && (
          <>
            <SectionHeader number="02" title="Sales Analytics"
              subtitle="Revenue breakdown by time, product, and category"
              question="How much are we selling, and what is driving revenue?" />

            <Row className="g-3 mb-4">
              <Col xs={12} lg={8}>
                <Card className="border-0 h-100" style={{ borderRadius: 14 }}>
                  <Card.Body className="p-3 p-md-4">
                    <h6 className="mb-3" style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>
                      Daily Revenue (Last 30 Days)
                    </h6>
                    {dailyTrend.length === 0 ? <NA /> : (
                      <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={dailyTrend}>
                          <defs>
                            <linearGradient id="dailyG" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={C.emerald} stopOpacity={0.35} />
                              <stop offset="95%" stopColor={C.emerald} stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} tickFormatter={compact} />
                          <Tooltip content={<ChartTooltip currency />} />
                          <Area type="monotone" dataKey="revenue" name="Revenue" stroke={C.emerald} strokeWidth={2} fill="url(#dailyG)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} lg={4}>
                <Card className="border-0 h-100" style={{ borderRadius: 14 }}>
                  <Card.Body className="p-3 p-md-4">
                    <h6 className="mb-3" style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>
                      Yearly Revenue
                    </h6>
                    {yearlyTrend.length === 0 ? <NA /> : (
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={yearlyTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} tickFormatter={compact} />
                          <Tooltip content={<ChartTooltip currency />} />
                          <Bar dataKey="revenue" fill={C.blue} radius={[6, 6, 0, 0]}>
                            {yearlyTrend.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="g-3 mb-4">
              <Col xs={12} lg={6}>
                <Card className="border-0 h-100" style={{ borderRadius: 14 }}>
                  <Card.Body className="p-3 p-md-4">
                    <h6 className="mb-3" style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>
                      Weekly Revenue (Last 12 Weeks)
                    </h6>
                    {weeklyTrend.length === 0 ? <NA /> : (
                      <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={weeklyTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 11 }} tickFormatter={compact} />
                          <Tooltip content={<ChartTooltip currency />} />
                          <Line type="monotone" dataKey="revenue" name="Revenue" stroke={C.purple} strokeWidth={2.5} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} lg={6}>
                <Card className="border-0 h-100" style={{ borderRadius: 14 }}>
                  <Card.Body className="p-3 p-md-4">
                    <h6 className="mb-3" style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>
                      Category Revenue
                    </h6>
                    {categoryStats.length === 0 ? <NA /> : (
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={categoryStats}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={50} />
                          <YAxis tick={{ fontSize: 11 }} tickFormatter={compact} />
                          <Tooltip content={<ChartTooltip currency />} />
                          <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]}>
                            {categoryStats.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="g-3 mb-4">
              <Col xs={12}>
                <Card className="border-0" style={{ borderRadius: 14 }}>
                  <Card.Body className="p-3 p-md-4">
                    <h6 className="mb-3" style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>
                      Top Products — click any row for details
                    </h6>
                    <Table hover responsive className="mb-0" style={{ fontSize: 12.5 }}>
                      <thead>
                        <tr>
                          <th>#</th><th>Product</th><th className="text-end">Revenue</th>
                          <th className="text-end">Units</th><th className="text-end">Sales</th>
                          <th className="text-end">Avg Price</th><th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {topProducts.length === 0 ? (
                          <tr><td colSpan={7} className="text-center text-muted py-3">No sales data</td></tr>
                        ) : topProducts.map((p, i) => (
                          <tr key={p.name} style={{ cursor: "pointer" }} onClick={() => openDrill("product", p)}>
                            <td>{i + 1}</td>
                            <td className="fw-semibold">{p.name}</td>
                            <td className="text-end fw-bold">{money(p.revenue)}</td>
                            <td className="text-end">{fmt(p.units)}</td>
                            <td className="text-end">{p.count}</td>
                            <td className="text-end">{money(safeDiv(p.revenue, p.units))}</td>
                            <td className="text-end"><span style={{ color: C.blue }}>→</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}

        {/* ==================== PROFITABILITY ==================== */}
        {tab === "profit" && (
          <>
            <SectionHeader number="03" title="Profitability Analytics"
              subtitle="Gross profit, margins, and profitability rankings"
              question="How profitable are we, and where does profit come from?" />

            {!capabilities.hasCostPrice && (
              <Alert variant="warning" style={{ borderRadius: 10, fontSize: 13 }}>
                <strong>⚠️ Gross profit cannot be calculated.</strong> The catalog table
                has no <code>costPrice</code> (or equivalent) field, and no expenses table
                is configured. To enable this section, add a cost price column to products
                and expose it via the catalog API. Until then, this section will show
                revenue-only analysis and explicit <strong>N/A</strong> values for profit.
              </Alert>
            )}

            <Row className="g-3 mb-4">
              <Col xs={12} sm={6} xl={3}>
                <KpiCard label="Gross Profit" value="—" unavailable
                  subtitle="Cost price missing" accent={C.emerald} icon="📈" />
              </Col>
              <Col xs={12} sm={6} xl={3}>
                <KpiCard label="Gross Profit Margin" value="—" unavailable
                  subtitle="Cost price missing" accent={C.purple} icon="%" />
              </Col>
              <Col xs={12} sm={6} xl={3}>
                <KpiCard label="Net Profit" value="—" unavailable
                  subtitle="No expenses table" accent={C.blue} icon="💵" />
              </Col>
              <Col xs={12} sm={6} xl={3}>
                <KpiCard label="Avg Revenue per Product" value={money(safeDiv(metrics.revenue, productStats.length))}
                  subtitle={`${productStats.length} distinct products`}
                  accent={C.amber2} icon="🎯" />
              </Col>
            </Row>

            <Row className="g-3 mb-4">
              <Col xs={12} lg={6}>
                <Card className="border-0 h-100" style={{ borderRadius: 14 }}>
                  <Card.Body className="p-3 p-md-4">
                    <h6 className="mb-3" style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>
                      Revenue vs Profit Trend
                    </h6>
                    <div className="text-center text-muted py-5" style={{ fontSize: 13 }}>
                      <div style={{ fontSize: 40, marginBottom: 8 }}>📊</div>
                      <NA text="Profit data requires costPrice field on catalog" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} lg={6}>
                <Card className="border-0 h-100" style={{ borderRadius: 14 }}>
                  <Card.Body className="p-3 p-md-4">
                    <h6 className="mb-3" style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>
                      Product Profitability Ranking
                    </h6>
                    <Table hover responsive className="mb-0" style={{ fontSize: 12 }}>
                      <thead>
                        <tr><th>#</th><th>Product</th><th className="text-end">Revenue</th><th className="text-end">Gross Profit</th><th className="text-end">Margin</th></tr>
                      </thead>
                      <tbody>
                        {topProducts.slice(0, 8).map((p, i) => (
                          <tr key={p.name}>
                            <td>{i + 1}</td>
                            <td className="fw-semibold">{p.name}</td>
                            <td className="text-end">{money(p.revenue)}</td>
                            <td className="text-end text-muted">N/A</td>
                            <td className="text-end text-muted">N/A</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Alert variant="info" style={{ borderRadius: 10, fontSize: 12.5 }}>
              <strong>How to enable profit analytics:</strong> Add a <code>costPrice</code> column
              to your catalog table, update the API to return it, and reload the dashboard.
              The profit section will then compute gross profit = (unitPrice − costPrice) × quantity
              and gross margin = gross profit / revenue for every product and category.
            </Alert>
          </>
        )}

        {/* ==================== INVENTORY ==================== */}
        {tab === "inventory" && (
          <>
            <SectionHeader number="04" title="Inventory Analytics"
              subtitle="Stock levels, low-stock alerts, and restocking priorities"
              question="What do we have in stock, and what needs urgent restocking?" />

            <Row className="g-3 mb-4">
              <Col xs={12} sm={6} xl={3}>
                <KpiCard label="Total Materials" value={fmt(inventoryStats.items.length)}
                  subtitle="Distinct materials tracked" accent={C.blue} icon="🧱" />
              </Col>
              <Col xs={12} sm={6} xl={3}>
                <KpiCard label="Total Balance" value={fmt(inventoryStats.items.reduce((s, m) => s + m.balance, 0))}
                  subtitle="Units remaining" accent={C.emerald} icon="📥" />
              </Col>
              <Col xs={12} sm={6} xl={3}>
                <KpiCard label="Low Stock" value={fmt(inventoryStats.lowStock.length)}
                  subtitle={`≤ ${CONFIG.lowStockThreshold} units`} accent={C.amber2} icon="⚠️" />
              </Col>
              <Col xs={12} sm={6} xl={3}>
                <KpiCard label="Out of Stock" value={fmt(inventoryStats.outOfStock.length)}
                  subtitle="Balance = 0" accent={C.red} icon="🚫" />
              </Col>
            </Row>

            <Row className="g-3 mb-4">
              <Col xs={12} lg={8}>
                <Card className="border-0 h-100" style={{ borderRadius: 14 }}>
                  <Card.Body className="p-3 p-md-4">
                    <h6 className="mb-3" style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>
                      Material Utilization (Issued vs Balance)
                    </h6>
                    {inventoryStats.items.length === 0 ? <NA /> : (
                      <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={inventoryStats.items.slice(0, 10)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip content={<ChartTooltip />} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Bar dataKey="out" name="Issued" fill={C.amber2} radius={[6, 6, 0, 0]} />
                          <Bar dataKey="balance" name="Balance" fill={C.emerald} radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} lg={4}>
                <Card className="border-0 h-100" style={{ borderRadius: 14 }}>
                  <Card.Body className="p-3 p-md-4">
                    <h6 className="mb-3" style={{ fontWeight: 700, color: C.red, fontSize: 15 }}>
                      🚨 Restocking Priorities
                    </h6>
                    {inventoryStats.outOfStock.length === 0 && inventoryStats.lowStock.length === 0 ? (
                      <div className="text-center text-muted py-4" style={{ fontSize: 12 }}>
                        ✅ All materials are adequately stocked
                      </div>
                    ) : (
                      <>
                        {inventoryStats.outOfStock.map((m) => (
                          <div key={m.name} style={{
                            background: "#fef2f2", border: "1px solid #fecaca",
                            borderRadius: 8, padding: "8px 10px", marginBottom: 6,
                            cursor: "pointer",
                          }} onClick={() => openDrill("material", m)}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: C.red }}>
                              🔴 {m.name}
                            </div>
                            <div style={{ fontSize: 11, color: C.slate2 }}>
                              Balance: 0 units · OUT OF STOCK
                            </div>
                          </div>
                        ))}
                        {inventoryStats.lowStock.map((m) => (
                          <div key={m.name} style={{
                            background: "#fffbeb", border: "1px solid #fcd34d",
                            borderRadius: 8, padding: "8px 10px", marginBottom: 6,
                            cursor: "pointer",
                          }} onClick={() => openDrill("material", m)}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: C.amber }}>
                              ⚠️ {m.name}
                            </div>
                            <div style={{ fontSize: 11, color: C.slate2 }}>
                              Balance: {m.balance} units · LOW
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Card className="border-0" style={{ borderRadius: 14 }}>
              <Card.Body className="p-3 p-md-4">
                <h6 className="mb-3" style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>
                  Full Inventory Table — click any row for movement history
                </h6>
                <Table hover responsive className="mb-0" style={{ fontSize: 12.5 }}>
                  <thead>
                    <tr>
                      <th>Material</th>
                      <th className="text-end">Total Issued</th>
                      <th className="text-end">Balance</th>
                      <th>Units</th>
                      <th className="text-end">Records</th>
                      <th>Status</th>
                      <th className="text-end">Stock Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryStats.items.map((m) => {
                      const status = m.balance <= 0 ? "OUT OF STOCK"
                        : m.balance <= CONFIG.lowStockThreshold ? "LOW" : "OK";
                      const color = status === "OUT OF STOCK" ? C.red
                        : status === "LOW" ? C.amber : C.emerald;
                      return (
                        <tr key={m.name} style={{ cursor: "pointer" }} onClick={() => openDrill("material", m)}>
                          <td className="fw-semibold">{m.name}</td>
                          <td className="text-end">{fmt(m.out)}</td>
                          <td className="text-end fw-bold">{fmt(m.balance)}</td>
                          <td>{m.units}</td>
                          <td className="text-end">{m.records}</td>
                          <td>
                            <Badge style={{ background: `${color}20`, color, fontSize: 10 }}>{status}</Badge>
                          </td>
                          <td className="text-end text-muted">N/A</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </>
        )}

        {/* ==================== CUSTOMERS ==================== */}
        {tab === "customers" && (
          <>
            <SectionHeader number="05" title="Customer Analytics"
              subtitle="Customer base, repeat behavior, and top spenders"
              question="Who are our customers, and who drives the most value?" />

            <Row className="g-3 mb-4">
              <Col xs={12} sm={6} xl={3}>
                <KpiCard label="Unique Customers" value={fmt(customerStats.total)}
                  subtitle="From sales records" accent={C.blue} icon="👥" />
              </Col>
              <Col xs={12} sm={6} xl={3}>
                <KpiCard label="Returning Customers" value={fmt(customerStats.returning)}
                  subtitle="2+ purchases" accent={C.emerald} icon="🔁" />
              </Col>
              <Col xs={12} sm={6} xl={3}>
                <KpiCard label="New Customers" value={fmt(customerStats.newCustomers)}
                  subtitle="One-time buyers" accent={C.amber2} icon="✨" />
              </Col>
              <Col xs={12} sm={6} xl={3}>
                <KpiCard label="Avg Customer Spend" value={money(customerStats.avgSpend)}
                  subtitle="Per customer, all-time in period" accent={C.purple} icon="💵" />
              </Col>
            </Row>

            <Row className="g-3 mb-4">
              <Col xs={12} lg={6}>
                <Card className="border-0 h-100" style={{ borderRadius: 14 }}>
                  <Card.Body className="p-3 p-md-4">
                    <h6 className="mb-3" style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>
                      New vs Returning
                    </h6>
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={[
                          { name: "New (1 order)", value: customerStats.newCustomers },
                          { name: "Returning (2+)", value: customerStats.returning },
                        ]} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3}>
                          <Cell fill={C.amber2} />
                          <Cell fill={C.emerald} />
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} lg={6}>
                <Card className="border-0 h-100" style={{ borderRadius: 14 }}>
                  <Card.Body className="p-3 p-md-4">
                    <h6 className="mb-3" style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>
                      Top Customers by Revenue
                    </h6>
                    {customerStats.top.length === 0 ? <NA text="No named customers in sales records" /> : (
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={customerStats.top} layout="vertical" margin={{ left: 10, right: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                          <XAxis type="number" tickFormatter={compact} tick={{ fontSize: 10 }} />
                          <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
                          <Tooltip content={<ChartTooltip currency />} />
                          <Bar dataKey="revenue" name="Revenue" radius={[0, 6, 6, 0]}>
                            {customerStats.top.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Card className="border-0" style={{ borderRadius: 14 }}>
              <Card.Body className="p-3 p-md-4">
                <h6 className="mb-3" style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>
                  Customer Directory — click any row for purchase history
                </h6>
                <Table hover responsive className="mb-0" style={{ fontSize: 12.5 }}>
                  <thead>
                    <tr>
                      <th>#</th><th>Customer</th><th>Phone</th>
                      <th className="text-end">Orders</th>
                      <th className="text-end">Revenue</th>
                      <th className="text-end">Distinct Items</th>
                      <th>Last Purchase</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerStats.top.length === 0 ? (
                      <tr><td colSpan={8} className="text-center text-muted py-3">
                        No customer names recorded on sales
                      </td></tr>
                    ) : customerStats.top.map((c, i) => (
                      <tr key={c.name + c.phone} style={{ cursor: "pointer" }} onClick={() => openDrill("customer", c)}>
                        <td>{i + 1}</td>
                        <td className="fw-semibold">{c.name}</td>
                        <td>{c.phone || "—"}</td>
                        <td className="text-end">{c.orders}</td>
                        <td className="text-end fw-bold">{money(c.revenue)}</td>
                        <td className="text-end">{c.itemCount}</td>
                        <td>{c.lastDate?.toISOString().slice(0, 10) || "—"}</td>
                        <td className="text-end"><span style={{ color: C.blue }}>→</span></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </>
        )}

        {/* ==================== ORDERS ==================== */}
        {tab === "orders" && (
          <>
            <SectionHeader number="06" title="Order Analytics"
              subtitle="Order status, fulfilment speed, and overdue orders"
              question="Are we completing orders on time, and what is stuck?" />

            <Row className="g-3 mb-4">
              <Col xs={12} sm={6} xl={3}>
                <KpiCard label="Total Orders" value={fmt(metrics.ordersCount)}
                  subtitle={`${money(metrics.ordersValue)} value`} accent={C.blue} icon="📋" />
              </Col>
              <Col xs={12} sm={6} xl={3}>
                <KpiCard label="Completed" value={fmt(metrics.completedOrders)}
                  subtitle={`${pct(metrics.completionRate)} completion rate`} accent={C.emerald} icon="✅" />
              </Col>
              <Col xs={12} sm={6} xl={3}>
                <KpiCard label="In Progress" value={fmt(metrics.inProgressOrders)}
                  subtitle="Pending/Processing" accent={C.amber2} icon="⏳" />
              </Col>
              <Col xs={12} sm={6} xl={3}>
                <KpiCard label="Overdue" value={fmt(overdueOrders.length)}
                  subtitle={`${money(overdueOrders.reduce((s, o) => s + num(o.totalPrice), 0))} at risk`}
                  accent={C.red} icon="🚨" />
              </Col>
            </Row>

            <Row className="g-3 mb-4">
              <Col xs={12} lg={6}>
                <Card className="border-0 h-100" style={{ borderRadius: 14 }}>
                  <Card.Body className="p-3 p-md-4">
                    <h6 className="mb-3" style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>
                      Order Status Distribution
                    </h6>
                    {orderStatusData.length === 0 ? <NA /> : (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie data={orderStatusData} dataKey="value" nameKey="name"
                            cx="50%" cy="50%" outerRadius={100}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                            {orderStatusData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                          </Pie>
                          <Tooltip content={<ChartTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} lg={6}>
                <Card className="border-0 h-100" style={{ borderRadius: 14 }}>
                  <Card.Body className="p-3 p-md-4">
                    <h6 className="mb-3" style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>
                      Fulfilment Speed
                    </h6>
                    {fulfilmentTime ? (
                      <div className="d-flex flex-column justify-content-center" style={{ height: 300 }}>
                        <div className="text-center mb-4">
                          <div style={{ fontSize: 42, fontWeight: 800, color: C.navy }}>
                            {fulfilmentTime.avg.toFixed(1)} days
                          </div>
                          <div style={{ color: C.slate2, fontSize: 13 }}>
                            Average fulfilment time (based on {fulfilmentTime.count} completed orders)
                          </div>
                        </div>
                        <div className="d-flex justify-content-around">
                          <div className="text-center">
                            <div style={{ fontSize: 20, fontWeight: 700, color: C.emerald }}>{fulfilmentTime.min.toFixed(0)}d</div>
                            <div style={{ fontSize: 11, color: C.slate2 }}>Fastest</div>
                          </div>
                          <div className="text-center">
                            <div style={{ fontSize: 20, fontWeight: 700, color: C.red }}>{fulfilmentTime.max.toFixed(0)}d</div>
                            <div style={{ fontSize: 11, color: C.slate2 }}>Slowest</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-muted py-5" style={{ fontSize: 13 }}>
                        <div style={{ fontSize: 40, marginBottom: 8 }}>⏱️</div>
                        <NA text="No orders with both date and actualCompletionDate" />
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Card className="border-0" style={{ borderRadius: 14 }}>
              <Card.Body className="p-3 p-md-4">
                <h6 className="mb-3" style={{ fontWeight: 700, color: C.red, fontSize: 15 }}>
                  🚨 Overdue Orders (past expected finish date, not yet completed)
                </h6>
                <Table hover responsive className="mb-0" style={{ fontSize: 12.5 }}>
                  <thead>
                    <tr>
                      <th>Customer</th><th>Item</th><th>Order Date</th>
                      <th>Expected Finish</th><th>Days Overdue</th>
                      <th className="text-end">Value</th><th>Status</th><th>Stage</th><th>Assigned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overdueOrders.length === 0 ? (
                      <tr><td colSpan={9} className="text-center text-muted py-3">
                        ✅ No overdue orders
                      </td></tr>
                    ) : overdueOrders.map((o, i) => {
                      const due = parseDate(o.expectedFinishDate);
                      const days = due ? Math.floor((Date.now() - due) / 86400000) : 0;
                      return (
                        <tr key={i}>
                          <td className="fw-semibold">{o.name || "—"}</td>
                          <td>{o.itemDescription || "—"}</td>
                          <td>{o.date || "—"}</td>
                          <td>{o.expectedFinishDate || "—"}</td>
                          <td className="text-danger fw-bold">{days}d</td>
                          <td className="text-end">{money(o.totalPrice)}</td>
                          <td>{o.status || "—"}</td>
                          <td>{o.stage || "—"}</td>
                          <td>{o.assignedTo || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </>
        )}

        {/* ==================== PAYMENTS ==================== */}
        {tab === "payments" && (
          <>
            <SectionHeader number="07" title="Payment Analytics"
              subtitle="Cash collection, outstanding balances, and payment mix"
              question="How much money has actually been collected, and what remains unpaid?" />

            <Row className="g-3 mb-4">
              <Col xs={12} sm={6} xl={3}>
                <KpiCard label="Total Collected" value={money(metrics.collected)}
                  subtitle={`${pct(metrics.collectionRate)} of order value`} accent={C.emerald} icon="🏦" />
              </Col>
              <Col xs={12} sm={6} xl={3}>
                <KpiCard label="Outstanding" value={money(metrics.outstanding)}
                  subtitle="To be collected" accent={C.orange} icon="⏳" />
              </Col>
              <Col xs={12} sm={6} xl={3}>
                <KpiCard label="Paid Sales" value={`${metrics.paidSales ?? 0}`}
                  subtitle={`${pct(metrics.paidRate)} payment rate`} accent={C.cyan} icon="✅" />
              </Col>
              <Col xs={12} sm={6} xl={3}>
                <KpiCard label="Payment Methods" value="—" unavailable
                  subtitle="Method field missing" accent={C.purple} icon="💳" />
              </Col>
            </Row>

            <Row className="g-3 mb-4">
              <Col xs={12} lg={6}>
                <Card className="border-0 h-100" style={{ borderRadius: 14 }}>
                  <Card.Body className="p-3 p-md-4">
                    <h6 className="mb-3" style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>
                      Collected vs Outstanding
                    </h6>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={[
                          { name: "Collected", value: metrics.collected },
                          { name: "Outstanding", value: metrics.outstanding },
                        ]} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3}>
                          <Cell fill={C.emerald} />
                          <Cell fill={C.orange} />
                        </Pie>
                        <Tooltip content={<ChartTooltip currency />} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} lg={6}>
                <Card className="border-0 h-100" style={{ borderRadius: 14 }}>
                  <Card.Body className="p-3 p-md-4">
                    <h6 className="mb-3" style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>
                      Payment Status Distribution (Sales)
                    </h6>
                    {paymentStatusData.length === 0 ? <NA /> : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={paymentStatusData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                          <Tooltip content={<ChartTooltip />} />
                          <Bar dataKey="value" name="Sales" radius={[6, 6, 0, 0]}>
                            {paymentStatusData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Card className="border-0" style={{ borderRadius: 14 }}>
              <Card.Body className="p-3 p-md-4">
                <h6 className="mb-3" style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>
                  Sales vs Recorded Collections
                </h6>
                <Table hover responsive className="mb-0" style={{ fontSize: 12.5 }}>
                  <thead>
                    <tr><th>Metric</th><th className="text-end">Value</th><th>Notes</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>Total order value</td><td className="text-end">{money(metrics.ordersValue)}</td><td>Sum of orders.totalPrice</td></tr>
                    <tr><td>Total sales value</td><td className="text-end">{money(metrics.revenue)}</td><td>Sum of sales.totalPrice</td></tr>
                    <tr><td>Deposits collected</td><td className="text-end text-success fw-bold">{money(metrics.collected)}</td><td>Sum of orders.deposit</td></tr>
                    <tr><td>Outstanding balance</td><td className="text-end text-warning fw-bold">{money(metrics.outstanding)}</td><td>Sum of orders.balance</td></tr>
                    <tr><td>Collection rate</td><td className="text-end">{pct(metrics.collectionRate)}</td><td>Collected ÷ Order Value</td></tr>
                    <tr><td>Payment method breakdown</td><td className="text-end text-muted">N/A</td><td>No paymentMethod field on sales</td></tr>
                    <tr><td>Succeeded / Failed / Pending payments</td><td className="text-end text-muted">N/A</td><td>No payment-status field on a payments table</td></tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </>
        )}

        {/* ==================== STAFF ==================== */}
        {tab === "staff" && (
          <>
            <SectionHeader number="08" title="Staff Performance"
              subtitle="Sales and revenue by team member"
              question="Who is contributing the most revenue, and who needs support?" />

            <Row className="g-3 mb-4">
              <Col xs={12} lg={6}>
                <Card className="border-0 h-100" style={{ borderRadius: 14 }}>
                  <Card.Body className="p-3 p-md-4">
                    <h6 className="mb-3" style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>
                      Revenue by Staff Member
                    </h6>
                    {staffStats.length === 0 ? <NA text="No salesPerson assigned on sales" /> : (
                      <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={staffStats}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                          <YAxis tick={{ fontSize: 11 }} tickFormatter={compact} />
                          <Tooltip content={<ChartTooltip currency />} />
                          <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]}>
                            {staffStats.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} lg={6}>
                <Card className="border-0 h-100" style={{ borderRadius: 14 }}>
                  <Card.Body className="p-3 p-md-4">
                    <h6 className="mb-3" style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>
                      Staff Performance Detail
                    </h6>
                    <Table hover responsive className="mb-0" style={{ fontSize: 12.5 }}>
                      <thead>
                        <tr>
                          <th>#</th><th>Team Member</th>
                          <th className="text-end">Revenue</th>
                          <th className="text-end">Sales</th>
                          <th className="text-end">Units</th>
                          <th>Share</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffStats.length === 0 ? (
                          <tr><td colSpan={6} className="text-center text-muted py-3">No staff attribution</td></tr>
                        ) : staffStats.map((p, i) => (
                          <tr key={p.name}>
                            <td>{i + 1}</td>
                            <td className="fw-semibold">{p.name}</td>
                            <td className="text-end fw-bold">{money(p.revenue)}</td>
                            <td className="text-end">{p.salesCount}</td>
                            <td className="text-end">{fmt(p.units)}</td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div style={{ flex: 1, height: 6, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                                  <div style={{ width: `${p.share}%`, height: "100%", background: C.blue }} />
                                </div>
                                <span style={{ fontSize: 11, color: C.slate2, minWidth: 38 }}>{p.share.toFixed(0)}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}

        {/* ==================== INSIGHTS ==================== */}
        {tab === "insights" && (
          <>
            <SectionHeader number="09" title="Advanced Business Insights"
              subtitle="Automated findings with recommended actions, based on real data only"
              question="What is happening, why, and what should we do next?" />

            <Row className="g-3 mb-4">
              <Col xs={12} lg={8}>
                <Card className="border-0 h-100" style={{ borderRadius: 14 }}>
                  <Card.Body className="p-3 p-md-4">
                    <h6 className="mb-3" style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>
                      Findings & Recommended Actions ({insights.length})
                    </h6>
                    {insights.length === 0 ? <NA text="No data available for insight generation" /> : (
                      insights.map((ins, i) => <InsightCard key={i} {...ins} />)
                    )}
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} lg={4}>
                <Card className="border-0 mb-3" style={{ borderRadius: 14 }}>
                  <Card.Body className="p-3 p-md-4">
                    <h6 className="mb-3" style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>
                      Performance Scorecard
                    </h6>
                    {scorecard.map((s) => {
                      if (s.na || s.value === null || s.value === undefined || !Number.isFinite(Number(s.value))) {
                        return (
                          <div key={s.label} className="d-flex justify-content-between align-items-center py-2"
                            style={{ borderBottom: `1px solid ${C.border}` }}>
                            <span style={{ fontSize: 12.5, color: C.slate2 }}>{s.label}</span>
                            <span style={{ fontSize: 11, color: C.slate3, fontStyle: "italic" }}>N/A</span>
                          </div>
                        );
                      }
                      const good = s.value >= s.target;
                      return (
                        <div key={s.label} className="d-flex justify-content-between align-items-center py-2"
                          style={{ borderBottom: `1px solid ${C.border}` }}>
                          <span style={{ fontSize: 12.5, color: C.slate }}>{s.label}</span>
                          <div className="d-flex align-items-center gap-2">
                            <span style={{ fontSize: 13, fontWeight: 800, color: C.navy }}>
                              {num(s.value).toFixed(1)}{s.unit}
                            </span>
                            <span style={{
                              fontSize: 10, fontWeight: 700,
                              background: good ? "#dcfce7" : "#fee2e2",
                              color: good ? C.emerald : C.red,
                              padding: "2px 7px", borderRadius: 12,
                            }}>
                              {good ? "ON TARGET" : "BELOW"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </Card.Body>
                </Card>
                <Card className="border-0" style={{ borderRadius: 14 }}>
                  <Card.Body className="p-3 p-md-4">
                    <h6 className="mb-3" style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>
                      Data Coverage
                    </h6>
                    {[
                      ["Revenue & Sales", true],
                      ["Orders & Completion", true],
                      ["Payments (deposits)", true],
                      ["Customer Names", customerStats.total > 0],
                      ["Inventory Balances", inventoryStats.items.length > 0],
                      ["Gross Profit", capabilities.hasCostPrice],
                      ["Inventory Value", capabilities.hasInventoryUnitPrice],
                      ["Payment Methods", capabilities.hasPaymentMethod],
                      ["Net Profit / Expenses", false],
                    ].map(([k, ok]) => (
                      <div key={k} className="d-flex justify-content-between py-1" style={{ fontSize: 12 }}>
                        <span style={{ color: C.slate2 }}>{k}</span>
                        <span style={{ fontWeight: 700, color: ok ? C.emerald : C.red }}>
                          {ok ? "✓ Available" : "✗ Missing"}
                        </span>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}

        {/* FOOTER */}
        <div className="text-center mt-4 pt-3" style={{ borderTop: `1px solid ${C.border}`, color: C.slate2, fontSize: 11.5 }}>
          <div style={{ fontWeight: 700, color: C.navy, marginBottom: 2 }}>
            Whitewise Interior Furniture — Executive Business Intelligence
          </div>
          <div>
            Confidential board report · Auto-refresh every 3 minutes · Last sync: {lastUpdated?.toLocaleString("en-GB")}
          </div>
        </div>
      </div>

      {renderDrill()}
    </div>
  );
};

export default ExecutiveDashboard;