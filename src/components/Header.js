"use client";
import Link from "next/link";
import { AppBar, Toolbar, Typography, Button, Container } from "@mui/material";

export default function Header() {
  return (
    <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ gap: 2 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Typography variant="h6" fontWeight={800} color="primary.main">MF Explorer</Typography>
          </Link>
          <div style={{ flexGrow: 1 }} />
          <Button component={Link} href="/funds" color="primary" variant="text">Funds</Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}


