import { listDecks, mode } from '@/lib/repo';
import { cached } from '@/lib/redis';
export async function GET() {
  const decks = mode() === 'local' ? await listDecks() : await cached('decks:v1', 60, listDecks);
  return Response.json(decks);
}
