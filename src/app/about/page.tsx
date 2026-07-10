import { buildProfilePageJsonLd, serializeJsonLd } from '../../lib/jsonLd';

export const metadata = {
  title: 'About',
  description:
    'Ayush Arora is a developer writing hands-on notes on system design, backend engineering, and computer networking, distilled from real building and reading.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 pb-24 pt-12 md:pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildProfilePageJsonLd()) }}
      />
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-10 mb-20">
        <div className="relative w-40 h-40 md:w-56 md:h-56 shrink-0 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center font-black text-7xl md:text-8xl text-white shadow-2xl ring-8 ring-black/5 dark:ring-white/10 animate-fade-in-up">
          A
        </div>
        
        <div className="text-center md:text-left flex flex-col justify-center h-full pt-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Hey! I'm <span className="text-amber-500">Ayush 👋</span>
          </h1>
          <p className="text-xl md:text-2xl text-[var(--text-secondary)] font-medium leading-relaxed max-w-2xl">
            I'm a Developer and tech enthusiast. I love building things, breaking things, and sharing what I learn along the way.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="rounded-3xl p-8 md:p-12 glass-panel border border-black/10 dark:border-white/10 shadow-xl relative overflow-hidden group">
          {/* Subtle Background Glow */}
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-amber-500/20 transition-colors duration-700" />
          
          <div className="relative z-10 space-y-8 text-lg text-[var(--text-secondary)] leading-relaxed">
            <p>
              Welcome to my digital garden! This is where I document my journey through software engineering, system design, and the ever-evolving world of technology.
            </p>
            <p>
              When I'm not writing code or architecting solutions, you'll find me reading about data-intensive applications, experimenting with new frameworks, and figuring out how complex systems scale under pressure. 
            </p>
            <p>
              I believe the best way to learn is to teach, which is why I started this blog. Every article here is a distillation of hours of reading, building, and debugging - served in an easy-to-digest format.
            </p>
          </div>

          {/* Action Links */}
          <div className="mt-12 pt-8 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row items-center gap-4 relative z-10">
            <a href="https://ayuslh.in" className="group/btn relative overflow-hidden w-full sm:w-auto px-10 flex items-center justify-center gap-2 py-4 rounded-2xl text-[15px] font-bold bg-black dark:bg-white text-white dark:text-black hover:scale-[1.02] active:scale-[0.98] transition-transform duration-300 shadow-xl hover:shadow-2xl">
              <span className="relative z-10 group-hover/btn:text-black dark:group-hover/btn:text-white transition-colors duration-300">View Portfolio</span>
              <svg className="relative z-10 group-hover/btn:text-black dark:group-hover/btn:text-white transition-colors duration-300" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-200 transform -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500 ease-in-out z-0" />
            </a>
            
            <a href="https://github.com/ayuslharora" target="_blank" rel="noopener noreferrer" className="group/github relative overflow-hidden flex-shrink-0 p-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black transition-transform duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/20">
              <svg className="relative z-10 group-hover/github:text-black dark:group-hover/github:text-white transition-colors duration-300" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-200 transform -translate-y-full group-hover/github:translate-y-0 transition-transform duration-500 ease-in-out z-0" />
            </a>
            
            <a href="https://linkedin.com/in/ayuslharora" target="_blank" rel="noopener noreferrer" className="group/linkedin relative overflow-hidden flex-shrink-0 p-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black transition-transform duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/20">
              <svg className="relative z-10 group-hover/linkedin:text-black dark:group-hover/linkedin:text-white transition-colors duration-300" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-200 transform -translate-y-full group-hover/linkedin:translate-y-0 transition-transform duration-500 ease-in-out z-0" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
