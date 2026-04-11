"use client";

import React from "react";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Left side: Hero Image (Hidden on mobile) */}
      <div className="hidden lg:block relative bg-neutral-100 overflow-hidden">
        <Image
          src="/hero.png"
          alt="AI Damage Scan"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
        <div className="absolute bottom-12 left-12 right-12 text-white z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="size-10 bg-white rounded-xl flex items-center justify-center text-primary font-bold text-xl">
              I
            </div>
            <span className="font-bold text-2xl tracking-tight">
              ClaimHelp<span className="text-white/80">UK</span>
            </span>
          </div>
          <h2 className="text-4xl font-medium leading-tight">
            The future of UK property <br />
            insurance claims.
          </h2>
          <p className="mt-4 text-lg font-normal text-white/80 max-w-md">
            Built for homeowners and modern property professionals to capture
            damage with precision.
          </p>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/60 to-transparent" />
      </div>

      {/* Right side: Interaction area */}
      <div className="flex flex-col items-center justify-center p-6 md:p-12 lg:p-16">
        <div className="w-full max-w-[400px] space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </div>
      </div>
    </div>
  );
}
