import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      {/* Main Content */}
      <div className="relative z-10 text-center mb-16">
        
        {/* Logo */}
        <div className="mb-12">
          <div className="flex justify-center mb-8">
            <Image
              src="/Logo.png"
              alt="FEUD.EXE Logo"
              width={400}
              height={200}
              className="max-w-md w-full h-auto drop-shadow-2xl hover:scale-105 transition-transform duration-500"
              priority
            />
          </div>
          
          {/* Animated underline */}
          <div className="flex justify-center mb-6">
            <div className="w-48 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse"></div>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-300 font-light tracking-wide">
            The Ultimate Team Battle Experience
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Fast-paced • Competitive • Addictive
          </p>
        </div>
      </div>

      {/* Navigation Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full px-4">
        
        {/* Play Game - Featured */}
        <Link href="/game" className="group md:col-span-2 lg:col-span-1">
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-sm border border-green-400/30 rounded-2xl p-8 text-center hover:from-green-500/30 hover:to-emerald-600/30 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25">
            <div className="text-5xl mb-4 animate-bounce">🎮</div>
            <h3 className="text-3xl font-bold text-white mb-3">Play Game</h3>
            <p className="text-gray-300 text-lg">Start the ultimate feud battle</p>
            <div className="mt-4 px-4 py-2 bg-green-500/20 rounded-full text-green-300 text-sm font-semibold">
              QUICK START
            </div>
          </div>
        </Link>

        {/* Setup Teams */}
        <Link href="/setup" className="group">
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-sm border border-blue-400/30 rounded-2xl p-6 text-center hover:from-blue-500/30 hover:to-cyan-600/30 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-2xl font-bold text-white mb-2">Setup Teams</h3>
            <p className="text-gray-300">Create and manage teams</p>
          </div>
        </Link>

        {/* Questions */}
        <Link href="/question" className="group">
          <div className="bg-gradient-to-br from-purple-500/20 to-violet-600/20 backdrop-blur-sm border border-purple-400/30 rounded-2xl p-6 text-center hover:from-purple-500/30 hover:to-violet-600/30 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25">
            <div className="text-4xl mb-4">❓</div>
            <h3 className="text-2xl font-bold text-white mb-2">Questions</h3>
            <p className="text-gray-300">Manage question database</p>
          </div>
        </Link>

        {/* Leaderboard */}
        <Link href="/leaderboard" className="group">
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 backdrop-blur-sm border border-yellow-400/30 rounded-2xl p-6 text-center hover:from-yellow-500/30 hover:to-orange-600/30 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/25">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-white mb-2">Leaderboard</h3>
            <p className="text-gray-300">View team rankings</p>
          </div>
        </Link>

        {/* Control Panel */}
        <Link href="/control" className="group">
          <div className="bg-gradient-to-br from-red-500/20 to-pink-600/20 backdrop-blur-sm border border-red-400/30 rounded-2xl p-6 text-center hover:from-red-500/30 hover:to-pink-600/30 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-red-500/25">
            <div className="text-4xl mb-4">🎛️</div>
            <h3 className="text-2xl font-bold text-white mb-2">Control Panel</h3>
            <p className="text-gray-300">Game host controls</p>
          </div>
        </Link>

        {/* Buzzer */}
        <Link href="/buzzer" className="group">
          <div className="bg-gradient-to-br from-indigo-500/20 to-blue-600/20 backdrop-blur-sm border border-indigo-400/30 rounded-2xl p-6 text-center hover:from-indigo-500/30 hover:to-blue-600/30 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/25">
            <div className="text-4xl mb-4">🔔</div>
            <h3 className="text-2xl font-bold text-white mb-2">Buzzer</h3>
            <p className="text-gray-300">Player buzzer interface</p>
          </div>
        </Link>

      </div>

      {/* Footer */}
      <div className="relative z-10 mt-16 text-center">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="w-8 h-px bg-gradient-to-r from-transparent to-gray-600"></div>
          <p className="text-gray-400 text-sm font-medium">
            READY TO BATTLE?
          </p>
          <div className="w-8 h-px bg-gradient-to-l from-transparent to-gray-600"></div>
        </div>
        <p className="text-gray-500 text-xs">
          Click any option above to get started • Built for competitive team battles
        </p>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-yellow-400/30 rounded-full animate-ping"></div>
        <div className="absolute top-3/4 left-1/4 w-1 h-1 bg-blue-400/40 rounded-full animate-ping delay-500"></div>
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-purple-400/30 rounded-full animate-ping delay-1000"></div>
        <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-pink-400/40 rounded-full animate-ping delay-1500"></div>
      </div>
    </div>
  );
}