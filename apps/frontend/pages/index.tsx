import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function buildTree(nodes: any[]) {
  const map = new Map<string, any>();
  const roots: any[] = [];
  nodes.forEach((n) => (map.set(n.id, { ...n, children: [] })));
  nodes.forEach((n) => {
    if (n.parentId) {
      const p = map.get(n.parentId);
      if (p) p.children.push(map.get(n.id));
      else roots.push(map.get(n.id));
    } else {
      roots.push(map.get(n.id));
    }
  });
  return roots;
}

export default function Home() {
  const { data } = useSWR('/nodes/tree', fetcher);
  const nodes = data || [];
  const tree = buildTree(nodes);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Site Hierarchy</h1>
      <Tree nodes={tree} />
    </div>
  );
}

function Tree({ nodes }: { nodes: any[] }) {
  return (
    <ul>
      {nodes.map((n) => (
        <li key={n.id} className="mb-2">
          <Link href={`/node/${n.slug}`} className="text-blue-600">{n.title}</Link>
          {n.children && n.children.length > 0 && <Tree nodes={n.children} />}
        </li>
      ))}
    </ul>
  );
}
