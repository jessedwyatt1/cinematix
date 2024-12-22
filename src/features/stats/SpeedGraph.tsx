import { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useSession } from '@/hooks/useSession';
import { formatBytes } from '@/utils/formatters';

const MAX_DATA_POINTS = 60; // 2 minutes of data at 2-second intervals

interface SpeedDataPoint {
  time: string;
  download: number;
  upload: number;
}

function SpeedGraph() {
  const [data, setData] = useState<SpeedDataPoint[]>([]);
  const { sessionStats } = useSession();

  const addDataPoint = useCallback(() => {
    if (!sessionStats) return;

    const now = new Date();
    const time = now.toLocaleTimeString();
    
    const newPoint = {
      time,
      download: sessionStats.downloadSpeed,
      upload: sessionStats.uploadSpeed
    };

    setData(prevData => {
      const newData = [...prevData, newPoint];
      if (newData.length > MAX_DATA_POINTS) {
        return newData.slice(-MAX_DATA_POINTS);
      }
      return newData;
    });
  }, [sessionStats]);

  useEffect(() => {
    addDataPoint();
    const interval = setInterval(addDataPoint, 2000);
    return () => clearInterval(interval);
  }, [addDataPoint]);

  // Calculate max value for Y axis scale

  const formatYAxis = (value: number) => {
    return formatBytes(value, 0) + '/s';
  };

  const CustomTooltip = ({ 
    active, 
    payload 
  }: {
    active?: boolean;
    payload?: Array<{
      value: number;
      payload: SpeedDataPoint;
    }>;
  }) => {
    if (!active || !payload) return null;

    return (
      <div className="rounded-lg border border-border bg-popover p-2 text-sm shadow-md">
        <p className="font-medium text-popover-foreground">{payload[0]?.payload.time}</p>
        <p className="flex items-center gap-2 text-emerald-500">
          ↓ {formatBytes(payload[0]?.value)}/s
        </p>
        <p className="flex items-center gap-2 text-blue-500">
          ↑ {formatBytes(payload[1]?.value)}/s
        </p>
      </div>
    );
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <XAxis 
            dataKey="time" 
            stroke="currentColor" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="currentColor"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatYAxis}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="download" 
            stroke="rgb(16, 185, 129)" // emerald-500
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line 
            type="monotone" 
            dataKey="upload" 
            stroke="rgb(59, 130, 246)" // blue-500
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SpeedGraph;