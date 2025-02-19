
import { useEffect, useRef } from 'react';

interface Planet {
  x: number;
  y: number;
  radius: number;
  color: string;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
}

interface CodeSymbol {
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  speedX: number;
  speedY: number;
}

export const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: any[] = [];
    let planets: Planet[] = [];
    let codeSymbols: CodeSymbol[] = [];
    let mouseX = 0;
    let mouseY = 0;

    // Initialize planets
    const createPlanets = () => {
      const planetColors = ['#4A90E2', '#C471ED', '#FF6B6B', '#50E3C2'];
      const numberOfPlanets = 4;
      
      for (let i = 0; i < numberOfPlanets; i++) {
        planets.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 40 + 20,
          color: planetColors[i],
          speedX: (Math.random() - 0.5) * 0.2,
          speedY: (Math.random() - 0.5) * 0.2,
          rotation: 0,
          rotationSpeed: (Math.random() - 0.5) * 0.02
        });
      }
    };

    // Initialize code symbols
    const createCodeSymbols = () => {
      const symbols = ['{ }', '< >', '/>', '[]', '()', '&&', '=>', '++', '||'];
      const numberOfSymbols = 15;
      
      for (let i = 0; i < numberOfSymbols; i++) {
        codeSymbols.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          text: symbols[Math.floor(Math.random() * symbols.length)],
          color: `rgba(${Math.random() * 100 + 156}, ${Math.random() * 100 + 156}, 255, 0.3)`,
          size: Math.random() * 14 + 10,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5
        });
      }
    };

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = `rgba(${Math.random() * 100 + 156}, ${
          Math.random() * 100 + 156
        }, 255, ${Math.random() * 0.3 + 0.1})`;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;

        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 100) {
          this.x += dx * 0.01;
          this.y += dy * 0.01;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      const numberOfParticles = (canvas.width * canvas.height) / 15000;
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
      }
      createPlanets();
      createCodeSymbols();
    };

    const updatePlanets = () => {
      planets.forEach(planet => {
        planet.x += planet.speedX;
        planet.y += planet.speedY;
        planet.rotation += planet.rotationSpeed;

        if (planet.x > canvas.width + planet.radius) planet.x = -planet.radius;
        if (planet.x < -planet.radius) planet.x = canvas.width + planet.radius;
        if (planet.y > canvas.height + planet.radius) planet.y = -planet.radius;
        if (planet.y < -planet.radius) planet.y = canvas.height + planet.radius;
      });
    };

    const updateCodeSymbols = () => {
      codeSymbols.forEach(symbol => {
        symbol.x += symbol.speedX;
        symbol.y += symbol.speedY;

        if (symbol.x > canvas.width) symbol.x = 0;
        if (symbol.x < 0) symbol.x = canvas.width;
        if (symbol.y > canvas.height) symbol.y = 0;
        if (symbol.y < 0) symbol.y = canvas.height;
      });
    };

    const drawPlanets = () => {
      planets.forEach(planet => {
        if (!ctx) return;
        ctx.save();
        ctx.translate(planet.x, planet.y);
        ctx.rotate(planet.rotation);
        
        // Planet glow effect
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, planet.radius);
        gradient.addColorStop(0, planet.color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(0, 0, planet.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Planet rings
        ctx.beginPath();
        ctx.ellipse(0, 0, planet.radius * 1.5, planet.radius * 0.3, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `${planet.color}44`;
        ctx.stroke();
        
        ctx.restore();
      });
    };

    const drawCodeSymbols = () => {
      if (!ctx) return;
      ctx.font = `monospace`;
      codeSymbols.forEach(symbol => {
        ctx.font = `${symbol.size}px JetBrains Mono`;
        ctx.fillStyle = symbol.color;
        ctx.fillText(symbol.text, symbol.x, symbol.y);
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0B1120');
      gradient.addColorStop(1, '#1A1F2C');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });
      
      updatePlanets();
      drawPlanets();
      
      updateCodeSymbols();
      drawCodeSymbols();
      
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.x;
      mouseY = e.y;
    };

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
    animate();

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
    />
  );
};
