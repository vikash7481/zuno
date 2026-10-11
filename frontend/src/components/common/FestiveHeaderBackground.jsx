import React, { useEffect, useRef, useState } from 'react';

export default function FestiveHeaderBackground({ theme, children }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Video playback safety
  useEffect(() => {
    if (videoRef.current && !prefersReducedMotion) {
      videoRef.current.play().catch(() => {
        // Autoplay may be restricted on some devices; graceful poster fallback
        setVideoError(true);
      });
    }
  }, [theme?.desktopMediaUrl, prefersReducedMotion]);

  // Canvas particle system for realistic festive motion
  useEffect(() => {
    if (prefersReducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const effect = theme?.particleEffect || 'none';
    const intensity = theme?.particleIntensity || 'medium';
    const speedMultiplier =
      theme?.animationSpeed === 'fast' ? 1.5 : theme?.animationSpeed === 'slow' ? 0.6 : 1.0;

    if (effect === 'none') {
      ctx.clearRect(0, 0, width, height);
      return () => window.removeEventListener('resize', handleResize);
    }

    const count =
      intensity === 'vibrant'
        ? width < 768 ? 24 : 45
        : intensity === 'subtle'
        ? width < 768 ? 10 : 18
        : width < 768 ? 16 : 28;

    // Initialize particles according to theme type
    const particles = Array.from({ length: count }, () => {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 4 + 2,
        speedX: (Math.random() - 0.5) * 0.8 * speedMultiplier,
        speedY:
          effect === 'diyas'
            ? -(Math.random() * 0.7 + 0.3) * speedMultiplier // Floating up
            : effect === 'snow' || effect === 'confetti'
            ? (Math.random() * 0.9 + 0.4) * speedMultiplier // Drifting down
            : (Math.random() - 0.5) * 0.6 * speedMultiplier,
        opacity: Math.random() * 0.7 + 0.3,
        pulseSpeed: Math.random() * 0.04 + 0.02,
        angle: Math.random() * Math.PI * 2,
        angularSpeed: (Math.random() - 0.5) * 0.04,
        color:
          effect === 'diyas'
            ? Math.random() > 0.3 ? '#F59E0B' : '#FCD34D' // Amber & Gold
            : effect === 'colors'
            ? ['#EC4899', '#06B6D4', '#FACC15', '#10B981', '#A855F7'][Math.floor(Math.random() * 5)] // Holi powder
            : effect === 'snow'
            ? '#FFFFFF'
            : effect === 'confetti'
            ? ['#F59E0B', '#FCD34D', '#38BDF8', '#EC4899', '#10B981'][Math.floor(Math.random() * 5)]
            : '#FDE047'
      };
    });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.angle += p.angularSpeed;

        // Wrap around boundaries
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        ctx.save();
        ctx.globalAlpha = Math.max(0.1, Math.min(1, p.opacity + Math.sin(p.angle) * 0.25));

        if (effect === 'diyas') {
          // Realistic Diya with flame glow
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.8, 0, Math.PI);
          ctx.fillStyle = '#92400E'; // Clay base
          ctx.fill();

          // Glowing flame
          ctx.beginPath();
          ctx.ellipse(p.x, p.y - p.size, p.size * 0.8, p.size * 1.4, 0, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(p.x, p.y - p.size, 0, p.x, p.y - p.size, p.size * 2);
          gradient.addColorStop(0, '#FEF08A');
          gradient.addColorStop(0.5, '#F59E0B');
          gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = gradient;
          ctx.fill();
        } else if (effect === 'colors') {
          // Soft organic gulal cloud specks
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
          grad.addColorStop(0, p.color);
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (effect === 'confetti') {
          // Tumbling rectangular confetti
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size, -p.size * 0.6, p.size * 2, p.size * 1.2);
        } else if (effect === 'snow') {
          // Crisp soft snowflake
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowBlur = 4;
          ctx.shadowColor = '#FFFFFF';
          ctx.fill();
        } else {
          // Celestial sparks & Dandiya flash
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 6;
          ctx.shadowColor = p.color;
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme?.particleEffect, theme?.particleIntensity, theme?.animationSpeed, prefersReducedMotion]);

  const primaryColor = theme?.primaryColor || '#2E1065';
  const secondaryColor = theme?.secondaryColor || '#F59E0B';
  const accentColor = theme?.accentColor || '#10B981';
  const overlayOpacity = typeof theme?.overlayOpacity === 'number' ? theme.overlayOpacity : 0.38;
  const videoUrl =
    typeof window !== 'undefined' && window.innerWidth < 640 && theme?.mobileMediaUrl
      ? theme.mobileMediaUrl
      : theme?.desktopMediaUrl;

  const showVideo =
    theme?.mediaType === 'video' && videoUrl && !videoError && !prefersReducedMotion;

  return (
    <div
      className="relative w-full overflow-hidden transition-colors duration-700 select-none"
      style={{
        background: `linear-gradient(135deg, ${primaryColor} 0%, #111827 55%, ${primaryColor} 100%)`
      }}
    >
      {/* 1. Static Poster Fallback / Underlying Artwork */}
      {theme?.posterUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 scale-105"
          style={{
            backgroundImage: `url(${theme.posterUrl})`,
            opacity: showVideo && videoLoaded ? 0.15 : 0.45
          }}
          aria-hidden="true"
        />
      )}

      {/* 2. Short Seamless Looping Background Video */}
      {showVideo && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={theme?.posterUrl || ''}
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => setVideoError(true)}
          className={`absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-40' : 'opacity-0'
          }`}
          aria-hidden="true"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}

      {/* 3. HTML5 Canvas Realistic Particle Engine */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-1"
        aria-hidden="true"
      />

      {/* 4. Contrast Scrim & Ambient Festive Glow Overlays */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          backgroundColor: `rgba(10, 10, 15, ${overlayOpacity})`,
          backdropFilter: 'blur(3px)'
        }}
        aria-hidden="true"
      />

      {/* Soft Ambient Radial Flares */}
      <div
        className="absolute -top-16 -left-16 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-40"
        style={{ background: secondaryColor }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-30"
        style={{ background: accentColor }}
        aria-hidden="true"
      />

      {/* 5. Interactive Foreground Header Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
