import React, { useEffect, useRef, useState, useCallback } from 'react';

interface CinematicScrollExperienceProps {
  onStartApp: () => void;
  reducedMotion?: boolean;
}

const TOTAL_FRAMES = 40;

export const CinematicScrollExperience: React.FC<CinematicScrollExperienceProps> = ({
  onStartApp,
  reducedMotion = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(1);
  const [loadedCount, setLoadedCount] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  // Preload frames progressively
  useEffect(() => {
    let isCancelled = false;
    const images: HTMLImageElement[] = [];

    const loadFrame = (index: number): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const frameNum = String(index).padStart(3, '0');
        img.src = `/frames/frame_${frameNum}.png`;
        img.onload = () => resolve(img);
        img.onerror = () => {
          console.warn(`Frame ${index} failed to load, falling back to frame 1`);
          if (images[0]) resolve(images[0]);
          else resolve(img);
        };
      });
    };

    // Load initial 5 priority frames first
    const preloadPriority = async () => {
      try {
        for (let i = 1; i <= 5; i++) {
          const img = await loadFrame(i);
          if (isCancelled) return;
          images[i - 1] = img;
          setLoadedCount(i);
        }
        imagesRef.current = images;
        setIsReady(true);
        drawFrame(1);

        // Load the remaining frames in background
        for (let i = 6; i <= TOTAL_FRAMES; i++) {
          if (isCancelled) return;
          const img = await loadFrame(i);
          images[i - 1] = img;
          setLoadedCount(i);
        }
      } catch (err) {
        console.warn('Progressive frame loading warning:', err);
      }
    };

    preloadPriority();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Efficient Canvas drawing of frame
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imagesRef.current[frameIndex - 1] || imagesRef.current[0];
    if (!img || !img.complete) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Clear
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Maintain 16:9 aspect ratio with centered cover/contain
    const imgRatio = img.width / img.height;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawWidth: number;
    let drawHeight: number;
    let offsetX: number;
    let offsetY: number;

    if (canvasRatio > imgRatio) {
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imgRatio;
      offsetX = 0;
      offsetY = (canvasHeight - drawHeight) / 2;
    } else {
      drawHeight = canvasHeight;
      drawWidth = canvasHeight * imgRatio;
      offsetX = (canvasWidth - drawWidth) / 2;
      offsetY = 0;
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    currentFrameRef.current = frameIndex;
  }, []);

  // Handle Canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvasRef.current.width = rect.width * dpr;
      canvasRef.current.height = rect.height * dpr;
      drawFrame(currentFrameRef.current);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawFrame, isReady]);

  // Map scroll progress to frames
  useEffect(() => {
    if (reducedMotion) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const container = containerRef.current;
          if (!container) {
            ticking = false;
            return;
          }

          const rect = container.getBoundingClientRect();
          const totalScrollable = container.offsetHeight - window.innerHeight;
          const currentScroll = Math.max(0, -rect.top);
          const progress = Math.min(1, Math.max(0, currentScroll / totalScrollable));

          setScrollProgress(progress);

          // Calculate target frame (1 to TOTAL_FRAMES)
          const targetFrame = Math.min(
            TOTAL_FRAMES,
            Math.max(1, Math.floor(progress * (TOTAL_FRAMES - 1)) + 1)
          );

          if (targetFrame !== currentFrameRef.current) {
            drawFrame(targetFrame);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [drawFrame, reducedMotion]);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#101B34] text-white selection:bg-[#17B99A]/30 selection:text-white"
      style={{ minHeight: reducedMotion ? '100vh' : '450vh' }}
    >
      {/* Sticky Background Canvas Viewport */}
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center pointer-events-none z-0">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover opacity-85 transition-opacity duration-700"
          style={{ filter: 'brightness(1.08) contrast(1.05)' }}
        />
        {/* Subtle cinematic radial vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#101B34] via-transparent to-[#101B34]/60 pointer-events-none" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#101B34]/30 to-[#101B34]/80 pointer-events-none" />

        {/* Ambient Loading indicator for frames */}
        {!isReady && (
          <div className="absolute top-6 right-6 flex items-center gap-2 bg-[#182746]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-mono text-[#17B99A]">
            <span className="w-2 h-2 rounded-full bg-[#17B99A] animate-ping" />
            Loading experience: {Math.round((loadedCount / 5) * 100)}%
          </div>
        )}
      </div>

      {/* Persistent Top Navigation Bar */}
      <header className="fixed top-0 left-0 w-full z-40 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-[#101B34]/60 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#17B99A] to-[#006B58] flex items-center justify-center shadow-lg shadow-[#17B99A]/30">
            <span className="material-symbols-outlined text-white text-[20px]">graphic_eq</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-white font-display-hero text-lg leading-tight">
              SARA
            </span>
            <span className="text-[11px] font-mono text-[#17B99A] uppercase tracking-wider">
              Smart Accessible Response Assistant
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onStartApp}
            className="px-4 py-2 rounded-full bg-[#17B99A] hover:bg-[#149d82] text-[#101B34] font-semibold text-sm transition-all shadow-lg shadow-[#17B99A]/25 flex items-center gap-2 group active:scale-95"
          >
            <span>Start with SARA</span>
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">
              arrow_forward
            </span>
          </button>
        </div>
      </header>

      {/* Scrollable Narrative Content Layers */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 pointer-events-auto">
        {/* SECTION 1: HERO / THE PROBLEM WITH ANIMATED SARA MOTION IN FIRST FRAME */}
        <section className="min-h-screen flex flex-col justify-center pt-24 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
            {/* Left Column: Hero Text */}
            <div className="lg:col-span-7 flex flex-col items-start text-left z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#17B99A]/15 border border-[#17B99A]/30 text-[#17B99A] text-xs font-mono mb-4">
                <span className="w-2 h-2 rounded-full bg-[#17B99A] animate-pulse" />
                TECH-QUEST 2.0 • RNSIT • ACCESSIBLE AI
              </div>

              {/* Kinetic Motion-Designed SARA Brand Header (First Frame) */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative inline-block">
                  <div className="relative flex items-center">
                    <span className="text-5xl md:text-7xl font-extrabold font-display-hero tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-[#17B99A] to-cyan-300 drop-shadow-[0_0_35px_rgba(23,185,154,0.7)]">
                      SARA
                    </span>
                    <span className="ml-3 px-2.5 py-0.5 rounded-full bg-[#17B99A]/20 border border-[#17B99A]/50 text-[#17B99A] font-mono text-xs font-bold animate-pulse">
                      4.0
                    </span>
                  </div>
                  {/* Animated Sound Frequency Equalizer Underline */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-[#17B99A] to-transparent rounded-full mt-1.5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/80 animate-wave-shimmer" />
                  </div>
                </div>
                <div className="border-l border-white/20 pl-4 flex flex-col justify-center">
                  <span className="text-xs uppercase tracking-[0.2em] font-mono text-[#17B99A] font-bold">
                    Smart Accessible
                  </span>
                  <span className="text-xs uppercase tracking-[0.2em] font-mono text-slate-300">
                    Response Assistant
                  </span>
                </div>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold font-display-hero tracking-tight leading-[1.1] mb-6 max-w-2xl text-white">
                Forms should not be a barrier.
              </h1>

              <p className="text-base md:text-lg text-slate-300 font-body-md max-w-xl leading-relaxed mb-8">
                Millions of people with limited literacy, digital anxiety, or motor barriers are excluded
                from online public forms. SARA breaks down this barrier through natural conversation.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={onStartApp}
                  className="px-7 py-3.5 rounded-xl bg-[#17B99A] hover:bg-[#149d82] text-[#101B34] font-semibold text-base transition-all shadow-xl shadow-[#17B99A]/25 flex items-center gap-3 active:scale-95 group"
                >
                  <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform">mic</span>
                  <span>Start with SARA</span>
                  <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>

              {!reducedMotion && (
                <div className="mt-12 flex items-center gap-3 text-xs text-slate-400 font-mono animate-bounce">
                  <span className="material-symbols-outlined text-[20px] text-[#17B99A]">
                    arrow_downward
                  </span>
                  <span>Scroll to witness speech become structure</span>
                </div>
              )}
            </div>

            {/* Right Column: SARA in Animated Motion (First Frame Only) */}
            <div className="lg:col-span-5 flex items-center justify-center relative py-6">
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center animate-float">
                {/* Concentric Animated Soundwave Ripples */}
                <div className="absolute inset-0 rounded-full border border-[#17B99A]/30 animate-ripple-ring pointer-events-none" />
                <div className="absolute inset-4 rounded-full border border-[#17B99A]/20 animate-ripple-ring pointer-events-none" style={{ animationDelay: '0.8s' }} />
                <div className="absolute inset-8 rounded-full border border-[#17B99A]/15 animate-ripple-ring pointer-events-none" style={{ animationDelay: '1.6s' }} />

                {/* Ambient Soft Glow Behind Orb */}
                <div className="absolute w-56 h-56 rounded-full bg-gradient-to-tr from-[#17B99A]/40 to-[#006B58]/20 blur-2xl animate-pulse-glow pointer-events-none" />

                {/* Central Kinetic SARA Holographic Orb */}
                <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br from-[#17B99A] via-[#0F766E] to-[#101B34] p-1 shadow-[0_0_50px_rgba(23,185,154,0.45)] border border-white/20 flex items-center justify-center backdrop-blur-md">
                  <div className="w-full h-full rounded-full bg-[#101B34]/60 backdrop-blur-sm flex flex-col items-center justify-center relative overflow-hidden">
                    {/* Inner Rotating Aura Ring */}
                    <div className="absolute inset-1 rounded-full border border-dashed border-[#17B99A]/40 animate-spin" style={{ animationDuration: '20s' }} />

                    {/* SARA Title & Waveform in Motion */}
                    <span className="font-display-hero text-2xl font-black tracking-widest text-white drop-shadow-[0_2px_8px_rgba(23,185,154,0.8)]">
                      SARA
                    </span>
                    <span className="text-[9px] font-mono tracking-widest text-[#17B99A] uppercase mt-0.5 font-bold">
                      ASSISTANT
                    </span>

                    {/* Dynamic Equalizer Audio Frequency Bars */}
                    <div className="flex items-center gap-1.5 mt-3 h-6">
                      <span className="w-1 bg-[#17B99A] rounded-full animate-wave-bar-1" />
                      <span className="w-1 bg-[#17B99A] rounded-full animate-wave-bar-2" />
                      <span className="w-1.5 bg-white rounded-full animate-wave-bar-3 shadow-sm shadow-[#17B99A]" />
                      <span className="w-1 bg-[#17B99A] rounded-full animate-wave-bar-4" />
                      <span className="w-1 bg-[#17B99A] rounded-full animate-wave-bar-2" />
                    </div>
                  </div>
                </div>

                {/* Floating Animated Badges Orbiting SARA */}
                <div className="absolute -top-3 -right-2 px-3 py-1.5 rounded-full bg-[#182746]/90 border border-[#17B99A]/40 backdrop-blur-md shadow-lg flex items-center gap-1.5 text-[11px] font-mono text-[#17B99A] animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-[#17B99A]" />
                  <span>SARA AI Voice Active</span>
                </div>

                <div className="absolute -bottom-2 -left-3 px-3 py-1.5 rounded-full bg-[#182746]/90 border border-white/10 backdrop-blur-md shadow-lg flex items-center gap-1.5 text-[11px] font-mono text-slate-200">
                  <span className="material-symbols-outlined text-[14px] text-[#17B99A]">translate</span>
                  <span>ಕನ್ನಡ • English</span>
                </div>

                <div className="absolute -bottom-5 right-2 px-2.5 py-1 rounded-full bg-[#101B34]/95 border border-[#17B99A]/30 backdrop-blur-md text-[10px] font-mono text-[#17B99A]">
                  🛡️ 100% User Control
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: THE TRANSFORMATION */}
        <section className="min-h-screen flex flex-col justify-center items-end text-right pb-16">
          <div className="bg-[#182746]/85 backdrop-blur-xl p-8 rounded-2xl border border-white/10 max-w-lg shadow-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-[#17B99A] text-xs font-mono mb-4">
              STAGE 1 • VOICE TO SIGNAL
            </div>

            <h2 className="text-3xl md:text-4xl font-bold font-display-hero text-white mb-4">
              "Just speak. SARA understands."
            </h2>

            <p className="text-slate-300 font-body-md leading-relaxed mb-6">
              No typing tricky input fields. No confusing error codes. You speak in your everyday
              language, exactly as you would speak to an empathetic assistant in person.
            </p>

            <div className="flex items-center justify-end gap-2 text-xs font-mono text-[#17B99A]">
              <span>Sample: "My name is Jeevan Gowda, I am 19, and I live in Bengaluru."</span>
            </div>
          </div>
        </section>

        {/* SECTION 3: THE INTELLIGENCE */}
        <section className="min-h-screen flex flex-col justify-center items-start pb-16">
          <div className="bg-[#182746]/85 backdrop-blur-xl p-8 rounded-2xl border border-white/10 max-w-lg shadow-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-[#17B99A] text-xs font-mono mb-4">
              STAGE 2 • SARA SENSE REASONING
            </div>

            <h2 className="text-3xl md:text-4xl font-bold font-display-hero text-white mb-4">
              Not just transcription. True comprehension.
            </h2>

            <p className="text-slate-300 font-body-md leading-relaxed mb-6">
              SARA SENSE maps a single spoken sentence into multiple structured fields at once.
              It knows that "19" belongs to Age, "Bengaluru" is Location, and "Jeevan" is Full Name.
            </p>

            <div className="space-y-2 w-full text-left font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-[#101B34] border border-white/5">
                <span className="text-slate-400">Full Name</span>
                <span className="text-[#17B99A] font-semibold">Jeevan Gowda</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#101B34] border border-white/5">
                <span className="text-slate-400">Age</span>
                <span className="text-[#17B99A] font-semibold">19 Years</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#101B34] border border-white/5">
                <span className="text-slate-400">Location</span>
                <span className="text-[#17B99A] font-semibold">Bengaluru</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: THE TRUST LAYER & SUBMISSION GUARANTEE */}
        <section className="min-h-screen flex flex-col justify-center items-center text-center pb-20">
          <div className="bg-[#182746]/90 backdrop-blur-2xl p-8 md:p-12 rounded-3xl border border-[#17B99A]/30 max-w-2xl shadow-2xl shadow-[#17B99A]/10">
            <div className="w-14 h-14 rounded-2xl bg-[#17B99A]/15 border border-[#17B99A]/40 flex items-center justify-center text-[#17B99A] mx-auto mb-6">
              <span className="material-symbols-outlined text-[32px]">verified_user</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold font-display-hero text-white mb-4">
              Nothing is submitted without you.
            </h2>

            <p className="text-slate-300 font-body-md text-base md:text-lg leading-relaxed mb-8 max-w-lg mx-auto">
              SARA is your assistant, not your replacement. Every extracted answer is clearly displayed,
              can be edited anytime, and requires your explicit confirmation before final completion.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onStartApp}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#17B99A] hover:bg-[#149d82] text-[#101B34] font-bold text-base transition-all shadow-xl shadow-[#17B99A]/30 flex items-center justify-center gap-3 active:scale-95"
              >
                <span className="material-symbols-outlined text-[22px]">how_to_reg</span>
                <span>Open Registration Form</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Scroll Progress Bar */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-white/10 z-50">
        <div
          className="h-full bg-[#17B99A] transition-all duration-150"
          style={{ width: `${Math.round(scrollProgress * 100)}%` }}
        />
      </div>
    </div>
  );
};

