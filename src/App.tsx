import { useEffect, useMemo, useState } from 'react';
import { Box, Chip, Drawer, IconButton, Stack, Typography } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
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
  baseflowContribution: number;
  downstreamPopulation: number;
}

interface OverlayToggles {
  showThreats: boolean;
  showWetlands: boolean;
  showCorridor: boolean;
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

const wetlandPatches: LatLngLiteral[][] = [
  [
    { lat: -12.31, lng: 22.21 },
    { lat: -12.29, lng: 22.33 },
    { lat: -12.23, lng: 22.38 },
    { lat: -12.19, lng: 22.28 },
  ],
  [
    { lat: -12.15, lng: 22.55 },
    { lat: -12.12, lng: 22.63 },
    { lat: -12.08, lng: 22.59 },
    { lat: -12.12, lng: 22.5 },
  ],
];

const corridorLine: LatLngLiteral[] = [
  { lat: -12.35, lng: 22.14 },
  { lat: -12.02, lng: 22.98 },
  { lat: -12.14, lng: 23.45 },
];

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
  const [overlays, setOverlays] = useState<OverlayToggles>({
    showThreats: true,
    showWetlands: true,
    showCorridor: true,
  });
  const [drawerOpen, setDrawerOpen] = useState(true);

  const baseflowContribution = useMemo(
    () => 64 + Math.sin(progress * Math.PI * 2) * 4 + Math.random() * 1.5,
    [progress],
  );

  const downstreamPopulation = useMemo(
    () => 24000000 + Math.sin(timeTick / 8) * 100000,
    [timeTick],
  );

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
    baseflowContribution: Number(baseflowContribution.toFixed(1)),
    downstreamPopulation: Math.round(downstreamPopulation),
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: '#020617',
        color: 'text.primary',
      }}
    >
      <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <ZambeziMap
          route={ROUTE}
          position={currentPosition}
          threatVisible={overlays.showThreats}
          wetlands={overlays.showWetlands ? wetlandPatches : []}
          corridor={overlays.showCorridor ? corridorLine : []}
        />
      </Box>

      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          position: 'absolute',
          top: { xs: 12, md: 16 },
          left: { xs: 12, md: 16 },
          zIndex: 2,
          background: 'rgba(3,7,18,0.85)',
          borderRadius: 999,
          px: 1,
          py: 0.5,
          boxShadow: 6,
        }}
      >
        <IconButton
          color="primary"
          size="small"
          onClick={() => setDrawerOpen((open) => !open)}
          sx={{ bgcolor: 'rgba(255,255,255,0.06)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
        >
          <MenuRoundedIcon />
        </IconButton>
        <Chip label="Zambezi Source Explorer · Demo" color="primary" size="small" sx={{ fontWeight: 700 }} />
        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
          Map-first layout with an immersive drawer
        </Typography>
      </Stack>

      <Drawer
        anchor="right"
        variant="persistent"
        open={drawerOpen}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 420, md: 460 },
            maxWidth: '100vw',
            background: 'linear-gradient(180deg, rgba(3,7,18,0.95) 0%, rgba(2,6,23,0.92) 100%)',
            color: 'text.primary',
            border: 'none',
            boxShadow: '-12px 0 24px rgba(0,0,0,0.45)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: { xs: 2, md: 3 },
            pb: { xs: 4, md: 6 },
          }}
        >
          <Sidebar
            metrics={metrics}
            telemetryData={telemetryData}
            overlays={overlays}
            onToggleOverlays={(next) => setOverlays(next)}
          />
        </Box>
      </Drawer>
    </Box>
  );
}

export default App;
