export type User = {
  id: string;
  email: string;
  name?: string;
};

export type UserPreferences = {
  theme: "light" | "dark";
  activeAPIs: string[];
  notifications: boolean;
};
