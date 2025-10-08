declare module 'diff' {
  export function createPatch(fileName: string, oldStr: string, newStr: string, oldHeader?: string, newHeader?: string): string;
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
  
  export function withSourceExpansion(): <P extends object>(component: ComponentType<P>) => ComponentType<P>;
}

declare module '@date-fns/utc' {
  export class UTCDate extends Date {
    constructor(...args: any[]);
  }
}
