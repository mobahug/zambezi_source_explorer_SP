import { useEffect, useMemo, useState } from 'react';
import {
  AppBar,
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  Stack,
  TextField,
  Toolbar,
  Typography,
  Button,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import RoomIcon from '@mui/icons-material/Room';
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
  turbidity: number;
  waterTemp: number;
  lastUpdated: string;
  nearestThreatKm: number;
}

type ExpeditionIcon = 'note' | 'observation' | 'alert';

interface ExpeditionLog {
  id: string;
  title: string;
  body: string;
  icon: ExpeditionIcon;
  createdAt: number;
  position: LatLngLiteral;
}

interface OverlayToggles {
  showThreats: boolean;
  showWetlands: boolean;
  showCorridor: boolean;
  showLogs: boolean;
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

interface ThreatMarker {
  position: LatLngLiteral;
  label: string;
  type: 'deforestation' | 'fire' | 'logging';
}

const threatMarkers: ThreatMarker[] = [
  {
    position: { lat: -12.29, lng: 22.36 },
    label: 'Deforestation hotspot – woodland loss since 2010',
    type: 'deforestation',
  },
  {
    position: { lat: -12.18, lng: 22.65 },
    label: 'Fire cluster – increased burn frequency',
    type: 'fire',
  },
  {
    position: { lat: -12.05, lng: 22.91 },
    label: 'Logging area – road expansion risk',
    type: 'logging',
  },
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
  const [turbidity, setTurbidity] = useState(4.2);
  const [waterTemp, setWaterTemp] = useState(18.5);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
  const [currentPosition, setCurrentPosition] = useState<LatLngLiteral>(ROUTE[0]);
  const [telemetryData, setTelemetryData] = useState<TelemetryPoint[]>([]);
  const [overlays, setOverlays] = useState<OverlayToggles>({
    showThreats: true,
    showWetlands: true,
    showCorridor: true,
    showLogs: true,
  });
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [nearestThreatKm, setNearestThreatKm] = useState(0);
  const [logs, setLogs] = useState<ExpeditionLog[]>([]);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [viewLog, setViewLog] = useState<ExpeditionLog | null>(null);
  const [logForm, setLogForm] = useState({ title: '', body: '', icon: 'note' as ExpeditionIcon });

  function nearestThreatDistanceKm(position: LatLngLiteral) {
    const distances = threatMarkers.map((marker) => haversineDistance(position, marker.position));
    return distances.length ? Math.min(...distances) : 0;
  }

  useEffect(() => {
    const stored = window.localStorage.getItem('zambezi-expedition-logs');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ExpeditionLog[];
        setLogs(parsed);
      } catch (err) {
        console.error('Failed to parse stored logs', err);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('zambezi-expedition-logs', JSON.stringify(logs));
  }, [logs]);

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
    const turbidityValue = Math.max(0.8, 3.5 + Math.sin(timeTick / 4) * 0.8 + (Math.random() * 0.6 - 0.3));
    const waterTempValue = 18.5 + Math.sin(timeTick / 6) * 1.8 + (Math.random() * 0.4 - 0.2);

    setCurrentPosition(position);
    setDistanceKm(Number(targetDistance.toFixed(1)));
    setHeartRate(Math.round(hr));
    setPh(Number(phValue.toFixed(2)));
    setTurbidity(Number(turbidityValue.toFixed(2)));
    setWaterTemp(Number(waterTempValue.toFixed(1)));
    setLastUpdated(new Date().toLocaleTimeString());
    setNearestThreatKm(Number(nearestThreatDistanceKm(position).toFixed(1)));
    setTelemetryData((prev) => {
      const next = [...prev, { time: timeTick, hr: Math.round(hr), ph: Number(phValue.toFixed(2)) }];
      return next.slice(-30);
    });
  }, [progress, timeTick, cumulative, totalDistance]);

  const metrics: Metrics = {
    distanceKm,
    heartRate,
    ph,
    turbidity,
    waterTemp,
    lastUpdated,
    nearestThreatKm,
  };

  const iconOptions: { value: ExpeditionIcon; label: string }[] = [
    { value: 'note', label: 'General note' },
    { value: 'observation', label: 'Observation' },
    { value: 'alert', label: 'Alert' },
  ];

  const handleSaveLog = () => {
    if (!logForm.title.trim()) return;
    const newLog: ExpeditionLog = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
      title: logForm.title.trim(),
      body: logForm.body.trim(),
      icon: logForm.icon,
      createdAt: Date.now(),
      position: currentPosition,
    };
    setLogs((prev) => [newLog, ...prev]);
    setLogForm({ title: '', body: '', icon: 'note' });
    setLogModalOpen(false);
  };

  const handleSelectLog = (logId: string) => {
    const found = logs.find((l) => l.id === logId);
    if (found) setViewLog(found);
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
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: 'rgba(3,7,18,0.9)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip label="Zambezi Source Explorer · Demo" color="primary" size="small" sx={{ fontWeight: 700 }} />
            <Typography variant="h6" fontWeight={800} sx={{ display: { xs: 'none', sm: 'block' } }}>
              The Source of the Zambezi
            </Typography>
          </Stack>
          <IconButton
            color="inherit"
            edge="end"
            onClick={() => setDrawerOpen(true)}
            sx={{ display: drawerOpen ? 'none' : 'inline-flex' }}
          >
            <MenuRoundedIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <ZambeziMap
          route={ROUTE}
          position={currentPosition}
          threatVisible={overlays.showThreats}
          wetlands={overlays.showWetlands ? wetlandPatches : []}
          corridor={overlays.showCorridor ? corridorLine : []}
          logMarkers={logs}
          showLogs={overlays.showLogs}
        />
      </Box>

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
        <Toolbar sx={{ justifyContent: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <IconButton color="inherit" onClick={() => setDrawerOpen(false)}>
            <ChevronRightIcon />
          </IconButton>
        </Toolbar>
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
            alerts={threatMarkers.map((marker, idx) => ({
              ...marker,
              distanceKm: Number(haversineDistance(currentPosition, marker.position).toFixed(1)),
              timeAgo: `${5 + idx * 3} min ago`,
            }))}
            logs={logs}
            onAddLog={() => setLogModalOpen(true)}
            onSelectLog={handleSelectLog}
          />
        </Box>
      </Drawer>

      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: 16, md: 20 },
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
          display: 'flex',
          gap: 1,
          bgcolor: 'rgba(3,7,18,0.85)',
          borderRadius: 999,
          px: 1.25,
          py: 0.5,
          boxShadow: '0 12px 28px rgba(0,0,0,0.45)',
        }}
      >
        <IconButton color="primary" onClick={() => setLogModalOpen(true)}>
          <NoteAddIcon />
        </IconButton>
        <IconButton
          color={overlays.showLogs ? 'primary' : 'default'}
          onClick={() => setOverlays({ ...overlays, showLogs: !overlays.showLogs })}
        >
          <RoomIcon />
        </IconButton>
      </Box>

      <Dialog open={logModalOpen} onClose={() => setLogModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add expedition log</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Stack direction="row" spacing={1}>
            {iconOptions.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                color={logForm.icon === opt.value ? 'primary' : 'default'}
                onClick={() => setLogForm((f) => ({ ...f, icon: opt.value }))}
                sx={{ fontWeight: logForm.icon === opt.value ? 700 : 500 }}
              />
            ))}
          </Stack>
          <TextField
            label="Title"
            value={logForm.title}
            onChange={(e) => setLogForm((f) => ({ ...f, title: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Details"
            value={logForm.body}
            onChange={(e) => setLogForm((f) => ({ ...f, body: e.target.value }))}
            fullWidth
            multiline
            minRows={3}
          />
          <Typography variant="caption" color="text.secondary">
            Log will pin to your current position along the route.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveLog} variant="contained" disabled={!logForm.title.trim()}>
            Save log
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!viewLog} onClose={() => setViewLog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{viewLog?.title}</DialogTitle>
        <DialogContent sx={{ whiteSpace: 'pre-line' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {viewLog ? new Date(viewLog.createdAt).toLocaleString() : ''}
          </Typography>
          <Typography variant="body1">{viewLog?.body || 'No details provided.'}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewLog(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;
