import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  safelist: [
    // Gradient utilities
    {
      pattern: /bg-gradient-to-(r|l|t|b|tr|tl|br|bl)/,
    },
    {
      pattern: /from-(green|teal|blue|purple|pink|red|yellow|orange|indigo|gray|slate|zinc|neutral|stone|amber|lime|emerald|cyan|sky|violet|fuchsia|rose)-(50|100|200|300|400|500|600|700|800|900|950)/,
    },
    {
      pattern: /to-(green|teal|blue|purple|pink|red|yellow|orange|indigo|gray|slate|zinc|neutral|stone|amber|lime|emerald|cyan|sky|violet|fuchsia|rose)-(50|100|200|300|400|500|600|700|800|900|950)/,
    },
    {
      pattern: /via-(green|teal|blue|purple|pink|red|yellow|orange|indigo|gray|slate|zinc|neutral|stone|amber|lime|emerald|cyan|sky|violet|fuchsia|rose)-(50|100|200|300|400|500|600|700|800|900|950)/,
    },
    // Background colors (for button_color)
    {
      pattern: /bg-(green|teal|blue|purple|pink|red|yellow|orange|indigo|gray|slate|zinc|neutral|stone|amber|lime|emerald|cyan|sky|violet|fuchsia|rose|white|black)-(50|100|200|300|400|500|600|700|800|900|950)?/,
    },
    // Text colors (for button_color)
    {
      pattern: /text-(green|teal|blue|purple|pink|red|yellow|orange|indigo|gray|slate|zinc|neutral|stone|amber|lime|emerald|cyan|sky|violet|fuchsia|rose|white|black)-(50|100|200|300|400|500|600|700|800|900|950)?/,
    },
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
