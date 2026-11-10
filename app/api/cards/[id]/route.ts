import { getCard, mode } from '@/lib/repo';
import { cached } from '@/lib/redis';
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = mode() === 'local' ? await getCard(id) : await cached(`card:${id}`, 60, () => getCard(id));
  return data ? Response.json(data) : Response.json({ error: 'not found' }, { status: 404 });
}
