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
  updateInterval: string;
  baseflowContribution: number;
  downstreamPopulation: number;
}

interface SidebarProps {
  metrics: Metrics;
  telemetryData: TelemetryPoint[];
  overlays: { showThreats: boolean; showWetlands: boolean; showCorridor: boolean };
  onToggleOverlays: (next: { showThreats: boolean; showWetlands: boolean; showCorridor: boolean }) => void;
}

const Sidebar = ({ metrics, telemetryData, overlays, onToggleOverlays }: SidebarProps) => (
  <Stack spacing={2} sx={{ height: '100%' }}>
    <Card sx={{ p: 3 }}>
      <Stack spacing={1}>
        <Chip
          label="● Zambezi Source Explorer · Demo"
          size="small"
          color="primary"
          sx={{ alignSelf: 'flex-start', fontWeight: 700 }}
        />
        <Typography variant="h4" fontWeight={800} gutterBottom>
          The Source of the Zambezi
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This demo simulates a river expedition from the Angolan Highlands, showing how live
          expedition data and threats can be visualized to support decisions about protecting the
          Zambezi's source.
        </Typography>
      </Stack>
    </Card>

    <Card sx={{ p: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <MetricCard label="Distance traveled" value={`${metrics.distanceKm} km`} accent="primary" />
        </Grid>
        <Grid item xs={6}>
          <MetricCard label="Team heart rate" value={`${metrics.heartRate} bpm`} accent="secondary" />
        </Grid>
        <Grid item xs={6}>
          <MetricCard label="Water pH" value={metrics.ph.toFixed(2)} accent="primary" />
        </Grid>
        <Grid item xs={6}>
          <MetricCard label="Update interval" value={metrics.updateInterval} />
        </Grid>
        <Grid item xs={6}>
          <MetricCard label="Baseflow contribution" value={`${metrics.baseflowContribution}%`} accent="secondary" />
        </Grid>
        <Grid item xs={6}>
          <MetricCard label="Downstream reach" value={`${(metrics.downstreamPopulation / 1_000_000).toFixed(1)} M people`} />
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
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="h6">Map layers</Typography>
        <IconButton size="small" color="primary">
          <MapIcon fontSize="small" />
        </IconButton>
      </Stack>
      <Stack spacing={1.2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="subtitle2">Threat alerts</Typography>
            <Typography variant="caption" color="text.secondary">
              Deforestation, fire, logging clusters
            </Typography>
          </Box>
          <Switch
            color="secondary"
            checked={overlays.showThreats}
            onChange={(e) => onToggleOverlays({ ...overlays, showThreats: e.target.checked })}
          />
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="subtitle2">Wetlands / peatlands</Typography>
            <Typography variant="caption" color="text.secondary">
              Mock headwater peat mosaics
            </Typography>
          </Box>
          <Switch
            color="primary"
            checked={overlays.showWetlands}
            onChange={(e) => onToggleOverlays({ ...overlays, showWetlands: e.target.checked })}
          />
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="subtitle2">Ramsar corridor</Typography>
            <Typography variant="caption" color="text.secondary">
              Proposed protection buffer
            </Typography>
          </Box>
          <Switch
            color="secondary"
            checked={overlays.showCorridor}
            onChange={(e) => onToggleOverlays({ ...overlays, showCorridor: e.target.checked })}
          />
        </Stack>
      </Stack>
    </Card>

    <Card sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
        <Typography variant="h6">Ramsar rationale</Typography>
        <VerifiedIcon color="primary" />
      </Stack>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 1 }} />
      <Stack spacing={1.5} color="text.secondary">
        <Stack direction="row" spacing={1} alignItems="center">
          <WaterDropIcon color="primary" fontSize="small" />
          <Typography variant="body2">
            Angolan Highlands wetlands regulate baseflow, acting as a headwater water tower feeding
            downstream drought resilience.
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <ForestIcon color="primary" fontSize="small" />
          <Typography variant="body2">
            Peat mosaics and intact miombo woodlands retain carbon while buffering fire spread near
            the Zambezi source.
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <PublicIcon color="primary" fontSize="small" />
          <Typography variant="body2">
            Over 24M people depend on steady flows for fisheries, floodplain farming, hydropower,
            and transboundary navigation.
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
        {[{
          title: 'Source confirmed in Angolan Highlands',
          detail: 'Geo-referenced springs and peat domes mapped for Ramsar nomination',
          icon: <VerifiedIcon color="primary" />, }, {
          title: 'Active fire edge spotted',
          detail: 'Thermal hotspot north of route; buffer recommended',
          icon: <WarningAmberIcon color="secondary" />, }, {
          title: 'Water chemistry stable',
          detail: 'pH holding near 7.0 with low turbidity',
          icon: <WaterDropIcon color="primary" />, }].map((item) => (
          <ListItem key={item.title} disableGutters sx={{ pb: 1 }}>
            <ListItemAvatar>{item.icon}</ListItemAvatar>
            <ListItemText
              primary={<Typography variant="subtitle2">{item.title}</Typography>}
              secondary={<Typography variant="caption" color="text.secondary">{item.detail}</Typography>}
            />
          </ListItem>
        ))}
      </List>
    </Card>
  </Stack>
);

export default Sidebar;
