import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Paper,
  TextField,
  makeStyles,
  Divider,
  Chip,
  CircularProgress,
} from "@material-ui/core";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { CryptoState } from "../CryptoContext";
import { ADMINS } from "../config/admins";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    padding: 24,
  },
  section: {
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  chipRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
}));

const darkTheme = createTheme({
  palette: {
    primary: { main: "#fff" },
    type: "dark",
  },
});

export default function AdminPage() {
  const classes = useStyles();
  const { user, setAlert, watchlist, coins } = CryptoState();

  const [targetUid, setTargetUid] = useState("");
  const [fetchedWatchlist, setFetchedWatchlist] = useState([]);
  const [wlLoading, setWlLoading] = useState(false);

  const [announcement, setAnnouncement] = useState("");
  const [annLoading, setAnnLoading] = useState(true);

  const isAdmin = !!user && ADMINS.includes(user.email || "");

  const coinMap = useMemo(() => {
    const m = new Map();
    coins?.forEach((c) => m.set(c.id, c));
    return m;
  }, [coins]);

  const broadcastTestAlert = () => {
    setAlert({ open: true, type: "success", message: "Broadcast from Admin" });
  };

  const clearWatchlist = async (uid) => {
    if (!uid) return;
    try {
      const ref = doc(db, "watchlist", uid);
      await setDoc(ref, { coins: [] }, { merge: true });
      if (uid === targetUid) setFetchedWatchlist([]);
      setAlert({ open: true, type: "success", message: `Cleared watchlist for ${uid}` });
    } catch (e) {
      setAlert({ open: true, type: "error", message: e.message });
    }
  };

  const fetchUserWatchlist = async (uid) => {
    if (!uid) return;
    try {
      setWlLoading(true);
      const ref = doc(db, "watchlist", uid);
      const snap = await getDoc(ref);
      const list = snap.exists() ? snap.data()?.coins || [] : [];
      setFetchedWatchlist(list);
    } catch (e) {
      setAlert({ open: true, type: "error", message: e.message });
    } finally {
      setWlLoading(false);
    }
  };

  const removeCoinFromWatchlist = async (uid, coinId) => {
    if (!uid || !coinId) return;
    try {
      const next = fetchedWatchlist.filter((id) => id !== coinId);
      const ref = doc(db, "watchlist", uid);
      await setDoc(ref, { coins: next }, { merge: true });
      setFetchedWatchlist(next);
      setAlert({ open: true, type: "success", message: `Removed ${coinId} from ${uid}` });
    } catch (e) {
      setAlert({ open: true, type: "error", message: e.message });
    }
  };

  const loadAnnouncement = async () => {
    try {
      setAnnLoading(true);
      const ref = doc(db, "settings", "app");
      const snap = await getDoc(ref);
      setAnnouncement((snap.exists() && snap.data()?.announcement) || "");
    } catch (e) {
      // ignore load error but surface via alert for visibility
      setAlert({ open: true, type: "error", message: e.message });
    } finally {
      setAnnLoading(false);
    }
  };

  const saveAnnouncement = async () => {
    try {
      const ref = doc(db, "settings", "app");
      await setDoc(ref, { announcement }, { merge: true });
      setAlert({ open: true, type: "success", message: "Announcement saved" });
    } catch (e) {
      setAlert({ open: true, type: "error", message: e.message });
    }
  };

  const clearAnnouncement = async () => {
    try {
      const ref = doc(db, "settings", "app");
      await setDoc(ref, { announcement: "" }, { merge: true });
      setAnnouncement("");
      setAlert({ open: true, type: "success", message: "Announcement cleared" });
    } catch (e) {
      setAlert({ open: true, type: "error", message: e.message });
    }
  };

  useEffect(() => {
    if (isAdmin) loadAnnouncement();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  return (
    <ThemeProvider theme={darkTheme}>
      <Container maxWidth="md" style={{ marginTop: 24 }}>
        {!isAdmin ? (
          <Paper className={classes.section}>
            <Typography variant="h5">Access denied</Typography>
            <Typography variant="body1">You must be an admin to view this page.</Typography>
          </Paper>
        ) : (
          <div className={classes.root}>
            <Typography variant="h4">Admin Panel</Typography>

            <Paper className={classes.section}>
              <Typography variant="h6">Quick Actions</Typography>
              <div className={classes.chipRow}>
                <Chip label={`Loaded coins: ${coins?.length || 0}`} />
                <Chip label={`My watchlist: ${watchlist?.length || 0}`} />
              </div>
              <Button variant="contained" style={{ backgroundColor: "#EEBC1D" }} onClick={broadcastTestAlert}>
                Broadcast Test Alert
              </Button>
            </Paper>

            <Paper className={classes.section}>
              <Typography variant="h6">Global Announcement</Typography>
              {annLoading ? (
                <CircularProgress size={20} style={{ color: "gold" }} />
              ) : (
                <>
                  <TextField
                    multiline
                    minRows={3}
                    variant="outlined"
                    placeholder="Write a short announcement for all users..."
                    value={announcement}
                    onChange={(e) => setAnnouncement(e.target.value)}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button variant="contained" style={{ backgroundColor: "#EEBC1D" }} onClick={saveAnnouncement}>
                      Save Announcement
                    </Button>
                    <Button variant="outlined" onClick={clearAnnouncement}>Clear</Button>
                  </div>
                </>
              )}
            </Paper>

            <Paper className={classes.section}>
              <Typography variant="h6">User Watchlist Tools</Typography>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <TextField
                  label="Target User UID"
                  variant="outlined"
                  size="small"
                  value={targetUid}
                  onChange={(e) => setTargetUid(e.target.value)}
                  style={{ flex: 1 }}
                />
                <Button variant="contained" onClick={() => fetchUserWatchlist(targetUid)}>Fetch</Button>
                <Button variant="contained" style={{ backgroundColor: "#ff0000" }} onClick={() => clearWatchlist(targetUid)}>
                  Clear UID Watchlist
                </Button>
              </div>
              <Divider />
              {wlLoading ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CircularProgress size={20} style={{ color: "gold" }} />
                  <Typography variant="body2">Loading watchlist...</Typography>
                </div>
              ) : fetchedWatchlist.length === 0 ? (
                <Typography variant="body2">No items.</Typography>
              ) : (
                <div className={classes.chipRow}>
                  {fetchedWatchlist.map((id) => {
                    const c = coinMap.get(id);
                    const label = c ? `${c.name} (${c.symbol?.toUpperCase()})` : id;
                    return (
                      <Chip
                        key={id}
                        label={label}
                        onDelete={() => removeCoinFromWatchlist(targetUid, id)}
                        color="default"
                        variant="default"
                      />
                    );
                  })}
                </div>
              )}
            </Paper>
          </div>
        )}
      </Container>
    </ThemeProvider>
  );
}
