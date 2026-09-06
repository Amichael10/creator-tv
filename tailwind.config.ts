import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tv: {
          dark: "#080808",
          card: "#121212",
          border: "#242424",
          red: "#E50914",
          redHover: "#F40612",
          amber: "#FFB800",
        },
      },
    },
  },
  plugins: [],
};
export default config;
