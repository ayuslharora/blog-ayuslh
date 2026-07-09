"use client";

import { useState } from "react";

export default function IpConverter() {
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
    <div className="w-full my-10 not-prose">
      <div className="rounded-3xl p-6 sm:p-8 glass-panel border border-black/10 dark:border-white/10 shadow-2xl relative overflow-hidden group">
        {/* Subtle Background Glow inside card */}
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-amber-500/20 transition-colors duration-700" />
        
        <div className="relative z-10 space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-extrabold tracking-tight mb-2">Interactive IP Converter</h3>
            <p className="text-sm text-[var(--text-secondary)] font-medium">Try converting any decimal IP into its 32-bit binary form below.</p>
          </div>

          {/* Input Section */}
          <div className="space-y-3">
            <label htmlFor="ip-input" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Decimal IP Address
            </label>
            <input
              id="ip-input"
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="e.g. 192.168.1.4"
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-5 py-4 text-xl font-mono focus:outline-none focus:ring-4 focus:ring-amber-500/30 transition-all placeholder:text-black/30 dark:placeholder:text-white/30"
            />
          </div>

          {/* Output Section */}
          <div className="space-y-3 pt-6 border-t border-black/10 dark:border-white/10">
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Binary Representation
            </label>
            
            {binaryParts ? (
              <div className="space-y-5">
                {/* Visual Blocks */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {binaryParts.map((part, index) => (
                    <div key={index} className="flex flex-col items-center p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10">
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-widest">Octet {index + 1}</span>
                      <span className="font-mono text-sm sm:text-base tracking-wider text-amber-600 dark:text-amber-400">{part}</span>
                    </div>
                  ))}
                </div>

                {/* Full String and Copy */}
                <div className="flex flex-col sm:flex-row items-stretch gap-3">
                  <div className="flex-1 flex items-center justify-center sm:justify-start bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-5 py-4 text-center sm:text-left font-mono overflow-x-auto text-sm sm:text-base whitespace-nowrap">
                    {binaryIpStr}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="w-full sm:w-auto px-6 py-4 rounded-xl font-bold bg-amber-500 text-white hover:bg-amber-600 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20"
                  >
                    {copied ? (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 border-dashed">
                <p className="text-[var(--text-secondary)] font-medium text-sm">
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
