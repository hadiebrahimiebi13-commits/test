import { useState } from 'react';
import { useRouter } from 'next/router';

export default function NewCase() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [finalDiagnosis, setFinalDiagnosis] = useState('');
  const [images, setImages] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);

  function addImage() {
    setImages((s) => [...s, { url: '', caption: '' }]);
  }
  function addQuestion() {
    setQuestions((s) => [...s, { prompt: '', options: [''], correctIndex: 0, explanation: '' }]);
  }

  async function submit(e: any) {
    e.preventDefault();
    const payload = { title, description, finalDiagnosis, images, questions };
    const res = await fetch('/cases', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) {
      alert('Created');
      const body = await res.json();
      // redirect to public case page
      router.push(`/cases/${body.id}`);
    } else {
      const body = await res.json();
      alert('Error: ' + JSON.stringify(body));
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Case</h1>
      <form onSubmit={submit} className="space-y-4">
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border" />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border" />
        <input placeholder="Final diagnosis" value={finalDiagnosis} onChange={(e) => setFinalDiagnosis(e.target.value)} className="w-full p-2 border" />
        <div>
          <h3 className="font-bold">Images</h3>
          {images.map((img, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input placeholder="url" value={img.url} onChange={(e) => { const v = e.target.value; setImages((s) => s.map((it, idx) => idx === i ? { ...it, url: v } : it)); }} className="p-2 border" />
              <input placeholder="caption" value={img.caption} onChange={(e) => { const v = e.target.value; setImages((s) => s.map((it, idx) => idx === i ? { ...it, caption: v } : it)); }} className="p-2 border" />
            </div>
          ))}
          <button type="button" onClick={addImage} className="mt-2 px-3 py-1 bg-gray-200">Add image</button>
        </div>
        <div>
          <h3 className="font-bold">Questions</h3>
          {questions.map((q, i) => (
            <div key={i} className="border p-2 mb-2">
              <input placeholder="Prompt" value={q.prompt} onChange={(e) => { const v = e.target.value; setQuestions((s) => s.map((it, idx) => idx === i ? { ...it, prompt: v } : it)); }} className="w-full p-2 border" />
              <div className="mt-2">
                {q.options.map((opt: string, oi: number) => (
                  <div key={oi} className="flex gap-2 items-center mb-1">
                    <input value={opt} onChange={(e) => { const v = e.target.value; setQuestions((s) => s.map((it, idx) => idx === i ? { ...it, options: it.options.map((o: string, k: number) => (k === oi ? v : o)) } : it)); }} className="p-2 border" />
                    <button type="button" onClick={() => setQuestions((s) => s.map((it, idx) => idx === i ? { ...it, options: it.options.filter((_o: string, k: number) => k !== oi) } : it))} className="text-red-600">Remove</button>
                  </div>
                ))}
                <button type="button" onClick={() => setQuestions((s) => s.map((it, idx) => idx === i ? { ...it, options: [...it.options, ''] } : it))} className="mt-1 px-2 py-1 bg-gray-200">Add option</button>
                <div className="mt-2">Correct index: <input type="number" value={q.correctIndex} onChange={(e) => { const v = Number(e.target.value); setQuestions((s) => s.map((it, idx) => idx === i ? { ...it, correctIndex: v } : it)); }} className="w-20 p-1 border inline-block" /></div>
              </div>
            </div>
          ))}
          <button type="button" onClick={addQuestion} className="mt-2 px-3 py-1 bg-gray-200">Add question</button>
        </div>
        <div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white">Create Case</button>
        </div>
      </form>
    </div>
  );
}
