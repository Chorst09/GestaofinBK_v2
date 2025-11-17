"use client";

import * as React from 'react';
import { Plane, Palmtree, Sun, Waves } from 'lucide-react';

export function TravelHero() {
  return (
    <div className="relative overflow-hidden rounded-2xl mb-8">
      {/* Fundo gradiente de praia */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-blue-400 to-cyan-500">
        {/* Ondas animadas */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-32 animate-wave" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path 
              fill="rgba(255, 255, 255, 0.1)" 
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
          <svg className="w-full h-32 absolute bottom-0 animate-wave-slow" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path 
              fill="rgba(255, 255, 255, 0.15)" 
              d="M0,160L48,144C96,128,192,96,288,96C384,96,480,128,576,144C672,160,768,160,864,144C960,128,1056,96,1152,96C1248,96,1344,128,1392,144L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
        </div>
        
        {/* Sol animado */}
        <div className="absolute top-8 right-12 animate-pulse">
          <Sun className="h-16 w-16 text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.5)]" />
        </div>
        
        {/* Nuvens flutuantes */}
        <div className="absolute top-12 left-20 animate-float">
          <div className="w-24 h-8 bg-white/30 rounded-full blur-sm" />
        </div>
        <div className="absolute top-24 right-32 animate-float-delayed">
          <div className="w-32 h-10 bg-white/25 rounded-full blur-sm" />
        </div>
        
        {/* Avião voando */}
        <div className="absolute top-20 left-0 animate-fly">
          <Plane className="h-8 w-8 text-white/80 rotate-45" />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 px-8 py-16 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Palmtree className="h-12 w-12 animate-bounce" />
            <h1 className="text-5xl font-headline font-bold drop-shadow-lg">
              Planejamento de Viagens
            </h1>
            <Waves className="h-12 w-12 animate-bounce animation-delay-200" />
          </div>
          
          <p className="text-xl text-white/90 drop-shadow-md max-w-2xl mx-auto">
            Organize suas férias dos sonhos, planeje rotas incríveis e controle seus gastos em um só lugar
          </p>
          
          <div className="mt-8 flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full animate-ping" />
              <span className="drop-shadow">Rotas com GPS</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full animate-ping animation-delay-300" />
              <span className="drop-shadow">Controle de Orçamento</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full animate-ping animation-delay-500" />
              <span className="drop-shadow">Múltiplas Viagens</span>
            </div>
          </div>
        </div>
      </div>

      {/* Areia na parte inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-amber-100 to-transparent" />
    </div>
  );
}
