import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
        },
        ink: {
          900: "#111827",
          800: "#1f2937",
          700: "#374151",
        },
      },
      boxShadow: {
        soft: "0 20px 50px rgba(15, 23, 42, 0.08)",
      },
      backgroundImage: {
        hero: "radial-gradient(circle at top left, rgba(37,99,235,0.20), transparent 35%), radial-gradient(circle at 90% 20%, rgba(59,130,246,0.16), transparent 30%), linear-gradient(180deg, #f8fbff 0%, #ffffff 55%)",
      },
      fontFamily: {
        sans: ['"Aptos"', '"Segoe UI"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
