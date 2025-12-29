import { useRouter } from 'next/router';
import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function NodePage() {
  const router = useRouter();
  const { slug } = router.query;
  const { data: nodes } = useSWR('/nodes/tree', fetcher);
  const node = (nodes || []).find((n: any) => n.slug === slug);
  if (!node) return <div className="p-8">Not found</div>;
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">{node.title}</h1>
      <p className="text-muted mt-2">{node.description}</p>
      <div className="mt-4">
        <Link href="/">Back</Link>
      </div>
    </div>
  );
}
