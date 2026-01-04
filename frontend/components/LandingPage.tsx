"use client";

import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Float, Stars } from "@react-three/drei";
import * as random from "maath/random/dist/maath-random.cjs";
import { motion } from "framer-motion";

function HelixDNA(props: any) {
  const pointsRef = useRef<any>();
  
  // Create a helix pattern
  const count = 3000; // Number of particles
  const radius = 2;   // Radius of the helix
  const turns = 5;    // Number of complete turns
  const length = 10;  // Length of the helix
  
  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = (i / count) * turns * Math.PI * 2;
      const x = Math.cos(t) * radius;
      const z = Math.sin(t) * radius;
      const y = (i / count) * length - length / 2;
      
      // Add some random noise/scatter
      pos[i * 3] = x + (Math.random() - 0.5) * 0.2;
      pos[i * 3 + 1] = y + (Math.random() - 0.5) * 0.2;
      pos[i * 3 + 2] = z + (Math.random() - 0.5) * 0.2;
    }
    return pos;
  });

  const [positions2] = useState(() => {
    // Second strand offset by PI
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = (i / count) * turns * Math.PI * 2 + Math.PI;
      const x = Math.cos(t) * radius;
      const z = Math.sin(t) * radius;
      const y = (i / count) * length - length / 2;
      
      pos[i * 3] = x + (Math.random() - 0.5) * 0.2;
      pos[i * 3 + 1] = y + (Math.random() - 0.5) * 0.2;
      pos[i * 3 + 2] = z + (Math.random() - 0.5) * 0.2;
    }
    return pos;
  });

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.2;
      // Gently float up and down
      pointsRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
    }
  });

  return (
    <group ref={pointsRef} rotation={[0, 0, Math.PI / 6]}>
      {/* Strand 1 - Indigo/Blue */}
      <Points positions={positions} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#6366f1" // Indigo
          size={0.03}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.8}
        />
      </Points>
      
      {/* Strand 2 - Violet/Purple */}
      <Points positions={positions2} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#8b5cf6" // Violet
          size={0.03}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.8}
        />
      </Points>
    </group>
  );
}

function ParticleField() {
  const ref = useRef<any>();
  const [sphere] = useState(() =>
    // Change 2000 to 2001 (or 3000, 1500, etc.)
    random.inSphere(new Float32Array(2001), { radius: 10 })
  );

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 20;
      ref.current.rotation.y -= delta / 25;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.01}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.3}
        />
      </Points>
    </group>
  );
}

export default function LandingPage({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] w-full h-screen bg-black overflow-hidden flex flex-col items-center justify-center">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <HelixDNA />
          <ParticleField />
          <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        </Canvas>
      </div>

      {/* Content Overlay */}
      <div className="z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center gap-8 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative"
        >
          {/* Glowing backdrop for text */}
          <div className="absolute -inset-8 bg-indigo-500/10 rounded-[50%] blur-3xl opacity-50 animate-pulse"></div>
          
          <h1 className="relative text-7xl md:text-9xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-200 to-slate-600 tracking-tighter drop-shadow-2xl">
            PHRELIS
          </h1>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="h-[1px] w-12 bg-indigo-500/50"></div>
            <span className="text-indigo-400 font-mono tracking-[0.5em] text-sm uppercase">Advanced Medical Intelligence</span>
            <div className="h-[1px] w-12 bg-indigo-500/50"></div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="text-lg md:text-xl text-slate-400 font-light tracking-wide max-w-xl leading-relaxed"
        >
          Experience the future of hospital resource optimization and predictive analytics.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="pointer-events-auto"
        >
          <button
            onClick={onEnter}
            className="group relative px-10 py-5 bg-black overflow-hidden rounded-full transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] border border-white/10 hover:border-indigo-500/50"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Animated border gradient */}
            <div className="absolute inset-0 rounded-full border border-white/5 group-hover:border-transparent transition-colors duration-300" />
            
            <span className="relative flex items-center gap-3 text-lg font-bold text-white tracking-widest uppercase">
              Initialize System
              <svg
                className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
          </button>
        </motion.div>
      </div>
      
      {/* Footer / Status */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-10 flex items-center gap-6 text-[10px] text-slate-600 tracking-[0.2em] uppercase font-bold"
      >
        <span>Secure Connection Established</span>
        <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></span>
        <span>v3.0.1 Stable</span>
      </motion.div>
    </div>
  );
}
