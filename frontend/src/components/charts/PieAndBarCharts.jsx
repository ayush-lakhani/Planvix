import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const TIER_COLORS = { free: "#64748b", pro: "#10b981", enterprise: "#8b5cf6" };
const BAR_COLORS = [
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#14b8a6",
];

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-slate-900 dark:text-white font-bold capitalize">{payload[0]?.name}</p>
      <p className="text-slate-600 dark:text-slate-300 text-sm">{payload[0]?.value} users</p>
      <p className="text-slate-400 text-xs">
        {payload[0]?.payload?.percent?.toFixed(1)}%
      </p>
    </div>
  );
};

export function TierDistributionPieChart({ data = {} }) {
  const chartData = [
    { name: "Free", value: data.free || 0 },
    { name: "Pro", value: data.pro || 0 },
    { name: "Enterprise", value: data.enterprise || 0 },
  ].filter((d) => d.value > 0);

  const total = chartData.reduce((a, b) => a + b.value, 0);
  chartData.forEach(
    (d) => (d.percent = total > 0 ? (d.value / total) * 100 : 0),
  );

  if (!total)
    return (
      <div className="h-56 flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800/60 rounded-2xl">
        <p className="text-sm">No user tier data</p>
      </div>
    );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={80}
          dataKey="value"
          paddingAngle={4}
          animationDuration={800}
        >
          {chartData.map((entry) => (
            <Cell
              key={entry.name}
              fill={TIER_COLORS[entry.name.toLowerCase()] || "#64748b"}
            />
          ))}
        </Pie>
        <Tooltip content={<PieTooltip />} isAnimationActive={false} />
        <Legend
          formatter={(v) => (
            <span className="text-slate-600 dark:text-slate-300 text-sm capitalize">{v}</span>
          )}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

const BarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 shadow-2xl">
        <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">{label}</p>
        <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
          {payload[0].value} users
        </p>
      </div>
    );
  }
  return null;
};

export function IndustryBarChart({ data = [] }) {
  if (!data.length)
    return (
      <div className="h-56 flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800/60 rounded-2xl">
        <p className="text-sm">No industry data yet</p>
      </div>
    );

  const chartData = data.map((d) => ({ name: d.industry, value: d.count }));

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 40, left: 60, bottom: 20 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={document.documentElement.classList.contains('dark') ? "#1e293b" : "#e2e8f0"}
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            dataKey="name"
            type="category"
            width={160}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            content={<BarTooltip />}
            isAnimationActive={false}
            allowEscapeViewBox={{ x: false, y: false }}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
          />
          <Bar
            dataKey="value"
            radius={[0, 8, 8, 0]}
            maxBarSize={24}
            animationDuration={800}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AITokenTrendChart({ data = [] }) {
  if (!data.length)
    return (
      <div className="h-56 flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800/60 rounded-2xl">
        <p className="text-sm">No AI usage data yet</p>
      </div>
    );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={document.documentElement.classList.contains('dark') ? "#1e293b" : "#e2e8f0"} />
        <XAxis
          dataKey="date"
          tick={{ fill: "#64748b", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => v?.slice(5)}
        />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v)}
        />
        <Tooltip
          contentStyle={{
            background: document.documentElement.classList.contains('dark') ? "#0f172a" : "#ffffff",
            border: document.documentElement.classList.contains('dark') ? "1px solid #334155" : "1px solid #e2e8f0",
            borderRadius: "12px",
          }}
          labelStyle={{ color: "#94a3b8", fontSize: "11px" }}
          itemStyle={{ color: "#8b5cf6" }}
          isAnimationActive={false}
        />
        <Bar
          dataKey="tokens"
          fill="#8b5cf6"
          radius={[4, 4, 0, 0]}
          maxBarSize={24}
          name="Tokens"
          animationDuration={800}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
