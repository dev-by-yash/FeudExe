import Link from 'next/link';

export default function BackToHome() {
  return (
    <Link 
      href="/" 
      className="fixed top-6 left-6 z-50 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
    >
      <span className="text-xl">←</span>
      <span className="font-medium">Home</span>
    </Link>
  );
}