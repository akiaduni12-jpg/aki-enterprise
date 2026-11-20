"use client";

import React, { useEffect, useRef, useState } from "react";

interface AeroShardsProps {
  shardColor?: string;
  accentColor?: string;
  count?: number;
  shardSize?: number;
  speed?: number;
  mouseInteraction?: boolean;
  mouseStrength?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function AeroShards({
  shardColor = "#F26A00",
  accentColor = "#FF8A24",
  count = 140,
  shardSize = 1.8,
  speed = 1.0,
  mouseInteraction = true,
  mouseStrength = 0.85,
  className = "",
  style = {},
}: AeroShardsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const container = containerRef.current;
    if (!container) return;

    // Create a dedicated canvas element
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "1";
    container.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let disposed = false;
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 550;

    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);

    const resize = () => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      width = Math.max(rect.width, 320);
      height = Math.max(rect.height, 450);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    resize();

    // Mouse coordinates & shockwave ripples
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      inside: true,
      ripples: [] as Array<{ x: number; y: number; radius: number; alpha: number }>,
    };

    // 3D Geometric Crystal Shard Shapes (Polygonal Facets)
    const shapes: Array<Array<[number, number]>> = [
      // 1. Razor Crystal Shard
      [[-0.8, -1.4], [0.9, 0.4], [-0.5, 1.3], [-0.9, 0.2]],
      // 2. Diamond Prism
      [[0, -1.6], [1.1, -0.2], [0.2, 1.5], [-1.0, 0.2]],
      // 3. Gemstone Fragment
      [[-0.3, -1.4], [0.8, -0.9], [0.95, 0.8], [-0.6, 1.3], [-0.85, -0.4]],
      // 4. Elongated Obsidian Spear
      [[-0.35, -1.8], [0.4, -1.6], [0.25, 1.8], [-0.4, 1.5]],
      // 5. Angular Hex Prism
      [[-0.2, -1.3], [0.9, -0.6], [0.75, 1.0], [-0.7, 1.1], [-0.9, -0.2]],
    ];

    const shardCount = Math.min(Math.max(count, 60), 200);

    // Initialize Shards
    const shards: Array<{
      x: number;
      y: number;
      z: number;
      depth: number;
      size: number;
      shape: Array<[number, number]>;
      isChrome: boolean;
      isAccent: boolean;
      rx: number;
      ry: number;
      rz: number;
      vrx: number;
      vry: number;
      vrz: number;
      vx: number;
      vy: number;
      tiltVelocity: number;
      specular: number;
    }> = [];

    for (let i = 0; i < shardCount; i++) {
      const depthLevel = Math.random();
      const baseShape = shapes[Math.floor(Math.random() * shapes.length)];
      const isChrome = Math.random() < 0.28;
      const isAccent = Math.random() < 0.45;

      shards.push({
        x: (Math.random() - 0.5) * (width * 1.5),
        y: (Math.random() - 0.5) * (height * 1.5),
        z: depthLevel * 700 - 150,
        depth: depthLevel,
        // Larger, more prominent crystal sizing (36px to 80px)
        size: (Math.random() * 38 + 28) * (1 - depthLevel * 0.35) * shardSize,
        shape: baseShape,
        isChrome,
        isAccent,
        rx: Math.random() * Math.PI * 2,
        ry: Math.random() * Math.PI * 2,
        rz: Math.random() * Math.PI * 2,
        vrx: (Math.random() - 0.5) * 0.022,
        vry: (Math.random() - 0.5) * 0.028,
        vrz: (Math.random() - 0.5) * 0.018,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.35,
        tiltVelocity: 0,
        specular: Math.random() * 0.5,
      });
    }

    // Drifting glowing light embers
    const embers: Array<{ x: number; y: number; r: number; alpha: number; vy: number; vx: number }> = [];
    for (let i = 0; i < 40; i++) {
      embers.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2.5 + 1.2,
        alpha: Math.random() * 0.7 + 0.3,
        vy: -(Math.random() * 0.6 + 0.2),
        vx: (Math.random() - 0.5) * 0.3,
      });
    }

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const mx = clientX - rect.left;
      const my = clientY - rect.top;
      mouse.targetX = mx;
      mouse.targetY = my;
    };

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const mx = clientX - rect.left;
      const my = clientY - rect.top;
      mouse.ripples.push({
        x: mx,
        y: my,
        radius: 10,
        alpha: 1.0,
      });
      if (mouse.ripples.length > 6) mouse.ripples.shift();
    };

    window.addEventListener("mousemove", onPointerMove, { passive: true });
    window.addEventListener("mousedown", onPointerDown, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchstart", onPointerDown, { passive: true });

    let lastTime = performance.now();

    const render = (time: number) => {
      if (disposed) return;
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Central ambient energy glow
      const radialGlow = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        40,
        width * 0.5,
        height * 0.5,
        width * 0.65
      );
      radialGlow.addColorStop(0, "rgba(242, 106, 0, 0.18)");
      radialGlow.addColorStop(0.45, "rgba(255, 138, 36, 0.08)");
      radialGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // Render floating embers
      for (const ember of embers) {
        ember.y += ember.vy;
        ember.x += ember.vx;
        if (ember.y < -10) {
          ember.y = height + 10;
          ember.x = Math.random() * width;
        }
        ctx.beginPath();
        ctx.arc(ember.x, ember.y, ember.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 170, 50, ${ember.alpha * 0.6})`;
        ctx.shadowColor = "#FF8A24";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Render shockwave ripples
      for (let r = mouse.ripples.length - 1; r >= 0; r--) {
        const rip = mouse.ripples[r];
        rip.radius += dt * 480;
        rip.alpha -= dt * 0.95;
        if (rip.alpha <= 0) {
          mouse.ripples.splice(r, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 150, 40, ${rip.alpha * 0.8})`;
        ctx.lineWidth = 3.5;
        ctx.shadowColor = "#FF8A24";
        ctx.shadowBlur = 14;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Sort shards by depth (painters algorithm)
      shards.sort((a, b) => b.z - a.z);

      const fov = 540;
      const centerX = width / 2;
      const centerY = height / 2;
      const mouseOffX = (mouse.x - centerX) * 0.14 * mouseStrength;
      const mouseOffY = (mouse.y - centerY) * 0.14 * mouseStrength;

      // Virtual directional light vector
      const lx = 0.4;
      const ly = -0.65;
      const lz = 0.65;

      for (let i = 0; i < shards.length; i++) {
        const shard = shards[i];

        // Motion physics
        shard.rx += (shard.vrx + shard.tiltVelocity * 0.03) * speed;
        shard.ry += (shard.vry + shard.tiltVelocity * 0.035) * speed;
        shard.rz += shard.vrz * speed;
        shard.tiltVelocity *= 0.92;

        shard.x += shard.vx * speed;
        shard.y += shard.vy * speed;

        // Torus wrap bounds
        const halfW = (width * 1.5) / 2;
        const halfH = (height * 1.5) / 2;
        if (shard.x < -halfW) shard.x = halfW;
        if (shard.x > halfW) shard.x = -halfW;
        if (shard.y < -halfH) shard.y = halfH;
        if (shard.y > halfH) shard.y = -halfH;

        const projZ = fov + shard.z;
        if (projZ <= 10) continue;
        const scale = fov / projZ;
        const screenX = (shard.x + mouseOffX * (1 - shard.depth * 0.7)) * scale + centerX;
        const screenY = (shard.y + mouseOffY * (1 - shard.depth * 0.7)) * scale + centerY;

        // Proximity reaction to mouse
        const dx = mouse.x - screenX;
        const dy = mouse.y - screenY;
        const dist = Math.hypot(dx, dy);
        if (dist < 220) {
          const force = (1 - dist / 220) * mouseStrength;
          shard.tiltVelocity += force * 1.2;
          shard.specular = Math.min(shard.specular + force * 0.45, 1);
        } else {
          shard.specular = Math.max(0, shard.specular - dt * 2);
        }

        // Ripple reaction
        for (const rip of mouse.ripples) {
          const rDist = Math.abs(dist - rip.radius);
          if (rDist < 50) {
            shard.tiltVelocity += (1 - rDist / 50) * 1.8;
          }
        }

        // 3D Euler rotation matrix
        const cosX = Math.cos(shard.rx);
        const sinX = Math.sin(shard.rx);
        const cosY = Math.cos(shard.ry);
        const sinY = Math.sin(shard.ry);
        const cosZ = Math.cos(shard.rz);
        const sinZ = Math.sin(shard.rz);

        const nx = -sinY;
        const ny = sinX * cosY;
        const nz = cosX * cosY;

        const dotLight = Math.max(0, nx * lx + ny * ly + nz * lz);
        const spec = Math.pow(dotLight, 5) + shard.specular * 0.75;

        const pts = shard.shape;
        const currentScale = shard.size * scale;

        ctx.beginPath();
        for (let p = 0; p < pts.length; p++) {
          const [px, py] = pts[p];
          const x1 = px * cosY;
          const y1 = py * cosX - -px * sinY * sinX;
          const x2 = x1 * cosZ - y1 * sinZ;
          const y2 = x1 * sinZ + y1 * cosZ;

          const vx = screenX + x2 * currentScale;
          const vy = screenY + y2 * currentScale;

          if (p === 0) ctx.moveTo(vx, vy);
          else ctx.lineTo(vx, vy);
        }
        ctx.closePath();

        // High-visibility opacity (0.45 to 0.95)
        const baseAlpha = (1 - shard.depth * 0.45) * 0.9;
        const finalAlpha = Math.min(1, Math.max(0.35, baseAlpha + spec * 0.4));

        if (shard.isChrome) {
          // Chrome Mirror Crystal Facet
          const grad = ctx.createLinearGradient(
            screenX - 30,
            screenY - 30,
            screenX + 30,
            screenY + 30
          );
          grad.addColorStop(0, `rgba(255, 255, 255, ${finalAlpha})`);
          grad.addColorStop(0.45, `rgba(200, 225, 255, ${finalAlpha * 0.75})`);
          grad.addColorStop(1, `rgba(180, 200, 220, ${finalAlpha * 0.85})`);
          ctx.fillStyle = grad;
          ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(1, finalAlpha * 1.5)})`;
        } else if (shard.isAccent) {
          // Vivid Amber/Gold Glowing Shard
          const grad = ctx.createLinearGradient(
            screenX - 25,
            screenY - 25,
            screenX + 25,
            screenY + 25
          );
          grad.addColorStop(0, `rgba(255, 200, 70, ${finalAlpha})`);
          grad.addColorStop(0.6, `rgba(255, 138, 36, ${finalAlpha * 0.85})`);
          grad.addColorStop(1, `rgba(242, 106, 0, ${finalAlpha * 0.7})`);
          ctx.fillStyle = grad;
          ctx.strokeStyle = `rgba(255, 230, 150, ${Math.min(1, finalAlpha * 1.6)})`;
        } else {
          // Deep TechHub Brand Orange Crystal Shard
          const grad = ctx.createLinearGradient(
            screenX - 30,
            screenY - 30,
            screenX + 30,
            screenY + 30
          );
          grad.addColorStop(0, `rgba(255, 145, 40, ${finalAlpha * 0.95})`);
          grad.addColorStop(0.5, `rgba(242, 106, 0, ${finalAlpha * 0.85})`);
          grad.addColorStop(1, `rgba(200, 60, 0, ${finalAlpha * 0.65})`);
          ctx.fillStyle = grad;
          ctx.strokeStyle = `rgba(255, 180, 90, ${Math.min(1, finalAlpha * 1.4)})`;
        }

        ctx.lineWidth = Math.max(1.5, 2.8 * (1 - shard.depth * 0.45));
        ctx.shadowColor = shard.isChrome ? "#FFFFFF" : "#FF8A24";
        ctx.shadowBlur = spec > 0.4 ? 12 : 4;
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Radiant Sparkle Starlet on High Specular Glints
        if (spec > 0.55 && shard.depth < 0.7) {
          const starSize = (spec - 0.55) * 32 * scale;
          ctx.save();
          ctx.beginPath();
          ctx.arc(screenX, screenY, starSize * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, (spec - 0.55) * 2)})`;
          ctx.shadowColor = "#FFB040";
          ctx.shadowBlur = 16;
          ctx.fill();
          ctx.restore();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(container);

    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchstart", onPointerDown);
      canvas.remove();
    };
  }, [count, shardSize, speed, mouseStrength]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[480px] overflow-hidden ${className}`}
      style={style}
    />
  );
}
