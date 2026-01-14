import Dashboard from '@/components/Dashboard';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center py-20 px-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      <div className="max-w-4xl w-full text-center mb-12">
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-indigo-200 tracking-tight mb-6 drop-shadow-lg">
          Smart Code Sanitizer
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          AI-powered deployment optimization for typical web projects. <br/>
          <span className="text-purple-400">Clean. Secure. Optimize.</span>
        </p>
      </div>
      
      <Dashboard />
    </main>
  );
}
