import {
  Box,
  Card,
  Chip,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ForestIcon from '@mui/icons-material/Forest';
import PublicIcon from '@mui/icons-material/Public';
import VerifiedIcon from '@mui/icons-material/Verified';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MapIcon from '@mui/icons-material/Map';
import InsightsIcon from '@mui/icons-material/Insights';
import MetricCard from './MetricCard';
import TelemetryChart from './TelemetryChart';

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

interface SidebarProps {
  metrics: Metrics;
  telemetryData: TelemetryPoint[];
  overlays: {
    showThreats: boolean;
    showWetlands: boolean;
    showCorridor: boolean;
  };
  onToggleOverlays: (next: {
    showThreats: boolean;
    showWetlands: boolean;
    showCorridor: boolean;
  }) => void;
  alerts: {
    position: { lat: number; lng: number };
    label: string;
    type: 'deforestation' | 'fire' | 'logging';
    distanceKm: number;
    timeAgo: string;
  }[];
}

const Sidebar = ({
  metrics,
  telemetryData,
  overlays,
  onToggleOverlays,
  alerts,
}: SidebarProps) => (
  <Stack spacing={2}>
    <Card sx={{ p: 3 }}>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label="● Zambezi Source Explorer · Demo"
            size="small"
            color="primary"
            sx={{ alignSelf: 'flex-start', fontWeight: 700 }}
          />
          <Chip
            label={`Updated ${metrics.lastUpdated}`}
            size="small"
            color="secondary"
            sx={{ alignSelf: 'flex-start', bgcolor: 'rgba(34,197,94,0.15)', color: '#bbf7d0' }}
          />
        </Stack>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          The Source of the Zambezi
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Live mock expedition feed from the Angolan Highlands. Toggle threats and wetlands to show
          what a real-time protection briefing could look like.
        </Typography>
      </Stack>
    </Card>

    <Card sx={{ p: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <MetricCard
            label="Distance traveled"
            value={`${metrics.distanceKm} km`}
            accent="primary"
          />
        </Grid>
        <Grid item xs={6}>
          <MetricCard
            label="Team heart rate"
            value={`${metrics.heartRate} bpm`}
            accent="secondary"
          />
        </Grid>
        <Grid item xs={6}>
          <MetricCard
            label="Water pH"
            value={metrics.ph.toFixed(2)}
            accent="primary"
          />
        </Grid>
        <Grid item xs={6}>
          <MetricCard label="Water pH" value={metrics.ph.toFixed(2)} accent="primary" />
        </Grid>
        <Grid item xs={6}>
          <MetricCard
            label="Water turbidity"
            value={`${metrics.turbidity.toFixed(1)} NTU`}
            accent="secondary"
          />
        </Grid>
        <Grid item xs={6}>
          <MetricCard
            label="Water temperature"
            value={`${metrics.waterTemp.toFixed(1)} °C`}
            accent="primary"
          />
        </Grid>
        <Grid item xs={12}>
          <MetricCard
            label="Nearest alert"
            value={`${metrics.nearestThreatKm.toFixed(1)} km away`}
            accent="secondary"
          />
        </Grid>
      </Grid>
    </Card>

    <Card sx={{ p: 3 }}>
      <Typography variant="overline" color="text.secondary">
        Telemetry (hr / pH)
      </Typography>
      <Box sx={{ mt: 1 }}>
        <TelemetryChart data={telemetryData} />
      </Box>
    </Card>

    <Card sx={{ p: 3 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={1}
      >
        <Typography variant="h6">Map layers</Typography>
        <IconButton size="small" color="primary">
          <MapIcon fontSize="small" />
        </IconButton>
      </Stack>
      <Stack spacing={1.2}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="subtitle2">Threat alerts</Typography>
            <Typography variant="caption" color="text.secondary">
              Deforestation, fire, logging clusters
            </Typography>
          </Box>
          <Switch
            color="secondary"
            checked={overlays.showThreats}
            onChange={e =>
              onToggleOverlays({ ...overlays, showThreats: e.target.checked })
            }
          />
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="subtitle2">Wetlands / peatlands</Typography>
            <Typography variant="caption" color="text.secondary">
              Mock headwater peat mosaics
            </Typography>
          </Box>
          <Switch
            color="primary"
            checked={overlays.showWetlands}
            onChange={e =>
              onToggleOverlays({ ...overlays, showWetlands: e.target.checked })
            }
          />
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="subtitle2">Ramsar corridor</Typography>
            <Typography variant="caption" color="text.secondary">
              Proposed protection buffer
            </Typography>
          </Box>
          <Switch
            color="secondary"
            checked={overlays.showCorridor}
            onChange={e =>
              onToggleOverlays({ ...overlays, showCorridor: e.target.checked })
            }
          />
        </Stack>
      </Stack>
    </Card>

    <Card sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
        <Typography variant="h6">Ramsar rationale</Typography>
        <VerifiedIcon color="primary" />
      </Stack>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 1 }} />
      <Stack spacing={1.5} color="text.secondary">
        <Stack direction="row" spacing={1} alignItems="center">
          <WaterDropIcon color="primary" fontSize="small" />
          <Typography variant="body2">
            Angolan Highlands wetlands regulate baseflow, acting as a headwater
            water tower feeding downstream drought resilience.
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <ForestIcon color="primary" fontSize="small" />
          <Typography variant="body2">
            Peat mosaics and intact miombo woodlands retain carbon while
            buffering fire spread near the Zambezi source.
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <PublicIcon color="primary" fontSize="small" />
          <Typography variant="body2">
            Over 24M people depend on steady flows for fisheries, floodplain
            farming, hydropower, and transboundary navigation.
          </Typography>
        </Stack>
      </Stack>
    </Card>

    <Card sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
        <Typography variant="h6">Expedition log</Typography>
        <InsightsIcon color="secondary" />
      </Stack>
      <List dense disablePadding>
        {alerts.map((item) => (
          <ListItem key={item.label} disableGutters sx={{ pb: 1 }}>
            <ListItemAvatar>
              {item.type === 'fire' ? (
                <WarningAmberIcon color="secondary" />
              ) : item.type === 'deforestation' ? (
                <ForestIcon color="primary" />
              ) : (
                <MapIcon color="primary" />
              )}
            </ListItemAvatar>
            <ListItemText
              primary={<Typography variant="subtitle2">{item.label}</Typography>}
              secondary={
                <Typography variant="caption" color="text.secondary">
                  {item.timeAgo} · {item.distanceKm.toFixed(1)} km away
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Card>
  </Stack>
);

export default Sidebar;
