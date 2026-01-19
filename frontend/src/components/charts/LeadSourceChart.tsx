import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface LeadSourceChartProps {
  data: Array<{
    source: string
    count: number
  }>
}

const COLORS = [
  'hsl(222, 47%, 11%)', // primary
  'hsl(142, 76%, 36%)', // success
  'hsl(38, 92%, 50%)', // warning
  'hsl(0, 84%, 60%)', // error
  'hsl(210, 40%, 60%)', // muted
  'hsl(280, 65%, 60%)', // purple
]

export function LeadSourceChart({ data }: LeadSourceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Source Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props: any) => {
                const { source, percent } = props
                return `${source} ${percent ? (percent * 100).toFixed(0) : 0}%`
              }}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
