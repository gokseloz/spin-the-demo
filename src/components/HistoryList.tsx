import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import type { Spin } from "../types";

type Props = {
  spins: Spin[];
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryList({ spins }: Props) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        History
      </Typography>
      {spins.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No spins yet.
        </Typography>
      ) : (
        <List dense sx={{ maxHeight: 280, overflow: "auto" }}>
          {spins.map((s) => (
            <ListItem key={s.id} disableGutters>
              <ListItemText
                primary={s.participantName}
                secondary={formatDate(s.spunAt)}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
