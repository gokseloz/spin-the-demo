import { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import type { Participant } from "../types";

const EMOJI_CHOICES = [
  "🎯",
  "🚀",
  "⭐",
  "🔥",
  "🌊",
  "🌸",
  "⚡",
  "🎨",
  "🦄",
  "🐱",
  "🐶",
  "🍕",
  "☕",
  "🎸",
  "🧠",
];

type Props = {
  participants: Participant[];
  onAdd: (name: string, emoji: string) => void;
  onUpdate: (id: string, patch: Partial<Participant>) => void;
  onDelete: (id: string) => void;
  onSetActive: (id: string, active: boolean) => void;
};

export default function RosterPanel({
  participants,
  onAdd,
  onUpdate,
  onDelete,
  onSetActive,
}: Props) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(EMOJI_CHOICES[0]);

  const active = participants.filter((p) => p.active);
  const inactive = participants.filter((p) => !p.active);

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed, emoji);
    setName("");
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Roster
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
        <TextField
          select
          slotProps={{ select: { native: true } }}
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          sx={{ width: 80 }}
          size="small"
        >
          {EMOJI_CHOICES.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </TextField>
        <TextField
          placeholder="Add name…"
          size="small"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <Button variant="outlined" onClick={submit}>
          Add
        </Button>
      </Stack>

      <List dense>
        {active.map((p) => (
          <ListItem
            key={p.id}
            secondaryAction={
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Move to 'already presented'">
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => onSetActive(p.id, false)}
                  >
                    <VisibilityOffIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Remove permanently">
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => onDelete(p.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            }
          >
            <ListItemText
              primary={
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{p.emoji}</span>
                  <TextField
                    value={p.name}
                    onChange={(e) => onUpdate(p.id, { name: e.target.value })}
                    variant="standard"
                    size="small"
                  />
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>

      {inactive.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Already presented ({inactive.length})
          </Typography>
          <List dense>
            {inactive.map((p) => (
              <ListItem
                key={p.id}
                secondaryAction={
                  <Tooltip title="Restore to wheel">
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => onSetActive(p.id, true)}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                }
                sx={{ opacity: 0.6 }}
              >
                <ListItemText primary={`${p.emoji} ${p.name}`} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
}
