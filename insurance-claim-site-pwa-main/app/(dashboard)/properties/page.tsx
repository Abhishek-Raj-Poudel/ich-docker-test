"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Home, 
  MapPin, 
  Check, 
  X, 
  Plus, 
  ChevronRight,
  Settings,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { PropertyForm } from "@/components/property/property-form";
import { Property, getMyProperties } from "@/lib/property";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as [number, number, number, number] }
  }
};

export default function PropertiesListPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProperties = async () => {
    setIsLoading(true);
    const result = await getMyProperties();
    if (result.success && result.data) {
      setProperties(result.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchProperties();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  const handleAddSuccess = (newProperty: Property) => {
    setProperties([...properties, newProperty]);
    setShowAddForm(false);
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-12 pb-24 px-4 md:px-0"
    >
      {/* Header section */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
           <Link 
            href="/profile"
            className="group flex items-center text-xs font-bold text-neutral-400 hover:text-primary transition-all uppercase tracking-[0.2em]"
          >
            <ArrowLeft className="mr-2 size-4 transition-transform group-hover:-translate-x-1" /> Back to Profile
          </Link>
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-neutral-900 font-serif">
              Properties
            </h1>
            <p className="text-lg font-normal text-neutral-500 max-w-xl">
              Manage your registered assets and insurance coverages.
            </p>
          </div>
        </div>
        {!showAddForm && (
          <Button
            onClick={() => setShowAddForm(true)}
            size="lg"
            className="h-12 rounded-full px-10 font-bold uppercase text-xs tracking-widest gap-3 w-full md:w-auto bg-primary text-primary-foreground hover:brightness-110 transition-all hover:scale-[1.02]"
          >
            <Plus className="size-5" />
            Add Property
          </Button>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {showAddForm ? (
          <motion.div
            key="add-form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-white border border-neutral-100 rounded-3xl p-8 md:p-10 space-y-8"
          >
             <div className="flex items-center justify-between border-b border-neutral-100 pb-8">
               <h2 className="text-2xl font-medium text-neutral-900">Add New Property</h2>
                <Button variant="ghost" onClick={() => setShowAddForm(false)} className="h-10 px-6 rounded-full text-neutral-500 font-bold uppercase text-[10px] tracking-widest hover:bg-neutral-50">
                 <X className="mr-2 size-4" /> Cancel
               </Button>
             </div>
             <PropertyForm onSuccess={handleAddSuccess} onCancel={() => setShowAddForm(false)} />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            variants={container}
            className="grid gap-6"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="size-10 animate-spin text-primary" />
              </div>
            ) : properties.length === 0 ? (
              <motion.div
                variants={item}
                className="p-14 border-2 border-dashed border-neutral-100 rounded-3xl flex flex-col items-center justify-center gap-6 text-center group cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all duration-500 bg-white"
                onClick={() => setShowAddForm(true)}
              >
                <div className="size-20 bg-white rounded-xl flex items-center justify-center text-neutral-300 border border-neutral-100 group-hover:text-primary group-hover:scale-110 group-hover:border-primary/20 transition-all duration-500">
                  <Plus className="size-10" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-bold text-neutral-900 group-hover:text-primary transition-colors">Add your first property</p>
                  <p className="text-base text-neutral-500 max-w-sm mx-auto">Fast residential and commercial validation for your insurance portfolio</p>
                </div>
              </motion.div>
            ) : (
              <>
                {properties.map((p) => (
                  <motion.div
                    key={p.id}
                    variants={item}
                    className="bg-white border border-neutral-100 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-primary/30 hover:bg-neutral-50/30 group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="size-20 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-400 border border-neutral-100 group-hover:bg-primary group-hover:text-white transition-all duration-500 ease-out shrink-0">
                        <Home className="size-10" />
                      </div>
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-neutral-900">{p.address_line}</span>
                          {p.ownership_verified ? (
                            <div className="flex items-center gap-1.5 text-teal-600 px-3 py-1 bg-teal-50 rounded-lg border border-teal-100 uppercase tracking-widest text-[8px] font-bold">
                              <Check className="size-3" /> Verified
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-orange-600 px-3 py-1 bg-orange-50 rounded-lg border border-orange-100 uppercase tracking-widest text-[8px] font-bold">
                              Pending Review
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] mt-2">
                          <p className="flex items-center gap-1.5">
                            <MapPin className="size-3.5 text-neutral-400" />
                            {p.postcode || "Postcode pending"}
                          </p>
                          <span className="size-1 bg-neutral-300 rounded-full" />
                          <p className="capitalize">{p.property_type}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-neutral-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl border border-neutral-100 hover:bg-neutral-50 text-neutral-400 hover:text-neutral-900 size-12 hidden sm:flex"
                      >
                        <Settings className="size-5" />
                      </Button>
                      <Link href={`/properties/${p.id}`} className="w-full sm:w-auto">
                        <Button
                          variant="outline"
                          className="h-12 px-8 text-xs font-bold uppercase tracking-widest rounded-full border-neutral-100 bg-white text-neutral-900 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 flex items-center gap-3 w-full sm:w-auto group/btn"
                        >
                          Coverage Details
                          <ChevronRight className="size-4 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}

                <motion.div
                  variants={item}
                  className="p-14 border-2 border-dashed border-neutral-100 rounded-3xl flex flex-col items-center justify-center gap-6 text-center group cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all duration-500 bg-white"
                  onClick={() => setShowAddForm(true)}
                >
                  <div className="size-20 bg-white rounded-xl flex items-center justify-center text-neutral-300 border border-neutral-100 group-hover:text-primary group-hover:scale-110 group-hover:border-primary/20 transition-all duration-500">
                    <Plus className="size-10" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-neutral-900 group-hover:text-primary transition-colors">Add another property</p>
                    <p className="text-base text-neutral-500 max-w-sm mx-auto">Fast residential and commercial validation for your insurance portfolio</p>
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
