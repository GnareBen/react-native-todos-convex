// theme/index.ts
import { useColorScheme } from "react-native";

// ─── Palettes ──────────────────────────────────────────────────────────────

const dark = {
    // Backgrounds
    bgBase:         "#0D0D1A",   // fond principal
    bgSurface:      "#1A1A2E",   // cards, items
    bgElevated:     "#12122A",   // sheets, modals
    bgInput:        "#1A1A2E",   // champs texte

    // Borders
    borderSubtle:   "#2A2A45",   // séparateurs, bordures légères
    borderMuted:    "#3A3A5C",   // bordures input inactif
    borderAccent:   "#C9A84C44", // bordure input actif (édition)

    // Text
    textPrimary:    "#E8E8F0",   // contenu principal
    textSecondary:  "#8888AA",   // labels, sous-titres
    textMuted:      "#555570",   // hints, dates
    textDisabled:   "#3A3A5C",   // placeholder, désactivé
    textOnAccent:   "#0D0D1A",   // texte sur fond doré

    // Accent
    accent:         "#C9A84C",   // or — CTA, FAB, progress
    accentGlow:     "#C9A84C",   // couleur de shadow
    accentMuted:    "#C9A84C22", // fond chip sélectionné

    // Semantic
    error:          "#FF5252",
    errorMuted:     "#FF525222",
    errorBorder:    "#FF525244",
    success:        "#4CAF50",
    successMuted:   "#4CAF5022",
    warning:        "#FFB830",
    warningMuted:   "#FFB83022",

    // Overlay
    overlay:        "#00000088",

    // Priority
    priority: {
        low:    { color: "#4CAF50", bg: "#4CAF5022" },
        medium: { color: "#FFB830", bg: "#FFB83022" },
        high:   { color: "#FF5252", bg: "#FF525222" },
    },
} as const;

const light = {
    // Backgrounds
    bgBase:         "#F4F4F8",
    bgSurface:      "#FFFFFF",
    bgElevated:     "#FAFAFA",
    bgInput:        "#F0F0F6",

    // Borders
    borderSubtle:   "#E0E0EC",
    borderMuted:    "#C8C8DC",
    borderAccent:   "#A8823C66",

    // Text
    textPrimary:    "#1A1A2E",
    textSecondary:  "#555580",
    textMuted:      "#8888AA",
    textDisabled:   "#BCBCCC",
    textOnAccent:   "#FFFFFF",

    // Accent
    accent:         "#A8823C",   // or assombri pour contraste sur fond clair
    accentGlow:     "#C9A84C",
    accentMuted:    "#C9A84C18",

    // Semantic
    error:          "#D32F2F",
    errorMuted:     "#D32F2F18",
    errorBorder:    "#D32F2F33",
    success:        "#388E3C",
    successMuted:   "#388E3C18",
    warning:        "#F57C00",
    warningMuted:   "#F57C0018",

    // Overlay
    overlay:        "#00000055",

    // Priority
    priority: {
        low:    { color: "#388E3C", bg: "#388E3C18" },
        medium: { color: "#F57C00", bg: "#F57C0018" },
        high:   { color: "#D32F2F", bg: "#D32F2F18" },
    },
} as const;

// ─── Typography ────────────────────────────────────────────────────────────

export const typography = {
    eyebrow:  { fontSize: 11, fontWeight: "700" as const, letterSpacing: 2.5 },
    display:  { fontSize: 36, fontWeight: "800" as const, letterSpacing: -0.5 },
    title:    { fontSize: 22, fontWeight: "700" as const, letterSpacing: 0.3 },
    body:     { fontSize: 15, fontWeight: "500" as const, lineHeight: 21, letterSpacing: 0.2 },
    label:    { fontSize: 13, fontWeight: "600" as const },
    caption:  { fontSize: 11, fontWeight: "400" as const },
    hint:     { fontSize: 10, fontStyle: "italic" as const },
    button:   { fontSize: 16, fontWeight: "800" as const, letterSpacing: 0.5 },
} as const;

// ─── Spacing ───────────────────────────────────────────────────────────────

export const spacing = {
    xs:   4,
    sm:   8,
    md:   12,
    lg:   16,
    xl:   20,
    xxl:  24,
    xxxl: 28,
    page: 24,  // padding horizontal standard
} as const;

// ─── Radii ─────────────────────────────────────────────────────────────────

export const radii = {
    sm:    8,
    md:    12,
    lg:    14,
    xl:    16,
    xxl:   20,
    sheet: 28,
    pill:  999,
} as const;

// ─── Shadows ───────────────────────────────────────────────────────────────

export const shadows = {
    card: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 5,
    },
    fab: (color: string) => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.45,
        shadowRadius: 16,
        elevation: 10,
    }),
    button: (color: string) => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    }),
} as const;

// ─── Types ─────────────────────────────────────────────────────────────────

export type Theme    = typeof dark;
export type ColorKey = keyof Omit<Theme, "priority">;

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useTheme() {
    const scheme = useColorScheme();
    const isDark  = scheme !== "light";
    return {
        colors: isDark ? dark : light,
        isDark,
    } as const;
}