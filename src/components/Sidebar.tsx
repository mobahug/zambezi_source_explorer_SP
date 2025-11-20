import {
  Box,
  Card,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
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
}

interface SidebarProps {
  metrics: Metrics;
  telemetryData: TelemetryPoint[];
}

const Sidebar = ({ metrics, telemetryData }: SidebarProps) => (
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
      <Typography variant="h6" gutterBottom>
        Why protect the source?
      </Typography>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 1 }} />
      <Stack spacing={1.5} color="text.secondary">
        <Typography variant="body2">
          The Zambezi is a lifeline for millions from Angola to Mozambique, powering food systems,
          fisheries, and hydropower. Every drop downstream begins as mist and rainfall in these
          highlands.
        </Typography>
        <Typography variant="body2">
          The Angolan Highlands act as a water tower. Intact peatlands and miombo woodlands filter
          and store water, releasing it steadily to keep the Zambezi flowing even in the dry season.
        </Typography>
        <Typography variant="body2">
          Protecting the source from deforestation, fire, and unchecked development is critical.
          Safeguarding this headwater landscape shields biodiversity, stabilizes flows, and keeps
          communities resilient.
        </Typography>
      </Stack>
    </Card>
  </Stack>
);

export default Sidebar;
