import type { Config } from "tailwindcss";

const config: Config = {
  // Force class strategy so `.dark` controls dark styles regardless of system preference
  darkMode: "class",
  // Content is optional in v4, but we include it to be explicit in this project
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;


