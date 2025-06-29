'use client';

import type { Nutrient } from '@/ai/flows/extract-ingredients-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';

interface NutritionChartProps {
  data: Nutrient[];
  servingSizeLabel?: string;
}

const parseValue = (value: string | undefined): number => {
  if (!value) return 0;
  return parseFloat(value) || 0;
};

export default function NutritionChart({ data, servingSizeLabel }: NutritionChartProps) {
  if (!data || data.length === 0) {
    return null;
  }

  // Filter data to only include nutrients measured in 'g' or 'mg' to make the chart comparable.
  // This avoids plotting energy (kJ/kcal) on the same scale as weight-based nutrients.
  const comparableData = data.filter(item => {
    const nutrientName = (item.nutrient || '').toLowerCase();
    if (nutrientName === 'energy') {
      return false; // Always exclude energy
    }
    const perServing = (item.perServing || '').toLowerCase();
    const per100mL = (item.per100mL || '').toLowerCase();
    // Include if units are present and are some form of grams.
    return perServing.includes('g') || per100mL.includes('g');
  });

  if (comparableData.length === 0) {
    // Don't render the chart if there's no comparable data to show.
    return null;
  }

  const chartData = comparableData.map(item => ({
    name: item.nutrient,
    'Per Serving': parseValue(item.perServing),
    'Per 100mL/g': parseValue(item.per100mL),
    servingRaw: item.perServing,
    per100Raw: item.per100mL,
  }));
  
  const servingLabelText = servingSizeLabel ? `Per Serving (${servingSizeLabel.split(':')[1]?.trim() || ''})` : 'Per Serving';

  const chartConfig = {
    'Per Serving': {
      label: servingLabelText,
      color: 'hsl(var(--chart-1))',
    },
    'Per 100mL/g': {
      label: 'Per 100mL/g',
      color: 'hsl(var(--chart-2))',
    },
  } satisfies ChartConfig;

  return (
    <Card className="mt-6 border-2 border-dashed">
      <CardHeader>
        <CardTitle>Nutrition Comparison Chart</CardTitle>
        <CardDescription>
         A visual comparison of key nutrients (in g/mg) per serving vs. per 100mL/g.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 20,
                left: 0,
                bottom: 60,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                label={{ value: 'Amount', angle: -90, position: 'insideLeft' }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent
                  indicator="dot"
                  formatter={(value, name, props) => {
                      if (name === 'Per Serving') return `${props.payload.servingRaw || 'N/A'}`;
                      if (name === 'Per 100mL/g') return `${props.payload.per100Raw || 'N/A'}`;
                      return `${value}`;
                  }}
                  labelClassName="font-bold"
                />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="Per Serving" fill="var(--color-Per Serving)" radius={4} />
              <Bar dataKey="Per 100mL/g" fill="var(--color-Per 100mL/g)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
