import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import type { Spin } from "../types";

type Props = {
  spins: Spin[];
  onDelete: (id: string) => void;
  onClear: () => void;
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

export default function HistoryList({ spins, onDelete, onClear }: Props) {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography variant="h6">History</Typography>
        {spins.length > 0 && (
          <Button
            size="small"
            color="inherit"
            onClick={() => {
              if (confirm("Delete all history?")) onClear();
            }}
          >
            Clear all
          </Button>
        )}
      </Box>
      {spins.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No spins yet.
        </Typography>
      ) : (
        <List dense sx={{ maxHeight: 280, overflow: "auto" }}>
          {spins.map((s) => (
            <ListItem
              key={s.id}
              disableGutters
              secondaryAction={
                <Tooltip title="Delete entry">
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => onDelete(s.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              }
            >
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
