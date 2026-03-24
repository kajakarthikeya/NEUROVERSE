import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export function DataWarpBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // We don't need alpha for the main layout since this is the bottom-most background.
    const ctx = canvas.getContext('2d', { alpha: false });
    let animationFrameId;
    
    let w, h, cx, cy;
    
    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      cx = w / 2;
      cy = h / 2;
    };
    window.addEventListener('resize', resize);
    resize();

    // Mouse parallax tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    
    const handleMouseMove = (e) => {
      mouseX = (e.clientX - cx) * 0.05; // parallax intensity
      mouseY = (e.clientY - cy) * 0.05;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Particle system
    const MAX_PARTICLES = 300;
    const MAX_Z = 2000;
    const FOV = 250;
    const BASE_SPEED = 2;
    
    const particles = [];

    // Create a particle
    const createParticle = (isStreak = false) => {
      // Random spread depending on screen ratio
      const radius = Math.random() * (Math.max(w, h)) + 100;
      const angle = Math.random() * Math.PI * 2;
      
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z: Math.random() * MAX_Z,
        size: isStreak ? Math.random() * 2 + 1 : Math.random() * 3 + 2,
        speed: isStreak ? BASE_SPEED * 8 : BASE_SPEED + Math.random() * 2,
        isStreak,
        hue: isStreak ? 190 : (Math.random() > 0.5 ? 200 : 260) // Mix of cyan (190) and violet (260)
      };
    };

    // Initialize particles
    for (let i = 0; i < MAX_PARTICLES; i++) {
      particles.push(createParticle(Math.random() > 0.9)); // 10% are fast streaks
    }

    const render = () => {
      // Smoothly interpolate camera/center position based on mouse
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Dark sci-fi background with fade for motion blur
      ctx.fillStyle = 'rgba(11, 15, 26, 0.4)'; // #0B0F1A with trailing blur
      ctx.fillRect(0, 0, w, h);

      // Draw radial gradient base just to give depth
      const grad = ctx.createRadialGradient(cx + targetX, cy + targetY, 0, cx + targetX, cy + targetY, Math.max(w, h));
      grad.addColorStop(0, 'rgba(11, 15, 26, 0)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Process particles
      particles.forEach(p => {
        p.z -= p.speed;
        
        // Reset if behind camera
        if (p.z <= 0) {
          p.z = MAX_Z;
          const radius = Math.random() * (Math.max(w, h)) + 100;
          const angle = Math.random() * Math.PI * 2;
          p.x = Math.cos(angle) * radius;
          p.y = Math.sin(angle) * radius;
        }

        // 3D to 2D Projection
        const scale = FOV / p.z;
        const x2d = (p.x * scale) + cx + targetX;
        const y2d = (p.y * scale) + cy + targetY;
        
        // Scale size by depth
        const size2d = p.size * scale;
        
        // Ignore if offscreen
        if (x2d < 0 || x2d > w || y2d < 0 || y2d > h) return;

        // Depth alpha (closer = more opaque, far = transparent)
        const alpha = Math.min(1, Math.max(0, 1 - (p.z / (MAX_Z * 0.8))));

        ctx.beginPath();
        if (p.isStreak) {
          // Draw streak
          const prevScale = FOV / (p.z + p.speed * 10); // Stretch by speed
          const px2d = (p.x * prevScale) + cx + targetX;
          const py2d = (p.y * prevScale) + cy + targetY;
          
          ctx.moveTo(px2d, py2d);
          ctx.lineTo(x2d, y2d);
          ctx.strokeStyle = `hsla(${p.hue}, 100%, 70%, ${alpha})`;
          ctx.lineWidth = size2d;
          ctx.shadowBlur = 15;
          ctx.shadowColor = `hsla(${p.hue}, 100%, 50%, 0.8)`;
          ctx.stroke();
        } else {
          // Draw dot
          ctx.arc(x2d, y2d, size2d, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${alpha})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = `hsla(${p.hue}, 100%, 50%, 0.6)`;
          ctx.fill();
        }
        ctx.shadowBlur = 0; // reset for next op
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, ease: 'easeInOut' }}
      className="fixed inset-0 z-[-1] overflow-hidden bg-[#0B0F1A]"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </motion.div>
  );
}
