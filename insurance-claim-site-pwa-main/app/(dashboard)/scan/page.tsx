"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ImagePlus,
  Home,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Waves,
  Flame,
  Zap,
  Wind,
  CloudRain,
  AlertCircle,
  CheckCircle2,
  Plus,
  ArrowRight,
  Sparkles,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PropertyForm } from "@/components/property/property-form";
import { Property, getMyProperties } from "@/lib/property";
import { addRoom, Room } from "@/lib/room";
import { analyzeRoomImage } from "@/lib/room-analysis";
import { syncJobFromRoom, SyncedJobDetail } from "@/lib/job";
import { useScanFlowStore } from "@/lib/scan-flow-store";
import { isDevModeEnabled } from "@/lib/dev-mode";

const weekdayLabels = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function getMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getDisplayDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function getCalendarDays(viewDate: Date) {
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const monthStartsOn = (firstDayOfMonth.getDay() + 6) % 7;
  const calendarStart = new Date(firstDayOfMonth);
  calendarStart.setDate(firstDayOfMonth.getDate() - monthStartsOn);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);
    return date;
  });
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown error";
}

function IncidentDatePicker({
  value,
  onChange,
}: {
  value: Date | null;
  onChange: (date: Date) => void;
}) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => value ?? new Date());

  useEffect(() => {
    if (value) {
      setViewDate(value);
    }
  }, [value]);

  const days = getCalendarDays(viewDate);
  const today = new Date();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-14 w-full justify-between rounded-xl border-2 border-neutral-300 bg-white px-4 text-left text-base font-medium text-neutral-900 shadow-none hover:border-neutral-400 hover:bg-white focus-visible:border-primary"
        >
          <span className="flex items-center gap-3">
            <Calendar className="size-5 text-neutral-400" />
            <span className={cn(value ? "text-neutral-900" : "text-neutral-500")}>
              {value ? getDisplayDate(value) : "Select incident date"}
            </span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-85 p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold tracking-tight text-neutral-900">
              {getMonthLabel(viewDate)}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="rounded-full border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                onClick={() =>
                  setViewDate(
                    new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1),
                  )
                }
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="rounded-full border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                onClick={() =>
                  setViewDate(
                    new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1),
                  )
                }
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {weekdayLabels.map((label) => (
              <div
                key={label}
                className="flex h-8 items-center justify-center text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400"
              >
                {label}
              </div>
            ))}
            {days.map((date) => {
              const isSelected = value ? isSameDay(date, value) : false;
              const isToday = isSameDay(date, today);
              const isOutsideMonth = date.getMonth() !== viewDate.getMonth();

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => {
                    onChange(date);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex h-10 items-center justify-center rounded-xl border text-sm font-medium transition-colors",
                    isSelected
                      ? "border-primary bg-primary text-white"
                      : "border-transparent bg-neutral-50 text-neutral-900 hover:border-neutral-200 hover:bg-neutral-100",
                    isOutsideMonth && !isSelected && "text-neutral-300 bg-white",
                    isToday && !isSelected && "border-neutral-300",
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function NewClaimFlow() {
  type GroupPhoto = {
    id: number;
    fileName: string;
    file?: File;
    previewUrl?: string;
    roomEntryId?: number;
    status: "pending" | "uploading" | "ready" | "failed";
  };

  type PhotoGroup = {
    id: number;
    roomName: string;
    photos: GroupPhoto[];
  };

  const step = useScanFlowStore((state) => state.step);
  const setStep = useScanFlowStore((state) => state.setStep);
  const isAddingProperty = useScanFlowStore((state) => state.isAddingProperty);
  const setIsAddingProperty = useScanFlowStore((state) => state.setIsAddingProperty);
  const property = useScanFlowStore((state) => state.property);
  const setProperty = useScanFlowStore((state) => state.setProperty);
  const setRooms = useScanFlowStore((state) => state.setRooms);
  const uploadedFiles = useScanFlowStore((state) => state.uploadedFiles);
  const setUploadingPhoto = useScanFlowStore((state) => state.setUploadingPhoto);
  const setUploadedFile = useScanFlowStore((state) => state.setUploadedFile);
  const cause = useScanFlowStore((state) => state.cause);
  const setCause = useScanFlowStore((state) => state.setCause);
  const resetScanFlow = useScanFlowStore((state) => state.reset);
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [createdJobs, setCreatedJobs] = useState<SyncedJobDetail[]>([]);
  const [photoGroups, setPhotoGroups] = useState<PhotoGroup[]>([]);
  const [incidentDate, setIncidentDate] = useState<Date | null>(null);

  const causeOptions = [
    {
      id: "water",
      label: "Water Damage",
      icon: Waves,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      id: "fire",
      label: "Fire & Smoke",
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      id: "impact",
      label: "Impact",
      icon: Zap,
      color: "text-yellow-500",
      bg: "bg-yellow-50",
    },
    {
      id: "storm",
      label: "Storm Damage",
      icon: CloudRain,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
    },
    {
      id: "subsidence",
      label: "Subsidence",
      icon: Wind,
      color: "text-teal-500",
      bg: "bg-teal-50",
    },
    {
      id: "other",
      label: "Other",
      icon: AlertCircle,
      color: "text-neutral-500",
      bg: "bg-neutral-50",
    },
  ];

  const areaOptions = [
    "Kitchen",
    "Living Room",
    "Bedroom 1",
    "Bedroom 2",
    "Bathroom",
    "Hallway",
    "Roof",
    "Garage",
  ];

  const fetchProperties = async () => {
    setIsLoadingProperties(true);
    const result = await getMyProperties();
    if (result.success && result.data) {
      setMyProperties(result.data);
    } else {
      toast.error(result.message || "Could not load properties. Please check your connection.");
    }
    setIsLoadingProperties(false);
  };

  useEffect(() => {
    fetchProperties();
    return () => {
      resetScanFlow();
    };
  }, [resetScanFlow]);

  const createPhotoEntry = (roomName: string): Room => ({
    id: Date.now() + Math.floor(Math.random() * 10000),
    property_id: property?.id ?? 0,
    room_name: roomName,
    window_count: 0,
    door_count: 0,
    dimensions: { floor_area: 0, ceiling_height: 0 },
    damages: [
      {
        type: cause || "damage",
        severity: "medium",
        area: 0,
        notes: "Awaiting AI analysis",
      },
    ],
    scan_status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const createPhotoGroup = () => ({
    id: Date.now() + Math.floor(Math.random() * 10000),
    roomName: "",
    photos: [],
  });

  const createPreviewDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  const syncRoomsSequentially = async (roomIds: number[]) => {
    const results: Array<{ success: boolean; data?: SyncedJobDetail; message?: string }> = [];

    for (const roomId of roomIds) {
      const result = await syncJobFromRoom(roomId);
      if (!result.success) {
        console.error("[scan] Failed to sync analyzed room into job", {
          roomId,
          message: result.message,
        });
      }
      results.push(result);
    }

    return results;
  };

  const updateRoomState = (roomId: number, updater: (room: Room) => Room) => {
    const currentRooms = useScanFlowStore.getState().rooms;
    setRooms(currentRooms.map((room) => (room.id === roomId ? updater(room) : room)));
  };

  const getGroupRoomEntryId = (group: PhotoGroup) =>
    group.photos.find((photo) => typeof photo.roomEntryId === "number")?.roomEntryId;

  const removePhotoGroup = (groupId: number) => {
    const group = photoGroups.find((entry) => entry.id === groupId);
    if (!group) return;

    const currentRooms = useScanFlowStore.getState().rooms;
    const roomEntryIds = group.photos
      .map((photo) => photo.roomEntryId)
      .filter((id): id is number => typeof id === "number");
    setRooms(currentRooms.filter((room) => !roomEntryIds.includes(room.id)));
    roomEntryIds.forEach((photoId) => {
      setUploadedFile(photoId, "");
      setUploadingPhoto(photoId, false);
    });
    setPhotoGroups((current) => current.filter((entry) => entry.id !== groupId));
  };

  const uploadFile = async (file: File, roomId: number): Promise<boolean> => {
    if (!property) return false;

    setUploadingPhoto(roomId, true);
    updateRoomState(roomId, (room) => ({
      ...room,
      scan_status: "processing",
      updated_at: new Date().toISOString(),
    }));

    try {
      const result = await analyzeRoomImage(file, property.id);
      if (result.success && result.data) {
        const currentRooms = useScanFlowStore.getState().rooms;
        const selectedRoomName = currentRooms.find((room) => room.id === roomId)?.room_name;

        updateRoomState(roomId, (room) => ({
          ...room,
          remote_room_id: result.data!.room_id,
          window_count: Math.max(room.window_count, result.data!.window_count),
          door_count: Math.max(room.door_count, result.data!.door_count),
          damages: [
            ...room.damages.filter((damage) => damage.notes !== "Awaiting AI analysis"),
            ...(result.data!.damages || []).map((damage) => ({
              type: damage.type || cause || "damage",
              severity: damage.severity || "medium",
              area: typeof damage.area === "number" ? damage.area : 0,
              notes: damage.location || damage.notes || "AI-detected issue",
            })),
          ],
          scan_status: "complete",
          updated_at: new Date().toISOString(),
        }));
        setUploadedFile(roomId, file.name);
        toast.success(`Analysis completed for ${selectedRoomName || "selected room"}`);
        return true;
      } else {
        updateRoomState(roomId, (room) => ({
          ...room,
          scan_status: "pending",
          updated_at: new Date().toISOString(),
        }));
        toast.error(result.message || "Failed to upload photo");
        return false;
      }
    } catch (error) {
      console.error("[scan] Room image upload crashed", {
        roomId,
        propertyId: property.id,
        fileName: file.name,
        error,
        message: getErrorMessage(error),
      });
      updateRoomState(roomId, (room) => ({
        ...room,
        scan_status: "pending",
        updated_at: new Date().toISOString(),
      }));
      toast.error("Upload error");
      return false;
    } finally {
      setUploadingPhoto(roomId, false);
    }
  };

  const handleGroupRoomChange = (groupId: number, roomName: string) => {
    const group = photoGroups.find((entry) => entry.id === groupId);
    if (!group) return;

    setPhotoGroups((current) =>
      current.map((entry) =>
        entry.id === groupId
          ? {
            ...entry,
            roomName,
          }
          : entry,
      ),
    );

    group.photos.forEach((photo) => {
      if (!photo.roomEntryId) return;
      updateRoomState(photo.roomEntryId, (currentRoom) => ({
        ...currentRoom,
        room_name: roomName,
        updated_at: new Date().toISOString(),
      }));
    });
  };

  const handleGroupUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    groupId: number,
  ) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    const photoEntries = await Promise.all(
      files.map(async (file) => ({
        id: Date.now() + Math.floor(Math.random() * 10000) + Math.floor(Math.random() * 10000),
        fileName: file.name,
        file,
        previewUrl: await createPreviewDataUrl(file),
        status: "pending" as const,
      })),
    );
    setPhotoGroups((current) =>
      current.map((entry) =>
        entry.id === groupId
          ? {
            ...entry,
            photos: [...entry.photos, ...photoEntries],
          }
          : entry,
      ),
    );
    e.target.value = "";
  };

  const removeGroupPhoto = (groupId: number, photoId: number) => {
    const group = photoGroups.find((entry) => entry.id === groupId);
    const photo = group?.photos.find((entry) => entry.id === photoId);
    if (!group || !photo) return;

    if (photo.roomEntryId) {
      const stillUsesRoom = group.photos.some(
        (groupPhoto) => groupPhoto.id !== photoId && groupPhoto.roomEntryId === photo.roomEntryId,
      );
      if (!stillUsesRoom) {
        const currentRooms = useScanFlowStore.getState().rooms;
        setRooms(currentRooms.filter((room) => room.id !== photo.roomEntryId));
        setUploadedFile(photo.roomEntryId, "");
        setUploadingPhoto(photo.roomEntryId, false);
      }
    }
    setPhotoGroups((current) =>
      current.map((entry) =>
        entry.id === groupId
          ? {
            ...entry,
            photos: entry.photos.filter((groupPhoto) => groupPhoto.id !== photoId),
          }
          : entry,
      ),
    );
  };

  const analyzeGroup = async (groupId: number) => {
    try {
      const group = photoGroups.find((entry) => entry.id === groupId);
      if (!group) return;
      if (!group.roomName) {
        toast.error("Select a room before analyzing photos.");
        return;
      }

      const pendingPhotos = group.photos.filter(
        (photo) => photo.status === "pending" || photo.status === "failed",
      );

      if (pendingPhotos.length === 0) {
        toast.error("No new photos to analyze in this room.");
        return;
      }

      let roomEntryId = getGroupRoomEntryId(group);
      if (!roomEntryId) {
        const roomEntry = createPhotoEntry(group.roomName);
        const currentRooms = useScanFlowStore.getState().rooms;
        setRooms([...currentRooms, roomEntry]);
        roomEntryId = roomEntry.id;
      }

      for (const photo of pendingPhotos) {
        if (!photo.file) continue;

        setPhotoGroups((current) =>
          current.map((entry) =>
            entry.id === groupId
              ? {
                ...entry,
                photos: entry.photos.map((groupPhoto) =>
                  groupPhoto.id === photo.id
                    ? {
                      ...groupPhoto,
                      roomEntryId,
                      status: "uploading",
                    }
                    : groupPhoto,
                ),
              }
              : entry,
          ),
        );

        const success = await uploadFile(photo.file, roomEntryId);
        setPhotoGroups((current) =>
          current.map((entry) =>
            entry.id === groupId
              ? {
                ...entry,
                photos: entry.photos.map((groupPhoto) =>
                  groupPhoto.id === photo.id
                    ? {
                      ...groupPhoto,
                      roomEntryId: success ? roomEntryId : undefined,
                      status: success ? "ready" : "failed",
                    }
                    : groupPhoto,
                ),
              }
              : entry,
          ),
        );

        if (!success) {
          const hasSuccessfulPhotos = useScanFlowStore
            .getState()
            .rooms.some((room) => room.id === roomEntryId && room.scan_status === "complete");
          if (!hasSuccessfulPhotos) {
            const latestRooms = useScanFlowStore.getState().rooms;
            setRooms(latestRooms.filter((room) => room.id !== roomEntryId));
            setUploadedFile(roomEntryId, "");
            setUploadingPhoto(roomEntryId, false);
          }
        }
      }
    } catch (error) {
      console.error("[scan] Room analysis group crashed", {
        groupId,
        error,
        message: getErrorMessage(error),
      });
      toast.error("An unexpected error occurred while analyzing this room.");
    }
  };

  const startProcessing = async () => {
    if (!property) return;

    const currentRooms = useScanFlowStore.getState().rooms;
    const pendingRooms = currentRooms.filter(
      (room) => !room.room_name || !room.remote_room_id || room.scan_status !== "complete",
    );

    if (pendingRooms.length > 0) {
      toast.error("Each photo needs a room selected and a completed AI analysis before submit.");
      return;
    }

    setStep("processing");
    try {
      let syncResults: Array<{ success: boolean; data?: SyncedJobDetail; message?: string }> = [];

      if (isDevModeEnabled()) {
        const storedRooms = await Promise.all(
          currentRooms.map((room) =>
            addRoom({
              property_id: room.property_id,
              room_name: room.room_name,
              window_count: room.window_count,
              door_count: room.door_count,
              dimensions: room.dimensions,
              damages: room.damages,
              media: photoGroups
                .flatMap((group) => group.photos)
                .filter((photo) => photo.roomEntryId === room.id && photo.previewUrl)
                .map((photo, index) => ({
                  url: photo.previewUrl!,
                  label: photo.fileName,
                  estimated_material_cost: 85 + index * 20,
                })),
            }),
          ),
        );

        const failedRoom = storedRooms.find((room) => !room.success || !room.data);
        if (failedRoom) {
          toast.error(failedRoom.message || "Failed to save scanned rooms in dev mode.");
          setStep("capture");
          return;
        }

        const storedRoomIds = storedRooms
          .map((room) => room.data?.id)
          .filter((roomId): roomId is number => typeof roomId === "number");

        if (storedRoomIds.length === 0) {
          toast.error("No scanned rooms were available to create a claim.");
          setStep("capture");
          return;
        }

        syncResults = await syncRoomsSequentially(storedRoomIds);
      } else {
        const remoteRoomIds = currentRooms
          .map((room) => room.remote_room_id)
          .filter((roomId): roomId is number => typeof roomId === "number");

        syncResults = await syncRoomsSequentially(remoteRoomIds);
      }

      const successfulJobs = syncResults
        .filter((result): result is { success: true; data: SyncedJobDetail } =>
          Boolean(result.success && result.data),
        )
        .map((result) => result.data)
        .filter(
          (job, index, jobs) => jobs.findIndex((entry) => entry.id === job.id) === index,
        );

      const failedResults = syncResults.filter((result) => !result.success);

      if (successfulJobs.length === 0) {
        console.error("[scan] Claim submission created no jobs", {
          propertyId: property.id,
          currentRooms,
          photoGroups,
          syncResults,
        });
        toast.error(
          failedResults[0]?.message ||
          "Failed to create job entries in the backend.",
        );
        setStep("capture");
        return;
      }

      setCreatedJobs(successfulJobs);
      if (failedResults.length > 0) {
        console.error("[scan] Some analyzed rooms failed to sync", {
          propertyId: property.id,
          failedResults,
          currentRooms,
        });
        toast.error(`${failedResults.length} photo(s) failed to sync into job entries.`);
      }

      setTimeout(() => {
        setStep("submitting");
      }, 1200);
    } catch (error) {
      console.error("[scan] Claim submission crashed", {
        propertyId: property.id,
        devMode: isDevModeEnabled(),
        rooms: currentRooms,
        photoGroups,
        error,
        message: getErrorMessage(error),
      });
      toast.error(`An unexpected error occurred during dispatch: ${getErrorMessage(error)}`);
      setStep("capture");
    }
  };

  const renderStep = () => {
    switch (step) {
      case "property":
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
              <h1 className="text-3xl font-medium tracking-tight text-neutral-900 font-serif">
                {isAddingProperty ? "Add New Property" : "Select Property"}
              </h1>
              <p className="text-lg font-normal text-neutral-500">
                {isAddingProperty
                  ? "Register a new London asset to start your claim."
                  : "Which property is affected by the damage?"}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {isAddingProperty ? (
                <motion.div
                  key="add-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white border border-neutral-100 rounded-3xl p-6"
                >
                  <PropertyForm
                    onSuccess={(newProperty) => {
                      setMyProperties([...myProperties, newProperty]);
                      setProperty(newProperty);
                      setIsAddingProperty(false);
                    }}
                    onCancel={() => setIsAddingProperty(false)}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid gap-4"
                >
                  {isLoadingProperties ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="size-8 animate-spin text-primary" />
                    </div>
                  ) : myProperties.length === 0 ? (
                    <div className="text-center py-12 space-y-4">
                      <p className="text-neutral-500">No properties found. Add one to get started.</p>
                      <Button
                        onClick={() => setIsAddingProperty(true)}
                        className="h-12 rounded-full text-base font-medium"
                      >
                        <Plus className="mr-2 size-5" /> Add Property
                      </Button>
                    </div>
                  ) : (
                    <>
                      {myProperties.map((p) => {
                        const fullAddress = [
                          p.address_line_1 || p.address_line,
                          p.address_line_2,
                          p.postcode,
                        ]
                          .filter(Boolean)
                          .join(", ");
                        return (
                          <button
                            key={p.id}
                            onClick={() => setProperty(p)}
                            className={cn(
                              "w-full text-left p-6 rounded-2xl border transition-all flex items-center justify-between group",
                              property?.id === p.id
                                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                : "border-neutral-200 bg-white hover:border-primary/20",
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={cn(
                                  "size-12 rounded-xl flex items-center justify-center border transition-colors",
                                  property?.id === p.id
                                    ? "bg-primary text-white border-primary"
                                    : "bg-neutral-50 text-neutral-400 border-neutral-100",
                                )}
                              >
                                <Home className="size-6" />
                              </div>
                              <div>
                                <p className="font-bold text-neutral-900">
                                  {fullAddress}
                                </p>
                                <p className="text-sm font-normal text-neutral-500 capitalize">
                                  {p.property_type}
                                </p>
                              </div>
                            </div>
                            {property?.id === p.id && (
                              <div className="size-6 bg-primary rounded-full flex items-center justify-center text-white">
                                <CheckCircle2 className="size-4" />
                              </div>
                            )}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setIsAddingProperty(true)}
                        className="w-full p-6 rounded-2xl border border-dashed border-neutral-200 hover:border-primary/50 transition-all flex items-center gap-4 text-neutral-500 hover:text-primary group"
                      >
                        <div className="size-12 rounded-xl bg-neutral-50 flex items-center justify-center border border-neutral-100 group-hover:bg-primary/5 group-hover:border-primary/20">
                          <Plus className="size-6 transition-transform group-hover:scale-110" />
                        </div>
                        <span className="font-medium">Add New Property</span>
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {!isAddingProperty && (
              <Button
                disabled={!property}
                onClick={() => setStep("incident")}
                className="w-full h-12 rounded-full text-base font-medium shadow-none"
              >
                Next: Cause of Damage
                <ChevronRight className="ml-2 size-5" />
              </Button>
            )}
          </div>
        );

      case "incident":
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <button
              onClick={() => setStep("property")}
              className="flex items-center text-sm font-bold text-neutral-400 hover:text-primary transition-colors uppercase tracking-widest"
            >
              <ChevronLeft className="mr-1 size-4" /> Previous Step
            </button>

            <div className="space-y-4">
              <h1 className="text-3xl font-medium tracking-tight text-neutral-900">
                What happened?
              </h1>
              <p className="text-lg font-normal text-neutral-500">
                Select the primary cause of damage.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {causeOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setCause(opt.id)}
                  className={cn(
                    "p-6 rounded-2xl border transition-all text-center flex flex-col items-center gap-4 group",
                    cause === opt.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-neutral-100 bg-white hover:border-primary/20",
                  )}
                >
                  <div
                    className={cn(
                      "size-14 rounded-xl flex items-center justify-center border transition-colors",
                      cause === opt.id
                        ? "bg-primary text-white border-primary"
                        : `${opt.bg} ${opt.color} border-neutral-100`,
                    )}
                  >
                    <opt.icon className="size-7" />
                  </div>
                  <span className="font-bold text-neutral-900">
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-neutral-500 pl-1">
                Date of Incident
              </Label>
              <IncidentDatePicker value={incidentDate} onChange={setIncidentDate} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => setStep("property")}
                className="h-12 rounded-xl text-base font-medium border-neutral-100 text-neutral-500"
              >
                <ChevronLeft className="mr-2 size-5" /> Back
              </Button>
              <Button
                disabled={!cause}
                onClick={() => setStep("capture")}
                className="h-12 rounded-full text-base font-medium"
              >
                Next: Upload Evidence
                <ChevronRight className="ml-2 size-5" />
              </Button>
            </div>
          </div>
        );

      case "capture":
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <button
              onClick={() => setStep("incident")}
              className="flex items-center text-sm font-bold text-neutral-400 hover:text-primary transition-colors uppercase tracking-widest"
            >
              <ChevronLeft className="mr-1 size-4" /> Previous Step
            </button>

            <div className="space-y-4">
              <h1 className="text-3xl font-medium tracking-tight text-neutral-900">
                Evidence Capture
              </h1>
              <p className="text-lg font-normal text-neutral-500">
                Add photos in room-based batches. Pick a room once, then upload
                multiple photos for that room in one go.
              </p>
            </div>

            {photoGroups.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-neutral-200 bg-white p-8 text-center space-y-4">
                <p className="text-sm text-neutral-500">
                  Start a batch, choose a room, and upload multiple photos at once.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPhotoGroups([createPhotoGroup()])}
                  className="h-12 rounded-full border-dashed border-neutral-200 text-neutral-700 hover:border-primary/30 hover:bg-primary/5"
                >
                  <Plus className="mr-2 size-4" />
                  Add Photos
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {photoGroups.map((group, index) => {
                  const uploadedCount = group.photos.filter((photo) => photo.status === "ready").length;
                  const uploadingCount = group.photos.filter((photo) => photo.status === "uploading").length;
                  const pendingCount = group.photos.filter((photo) => photo.status === "pending").length;

                  return (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 rounded-2xl border flex flex-col gap-4 bg-white border-neutral-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-xl flex items-center justify-center border text-sm font-bold bg-neutral-50 text-neutral-500 border-neutral-100">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-neutral-900">Photo Batch {index + 1}</h4>
                          <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">
                            {group.roomName || "Room not selected"}
                          </p>
                          <p className="text-xs text-neutral-500 mt-1">
                            {uploadedCount} uploaded
                            {uploadingCount > 0 ? ` · ${uploadingCount} processing` : ""}
                            {pendingCount > 0 ? ` · ${pendingCount} waiting` : ""}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => removePhotoGroup(group.id)}
                          className="size-10 rounded-full text-neutral-500 hover:text-neutral-900"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                          Room or Area
                        </Label>
                        <Select
                          value={group.roomName || undefined}
                          onValueChange={(value) => handleGroupRoomChange(group.id, value)}
                        >
                          <SelectTrigger className="w-full h-14 rounded-xl border-2 border-neutral-300 bg-white px-4 text-left text-base font-medium text-neutral-900 shadow-none hover:border-neutral-400 focus:border-primary focus:ring-0 data-[placeholder]:text-neutral-500">
                            <SelectValue placeholder="Select room" />
                          </SelectTrigger>
                          <SelectContent>
                            {areaOptions.map((area) => (
                              <SelectItem key={area} value={area}>
                                {area}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <input
                        type="file"
                        id={`group-file-${group.id}`}
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleGroupUpload(e, group.id)}
                      />

                      <Button
                        variant="outline"
                        onClick={() => document.getElementById(`group-file-${group.id}`)?.click()}
                        className="rounded-full h-12 border-neutral-100 gap-2 hover:bg-neutral-50 font-bold text-[10px] uppercase tracking-widest w-full"
                      >
                        <ImagePlus className="size-4" />
                        Choose Photos
                      </Button>

                      <Button
                        type="button"
                        onClick={() => analyzeGroup(group.id)}
                        disabled={!group.roomName || group.photos.length === 0 || uploadingCount > 0}
                        className="rounded-full h-12 font-bold text-[10px] uppercase tracking-widest w-full"
                      >
                        Analyze Room
                      </Button>

                      {group.photos.length > 0 ? (
                        <div className="rounded-2xl bg-neutral-50 p-4 space-y-2">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {group.photos.map((photo) => (
                              <div
                                key={`${photo.id}-preview`}
                                className="relative aspect-square overflow-hidden rounded-2xl border border-neutral-200 bg-white"
                              >
                                {photo.previewUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={photo.previewUrl}
                                    alt={photo.fileName}
                                    className="size-full object-cover"
                                  />
                                ) : null}
                                <div className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                                  {photo.status === "uploading"
                                    ? "Uploading"
                                    : photo.status === "ready"
                                      ? "Ready"
                                      : photo.status === "failed"
                                        ? "Failed"
                                        : "Pending"}
                                </div>
                              </div>
                            ))}
                          </div>
                          {group.photos.map((photo, photoIndex) => (
                            <div
                              key={photo.id}
                              className="flex items-center justify-between gap-3 text-sm text-neutral-600"
                            >
                              <div className="min-w-0">
                                <p className="font-medium text-neutral-900">
                                  Photo {photoIndex + 1}
                                </p>
                                {photo.roomEntryId && uploadedFiles[photo.roomEntryId] ? (
                                  <p className="truncate text-xs text-neutral-500">
                                    {uploadedFiles[photo.roomEntryId]}
                                  </p>
                                ) : (
                                  <p className="truncate text-xs text-neutral-500">{photo.fileName}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                                  {photo.status === "uploading"
                                    ? "Uploading"
                                    : photo.status === "ready"
                                      ? "Ready"
                                      : photo.status === "failed"
                                        ? "Failed"
                                        : "Pending"}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeGroupPhoto(group.id, photo.id)}
                                  className="rounded-full p-1 text-neutral-400 hover:text-neutral-800"
                                >
                                  <X className="size-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </motion.div>
                  );
                })}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPhotoGroups((current) => [...current, createPhotoGroup()])}
                  className="w-full h-12 rounded-full border-dashed border-neutral-200 text-neutral-700 hover:border-primary/30 hover:bg-primary/5"
                >
                  <Plus className="mr-2 size-4" />
                  Add Photos
                </Button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => setStep("incident")}
                className="h-14 rounded-full text-base font-bold uppercase tracking-widest border-neutral-100 text-neutral-500"
              >
                <ChevronLeft className="mr-2 size-5" /> Back
              </Button>
              <Button
                onClick={startProcessing}
                className="h-14 rounded-full text-base font-bold uppercase tracking-widest"
              >
                Submit
                <ArrowRight className="ml-2 size-5" />
              </Button>
            </div>
          </div>
        );

      case "processing":
        return (
          <div className="max-w-md mx-auto space-y-10 py-20 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="mx-auto size-32 bg-primary/5 rounded-full flex items-center justify-center text-primary border border-primary/20 relative">
              <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <Sparkles className="size-12" />
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-medium text-neutral-900 font-serif">
                Dispatching Images to Analysis Service
              </h2>
              <p className="text-lg font-normal text-neutral-500 leading-relaxed">
                Each uploaded image is sent to the microservice first, then the
                analyzed room data is synced into the main API as a job entry.
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Loader2 className="size-5 animate-spin text-primary/40" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                Finalizing Transfer...
              </span>
            </div>
          </div>
        );

      case "submitting":
        return (
          <div className="max-w-md mx-auto space-y-10 py-20 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="mx-auto size-32 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 border border-teal-100 animate-pulse">
              <CheckCircle2 className="size-16" />
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-medium text-neutral-900 font-serif">
                Job Entry Created
              </h2>
              <p className="text-lg font-normal text-neutral-500 leading-relaxed">
                Your room images were analyzed by the microservice and synced into
                {isDevModeEnabled()
                  ? "Your uploaded evidence was grouped into a single local claim with all scanned rooms attached."
                  : `Your room images were analyzed by the microservice and synced into
                the main API. The backend created ${createdJobs.length} job entr${createdJobs.length === 1 ? "y" : "ies"
                  } from this submission.`}
              </p>
            </div>

            {createdJobs.length > 0 ? (
              <div className="text-left bg-white border border-neutral-100 rounded-3xl p-6 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                  {isDevModeEnabled() ? "Created Claim" : "Created Jobs"}
                </p>
                {createdJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between gap-4 border border-neutral-100 rounded-2xl px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">
                        {isDevModeEnabled() ? `Claim Job #${job.id}` : `Job #${job.id}`}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {isDevModeEnabled()
                          ? `Report ${job.report_id} · ${job.status}`
                          : `Room ${job.room_id} · Report ${job.report_id} · ${job.status}`}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-neutral-900">
                      £{Number(job.total_cost || 0).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="space-y-4">
              <Link href="/dashboard" className="w-full">
                <Button className="w-full h-14 rounded-full text-base font-bold uppercase tracking-widest transition-all active:scale-[0.98] shadow-none">
                  Return to Dashboard
                  <ArrowRight className="ml-2 size-5" />
                </Button>
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center max-w-2xl mx-auto ">
      {step !== "submitting" && (
        <div className="w-full h-1 bg-neutral-100 rounded-full mb-12 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{
              width: `${step === "property"
                  ? 25
                  : step === "incident"
                    ? 50
                    : step === "capture"
                      ? 75
                      : step === "processing"
                        ? 90
                        : 100
                }%`,
            }}
          />
        </div>
      )}

      {renderStep()}
    </div>
  );
}
