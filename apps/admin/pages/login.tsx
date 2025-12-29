import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const router = useRouter();

  async function submit(e: any) {
    e.preventDefault();
    const res = await fetch('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
    if (res.ok) router.push('/');
    else alert('Login failed');
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
      <form onSubmit={submit} className="space-y-3">
        <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 border" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border" />
        <button className="bg-blue-600 text-white px-4 py-2">Login</button>
      </form>
    </div>
  );
}
