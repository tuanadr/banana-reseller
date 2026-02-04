import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-gray-900/50 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            BananaAI
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="px-4 py-2 text-gray-300 hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/register" className="px-4 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/30 rounded-full blur-[120px] -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block px-4 py-1.5 rounded-full bg-gray-800/50 border border-gray-700 text-sm text-gray-300 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            ✨ The Next Gen AI Art Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent pb-2">
            Create Unlimited <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Masterpieces</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Access premium AI generation models with zero waits. Scale your creativity with our smart distributed network.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/register" className="px-8 py-4 bg-white text-black text-lg font-bold rounded-xl hover:scale-105 transition-transform shadow-xl shadow-purple-500/20">
              Start Creating Now
            </Link>
            <Link href="#pricing" className="px-8 py-4 bg-gray-800/50 border border-gray-700 text-white text-lg font-semibold rounded-xl hover:bg-gray-800 transition-colors">
              View Pricing
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Ultra Fast", desc: "Distributed GPU network ensures your images are ready in seconds." },
            { title: "Unlimited Access", desc: "No more daily caps. Create as much as you want with our Pro plans." },
            { title: "Stealth Tech", desc: "Our smart proxy ensures 100% uptime and privacy for every request." }
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-purple-500/50 transition-colors">
              <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
