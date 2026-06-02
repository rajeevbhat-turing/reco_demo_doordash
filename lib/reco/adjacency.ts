import { readFileSync } from 'fs';

export type AdjacencyMap = Record<string, string[]>;

export function adjacentCuisines(cuisine: string, map: AdjacencyMap): string[] {
  return map[cuisine] ?? [];
}

export function loadAdjacencies(path: string): AdjacencyMap {
  return JSON.parse(readFileSync(path, 'utf8')) as AdjacencyMap;
}
