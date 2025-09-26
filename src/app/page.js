import { Container, Typography, Button, Stack } from "@mui/material";
import Link from "next/link";

export default function Home() {
  return (
    <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
      <Typography variant="h3" fontWeight={800} gutterBottom>Mutual Fund Explorer</Typography>
      <Typography color="text.secondary" gutterBottom>
        Search funds, view NAV history, and calculate SIP returns using real data from MFAPI.
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={4} justifyContent="center">
        <Link href="/funds"><Button variant="contained" size="large">Browse Funds</Button></Link>
        <Link href="/funds"><Button variant="outlined" size="large">Start Exploring</Button></Link>
      </Stack>
    </Container>
  );
}
