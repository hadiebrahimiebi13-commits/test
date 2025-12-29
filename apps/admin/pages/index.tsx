import useSWR from 'swr';
import { useState } from 'react';

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

export default function AdminHome() {
  const { data, mutate } = useSWR('/nodes/tree', fetcher);
  const nodes = data || [];
  const tree = buildTree(nodes);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin - Nodes</h1>
      <div className="flex gap-2 mb-4">
        <button onClick={() => { const slug = prompt('slug'); if (!slug) return; fetch('/nodes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: slug, slug }) }).then(() => mutate()); }} className="px-2 py-1 bg-gray-200">Add root</button>
        <a href="/cases/new" className="px-2 py-1 bg-green-200">Create Case</a>
      </div>
      <Tree nodes={tree} mutate={mutate} />
    </div>
  );
}

function Tree({ nodes, mutate }: any) {
  return (
    <ul>
      {nodes.map((n: any) => (
        <li key={n.id} className="mb-2">
          <strong>{n.title}</strong>
          <button className="ml-2 text-sm text-red-600" onClick={async () => { if (!confirm('Delete?')) return; await fetch(`/nodes/${n.id}`, { method: 'DELETE' }); mutate(); }}>Delete</button>
          <button className="ml-2 text-sm" onClick={async () => { const child = prompt('child slug'); if (!child) return; await fetch('/nodes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: child, slug: child, parentId: n.id }) }); mutate(); }}>Add child</button>
          {n.children && n.children.length > 0 && <Tree nodes={n.children} mutate={mutate} />}
        </li>
      ))}
    </ul>
  );
}
