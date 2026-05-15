'use client';

import type { Nutrient } from '@/ai/flows/extract-ingredients-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Cell } from 'recharts';
import { Activity } from 'lucide-react';

interface NutritionChartProps {
  data: Nutrient[];
  servingSizeLabel?: string;
}

const parseValue = (value: string | undefined): number => {
  if (!value || value.toLowerCase() === 'n/a' || value === '0') return 0;
  // Remove all non-numeric characters except for the decimal point
  const numericString = value.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(numericString);
  return isNaN(parsed) ? 0 : Number(parsed.toFixed(2));
};

export default function NutritionChart({ data, servingSizeLabel }: NutritionChartProps) {
  if (!data || data.length === 0) {
    return null;
  }

  // Define which nutrients to include and their display order
  const priorityNutrients = [
    'energy', 'protein', 'carbohydrate', 'total sugars', 
    'added sugars', 'total fat', 'saturated fat', 'trans fat', 'sodium'
  ];

  const nutrientColors: Record<string, string> = {
    'energy': '#22c55e',      // Green
    'protein': '#3b82f6',     // Blue
    'carbohydrate': '#eab308', // Yellow
    'total sugars': '#f59e0b', // Amber
    'added sugars': '#f97316', // Orange
    'total fat': '#f97316',    // Orange
    'saturated fat': '#ef4444', // Red
    'trans fat': '#991b1b',    // Dark Red
    'sodium': '#6366f1'        // Indigo
  };

  const chartData = data
    .filter(item => priorityNutrients.includes(item.nutrient.toLowerCase()))
    .sort((a, b) => priorityNutrients.indexOf(a.nutrient.toLowerCase()) - priorityNutrients.indexOf(b.nutrient.toLowerCase()))
    .map(item => {
      const lowerName = item.nutrient.toLowerCase();
      return {
        name: item.nutrient,
        'Per Serving': parseValue(item.perServing),
        'Per 100mL/g': parseValue(item.per100mL),
        servingRaw: item.perServing || '0',
        per100Raw: item.per100mL || '0',
        unit: (item.perServing || item.per100mL || '').replace(/[0-9.]/g, '').trim(),
        fill: nutrientColors[lowerName] || '#94a3b8'
      };
    });

  if (chartData.length === 0) {
    return null;
  }

  const chartConfig = {
    'Per Serving': {
      label: servingSizeLabel ? `Serving (${servingSizeLabel.replace(/Serving size: /i, '')})` : 'Per Serving',
      color: 'hsl(var(--primary))',
    },
    'Per 100mL/g': {
      label: 'Per 100g/mL',
      color: 'hsl(var(--accent))',
    },
  } satisfies ChartConfig;

  return (
    <Card className="mt-6 border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
           <Activity className="h-5 w-5 text-primary" />
           Nutritional Profile
        </CardTitle>
        <CardDescription>
         Comparison of key nutrients. Values are normalized for visualization.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{
                top: 5,
                right: 30,
                left: 40,
                bottom: 5,
              }}
              barGap={2}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                tickLine={false}
                axisLine={false}
                width={100}
                tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)', fontWeight: 500 }}
              />
              <ChartTooltip
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                content={<ChartTooltipContent
                  indicator="dot"
                  formatter={(value, name, props) => {
                      if (name === 'Per Serving') return (
                        <div className="flex items-center gap-2">
                           <span className="font-bold text-white">{props.payload.servingRaw}</span>
                        </div>
                      );
                      if (name === 'Per 100mL/g') return (
                        <div className="flex items-center gap-2">
                           <span className="font-medium text-white/70">{props.payload.per100Raw}</span>
                        </div>
                      );
                      return value;
                  }}
                />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="Per Serving" radius={[0, 4, 4, 0]} barSize={16}>
                {chartData.map((entry, index) => (
                   <Cell key={`cell-serving-${index}`} fill={entry.fill} fillOpacity={1} />
                ))}
              </Bar>
              <Bar dataKey="Per 100mL/g" radius={[0, 4, 4, 0]} barSize={16}>
                {chartData.map((entry, index) => (
                   <Cell key={`cell-100-${index}`} fill={entry.fill} fillOpacity={0.4} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
