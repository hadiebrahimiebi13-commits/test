import useSWR from 'swr';
import { useRouter } from 'next/router';
import { useState } from 'react';
const fetcher = (url:string)=> fetch(url).then(r=>r.json());

export default function CaseDetail(){
  const router = useRouter();
  const { id } = router.query;
  const { data, mutate } = useSWR(id ? `/cases/${id}` : null, fetcher, { refreshInterval: 0 });
  const [answers, setAnswers] = useState<Record<string, number>>({});
  if (!data) return <div className="p-8">Loading…</div>;

  async function submit(){
    const payload = { userId: 'public', answers: Object.entries(answers).map(([questionId, selectedIndex])=> ({ questionId, selectedIndex })) };
    const res = await fetch(`/cases/${id}/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const body = await res.json();
    if (body.feedback) {
      alert(JSON.stringify(body.feedback, null, 2));
      // optionally show results on page
      mutate();
    } else alert('No feedback');
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{data.title}</h1>
      <div className="mb-4">{data.description}</div>
      <div className="mb-4">Images:
        <div className="flex gap-2 mt-2">{data.images?.map((img:any)=> <img key={img.id} src={img.url} alt={img.caption} className="w-48 h-48 object-cover"/>)}</div>
      </div>
      <div>
        <h2 className="font-bold mb-2">Questions</h2>
        {data.questions.map((q:any)=> (
          <div key={q.id} className="border p-3 mb-2">
            <div className="mb-2">{q.prompt}</div>
            <div className="flex flex-col gap-2">
              {q.options.map((opt:string, idx:number)=> (
                <label key={idx} className="flex items-center gap-2">
                  <input type="radio" name={q.id} checked={answers[q.id]===idx} onChange={()=> setAnswers(a=> ({...a, [q.id]: idx}))} />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <button onClick={submit} className="px-4 py-2 bg-blue-600 text-white">Submit Answers</button>
      </div>
    </div>
  );
}
