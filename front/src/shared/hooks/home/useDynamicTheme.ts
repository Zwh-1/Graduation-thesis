'use client';

import { useState } from 'react';

export interface EnhancementMode {
  name: string;
  particles: boolean;
  parallax: boolean;
  animations: 'full' | 'reduced' | 'none';
  performanceMode: boolean;
}

export const enhancementModes: Record<string, EnhancementMode> = {
  particle: {
    name: 'modeSwitcher.particle',
    particles: true,
    parallax: true,
    animations: 'full',
    performanceMode: false,
  },
  minimal: {
    name: 'modeSwitcher.minimal',
    particles: false,
    parallax: false,
    animations: 'none',
    performanceMode: true,
  },
};
