import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url:string)=> fetch(url).then(r=>r.json());

export default function Cases() {
  const { data, error } = useSWR('/cases', fetcher, { refreshInterval: 5000 });
  const cases = data || [];
  if (error) return <div>Error loading</div>;
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Cases</h1>
      <ul>
        {cases.map((c:any)=> (
          <li key={c.id} className="mb-3">
            <Link href={`/cases/${c.id}`} className="text-blue-600">{c.title}</Link>
            <div className="text-sm text-gray-600">{c.description}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
