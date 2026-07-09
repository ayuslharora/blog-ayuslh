"use client";

import { useState } from "react";

export default function IpConverterPage() {
  const [ip, setIp] = useState("");
  const [copied, setCopied] = useState(false);

  // Parse and convert the IP address
  const convertToBinary = (ipStr: string) => {
    const parts = ipStr.trim().split(".");
    
    // Check if there are exactly 4 parts and all are valid numbers between 0 and 255
    if (parts.length !== 4) return null;
    
    const binaryParts = parts.map((part) => {
      if (part === "") return null;
      const num = parseInt(part, 10);
      // Regex to ensure it's strictly digits (no letters, no floats)
      if (!/^\d+$/.test(part) || isNaN(num) || num < 0 || num > 255) return null;
      return num.toString(2).padStart(8, "0");
    });

    if (binaryParts.includes(null)) return null;
    return binaryParts as string[];
  };

  const binaryParts = convertToBinary(ip);
  const binaryIpStr = binaryParts?.join(".");

  const handleCopy = () => {
    if (binaryIpStr) {
      navigator.clipboard.writeText(binaryIpStr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 pb-24 pt-12 md:pt-20 min-h-screen">
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Hero Section */}
      <div className="text-center mb-16 animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
          IP to <span className="text-amber-500">Binary</span> Converter
        </h1>
        <p className="text-xl text-[var(--text-secondary)] font-medium leading-relaxed max-w-2xl mx-auto">
          Convert any standard decimal IPv4 address into its 32-bit binary representation in real-time.
        </p>
      </div>

      {/* Tool Container */}
      <div className="max-w-2xl mx-auto rounded-3xl p-8 md:p-12 glass-panel border border-black/10 dark:border-white/10 shadow-2xl relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        {/* Subtle Background Glow inside card */}
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-amber-500/20 transition-colors duration-700" />
        
        <div className="relative z-10 space-y-8">
          {/* Input Section */}
          <div className="space-y-4">
            <label htmlFor="ip-input" className="block text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Decimal IP Address
            </label>
            <input
              id="ip-input"
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="e.g. 192.168.1.4"
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-6 py-5 text-2xl font-mono focus:outline-none focus:ring-4 focus:ring-amber-500/30 transition-all placeholder:text-black/30 dark:placeholder:text-white/30"
            />
          </div>

          {/* Output Section */}
          <div className="space-y-4 pt-6 border-t border-black/10 dark:border-white/10">
            <label className="block text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Binary Representation
            </label>
            
            {binaryParts ? (
              <div className="space-y-6">
                {/* Visual Blocks */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {binaryParts.map((part, index) => (
                    <div key={index} className="flex flex-col items-center p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/10 dark:border-white/10">
                      <span className="text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-widest">Octet {index + 1}</span>
                      <span className="font-mono text-lg tracking-wider text-amber-600 dark:text-amber-400">{part}</span>
                    </div>
                  ))}
                </div>

                {/* Full String and Copy */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-1 w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-6 py-5 text-center sm:text-left font-mono overflow-x-auto text-lg whitespace-nowrap">
                    {binaryIpStr}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="w-full sm:w-auto px-8 py-5 rounded-2xl font-bold bg-amber-500 text-white hover:bg-amber-600 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20"
                  >
                    {copied ? (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-2xl border border-black/10 dark:border-white/10 border-dashed">
                <p className="text-[var(--text-secondary)] font-medium">
                  {ip.length > 0 ? "Enter a valid 4-octet IPv4 address..." : "Waiting for input..."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
