import type { Pillar } from './types'

// Single source of truth for pillar labels, emojis, prompts, and colors.
// The "accent" values are plain hex so we can use them anywhere (CSS vars,
// inline styles, gradients) without relying on Tailwind's safelist.

export interface PillarMeta {
  key: Pillar
  label: string
  emoji: string
  prompt: string
  accent: string // main color
  accentSoft: string // 15% alpha version for backgrounds
}

export const PILLAR_META: Record<Pillar, PillarMeta> = {
  physical: {
    key: 'physical',
    label: 'Physical',
    emoji: '💪',
    prompt: 'What did your body do today?',
    accent: '#f97316', // orange-500
    accentSoft: 'rgba(249, 115, 22, 0.15)',
  },
  mental: {
    key: 'mental',
    label: 'Mental',
    emoji: '🧠',
    prompt: 'What fed or rested your mind today?',
    accent: '#3b82f6', // blue-500
    accentSoft: 'rgba(59, 130, 246, 0.15)',
  },
  spiritual: {
    key: 'spiritual',
    label: 'Spiritual',
    emoji: '🕊️',
    prompt: 'What grounded you today?',
    accent: '#a855f7', // purple-500
    accentSoft: 'rgba(168, 85, 247, 0.15)',
  },
  social: {
    key: 'social',
    label: 'Social',
    emoji: '🤝',
    prompt: 'Who did you connect with today?',
    accent: '#22c55e', // green-500
    accentSoft: 'rgba(34, 197, 94, 0.15)',
  },
}

// Ordered list for iteration in UI.
export const PILLAR_ORDER: Pillar[] = ['physical', 'mental', 'spiritual', 'social']
