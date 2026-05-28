import type { Page } from 'playwright';

/**
 * DOM serialization for the LLM prompt. Phase 4 §3.
 *
 * Walks visible "interesting" elements (anchors, buttons, headings,
 * inputs, anything with a `data-testid`) and emits one compact line
 * per element. Cap at `maxBytes` (default 8 KB) so a giant page can't
 * blow past the LLM's context window.
 *
 * The output is plain text, not HTML — the LLM doesn't need styling
 * or layout, just enough structure to pick a target. Each line is:
 *
 *   <tag> [#id] [.classes] [data-testid="..."] [href="..."] "<visible text>"
 */
export interface ObserveOptions {
  maxBytes?: number;
  rootSelector?: string;
}

interface ObservedNode {
  tag: string;
  id: string | null;
  classes: string;
  testId: string | null;
  href: string | null;
  text: string;
  visible: boolean;
}

export async function observe(page: Page, opts: ObserveOptions = {}): Promise<string> {
  const maxBytes = opts.maxBytes ?? 8_192;
  const root = opts.rootSelector ?? 'body';

  const nodes: ObservedNode[] = await page.$$eval(
    `${root} a, ${root} button, ${root} h1, ${root} h2, ${root} h3, ${root} h4, ${root} input, ${root} [data-testid]`,
    elements =>
      (elements as HTMLElement[]).map(el => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        const visible =
          rect.width > 0 &&
          rect.height > 0 &&
          style.visibility !== 'hidden' &&
          style.display !== 'none';
        const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 120);
        return {
          tag: el.tagName.toLowerCase(),
          id: el.id || null,
          classes: el.className && typeof el.className === 'string' ? el.className.slice(0, 40) : '',
          testId: el.getAttribute('data-testid'),
          href: el.getAttribute('href'),
          text,
          visible,
        };
      })
  );

  const lines: string[] = [];
  let bytes = 0;
  for (const n of nodes) {
    if (!n.visible) continue;
    const parts = [`<${n.tag}>`];
    if (n.id) parts.push(`#${n.id}`);
    if (n.testId) parts.push(`testid="${n.testId}"`);
    if (n.href) parts.push(`href="${n.href}"`);
    if (n.text) parts.push(`"${n.text}"`);
    const line = parts.join(' ');
    if (bytes + line.length + 1 > maxBytes) {
      lines.push(`... (${nodes.length - lines.length} more elements truncated)`);
      break;
    }
    lines.push(line);
    bytes += line.length + 1;
  }

  return lines.join('\n');
}
