"use client";

import React, { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Check, Crosshair, Globe, Home, Loader2, MapPinned, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { createProperty, updateProperty, type CreatePropertyData, type Property } from "@/lib/property";
import { isDevModeEnabled } from "@/lib/dev-mode";

interface PropertyFormProps {
  initialData?: Property;
  onSuccess?: (property: Property) => void;
  onCancel?: () => void;
}

const LocationPicker = dynamic(() => import("./location-picker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] w-full items-center justify-center rounded-3xl border border-neutral-100 bg-neutral-50">
      <div className="flex flex-col items-center gap-3 text-neutral-400">
        <Loader2 className="size-6 animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-widest">Initializing Map...</p>
      </div>
    </div>
  ),
});

export function PropertyForm({ onSuccess, onCancel, initialData }: PropertyFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreatePropertyData>({
    address_line: initialData?.address_line || "",
    postcode: initialData?.postcode || "",
    property_type: (initialData?.property_type || "owned") as "owned" | "rented",
    latitude: initialData?.latitude || 0,
    longitude: initialData?.longitude || 0,
  });

  const propertyTypes = [
    { id: "owned", label: "Owner-Occupied" },
    { id: "rented", label: "Rented" },
  ] as const;

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    if (isDevModeEnabled()) {
      setFormData((prev) => ({
        ...prev,
        address_line: prev.address_line || "Dev Mode Address, London",
        postcode: prev.postcode || "SW1A 1AA",
      }));
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      );
      const data = await res.json();
      if (data?.address) {
        const fullAddress = [
          data.address.house_number,
          data.address.road,
          data.address.city || data.address.town || data.address.village,
        ]
          .filter(Boolean)
          .join(", ");

        setFormData((prev) => ({
          ...prev,
          address_line: fullAddress || prev.address_line,
          postcode: data.address.postcode || prev.postcode,
        }));
      }
    } catch (err) {
      console.error("Reverse geocoding failed", err);
    }
  }, []);

  const detectMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
        void reverseGeocode(lat, lng);
        toast.success("Location pinpointed accurately.");
        setIsLocating(false);
      },
      () => {
        toast.error("Could not capture your current coordinates.");
        setIsLocating(false);
      },
    );
  };

  const findLatLongFromAddress = async () => {
    if (isDevModeEnabled()) {
      setFormData((prev) => ({
        ...prev,
        latitude: prev.latitude || 51.5074,
        longitude: prev.longitude || -0.1278,
      }));
      toast.success("Using seeded coordinates from dev mode");
      return;
    }

    if (!formData.address_line.trim()) {
      toast.error("Please enter an address first");
      return;
    }

    setIsLocating(true);
    try {
      const encodedAddress = encodeURIComponent(
        `${formData.address_line} ${formData.postcode}`.trim(),
      );
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
      );
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        }));
        toast.success("Location found for address");
      } else {
        toast.error("Could not find location for the address");
      }
    } catch {
      toast.error("Error connecting to geodata service.");
    } finally {
      setIsLocating(false);
    }
  };

  const handleMapChange = useCallback(
    (lat: number, lng: number) => {
      setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
      void reverseGeocode(lat, lng);
    },
    [reverseGeocode],
  );

  useEffect(() => {
    if (initialData?.latitude && initialData?.longitude && formData.latitude === 0) {
      setFormData((prev) => ({
        ...prev,
        latitude: initialData.latitude || 0,
        longitude: initialData.longitude || 0,
      }));
    }
  }, [formData.latitude, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.address_line.trim()) {
      setError("Address is required.");
      return;
    }
    if (!formData.postcode.trim()) {
      setError("Postcode is required.");
      return;
    }
    if (!formData.latitude || !formData.longitude) {
      setError("Pick the property location on the map or enter latitude and longitude manually.");
      return;
    }

    setIsLoading(true);

    try {
      const result = initialData
        ? await updateProperty(initialData.id, formData)
        : await createProperty(formData);

      if (result.success && result.property) {
        onSuccess?.(result.property);
      } else {
        setError(result.message || `Failed to ${initialData ? "update" : "add"} property.`);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {error ? (
        <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4">
          <X className="mt-0.5 size-5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : null}

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
            Full Address
          </Label>
          <div className="relative group">
            <Home className="absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="e.g. 22 Baker Street, London"
              value={formData.address_line}
              onChange={(e) => setFormData((prev) => ({ ...prev, address_line: e.target.value }))}
              className="h-14 rounded-md border-neutral-200 bg-neutral-50/50 pl-12 shadow-none transition-all focus-visible:border-primary focus-visible:bg-white"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
            Postcode
          </Label>
          <div className="relative group">
            <MapPinned className="absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="e.g. SW1A 1AA"
              value={formData.postcode}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, postcode: e.target.value.toUpperCase() }))
              }
              className="h-14 rounded-md border-neutral-200 bg-neutral-50/50 pl-12 shadow-none transition-all focus-visible:border-primary focus-visible:bg-white"
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
            Property Type
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {propertyTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, property_type: type.id }))
                }
                className={cn(
                  "rounded-2xl border px-4 py-4 text-left transition-all",
                  formData.property_type === type.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary/15"
                    : "border-neutral-200 bg-white hover:border-primary/30",
                )}
              >
                <p className="text-sm font-semibold text-neutral-900">{type.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 border-t border-neutral-50 pt-4">
          <div className="flex items-center justify-between">
            <Label className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
              Location
            </Label>
            <Button
              type="button"
              variant="ghost"
              onClick={detectMyLocation}
              disabled={isLocating}
              className="h-8 rounded-md px-3 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5"
            >
              <Crosshair className={cn("mr-2 size-3.5", isLocating && "animate-spin")} />
              Use Current GPS
            </Button>
          </div>

          {isDevModeEnabled() ? (
            <div className="flex h-[320px] w-full flex-col items-center justify-center gap-3 rounded-3xl border border-neutral-100 bg-neutral-50 px-6 text-center">
              <MapPinned className="size-8 text-neutral-400" />
              <p className="text-sm font-medium text-neutral-900">Map interactions are stubbed in dev mode.</p>
              <p className="text-xs text-neutral-500">Coordinates entered below still save into the local dataset.</p>
            </div>
          ) : (
            <LocationPicker
              lat={formData.latitude}
              lng={formData.longitude}
              onChange={handleMapChange}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="relative group">
                <Globe className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-300 transition-colors group-focus-within:text-primary" />
                <Input
                  type="number"
                  step="any"
                  value={formData.latitude === 0 ? "" : formData.latitude}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      latitude: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="h-12 rounded-md border-neutral-200 bg-neutral-50/50 pl-12 font-mono text-xs shadow-none transition-all focus-visible:border-primary focus-visible:bg-white"
                  placeholder="Latitude"
                />
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-bold uppercase tracking-widest text-neutral-300">
                  LAT
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="relative group">
                <Globe className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-300 transition-colors group-focus-within:text-primary" />
                <Input
                  type="number"
                  step="any"
                  value={formData.longitude === 0 ? "" : formData.longitude}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      longitude: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="h-12 rounded-md border-neutral-200 bg-neutral-50/50 pl-12 font-mono text-xs shadow-none transition-all focus-visible:border-primary focus-visible:bg-white"
                  placeholder="Longitude"
                />
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-bold uppercase tracking-widest text-neutral-300">
                  LNG
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={findLatLongFromAddress}
              disabled={isLocating}
              className="h-11 rounded-full border-neutral-200 text-[10px] font-bold uppercase tracking-widest"
            >
              <Globe className={cn("mr-2 size-4", isLocating && "animate-spin")} />
              Find from Address
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="h-14 rounded-md border-neutral-200 text-[10px] font-bold uppercase tracking-widest text-neutral-500"
          >
            <X className="mr-2 size-4" />
            Cancel
          </Button>
        ) : null}
        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "h-14 rounded-md bg-primary text-[10px] font-bold uppercase tracking-widest text-white shadow-none",
            !onCancel && "col-span-2",
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              {initialData ? "Saving..." : "Adding..."}
            </>
          ) : (
            <>
              {initialData ? <Check className="mr-2 size-4" /> : <Plus className="mr-2 size-4" />}
              {initialData ? "Save Changes" : "Add Property"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
