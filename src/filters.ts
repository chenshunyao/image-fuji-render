// Fuji Film Simulation Filter Definitions
// Each filter approximates a classic Fujifilm film stock using parametric adjustments

export interface FilterParams {
  id: string;
  name: string;
  description: string;
  // Color adjustments
  saturation: number;       // 0-2, 1 = normal
  contrast: number;         // 0-2, 1 = normal
  brightness: number;       // -0.5 to 0.5
  exposure: number;         // -1 to 1
  // Tone curve (shadows, midtones, highlights)
  shadowsR: number; shadowsG: number; shadowsB: number;
  midtonesR: number; midtonesG: number; midtonesB: number;
  highlightsR: number; highlightsG: number; highlightsB: number;
  // Color grading
  hueShift: number;         // -180 to 180 degrees
  temperature: number;      // -1 to 1, negative = cool, positive = warm
  tint: number;             // -1 to 1, negative = green, positive = magenta
  // Film characteristics
  grain: number;            // 0-1
  vignette: number;         // 0-1
  // Desaturation (for B&W)
  desaturate: number;       // 0-1, 0 = color, 1 = full B&W
  // Fade (lifted blacks)
  fade: number;             // 0-0.2
}

export const filters: FilterParams[] = [
  {
    id: 'original',
    name: 'Original',
    description: '原图',
    saturation: 1.0, contrast: 1.0, brightness: 0, exposure: 0,
    shadowsR: 0, shadowsG: 0, shadowsB: 0,
    midtonesR: 0, midtonesG: 0, midtonesB: 0,
    highlightsR: 0, highlightsG: 0, highlightsB: 0,
    hueShift: 0, temperature: 0, tint: 0,
    grain: 0, vignette: 0, desaturate: 0, fade: 0,
  },
  {
    id: 'provia',
    name: 'PROVIA',
    description: '标准色彩，自然均衡',
    saturation: 1.1, contrast: 1.08, brightness: 0.02, exposure: 0.05,
    shadowsR: 0.0, shadowsG: 0.0, shadowsB: 0.02,
    midtonesR: 0.0, midtonesG: 0.0, midtonesB: 0.0,
    highlightsR: 0.02, highlightsG: 0.01, highlightsB: -0.01,
    hueShift: 0, temperature: 0.03, tint: 0.0,
    grain: 0.03, vignette: 0.05, desaturate: 0, fade: 0,
  },
  {
    id: 'velvia',
    name: 'Velvia',
    description: '高饱和鲜艳，风景利器',
    saturation: 1.45, contrast: 1.2, brightness: 0.0, exposure: 0.05,
    shadowsR: 0.0, shadowsG: 0.0, shadowsB: 0.03,
    midtonesR: 0.02, midtonesG: -0.01, midtonesB: -0.02,
    highlightsR: 0.03, highlightsG: 0.01, highlightsB: -0.02,
    hueShift: 2, temperature: 0.05, tint: 0.02,
    grain: 0.02, vignette: 0.08, desaturate: 0, fade: 0,
  },
  {
    id: 'astia',
    name: 'ASTIA',
    description: '柔和色调，自然肤色',
    saturation: 1.05, contrast: 0.95, brightness: 0.03, exposure: 0.05,
    shadowsR: 0.01, shadowsG: 0.0, shadowsB: 0.02,
    midtonesR: 0.01, midtonesG: 0.01, midtonesB: 0.0,
    highlightsR: 0.02, highlightsG: 0.02, highlightsB: 0.0,
    hueShift: -2, temperature: 0.02, tint: 0.01,
    grain: 0.02, vignette: 0.03, desaturate: 0, fade: 0.01,
  },
  {
    id: 'classic-chrome',
    name: 'CLASSIC CHROME',
    description: '低饱和复古，纪实感',
    saturation: 0.75, contrast: 1.15, brightness: -0.02, exposure: 0.0,
    shadowsR: 0.02, shadowsG: 0.02, shadowsB: 0.04,
    midtonesR: 0.02, midtonesG: 0.0, midtonesB: -0.02,
    highlightsR: 0.0, highlightsG: -0.01, highlightsB: -0.03,
    hueShift: 5, temperature: 0.08, tint: -0.02,
    grain: 0.05, vignette: 0.1, desaturate: 0.1, fade: 0.03,
  },
  {
    id: 'classic-neg',
    name: 'CLASSIC Neg.',
    description: '高对比度，独特色彩渲染',
    saturation: 0.85, contrast: 1.25, brightness: -0.02, exposure: 0.0,
    shadowsR: 0.04, shadowsG: 0.02, shadowsB: 0.0,
    midtonesR: 0.03, midtonesG: -0.01, midtonesB: -0.04,
    highlightsR: 0.04, highlightsG: 0.02, highlightsB: -0.03,
    hueShift: 8, temperature: 0.12, tint: 0.02,
    grain: 0.06, vignette: 0.12, desaturate: 0.05, fade: 0.02,
  },
  {
    id: 'reala-ace',
    name: 'REALA ACE',
    description: '自然色彩还原',
    saturation: 1.08, contrast: 1.02, brightness: 0.02, exposure: 0.03,
    shadowsR: 0.0, shadowsG: 0.01, shadowsB: 0.02,
    midtonesR: 0.01, midtonesG: 0.01, midtonesB: 0.01,
    highlightsR: 0.01, highlightsG: 0.0, highlightsB: -0.01,
    hueShift: -1, temperature: 0.02, tint: 0.0,
    grain: 0.02, vignette: 0.03, desaturate: 0, fade: 0,
  },
  {
    id: 'pro-neg-std',
    name: 'PRO Neg.Std',
    description: '柔和色彩，人像向',
    saturation: 0.88, contrast: 0.92, brightness: 0.03, exposure: 0.05,
    shadowsR: 0.01, shadowsG: 0.01, shadowsB: 0.03,
    midtonesR: 0.01, midtonesG: 0.01, midtonesB: 0.0,
    highlightsR: 0.02, highlightsG: 0.01, highlightsB: 0.0,
    hueShift: -3, temperature: 0.0, tint: 0.02,
    grain: 0.03, vignette: 0.05, desaturate: 0.05, fade: 0.02,
  },
  {
    id: 'eterna',
    name: 'ETERNA',
    description: '电影感，低饱和低对比',
    saturation: 0.7, contrast: 0.85, brightness: 0.0, exposure: 0.0,
    shadowsR: 0.02, shadowsG: 0.03, shadowsB: 0.05,
    midtonesR: 0.0, midtonesG: 0.01, midtonesB: 0.02,
    highlightsR: -0.01, highlightsG: 0.0, highlightsB: 0.01,
    hueShift: -5, temperature: -0.05, tint: 0.0,
    grain: 0.04, vignette: 0.08, desaturate: 0.15, fade: 0.05,
  },
  {
    id: 'eterna-bb',
    name: 'ETERNA BB',
    description: '银盐漂白效果，去饱和高对比',
    saturation: 0.45, contrast: 1.35, brightness: -0.03, exposure: 0.0,
    shadowsR: 0.01, shadowsG: 0.01, shadowsB: 0.03,
    midtonesR: 0.0, midtonesG: 0.0, midtonesB: 0.0,
    highlightsR: 0.02, highlightsG: 0.01, highlightsB: -0.01,
    hueShift: 0, temperature: -0.02, tint: 0.0,
    grain: 0.06, vignette: 0.15, desaturate: 0.35, fade: 0.02,
  },
  {
    id: 'acros',
    name: 'ACROS',
    description: '经典黑白，细腻颗粒',
    saturation: 0.0, contrast: 1.18, brightness: 0.0, exposure: 0.02,
    shadowsR: 0.02, shadowsG: 0.02, shadowsB: 0.02,
    midtonesR: 0.0, midtonesG: 0.0, midtonesB: 0.0,
    highlightsR: 0.0, highlightsG: 0.0, highlightsB: 0.0,
    hueShift: 0, temperature: 0.0, tint: 0.0,
    grain: 0.08, vignette: 0.1, desaturate: 1.0, fade: 0.02,
  },
];
