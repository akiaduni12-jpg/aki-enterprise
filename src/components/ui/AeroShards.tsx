"use client";

import React, { useEffect, useRef } from "react";

interface AeroShardsProps {
  shardColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  count?: number;
  shardSize?: number;
  speed?: number;
  mouseInteraction?: boolean;
  mouseStrength?: number;
  glow?: number;
  depthOfField?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function AeroShards({
  shardColor = "#F26A00",
  accentColor = "#FF8A24",
  backgroundColor = "transparent",
  count = 180,
  shardSize = 1.3,
  speed = 0.8,
  mouseInteraction = true,
  mouseStrength = 0.7,
  glow = 0.8,
  depthOfField = 0.7,
  className = "",
  style = {},
}: AeroShardsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create a fresh dedicated canvas element
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.style.pointerEvents = "none";
    container.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let disposed = false;
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 550;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      width = Math.max(rect.width, 320);
      height = Math.max(rect.height, 400);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    resize();

    // Mouse coordinates & parallax
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      inside: false,
      ripples: [] as Array<{ x: number; y: number; radius: number; alpha: number }>,
    };

    // Diverse geometric 3D crystal shard shapes
    const shapes: Array<Array<[number, number]>> = [
      // Razor shard
      [[-0.6, -1.2], [0.8, 0.3], [-0.4, 1.1]],
      // Diamond crystal facet
      [[0, -1.3], [0.9, -0.1], [0.1, 1.3], [-0.8, 0.2]],
      // Gemstone fragment
      [[-0.2, -1.2], [0.65, -0.8], [0.75, 0.7], [-0.5, 1.1]],
      // Pentagonal shard
      [[-0.1, -1.1], [0.8, -0.4], [0.6, 0.9], [-0.65, 0.85], [-0.75, -0.3]],
      // Elongated needle shard
      [[-0.2, -1.5], [0.25, -1.4], [0.15, 1.5], [-0.3, 1.3]],
    ];

    const shardCount = Math.min(Math.max(count, 80), 300);
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
      const isChrome = Math.random() < 0.22;
      const isAccent = Math.random() < 0.38;

      shards.push({
        x: (Math.random() - 0.5) * (width * 1.4),
        y: (Math.random() - 0.5) * (height * 1.4),
        z: depthLevel * 700 - 150,
        depth: depthLevel,
        size: (Math.random() * 26 + 16) * (1 - depthLevel * 0.45) * shardSize,
        shape: baseShape,
        isChrome,
        isAccent,
        rx: Math.random() * Math.PI * 2,
        ry: Math.random() * Math.PI * 2,
        rz: Math.random() * Math.PI * 2,
        vrx: (Math.random() - 0.5) * 0.016,
        vry: (Math.random() - 0.5) * 0.022,
        vrz: (Math.random() - 0.5) * 0.014,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.28,
        tiltVelocity: 0,
        specular: 0,
      });
    }

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      mouse.targetX = mx;
      mouse.targetY = my;
      mouse.inside = mx >= -50 && mx <= rect.width + 50 && my >= -50 && my <= rect.height + 50;
    };

    const onPointerDown = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      if (mx >= 0 && mx <= rect.width && my >= 0 && my <= rect.height) {
        mouse.ripples.push({
          x: mx,
          y: my,
          radius: 15,
          alpha: 0.9,
        });
        if (mouse.ripples.length > 5) mouse.ripples.shift();
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });

    let lastTime = performance.now();

    const render = (time: number) => {
      if (disposed) return;
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Smooth camera interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.07;
      mouse.y += (mouse.targetY - mouse.y) * 0.07;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Ambient radial glow in center
      const ambientGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        50,
        width * 0.5,
        height * 0.5,
        width * 0.7
      );
      ambientGrad.addColorStop(0, "rgba(242, 106, 0, 0.12)");
      ambientGrad.addColorStop(0.5, "rgba(255, 138, 36, 0.05)");
      ambientGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = ambientGrad;
      ctx.fillRect(0, 0, width, height);

      const fov = 520;
      const centerX = width / 2;
      const centerY = height / 2;
      const mouseOffX = (mouse.x - centerX) * 0.09 * mouseStrength;
      const mouseOffY = (mouse.y - centerY) * 0.09 * mouseStrength;

      // Update shockwave ripples
      for (let r = mouse.ripples.length - 1; r >= 0; r--) {
        const rip = mouse.ripples[r];
        rip.radius += dt * 400;
        rip.alpha -= dt * 0.95;
        if (rip.alpha <= 0) {
          mouse.ripples.splice(r, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 138, 36, ${rip.alpha * 0.5})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // Sort shards by depth (painters algorithm)
      shards.sort((a, b) => b.z - a.z);

      // Light direction in camera space: [0.35, -0.6, 0.72]
      const lx = 0.35;
      const ly = -0.6;
      const lz = 0.72;

      for (let i = 0; i < shards.length; i++) {
        const shard = shards[i];

        // Rotation & drift update
        shard.rx += (shard.vrx + shard.tiltVelocity * 0.02) * speed;
        shard.ry += (shard.vry + shard.tiltVelocity * 0.025) * speed;
        shard.rz += shard.vrz * speed;
        shard.tiltVelocity *= 0.93;

        shard.x += shard.vx * speed;
        shard.y += shard.vy * speed;

        // Wrap around bounds
        const halfW = (width * 1.4) / 2;
        const halfH = (height * 1.4) / 2;
        if (shard.x < -halfW) shard.x = halfW;
        if (shard.x > halfW) shard.x = -halfW;
        if (shard.y < -halfH) shard.y = halfH;
        if (shard.y > halfH) shard.y = -halfH;

        const projZ = fov + shard.z;
        if (projZ <= 10) continue;
        const scale = fov / projZ;
        const screenX = (shard.x + mouseOffX * (1 - shard.depth * 0.75)) * scale + centerX;
        const screenY = (shard.y + mouseOffY * (1 - shard.depth * 0.75)) * scale + centerY;

        // Pointer proximity deflection
        const dx = mouse.x - screenX;
        const dy = mouse.y - screenY;
        const dist = Math.hypot(dx, dy);
        if (dist < 200 && mouse.inside) {
          const force = (1 - dist / 200) * mouseStrength;
          shard.tiltVelocity += force * 0.9;
          shard.specular = Math.min(shard.specular + force * 0.35, 1);
        } else {
          shard.specular = Math.max(0, shard.specular - dt * 2.5);
        }

        // Ripple push
        for (const rip of mouse.ripples) {
          const rDist = Math.abs(dist - rip.radius);
          if (rDist < 45) {
            shard.tiltVelocity += (1 - rDist / 45) * 1.5;
          }
        }

        // 3D Matrix Euler angles
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
        const spec = Math.pow(dotLight, 6) + shard.specular * 0.7;

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

        const baseAlpha = (1 - shard.depth * 0.55) * 0.85;
        const finalAlpha = Math.min(1, Math.max(0.18, baseAlpha + spec * 0.4));

        if (shard.isChrome) {
          const grad = ctx.createLinearGradient(screenX - 22, screenY - 22, screenX + 22, screenY + 22);
          grad.addColorStop(0, `rgba(255, 255, 255, ${finalAlpha * 0.95})`);
          grad.addColorStop(0.5, `rgba(190, 215, 240, ${finalAlpha * 0.55})`);
          grad.addColorStop(1, `rgba(255, 255, 255, ${finalAlpha})`);
          ctx.fillStyle = grad;
          ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(1, finalAlpha * 1.4)})`;
        } else if (shard.isAccent) {
          const grad = ctx.createLinearGradient(screenX - 18, screenY - 18, screenX + 18, screenY + 18);
          grad.addColorStop(0, `rgba(255, 185, 60, ${finalAlpha * 0.9})`);
          grad.addColorStop(1, `rgba(242, 106, 0, ${finalAlpha * 0.55})`);
          ctx.fillStyle = grad;
          ctx.strokeStyle = `rgba(255, 220, 130, ${Math.min(1, finalAlpha * 1.45)})`;
        } else {
          const grad = ctx.createLinearGradient(screenX - 24, screenY - 24, screenX + 24, screenY + 24);
          grad.addColorStop(0, `rgba(242, 106, 0, ${finalAlpha * 0.85})`);
          grad.addColorStop(0.7, `rgba(255, 138, 36, ${finalAlpha * 0.6})`);
          grad.addColorStop(1, `rgba(255, 80, 0, ${finalAlpha * 0.4})`);
          ctx.fillStyle = grad;
          ctx.strokeStyle = `rgba(255, 190, 100, ${Math.min(1, finalAlpha * 1.3)})`;
        }

        ctx.lineWidth = Math.max(1, 1.8 * (1 - shard.depth * 0.45));
        ctx.fill();
        ctx.stroke();

        // High specular gleam starlet
        if (spec > 0.65 && shard.depth < 0.65) {
          const starSize = (spec - 0.65) * 26 * scale;
          ctx.save();
          ctx.beginPath();
          ctx.arc(screenX, screenY, starSize * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, (spec - 0.65) * 1.8)})`;
          ctx.shadowColor = "#FF8A24";
          ctx.shadowBlur = 12;
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
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      canvas.remove();
    };
  }, [count, shardSize, speed, mouseStrength]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[500px] overflow-hidden ${className}`}
      style={style}
    />
  );
}
