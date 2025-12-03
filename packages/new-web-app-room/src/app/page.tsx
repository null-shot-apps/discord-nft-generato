'use client';

import { useState, useRef } from 'react';

// Simple hash function to convert string to number
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Generate deterministic colors based on hash
function generateColors(hash: number): string[] {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
    '#A3E4D7', '#F9E79F', '#D5A6BD', '#AED6F1', '#A9DFBF'
  ];
  
  const selectedColors = [];
  let tempHash = hash;
  
  for (let i = 0; i < 8; i++) {
    selectedColors.push(colors[tempHash % colors.length]);
    tempHash = Math.floor(tempHash / colors.length);
  }
  
  return selectedColors;
}

// Generate 32x32 pixel art
function generatePixelArt(username: string): string[][] {
  const hash = hashString(username);
  const colors = generateColors(hash);
  const grid: string[][] = [];
  
  let seedValue = hash;
  
  // Simple pseudo-random number generator
  function nextRandom(): number {
    seedValue = (seedValue * 1103515245 + 12345) & 0x7fffffff;
    return seedValue / 0x7fffffff;
  }
  
  // Create base pattern (symmetric for punk-like appearance)
  for (let y = 0; y < 32; y++) {
    grid[y] = [];
    for (let x = 0; x < 32; x++) {
      const rand = nextRandom();
      
      // Create face outline (roughly centered)
      if (y >= 8 && y <= 24 && x >= 8 && x <= 24) {
        if (rand < 0.7) {
          grid[y][x] = colors[Math.floor(nextRandom() * colors.length)];
        } else {
          grid[y][x] = 'transparent';
        }
      }
      // Hair/accessories area
      else if (y >= 4 && y <= 12 && x >= 6 && x <= 26) {
        if (rand < 0.4) {
          grid[y][x] = colors[Math.floor(nextRandom() * colors.length)];
        } else {
          grid[y][x] = 'transparent';
        }
      }
      // Background/body
      else if (y >= 20 && rand < 0.3) {
        grid[y][x] = colors[Math.floor(nextRandom() * colors.length)];
      } else {
        grid[y][x] = 'transparent';
      }
    }
  }
  
  return grid;
}

export default function PixelNFTGenerator() {
  const [username, setUsername] = useState('');
  const [pixelArt, setPixelArt] = useState<string[][] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleGenerate = () => {
    if (!username.trim()) return;
    
    setIsGenerating(true);
    
    // Add a small delay for better UX
    setTimeout(() => {
      const art = generatePixelArt(username.trim());
      setPixelArt(art);
      setIsGenerating(false);
    }, 500);
  };

  const downloadNFT = () => {
    if (!pixelArt || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = 320; // 32x32 scaled up 10x
    canvas.height = 320;
    
    // Draw pixel art
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        if (pixelArt[y][x] !== 'transparent') {
          ctx.fillStyle = pixelArt[y][x];
          ctx.fillRect(x * 10, y * 10, 10, 10);
        }
      }
    }
    
    // Download
    const link = document.createElement('a');
    link.download = `${username}-pixel-nft.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Discord → Pixel NFT
          </h1>
          <p className="text-xl text-gray-300">
            Generate unique 32×32 CryptoPunk-style NFTs from any Discord username
          </p>
        </div>

        {/* Generator Interface */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            {/* Input Section */}
            <div className="mb-8">
              <label className="block text-lg font-medium mb-4">
                Enter Discord Username
              </label>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. CoolGamer123"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <button
                  onClick={handleGenerate}
                  disabled={!username.trim() || isGenerating}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isGenerating ? 'Generating...' : 'Generate NFT'}
                </button>
              </div>
            </div>

            {/* Result Section */}
            {pixelArt && (
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-6">
                  Your Pixel NFT for &quot;{username}&quot;
                </h3>
                
                {/* Pixel Art Display */}
                <div className="inline-block bg-white/5 p-6 rounded-xl border border-white/20 mb-6">
                  <div className="grid grid-cols-32 gap-0 w-80 h-80 mx-auto">
                    {pixelArt.map((row, y) =>
                      row.map((color, x) => (
                        <div
                          key={`${x}-${y}`}
                          className="w-2.5 h-2.5"
                          style={{
                            backgroundColor: color === 'transparent' ? 'transparent' : color,
                            border: color === 'transparent' ? 'none' : '1px solid rgba(255,255,255,0.1)'
                          }}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* Download Button */}
                <button
                  onClick={downloadNFT}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg font-medium hover:from-green-600 hover:to-blue-600 transition-all"
                >
                  Download PNG
                </button>
                
                <p className="text-sm text-gray-400 mt-4">
                  Same username always generates the same unique NFT
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Hidden canvas for download */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}


