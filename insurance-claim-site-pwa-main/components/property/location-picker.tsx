"use client";

import React from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  LocateFixed,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocationPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

const DEFAULT_LAT = 51.5074;
const DEFAULT_LNG = -0.1278;
const SMALL_STEP = 0.001;
const LARGE_STEP = 0.01;

function clampLatitude(value: number) {
  return Math.max(-90, Math.min(90, value));
}

function clampLongitude(value: number) {
  return Math.max(-180, Math.min(180, value));
}

export default function LocationPicker({
  lat,
  lng,
  onChange,
}: LocationPickerProps) {
  const currentLat = lat || DEFAULT_LAT;
  const currentLng = lng || DEFAULT_LNG;
  const hasCoordinates = Boolean(lat && lng);

  const updatePosition = (nextLat: number, nextLng: number) => {
    onChange(clampLatitude(nextLat), clampLongitude(nextLng));
  };

  const openStreetMapUrl = `https://www.openstreetmap.org/?mlat=${currentLat}&mlon=${currentLng}#map=16/${currentLat}/${currentLng}`;
  const googleMapsUrl = `https://www.google.com/maps?q=${currentLat},${currentLng}`;

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-primary">
              <MapPin className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-neutral-900">
                Location controls
              </p>
              <p className="text-sm leading-relaxed text-neutral-500">
                Leaflet map preview is disabled for now. Use GPS, address lookup,
                or nudge the saved coordinates here.
              </p>
            </div>
          </div>

          {!hasCoordinates && (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-700">
              Defaulting to London
            </span>
          )}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                  Coordinates
                </p>
                <p className="mt-1 text-base font-medium text-neutral-900">
                  {currentLat.toFixed(6)}, {currentLng.toFixed(6)}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => updatePosition(DEFAULT_LAT, DEFAULT_LNG)}
                className="h-10 rounded-full border-neutral-200 px-4 text-[10px] font-bold uppercase tracking-widest"
              >
                <LocateFixed className="mr-2 size-4" />
                Reset
              </Button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <a
                href={openStreetMapUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-11 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 px-4 text-[10px] font-bold uppercase tracking-widest text-neutral-700 transition-colors hover:border-primary/30 hover:text-primary"
              >
                OpenStreetMap
              </a>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-11 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 px-4 text-[10px] font-bold uppercase tracking-widest text-neutral-700 transition-colors hover:border-primary/30 hover:text-primary"
              >
                Google Maps
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
              Fine Tune Position
            </p>

            <div className="mt-4 grid place-items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => updatePosition(currentLat + LARGE_STEP, currentLng)}
                className="h-11 w-11 rounded-full border-neutral-200 p-0"
              >
                <ArrowUp className="size-4" />
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => updatePosition(currentLat, currentLng - LARGE_STEP)}
                  className="h-11 w-11 rounded-full border-neutral-200 p-0"
                >
                  <ArrowLeft className="size-4" />
                </Button>
                <div className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  0.01 deg
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => updatePosition(currentLat, currentLng + LARGE_STEP)}
                  className="h-11 w-11 rounded-full border-neutral-200 p-0"
                >
                  <ArrowRight className="size-4" />
                </Button>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => updatePosition(currentLat - LARGE_STEP, currentLng)}
                className="h-11 w-11 rounded-full border-neutral-200 p-0"
              >
                <ArrowDown className="size-4" />
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => updatePosition(currentLat + SMALL_STEP, currentLng)}
                className="h-10 rounded-full border-neutral-200 px-0 text-[10px] font-bold"
              >
                N
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => updatePosition(currentLat - SMALL_STEP, currentLng)}
                className="h-10 rounded-full border-neutral-200 px-0 text-[10px] font-bold"
              >
                S
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => updatePosition(currentLat, currentLng - SMALL_STEP)}
                className="h-10 rounded-full border-neutral-200 px-0 text-[10px] font-bold"
              >
                W
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => updatePosition(currentLat, currentLng + SMALL_STEP)}
                className="h-10 rounded-full border-neutral-200 px-0 text-[10px] font-bold"
              >
                E
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-neutral-50 text-neutral-500">
            <MapPin className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
              Saved Coordinates
            </p>
            <p className="text-sm font-medium text-neutral-900">
              {currentLat.toFixed(6)}, {currentLng.toFixed(6)}
            </p>
          </div>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
          GPS or address lookup recommended
        </p>
      </div>
    </div>
  );
}
