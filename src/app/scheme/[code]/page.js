"use client";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { Box, Card, CardContent, Container, Grid, Typography, Chip, Stack, TextField, MenuItem, Button, Divider } from "@mui/material";
import { VictoryChart, VictoryLine, VictoryAxis, VictoryVoronoiContainer, VictoryTooltip, VictoryTheme, VictoryArea, VictoryZoomContainer } from "victory";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function SchemePage({ params }) {
  const code = params.code;
  const { data: scheme, isLoading } = useSWR(`/api/scheme/${code}`, fetcher, { revalidateOnFocus: false });
  const { data: r1m } = useSWR(`/api/scheme/${code}/returns?period=1m`, fetcher);
  const { data: r3m } = useSWR(`/api/scheme/${code}/returns?period=3m`, fetcher);
  const { data: r6m } = useSWR(`/api/scheme/${code}/returns?period=6m`, fetcher);
  const { data: r1y } = useSWR(`/api/scheme/${code}/returns?period=1y`, fetcher);

  const [sip, setSip] = useState({ amount: 5000, frequency: "monthly", from: "2020-01-01", to: new Date().toISOString().slice(0,10) });
  const [sipResult, setSipResult] = useState(null);
  const [loadingSip, setLoadingSip] = useState(false);

  const navData = useMemo(() => {
    const points = scheme?.navHistory?.slice(-365) || [];
    return points.map((d) => ({ x: d.date, y: d.nav }));
  }, [scheme]);

  const onCalcSip = async () => {
    try {
      setLoadingSip(true);
      const res = await fetch(`/api/scheme/${code}/sip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sip),
      });
      const json = await res.json();
      setSipResult(json);
    } finally {
      setLoadingSip(false);
    }
  };

  const growthData = useMemo(() => {
    if (!sipResult?.contributions || !scheme?.navHistory) return [];
    let cumulativeUnits = 0;
    const lastNav = scheme.navHistory[scheme.navHistory.length - 1]?.nav || 0;
    return sipResult.contributions.map((c) => {
      cumulativeUnits += c.units;
      return { x: c.date, y: cumulativeUnits * lastNav };
    });
  }, [sipResult, scheme]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        {scheme?.meta?.schemeName || "Loading..."}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>NAV (last 1 year)</Typography>
              <Box sx={{ width: "100%", height: 300 }}>
                <VictoryChart
                  height={300}
                  padding={{ top: 10, left: 50, right: 20, bottom: 40 }}
                  theme={VictoryTheme.material}
                  containerComponent={<VictoryZoomContainer allowZoom allowPan zoomDimension="x" zoomDomain={{ x: [0, navData.length] }} />}
                >
                  <VictoryAxis tickFormat={(t) => (typeof t === "string" ? t.slice(2, 10) : t)} style={{ tickLabels: { fontSize: 9 } }} />
                  <VictoryAxis dependentAxis tickFormat={(t) => `${t}`} style={{ tickLabels: { fontSize: 9 } }} />
                  <VictoryLine data={navData} interpolation="monotoneX" style={{ data: { stroke: "#1976d2" } }} />
                </VictoryChart>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography fontWeight={700} gutterBottom>Metadata</Typography>
              <Stack spacing={0.5}>
                <Row k="Fund House" v={scheme?.meta?.fundHouse} />
                <Row k="Category" v={scheme?.meta?.schemeCategory} />
                <Row k="Type" v={scheme?.meta?.schemeType} />
                <Row k="ISIN (Growth)" v={scheme?.meta?.isin?.growth} />
                <Row k="ISIN (Dividend)" v={scheme?.meta?.isin?.dividend} />
                <Row k="Last Updated" v={scheme?.meta?.lastUpdated} />
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ mt: 2 }}>
            <CardContent>
              <Typography fontWeight={700} gutterBottom>Returns</Typography>
              <Stack spacing={0.5}>
                <Row k="1m" v={fmtPct(r1m?.simpleReturn)} />
                <Row k="3m" v={fmtPct(r3m?.simpleReturn)} />
                <Row k="6m" v={fmtPct(r6m?.simpleReturn)} />
                <Row k="1y (Ann.)" v={fmtPct(r1y?.annualizedReturn)} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" fontWeight={700} gutterBottom>
        SIP Calculator
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label="Amount" type="number" fullWidth value={sip.amount} onChange={(e) => setSip({ ...sip, amount: Number(e.target.value) })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField select label="Frequency" fullWidth value={sip.frequency} onChange={(e) => setSip({ ...sip, frequency: e.target.value })}>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="From" type="date" fullWidth InputLabelProps={{ shrink: true }} value={sip.from} onChange={(e) => setSip({ ...sip, from: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="To" type="date" fullWidth InputLabelProps={{ shrink: true }} value={sip.to} onChange={(e) => setSip({ ...sip, to: e.target.value })} />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" onClick={onCalcSip} disabled={loadingSip}>Calculate Returns</Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography fontWeight={700} gutterBottom>Results</Typography>
              {sipResult ? (
                <Stack spacing={0.5}>
                  <Row k="Total Invested" v={fmtCurrency(sipResult.totalInvested)} />
                  <Row k="Current Value" v={fmtCurrency(sipResult.currentValue)} />
                  <Row k="Absolute Return" v={fmtPct(sipResult.absoluteReturn)} />
                  <Row k="Annualized Return" v={fmtPct(sipResult.annualizedReturn)} />
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">Enter inputs and calculate.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Growth of Investment</Typography>
              <Box sx={{ width: "100%", height: 320 }}>
                <VictoryChart
                  height={320}
                  padding={{ top: 10, left: 50, right: 20, bottom: 40 }}
                  theme={VictoryTheme.material}
                  containerComponent={<VictoryVoronoiContainer voronoiDimension="x" labels={({ datum }) => `${datum.x}\n${fmtCurrency(datum.y)}`} labelComponent={<VictoryTooltip constrainToVisibleArea />} />}
                >
                  <VictoryAxis tickFormat={(t) => (typeof t === "string" ? t.slice(2, 10) : t)} style={{ tickLabels: { fontSize: 9 } }} />
                  <VictoryAxis dependentAxis tickFormat={(t) => `${Math.round(t)}`} style={{ tickLabels: { fontSize: 9 } }} />
                  <VictoryArea data={growthData} interpolation="monotoneX" style={{ data: { stroke: "#1976d2", fill: "#1976d233" } }} />
                </VictoryChart>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

function Row({ k, v }) {
  return (
    <Stack direction="row" spacing={1} justifyContent="space-between">
      <Typography variant="body2" color="text.secondary">{k}</Typography>
      <Typography variant="body2" fontWeight={600}>{v ?? "-"}</Typography>
    </Stack>
  );
}

function fmtPct(v) {
  if (v === null || v === undefined || Number.isNaN(v)) return "-";
  return `${v.toFixed(2)}%`;
}

function fmtCurrency(v) {
  if (v === null || v === undefined || Number.isNaN(v)) return "-";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);
}


