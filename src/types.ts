export type Participant = {
  id: string;
  name: string;
  emoji: string;
  active: boolean; // false = "already presented" pool
  createdAt: string;
};

export type Spin = {
  id: string;
  participantId: string;
  participantName: string;
  spunAt: string;
};

export type Settings = {
  excludeLastN: number;
  soundEnabled: boolean;
  themeMode: "light" | "dark";
};
