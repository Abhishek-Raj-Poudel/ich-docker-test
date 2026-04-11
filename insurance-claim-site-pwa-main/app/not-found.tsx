"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-8 max-w-md"
      >
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center size-24 rounded-full bg-primary/5 border border-primary/10">
            <span className="text-5xl font-normal text-primary">404</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-normal tracking-tight text-neutral-900">
            Page Not Found
          </h1>
          
          <p className="text-base text-neutral-500 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back on track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            className="w-full sm:w-auto h-12 rounded-md text-base font-medium gap-2"
          >
            <Link href="/">
              <Home className="size-5" />
              Go Home
            </Link>
          </Button>
          
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto h-12 rounded-md border border-neutral-200 text-base font-medium gap-2 bg-white hover:bg-neutral-50"
          >
            <Link href="/dashboard">
              <ArrowLeft className="size-5" />
              Dashboard
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}