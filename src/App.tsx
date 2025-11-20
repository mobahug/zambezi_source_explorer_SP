import { useEffect, useMemo, useState } from 'react';
import { Box, Container, Grid, Stack } from '@mui/material';
import type { LatLngLiteral } from 'leaflet';
import Sidebar from './components/Sidebar';
import ZambeziMap from './components/ZambeziMap';

interface TelemetryPoint {
  time: number;
  hr: number;
  ph: number;
}

interface Metrics {
  distanceKm: number;
  heartRate: number;
  ph: number;
  updateInterval: string;
}

const ROUTE: LatLngLiteral[] = [
  { lat: -12.312, lng: 22.244 },
  { lat: -12.221, lng: 22.369 },
  { lat: -12.115, lng: 22.51 },
  { lat: -12.048, lng: 22.712 },
  { lat: -12.034, lng: 22.932 },
  { lat: -12.102, lng: 23.121 },
  { lat: -12.218, lng: 23.312 },
  { lat: -12.401, lng: 23.501 },
];

const UPDATE_INTERVAL_MS = 2000;
const STEP_DELTA = 0.055;

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

function haversineDistance(a: LatLngLiteral, b: LatLngLiteral): number {
  const R = 6371; // km
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const c = 2 * Math.atan2(
    Math.sqrt(sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon),
    Math.sqrt(1 - sinLat * sinLat - Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon),
  );

  return R * c;
}

function interpolatePosition(route: LatLngLiteral[], cumulative: number[], targetDistance: number): LatLngLiteral {
  if (route.length < 2) return route[0];
  let segmentIndex = 0;
  for (let i = 1; i < cumulative.length; i += 1) {
    if (targetDistance <= cumulative[i]) {
      segmentIndex = i - 1;
      break;
    }
  }

  const start = route[segmentIndex];
  const end = route[segmentIndex + 1] ?? route[segmentIndex];
  const segmentStart = cumulative[segmentIndex];
  const segmentEnd = cumulative[segmentIndex + 1] ?? targetDistance;
  const segmentLength = Math.max(segmentEnd - segmentStart, 0.0001);
  const t = Math.min(Math.max((targetDistance - segmentStart) / segmentLength, 0), 1);

  return {
    lat: start.lat + (end.lat - start.lat) * t,
    lng: start.lng + (end.lng - start.lng) * t,
  };
}

function App() {
  const cumulative = useMemo(() => {
    const distances = [0];
    for (let i = 0; i < ROUTE.length - 1; i += 1) {
      distances.push(distances[i] + haversineDistance(ROUTE[i], ROUTE[i + 1]));
    }
    return distances;
  }, []);

  const totalDistance = cumulative[cumulative.length - 1] ?? 0;

  const [progress, setProgress] = useState(0);
  const [timeTick, setTimeTick] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [heartRate, setHeartRate] = useState(120);
  const [ph, setPh] = useState(7);
  const [currentPosition, setCurrentPosition] = useState<LatLngLiteral>(ROUTE[0]);
  const [telemetryData, setTelemetryData] = useState<TelemetryPoint[]>([]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTimeTick((t) => t + 1);
      setProgress((p) => {
        const next = p + STEP_DELTA;
        return next > 1 ? next - 1 : next;
      });
    }, UPDATE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const targetDistance = totalDistance * progress;
    const position = interpolatePosition(ROUTE, cumulative, targetDistance);
    const hr = 120 + Math.sin(timeTick / 3) * 10 + (Math.random() * 8 - 4);
    const phValue = 7 + Math.sin(timeTick / 5) * 0.35 + (Math.random() * 0.1 - 0.05);

    setCurrentPosition(position);
    setDistanceKm(Number(targetDistance.toFixed(1)));
    setHeartRate(Math.round(hr));
    setPh(Number(phValue.toFixed(2)));
    setTelemetryData((prev) => {
      const next = [...prev, { time: timeTick, hr: Math.round(hr), ph: Number(phValue.toFixed(2)) }];
      return next.slice(-30);
    });
  }, [progress, timeTick, cumulative, totalDistance]);

  const metrics: Metrics = {
    distanceKm,
    heartRate,
    ph,
    updateInterval: `${UPDATE_INTERVAL_MS / 1000} seconds`,
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, rgba(2,6,23,0.9) 0%, rgba(3,7,18,0.98) 100%)',
        color: 'text.primary',
        py: { xs: 2, md: 3 },
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={2} sx={{ minHeight: { xs: 'auto', md: '90vh' } }}>
          <Grid item xs={12} md={7.5}>
            <Stack sx={{ height: { xs: 360, md: '100%' }, borderRadius: 3, overflow: 'hidden' }}>
              <ZambeziMap route={ROUTE} position={currentPosition} />
            </Stack>
          </Grid>
          <Grid item xs={12} md={4.5}>
            <Sidebar metrics={metrics} telemetryData={telemetryData} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default App;
