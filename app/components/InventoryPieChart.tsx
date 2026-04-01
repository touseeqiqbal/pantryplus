'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { InventoryItem } from '@/lib/db/dexie';
import { useMemo } from 'react';
import { useTheme } from 'next-themes';

interface InventoryPieChartProps {
  items: InventoryItem[];
}

const COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#10b981'];
const DARK_COLORS = ['#818cf8', '#f472b6', '#2dd4bf', '#fbbf24', '#a78bfa', '#34d399'];

export default function InventoryPieChart({ items }: InventoryPieChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const data = useMemo(() => {
    const categoryCount: Record<string, number> = {};
    items.forEach(item => {
      const category = item.category || 'Uncategorized';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    return Object.entries(categoryCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 categories
  }, [items]);

  const activeColors = isDark ? DARK_COLORS : COLORS;

  if (items.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
        No inventory data
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={activeColors[index % activeColors.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              borderColor: isDark ? '#374151' : '#e5e7eb',
              color: isDark ? '#f3f4f6' : '#111827'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
