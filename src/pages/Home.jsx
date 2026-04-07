import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import PotholeChart from '../components/PotholeChart';
import './Home.css';

const StatCounter = ({ end, duration = 2000, suffix = "", decimals = 0, delay = 0 }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            let startTimestamp = null;
            const step = (timestamp) => {
              if (!startTimestamp) startTimestamp = timestamp;
              const progress = Math.min((timestamp - startTimestamp) / duration, 1);
              // ease-out cubic: 1 - pow(1 - x, 3)
              const easedProgress = 1 - Math.pow(1 - progress, 3);
              const currentCount = easedProgress * end;
              setCount(currentCount);
              if (progress < 1) {
                window.requestAnimationFrame(step);
              }
            };
            window.requestAnimationFrame(step);
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, [end, duration, delay]);

  return (
    <span ref={countRef}>
      {count.toLocaleString(undefined, { 
        minimumFractionDigits: decimals, 
        maximumFractionDigits: decimals 
      })}
      {suffix}
    </span>
  );
};
export default function Home() {
  useEffect(() => {
    document.documentElement.classList.add("scroll-smooth");
    document.body.className = "bg-surface text-on-surface font-body overflow-x-hidden";

    if (!document.getElementById('tailwind-script')) {
      const twScript = document.createElement('script');
      twScript.id = 'tailwind-script';
      twScript.src = 'https://cdn.tailwindcss.com?plugins=forms,container-queries';

      twScript.onload = () => {
        if (window.tailwind) {
          window.tailwind.config = {
            darkMode: "class",
            theme: {
              extend: {
                "colors": {
                  "on-primary": "#ffffff",
                  "surface-dim": "#dadad8",
                  "on-error": "#ffffff",
                  "error": "#ba1a1a",
                  "on-surface": "#1a1c1b",
                  "primary": "#ED1C24",
                  "primary-container": "#e71520",
                  "surface-tint": "#c00014",
                  "tertiary-fixed-dim": "#c7c6c6",
                  "surface-container-lowest": "#ffffff",
                  "secondary-fixed-dim": "#c8c6c5",
                  "inverse-surface": "#0A0A0A",
                  "on-secondary-fixed-variant": "#474646",
                  "tertiary": "#5b5c5c",
                  "error-container": "#ffdad6",
                  "on-secondary-fixed": "#1c1b1b",
                  "on-tertiary-container": "#fefcfc",
                  "on-primary-container": "#fffbff",
                  "surface-container": "#eeeeec",
                  "outline-variant": "#e8bcb7",
                  "on-tertiary": "#ffffff",
                  "on-background": "#1a1c1b",
                  "tertiary-fixed": "#e3e2e2",
                  "inverse-primary": "#ffb4ab",
                  "on-secondary": "#ffffff",
                  "outline": "#936e6a",
                  "on-tertiary-fixed-variant": "#464747",
                  "primary-fixed-dim": "#ffb4ab",
                  "on-tertiary-fixed": "#1b1c1c",
                  "surface": "#FAFAF8",
                  "surface-container-highest": "#e2e3e1",
                  "surface-bright": "#f9f9f7",
                  "secondary-container": "#e5e2e1",
                  "inverse-on-surface": "#FFFCF2",
                  "tertiary-container": "#747474",
                  "on-error-container": "#93000a",
                  "primary-fixed": "#ffdad6",
                  "secondary-fixed": "#e5e2e1",
                  "on-primary-fixed": "#410002",
                  "secondary": "#5f5e5e",
                  "surface-variant": "#e2e3e1",
                  "on-surface-variant": "#888888",
                  "background": "#FAFAF8",
                  "on-primary-fixed-variant": "#93000d",
                  "surface-container-high": "#e8e8e6",
                  "on-secondary-container": "#656464",
                  "surface-container-low": "#F0EEE9"
                },
                "borderRadius": {
                  "DEFAULT": "0px",
                  "lg": "4px",
                  "xl": "8px",
                  "full": "9999px"
                },
                "fontFamily": {
                  "headline": ["Space Grotesk"],
                  "body": ["Inter"],
                  "label": ["Inter"]
                }
              },
            },
          };
        }
      };
      document.head.appendChild(twScript);

      const font1 = document.createElement('link');
      font1.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700&family=Inter:wght@300;400;600;700&display=swap';
      font1.rel = 'stylesheet';
      document.head.appendChild(font1);

      const font2 = document.createElement('link');
      font2.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
      font2.rel = 'stylesheet';
      document.head.appendChild(font2);
    }
  }, []);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 h-16 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-black/5 dark:border-white/5 flex justify-between items-center px-8 mx-auto">
        <div className="text-xl font-bold tracking-tighter text-black dark:text-white font-headline">
          ARGUS<span className="text-primary">·</span>AI
        </div>
        <div className="hidden md:flex gap-8 font-['Space_Grotesk'] tracking-tighter uppercase text-sm font-bold">
          <Link className="text-primary border-b-2 border-primary pb-1 transition-all" to="/">Product</Link>
          <Link className="text-neutral-500 hover:text-black dark:hover:text-white transition-colors duration-200" to="/map">Map & Routing</Link>
          <Link className="text-neutral-500 hover:text-black dark:hover:text-white transition-colors duration-200" to="/dashboard">Dashboard</Link>
        </div>
        <button className="bg-primary text-white px-5 py-2 font-headline uppercase tracking-tighter text-sm font-bold active:opacity-80 active:scale-95 transition-all">
          Get Early Access
        </button>
      </nav>
      <section className="min-h-screen w-full bg-inverse-surface pt-16 flex flex-col items-center">
        <div className="w-full h-[512px] md:h-[665px] bg-[#161618] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#2a2a2d] to-transparent opacity-40 pointer-events-none"></div>
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              className="w-full h-full object-cover opacity-90"
              autoPlay
              loop
              muted
              playsInline
              src="/argus_intro.mp4"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
        <div className="w-full max-w-5xl px-8 py-20 flex flex-col items-center text-center">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <div className="h-[2px] w-8 bg-primary"></div>
            <span className="text-[11px] font-label font-bold tracking-[3px] text-primary uppercase">ROAD SAFETY · REIMAGINED</span>
            <div className="h-[2px] w-8 bg-primary"></div>
          </div>
          <h1 className="font-headline font-bold text-5xl lg:text-8xl text-inverse-on-surface leading-[1.1] tracking-[-0.02em] mb-8">
            See Every Road.<br /><span className="text-primary">Safe.</span>
          </h1>
          <p className="text-on-surface-variant text-base md:text-lg max-w-2xl mb-12 leading-relaxed">
            ARGUS AI is the first vision-based pothole, pedestrian and obstacle detection system powered by edge intelligence for ultra-low latency response.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-8 mb-20">
            <button className="bg-inverse-on-surface text-inverse-surface px-12 py-4 font-headline uppercase font-bold tracking-tighter transition-all hover:bg-primary hover:text-white">
              Explore Hardware
            </button>
            <Link className="text-on-surface-variant font-headline font-bold text-sm tracking-widest hover:text-inverse-on-surface transition-colors" to="/map">
              VIEW FEATURES →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-white/10 pt-12 w-full">
            <div>
              <div className="font-headline font-bold text-4xl lg:text-5xl text-inverse-on-surface tracking-tighter">&lt;30ms</div>
              <div className="text-[11px] font-label font-bold text-neutral-600 tracking-widest uppercase mt-2">Latency</div>
            </div>
            <div>
              <div className="font-headline font-bold text-4xl lg:text-5xl text-inverse-on-surface tracking-tighter">88.8%</div>
              <div className="text-[11px] font-label font-bold text-neutral-600 tracking-widest uppercase mt-2">Detection Accuracy</div>
            </div>
            <div>
              <div className="font-headline font-bold text-4xl lg:text-5xl text-inverse-on-surface tracking-tighter">Rs.6000</div>
              <div className="text-[11px] font-label font-bold text-neutral-600 tracking-widest uppercase mt-2">Starting Price</div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-surface">
        <div className="py-24 px-8 max-w-5xl mx-auto flex flex-col items-center">
          <div className="w-full text-center mb-12">
            <div className="text-primary font-headline font-bold text-sm mb-4 tracking-widest">PHASE 01</div>
            <h3 className="font-headline font-bold text-5xl text-on-surface mb-6">Assembled</h3>
            <p className="text-on-surface-variant max-w-2xl mx-auto text-lg leading-relaxed">Weatherproof ABS enclosure rated IP65 sealed against dust ingress and water jets, handlebar-mounted in under 5 minutes on any two-wheeler.</p>
          </div>
          <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-surface-container-low border border-black/5 flex items-center justify-center overflow-hidden">
            <img className="w-full h-full object-cover" data-alt="Hyper-detailed 3D technical render of AI device internals showing circuit boards and glowing microchips in high contrast lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKSW8lY_0Ap1AjkrGJYvFTGEa45xr-CqAviWPRx2nbF0d_Rq8r_0QByMxQfVWXUN_hrr9Pc69R0HTy4Z-pS7ZwH6ZWOXqurmvalvLDGYbb0ICuB1C6-DSZLnQzwFx-_xE4EBYNbjFD9UCSdchseBXutEiTvOwvCouP4uSEjol40th7ofBOEuAC6rN7QdQrb1Kjr9Cd5DAizZ6VdAaemTDeFqUlRJb99GLdlw1xSYXKTfspbY4B2WCoS6g2cJRzrbeSTlayQ45rd1iF" alt="" />
          </div>
        </div>
        <div className="py-24 px-8 max-w-5xl mx-auto flex flex-col items-center border-t border-black/5">
          <div className="w-full text-center mb-12">
            <div className="text-primary font-headline font-bold text-sm mb-4 tracking-widest">PHASE 02</div>
            <h3 className="font-headline font-bold text-5xl text-on-surface mb-6">Internal Architecture</h3>
            <p className="text-on-surface-variant max-w-2xl mx-auto text-lg leading-relaxed">Raspberry Pi Zero 2W running YOLOv10n at 8–12 FPS on-device — 40,715 training images, 88.8% mAP, zero cloud dependency.</p>
          </div>
          <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-surface-container-low border border-black/5 flex items-center justify-center overflow-hidden">
            <img className="w-full h-full object-cover grayscale opacity-80" data-alt="Hyper-detailed 3D technical render of AI device internals showing circuit boards and glowing microchips in high contrast lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKSW8lY_0Ap1AjkrGJYvFTGEa45xr-CqAviWPRx2nbF0d_Rq8r_0QByMxQfVWXUN_hrr9Pc69R0HTy4Z-pS7ZwH6ZWOXqurmvalvLDGYbb0ICuB1C6-DSZLnQzwFx-_xE4EBYNbjFD9UCSdchseBXutEiTvOwvCouP4uSEjol40th7ofBOEuAC6rN7QdQrb1Kjr9Cd5DAizZ6VdAaemTDeFqUlRJb99GLdlw1xSYXKTfspbY4B2WCoS6g2cJRzrbeSTlayQ45rd1iF" alt="" />
          </div>
        </div>
        <div className="py-24 px-8 max-w-5xl mx-auto flex flex-col items-center border-t border-black/5">
          <div className="w-full text-center mb-12">
            <div className="text-primary font-headline font-bold text-sm mb-4 tracking-widest">PHASE 03</div>
            <h3 className="font-headline font-bold text-5xl text-on-surface mb-6">System Intelligence</h3>
            <p className="text-on-surface-variant max-w-2xl mx-auto text-lg leading-relaxed">MPU6050 6-axis IMU detects crash events and triggers a 30-second dead man countdown auto-dispatching GPS coordinates via SIM800L GSM to emergency contacts.</p>
          </div>
          <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-surface-container-low border border-black/5 flex items-center justify-center overflow-hidden">
            <img className="w-full h-full object-cover" data-alt="Hyper-detailed 3D technical render of AI device internals showing circuit boards and glowing microchips in high contrast lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKSW8lY_0Ap1AjkrGJYvFTGEa45xr-CqAviWPRx2nbF0d_Rq8r_0QByMxQfVWXUN_hrr9Pc69R0HTy4Z-pS7ZwH6ZWOXqurmvalvLDGYbb0ICuB1C6-DSZLnQzwFx-_xE4EBYNbjFD9UCSdchseBXutEiTvOwvCouP4uSEjol40th7ofBOEuAC6rN7QdQrb1Kjr9Cd5DAizZ6VdAaemTDeFqUlRJb99GLdlw1xSYXKTfspbY4B2WCoS6g2cJRzrbeSTlayQ45rd1iF" alt="" />
          </div>
        </div>
        <div className="py-24 px-8 max-w-5xl mx-auto flex flex-col items-center border-t border-black/5">
          <div className="w-full text-center mb-12">
            <h3 className="font-headline font-bold text-5xl text-on-surface mb-6">Live Demonstration</h3>
            <p className="text-on-surface-variant max-w-2xl mx-auto text-lg leading-relaxed">Watch the Argus AI system operating in real-world road conditions.</p>
          </div>
          <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-surface-container-low border border-black/5 flex items-center justify-center overflow-hidden relative group cursor-pointer shadow-lg hover:shadow-xl transition-shadow duration-300">
            {/* Interactive UI Overlay for Video element */}
            <div className="absolute inset-0 bg-neutral-900/20 group-hover:bg-neutral-900/40 transition-colors z-10 flex items-center justify-center">
              <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-4xl ml-2">play_arrow</span>
              </div>
            </div>
            {/* Placeholder Thumbnail */}
            <img className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 transition-all duration-500" data-alt="Video placeholder" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEJN9H5CVFLvEj6eXNR9wAFBIFsGYT_KdcNV9jmBq3XIew9n41Nech2L8d3zEBX5tjYxKrFbRSjnEOH3s2_Nlb9TkRYqQF0GS4UKgQfOI0_ai_avISkeTa3OvT11g_Ts0DB34i9ETItzSY3ViY8AkfwR0IbRsLY-oVMVEM6CBJXta8eMKQPdm8ClJPmF3Wtj9Gry6EU0n8E4T7yXKQ6OPrz7ohVGrRJT7BeYUk7UEuZbHM2807MimMLmcTdXzaxcYdhpPan5naU079" alt="Video presentation thumbnail" />
          </div>
        </div>
      </section>
      <section className="bg-inverse-surface py-24 px-8">
        <div className="max-w-5xl mx-auto flex flex-col divide-y divide-white/10">
          <div className="py-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="font-headline font-bold text-6xl md:text-8xl text-primary tracking-tighter">
              <StatCounter end={1.78} decimals={2} suffix="L" delay={0} />
            </div>
            <div className="font-label text-sm font-bold text-neutral-500 tracking-[0.2em] uppercase">Road Deaths Per Year in India</div>
          </div>
          <div className="py-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="font-headline font-bold text-6xl md:text-8xl text-primary tracking-tighter">
              <StatCounter end={44} suffix="%" delay={200} />
            </div>
            <div className="font-label text-sm font-bold text-neutral-500 tracking-[0.2em] uppercase">Are Two-Wheeler Riders</div>
          </div>
          <div className="py-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="font-headline font-bold text-6xl md:text-8xl text-primary tracking-tighter">
              <StatCounter end={264} delay={400} />
            </div>
            <div className="font-label text-sm font-bold text-neutral-500 tracking-[0.2em] uppercase">FPS on AMD Radeon 780M · DirectML</div>
          </div>
          <div className="py-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="font-headline font-bold text-6xl md:text-8xl text-primary tracking-tighter">
              <StatCounter end={0.888} decimals={3} delay={600} />
            </div>
            <div className="font-label text-sm font-bold text-neutral-500 tracking-[0.2em] uppercase">mAP50 · YOLOv10n Detection Accuracy</div>
          </div>
        </div>
      </section>
      <section className="bg-surface py-24 px-8">
        <div className="max-w-5xl mx-auto flex flex-col gap-16">
          <div className="text-center">
            <div className="text-primary font-headline font-bold text-sm mb-4 tracking-widest">THE SCALE OF THE CRISIS</div>
            <h2 className="font-headline font-bold text-4xl lg:text-6xl text-on-surface tracking-tighter leading-tight mb-6">
              1,856 Indians killed by potholes<br />in 2022 — a 26% rise in two years.
            </h2>
            <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
              Government data from Rajya Sabha Q.1871 confirms pothole fatalities are accelerating every year with no sign of reversal.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex flex-col gap-4 md:w-1/3">
              {[
                { num: "1,856", label: "Pothole fatalities in 2022" },
                { num: "+26%", label: "Rise since 2020" },
                { num: "55%", label: "Concentrated in Uttar Pradesh alone" },
              ].map(({ num, label }) => (
                <div key={label} className="border border-black/5 bg-surface-container-low p-8">
                  <div className="font-headline font-bold text-4xl text-primary tracking-tighter mb-2">{num}</div>
                  <div className="text-on-surface-variant text-sm font-bold uppercase tracking-widest">{label}</div>
                </div>
              ))}
            </div>
            <div className="md:w-2/3">
              <PotholeChart />
            </div>
          </div>
        </div>
      </section>
      <section className="bg-surface py-24 px-8">
        <div className="max-w-5xl mx-auto flex flex-col gap-12">
          <div className="w-full text-center md:text-left mb-4">
            <div className="text-primary font-headline font-bold text-sm mb-4 tracking-widest uppercase">Core Capabilities</div>
            <h2 className="font-headline font-bold text-5xl lg:text-6xl text-on-surface tracking-tighter leading-none mb-4">Features of Argus.Ai</h2>
            <p className="text-on-surface-variant text-lg leading-relaxed max-w-2xl">
              Advanced computer vision and edge processing designed to prevent accidents before they happen.
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-12 p-12 border border-[#E2E0DA] bg-white">
            <span className="material-symbols-outlined text-primary text-6xl" style={{ fontVariationSettings: '"FILL" 1' }}>road</span>
            <div className="text-center md:text-left">
              <h4 className="font-headline font-bold text-3xl mb-4 tracking-tight">Pothole Detection</h4>
              <p className="text-on-surface-variant text-lg leading-relaxed">Early-warning alerts for surface deformities at speeds up to 120km/h with sub-meter accuracy.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-12 p-12 border border-[#E2E0DA] bg-white">
            <span className="material-symbols-outlined text-primary text-6xl">people</span>
            <div className="text-center md:text-left">
              <h4 className="font-headline font-bold text-3xl mb-4 tracking-tight">Pedestrian Alert</h4>
              <p className="text-on-surface-variant text-lg leading-relaxed">Predictive behavioral modeling identifies potential road crossings before they occur.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-12 p-12 border border-[#E2E0DA] bg-white">
            <span className="material-symbols-outlined text-primary text-6xl">emergency</span>
            <div className="text-center md:text-left">
              <h4 className="font-headline font-bold text-3xl mb-4 tracking-tight">Auto SOS Dispatch</h4>
              <p className="text-on-surface-variant text-lg leading-relaxed">Instant crash detection notifies emergency services with precise GPS coordinates and vitals.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-12 p-12 border border-[#E2E0DA] bg-white">
            <span className="material-symbols-outlined text-primary text-6xl">memory</span>
            <div className="text-center md:text-left">
              <h4 className="font-headline font-bold text-3xl mb-4 tracking-tight">Edge AI</h4>
              <p className="text-on-surface-variant text-lg leading-relaxed">No cloud dependency. All neural network processing happens locally on the device hardware.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-12 p-12 border border-[#E2E0DA] bg-white">
            <span className="material-symbols-outlined text-primary text-6xl">route</span>
            <div className="text-center md:text-left">
              <h4 className="font-headline font-bold text-3xl mb-4 tracking-tight">SafeRoute Intelligence</h4>
              <p className="text-on-surface-variant text-lg leading-relaxed">Dynamic re-routing based on real-time road condition data harvested from the Argus fleet.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-inverse-surface py-32 px-8">
        <div className="max-w-5xl mx-auto flex flex-col gap-20">
          <div className="text-center">
            <h2 className="font-headline font-bold text-5xl lg:text-7xl text-inverse-on-surface tracking-tighter leading-none mb-8">
              264 FPS on integrated GPU.
            </h2>
            <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
              Optimized for AMD RDNA™ architecture. We leverage low-level hardware acceleration to achieve high-performance vision without the bulk of a dedicated card.
            </p>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left font-headline">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="py-6 text-neutral-500 uppercase text-xs tracking-widest font-bold">Processor / GPU</th>
                  <th className="py-6 text-neutral-500 uppercase text-xs tracking-widest font-bold text-right">Inference Speed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="group">
                  <td className="py-10 text-primary font-bold text-3xl tracking-tighter">AMD Radeon 780M</td>
                  <td className="py-10 text-primary font-bold text-3xl tracking-tighter text-right">264 FPS</td>
                </tr>
                <tr className="group opacity-50">
                  <td className="py-10 text-inverse-on-surface font-bold text-3xl tracking-tighter">NVIDIA RTX 3050 (Mobile)</td>
                  <td className="py-10 text-inverse-on-surface font-bold text-3xl tracking-tighter text-right">212 FPS</td>
                </tr>
                <tr className="group opacity-50">
                  <td className="py-10 text-inverse-on-surface font-bold text-3xl tracking-tighter">Intel Core i5 (13th Gen)</td>
                  <td className="py-10 text-inverse-on-surface font-bold text-3xl tracking-tighter text-right">88 FPS</td>
                </tr>
                <tr className="group opacity-50">
                  <td className="py-10 text-inverse-on-surface font-bold text-3xl tracking-tighter">Ryzen 7 (Standard)</td>
                  <td className="py-10 text-inverse-on-surface font-bold text-3xl tracking-tighter text-right">104 FPS</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <section className="bg-surface-container-low py-32 px-8">
        <div className="max-w-5xl mx-auto flex flex-col gap-24">
          <div className="w-full">
            <h3 className="font-headline font-bold text-4xl mb-12 tracking-tight text-center md:text-left">Technical Specifications</h3>
            <div className="space-y-8">
              <div className="flex justify-between items-end border-b border-black/5 pb-4">
                <span className="text-on-surface-variant font-bold uppercase text-xs tracking-widest">Processor</span>
                <span className="text-primary font-headline font-bold text-xl text-right">Quad-core ARM Cortex-A53 · 1GHz</span>
              </div>
              <div className="flex justify-between items-end border-b border-black/5 pb-4">
                <span className="text-on-surface-variant font-bold uppercase text-xs tracking-widest">AI Model</span>
                <span className="text-primary font-headline font-bold text-xl text-right">YOLOv10n · 88.8% mAP · 40,715 training images</span>
              </div>
              <div className="flex justify-between items-end border-b border-black/5 pb-4">
                <span className="text-on-surface-variant font-bold uppercase text-xs tracking-widest">Field of View</span>
                <span className="text-primary font-headline font-bold text-xl text-right">120° FOV · Pi Camera v2</span>
              </div>
              <div className="flex justify-between items-end border-b border-black/5 pb-4">
                <span className="text-on-surface-variant font-bold uppercase text-xs tracking-widest">Detection Range</span>
                <span className="text-primary font-headline font-bold text-xl text-right">Up to 8 metres · &lt;30ms latency</span>
              </div>
              <div className="flex justify-between items-end border-b border-black/5 pb-4">
                <span className="text-on-surface-variant font-bold uppercase text-xs tracking-widest">Total Cost</span>
                <span className="text-primary font-headline font-bold text-xl text-right">Rs. 6000 one-time · no subscription</span>
              </div>
            </div>
          </div>
          <div className="w-full">
            <div className="bg-white p-12 md:p-16 relative shadow-sm border border-black/5">
              <span className="material-symbols-outlined text-primary text-7xl absolute top-0 left-8 md:left-16 -translate-y-1/2 bg-white px-2">format_quote</span>
              <p className="font-headline text-3xl font-light italic text-on-surface leading-relaxed mb-12 pt-8">
                "Argus AI isn't just another gadget; it's the black box of safety. The latency on the RDNA hardware is so low it feels predictive rather than reactive."
              </p>
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-surface-container-high rounded-full overflow-hidden">
                  <img className="w-full h-full object-cover" data-alt="Portrait of a professional motorcycle racer in full gear looking into the distance with urban cityscape background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkR75ehV4nngtDapKD-8gPR4Vci662LOPoCrOINOPfQOdsgo-2_iBhkM-S6w_k2hWVbmC24TrHVKx1JxGkfKOHKQg0mnNNk262MfaK90bU4dcf07lbaW9Ccvo7hrotGnBk80F3lv-S0hSztz9I5XlhD7DNy6JQGj9KipW4Q43lcevOkSB0FI2Fzglb_WMksBqaiw77xdIIyctt4jlmKgm_coUn4ZOkNa5W20aJFuXnU540WV_t-3tfAkzWDqh42ICKF7DrwT6bWNUW" alt="" />
                </div>
                <div>
                  <div className="font-bold text-lg tracking-tight">Vikram Singh</div>
                  <div className="text-xs text-on-surface-variant font-bold tracking-widest uppercase">Lead Tester, Apex Racing</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-primary py-32 px-8 flex flex-col items-center text-center">
        <h2 className="font-headline font-bold text-5xl lg:text-7xl text-inverse-on-surface tracking-tighter mb-12">
          Ready to ride safer?
        </h2>
        <button className="bg-white text-primary px-16 py-6 font-headline font-bold uppercase tracking-widest text-xl hover:bg-inverse-surface hover:text-white transition-all">
          Request Early Access
        </button>
      </section>
      <footer className="bg-inverse-surface py-20 px-8 flex flex-col items-center w-full gap-12">
        <div className="flex flex-col items-center gap-6">
          <div className="text-3xl font-bold tracking-tighter text-white font-headline">
            ARGUS<span className="text-primary">·</span>AI
          </div>
          <p className="font-['Inter'] text-xs tracking-widest uppercase text-neutral-500">
            © 2024 ARGUS·AI. ALL RIGHTS RESERVED.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          <Link className="font-['Inter'] text-xs tracking-widest uppercase text-neutral-400 hover:text-primary transition-colors" to="/">Privacy Policy</Link>
          <Link className="font-['Inter'] text-xs tracking-widest uppercase text-neutral-400 hover:text-primary transition-colors" to="/">Terms of Service</Link>
          <Link className="font-['Inter'] text-xs tracking-widest uppercase text-neutral-400 hover:text-primary transition-colors" to="/">Contact</Link>
        </div>
      </footer>
    </>
  );
}
