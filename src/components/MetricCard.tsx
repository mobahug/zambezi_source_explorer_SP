import { Card, Stack, Typography } from '@mui/material';

interface MetricCardProps {
  label: string;
  value: string | number;
  accent?: 'primary' | 'secondary';
}

const MetricCard = ({ label, value, accent = 'primary' }: MetricCardProps) => (
  <Card
    variant="outlined"
    sx={{
      p: 2.5,
      height: '100%',
      background: 'linear-gradient(135deg, rgba(20, 24, 40, 0.85), rgba(10, 14, 26, 0.9))',
      borderColor: 'rgba(255,255,255,0.06)',
    }}
  >
    <Stack spacing={0.5}>
      <Typography variant="overline" color="text.secondary" fontWeight={700}>
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={800} color={`${accent}.main`}>
        {value}
      </Typography>
    </Stack>
  </Card>
);

export default MetricCard;
