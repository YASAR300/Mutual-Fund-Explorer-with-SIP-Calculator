"use client";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Box, Card, CardActionArea, CardContent, CircularProgress, Container, Grid, TextField, Typography, Chip, Stack, Skeleton } from "@mui/material";
import Link from "next/link";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function FundsPage() {
  const { data, error, isLoading } = useSWR("/api/mf", fetcher, { revalidateOnFocus: false, dedupingInterval: 60_000 });
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(120);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(t);
  }, [query]);

  const grouped = useMemo(() => {
    const result = new Map();
    if (!Array.isArray(data)) return result;
    for (const s of data) {
      const house = s?.fund_house || "Unknown";
      if (!result.has(house)) result.set(house, []);
      result.get(house).push(s);
    }
    return result;
  }, [data]);

  const filtered = useMemo(() => {
    if (!debouncedQuery) return grouped;
    const q = debouncedQuery.toLowerCase();
    const res = new Map();
    for (const [house, schemes] of grouped.entries()) {
      const list = schemes.filter((s) => (s.schemeName || s.scheme_name || s.scheme_name)?.toLowerCase?.().includes(q));
      if (list.length) res.set(house, list);
    }
    return res;
  }, [grouped, debouncedQuery]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Explore Mutual Funds
      </Typography>
      <TextField fullWidth placeholder="Search scheme name..." value={query} onChange={(e) => setQuery(e.target.value)} size="small" />

      {isLoading && (
        <Grid container spacing={2} mt={1}>
          {Array.from({ length: 12 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={`sk-${i}`}>
              <Skeleton variant="rounded" height={120} />
            </Grid>
          ))}
        </Grid>
      )}
      {error && <Typography color="error">Failed to load funds</Typography>}

      {[...filtered.entries()].map(([house, schemes]) => (
        <Box key={house} mt={4}>
          <Stack direction="row" alignItems="center" gap={1} mb={2}>
            <Typography variant="h6" fontWeight={700}>{house}</Typography>
            <Chip label={`${schemes.length} schemes`} size="small" />
          </Stack>
          <Grid container spacing={2}>
            {schemes.slice(0, visibleCount).map((s) => {
              const code = s?.schemeCode || s?.scheme_code || s?.code;
              const name = s?.schemeName || s?.scheme_name || s?.name;
              const category = s?.category || s?.scheme_category || s?.schemeType;
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={`${house}-${code}`}>
                  <Card variant="outlined" sx={{ height: "100%", transition: "transform .15s ease, box-shadow .15s ease", '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 } }}>
                    <Link href={`/scheme/${code}`} passHref legacyBehavior>
                      <CardActionArea sx={{ height: "100%" }}>
                        <CardContent>
                          <Typography fontWeight={700} gutterBottom noWrap>{name}</Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {category || "Category"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">Code: {code}</Typography>
                        </CardContent>
                      </CardActionArea>
                    </Link>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
          {schemes.length > visibleCount && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Chip label="Load more" onClick={() => setVisibleCount((v) => v + 120)} clickable />
            </Box>
          )}
        </Box>
      ))}
    </Container>
  );
}


