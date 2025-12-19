import React from 'react';
declare module 'diff' {
  export function createPatch(
    fileName: string,
    oldStr: string,
    newStr: string,
    oldHeader?: string,
    newHeader?: string
  ): string;
  export function parsePatch(patch: string): any[];
  export function applyPatch(source: string, patch: string): string;
}

declare module 'react-diff-view' {
  import { ComponentType } from 'react';

  export interface Hunk {
    content: string;
    oldStart: number;
    oldLines: number;
    newStart: number;
    newLines: number;
  }

  export interface DiffFile {
    key: string;
    type: string;
    hunks: Hunk[];
    oldSource: string;
    newSource: string;
  }

  export function parseDiff(patch: string): DiffFile[];

  export const Diff: ComponentType<{
    hunks: Hunk[];
    diffType?: string;
    viewType?: string;
    children?: (hunks: Hunk[]) => React.ReactNode;
  }>;

  export const Hunk: ComponentType<{
    hunk: Hunk;
    children?: (hunk: Hunk) => React.ReactNode;
  }>;

  export const Decoration: ComponentType<{
    children: React.ReactNode;
  }>;

  export function withSourceExpansion(): <P extends object>(
    component: ComponentType<P>
  ) => ComponentType<P>;
}

declare module '@date-fns/utc' {
  export class UTCDate extends Date {
    constructor(...args: any[]);
  }
}

// Bootstrap API - Global window functions for time simulation
interface BootstrapConfig {
  date?: string; // ISO 8601 date string (e.g., "2025-02-14T18:30:00Z")
  user?: string; // User email to auto-login
}

interface BootstrapStatus {
  isBootstrapped: boolean;
  currentTime: string;
  timeOffset: string | null;
  simulatedUser: string | null;
  bootstrapTimestamp: string | null;
}

declare global {
  interface Window {
    /**
     * Bootstrap the application with simulated time and/or user
     * 
     * @example
     * window.bootstrap({ date: "2025-02-14T18:30:00Z" })
     * window.bootstrap({ date: "2025-02-14T18:30:00Z", user: "john@example.com" })
     */
    bootstrap: (config: BootstrapConfig) => void;
    
    /**
     * Clear all bootstrap settings and return to real system time
     */
    clearBootstrap: () => void;
    
    /**
     * Get the current bootstrap status for debugging
     */
    getBootstrapStatus: () => BootstrapStatus;
  }
}