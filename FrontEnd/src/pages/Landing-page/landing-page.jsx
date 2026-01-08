import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scene } from "@/components/hero-section.jsx";
import { ShinyButton } from "@/components/shiny-button";
import { Component } from "@/components/glow-button";
import {
  Activity,
  ShieldCheck,
  CalendarCheck,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";

const features = [
  {
    icon: FileText,
    title: "Smart Referrals",
    description:
      "Streamlined submission for managers and self-referring users.",
  },
  {
    icon: ShieldCheck,
    title: "GDPR Compliant",
    description: "ISO 27001 certified security for sensitive patient records.",
  },
  {
    icon: CalendarCheck,
    title: "Dynamic Diary",
    description: "Real-time appointment scheduling with conflict detection.",
  },
  {
    icon: Activity,
    title: "Health Analytics",
    description: "Live dashboards for SLAs, KPIs, and health outcomes.",
  },
];

export const Landing = () => {
  return (
    // FIX: Updated background to use 'bg-linear-to-br' (Tailwind v4 syntax)
    <div className="min-h-svh w-screen bg-linear-to-br from-slate-950 via-[#0a0a0a] to-black text-white flex flex-col items-center justify-center p-8 overflow-hidden relative">
      <div className="w-full max-w-7xl space-y-16 relative z-10 mt-10">
        {/* Hero Header */}
        <div className="flex flex-col items-center text-center space-y-10">
          <Badge
            variant="secondary"
            className="backdrop-blur-md bg-cyan-950/30 border border-cyan-400/30 text-cyan-300 px-6 py-2 rounded-full text-base shadow-[0_0_15px_rgba(34,211,238,0.2)]"
          >
            ✨ Occupational Health Evolved
          </Badge>

          <div className="space-y-8 flex items-center justify-center flex-col">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight max-w-5xl leading-tight">
              <span className="bg-clip-text text-transparent bg-linear-to-r from-white via-slate-200 to-slate-400 mb-3 drop-shadow-2xl">
                The complete platform for
              </span>
              <br />
              {/* FIX: Updated text gradient to 'bg-linear-to-r' */}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-cyan-400 to-blue-500 drop-shadow-2xl mt-3">
                Health Matters
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl leading-relaxed font-light">
              Empowering practitioners, managers, and admins with a unified
              solution for referrals, clinical records, and outcome reporting.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 items-center pt-4">
              {/* 1. VISIBLE WHEN LOGGED OUT: Standard "Get Started" Button */}
              <SignedOut>
                <Link to="/sign-in">
                  <Button className="h-14 px-10 text-lg rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 shadow-[0_0_40px_rgba(6,182,212,0.4)] hover:bg-cyan-400 hover:scale-105 transition-all duration-300">
                    Get Started <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="h-14 px-10 text-lg rounded-2xl bg-white/5 text-white border-white/20 hover:bg-white/10 hover:border-white/40 transition-all backdrop-blur-sm"
                >
                  View User Stories
                </Button>
              </SignedOut>

              {/* 2. VISIBLE WHEN LOGGED IN: Bigger "Go to Dashboard" Button */}
              <SignedIn>
                {/* Increased height to h-16 and text to text-xl for emphasis */}
                <Link to="/admin/dashboard">
                  <ShinyButton>Dashboard</ShinyButton>
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto pt-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              // FIX: Used backticks for long string & ensuring class names are safe
              className={`group backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-2xl p-8 flex flex-col justify-between items-start space-y-4 hover:bg-white/[0.07] hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-300`}
            >
              <div className="p-3 rounded-xl bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
                <feature.icon
                  size={32}
                  className="text-cyan-400 group-hover:text-cyan-300 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white group-hover:text-cyan-200 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-base text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Background 3D Scene */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-60 mix-blend-screen">
        <Scene />
      </div>

      {/* Decorative gradient overlay */}
      {/* FIX: Updated to 'bg-linear-to-b' */}
      <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-cyan-500/5 via-transparent to-transparent pointer-events-none z-0" />
    </div>
  );
};
