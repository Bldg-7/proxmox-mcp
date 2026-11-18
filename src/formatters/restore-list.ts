import { z } from 'zod';
import { restoreEntryId } from '../schemas/storage-management.js';

const entry = z.object({ filepath: restoreEntryId, text: z.string(), type: z.string(),
  leaf: z.union([z.boolean(), z.literal(0), z.literal(1)]).transform(Boolean),
  size: z.number().int().nonnegative().optional(), mtime: z.number().int().optional(),
});

/** Preserve complete identifiers when limiting output; never cut an ID mid-row. */
export function formatRestoreListing(node: string, storage: string, volume: string, data: unknown): string {
  if (!Array.isArray(data)) throw new Error('Invalid PBS listing: expected an array');
  let output = `**PBS File Restore Listing**\nNode: ${node}\nStorage: ${storage}\nVolume: ${JSON.stringify(volume)}\n`;
  if (!data.length) return output + '\nNo files found in backup.';
  let shown = 0;
  for (const item of data) {
    if (shown === 100) break;
    const parsed = entry.safeParse(item);
    if (!parsed.success) throw new Error('Invalid PBS listing entry');
    const row = '\n' + JSON.stringify(parsed.data);
    if (output.length + row.length > 15900) break;
    output += row;
    shown++;
  }
  return `${output}\nShown ${shown} of ${data.length} entries${shown < data.length ? ' (output truncated)' : ''}.`;
}
