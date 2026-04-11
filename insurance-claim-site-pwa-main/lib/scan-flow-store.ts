"use client";

import { create } from "zustand";
import type { Property } from "./property";
import type { Report } from "./report";
import type { Room } from "./room";

export type ScanStep =
  | "property"
  | "incident"
  | "areas"
  | "capture"
  | "processing"
  | "submitting";

interface ScanFlowState {
  step: ScanStep;
  isAddingProperty: boolean;
  property: Property | null;
  rooms: Room[];
  currentRoomIndex: number;
  uploadingPhotos: Record<number, boolean>;
  uploadedFiles: Record<number, string>;
  report: Report | null;
  cause: string;
  affectedAreas: string[];
  setStep: (step: ScanStep) => void;
  setIsAddingProperty: (value: boolean) => void;
  setProperty: (property: Property | null) => void;
  setRooms: (rooms: Room[]) => void;
  setCurrentRoomIndex: (index: number) => void;
  setUploadingPhoto: (roomId: number, isUploading: boolean) => void;
  setUploadedFile: (roomId: number, fileName: string) => void;
  setReport: (report: Report | null) => void;
  setCause: (cause: string) => void;
  toggleArea: (area: string) => void;
  setAffectedAreas: (areas: string[]) => void;
  reset: () => void;
}

const initialState = {
  step: "property" as ScanStep,
  isAddingProperty: false,
  property: null,
  rooms: [] as Room[],
  currentRoomIndex: 0,
  uploadingPhotos: {} as Record<number, boolean>,
  uploadedFiles: {} as Record<number, string>,
  report: null as Report | null,
  cause: "",
  affectedAreas: [] as string[],
};

export const useScanFlowStore = create<ScanFlowState>((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  setIsAddingProperty: (isAddingProperty) => set({ isAddingProperty }),
  setProperty: (property) => set({ property }),
  setRooms: (rooms) => set({ rooms }),
  setCurrentRoomIndex: (currentRoomIndex) => set({ currentRoomIndex }),
  setUploadingPhoto: (roomId, isUploading) =>
    set((state) => ({
      uploadingPhotos: {
        ...state.uploadingPhotos,
        [roomId]: isUploading,
      },
    })),
  setUploadedFile: (roomId, fileName) =>
    set((state) => ({
      uploadedFiles: {
        ...state.uploadedFiles,
        [roomId]: fileName,
      },
    })),
  setReport: (report) => set({ report }),
  setCause: (cause) => set({ cause }),
  toggleArea: (area) =>
    set((state) => ({
      affectedAreas: state.affectedAreas.includes(area)
        ? state.affectedAreas.filter((entry) => entry !== area)
        : [...state.affectedAreas, area],
    })),
  setAffectedAreas: (affectedAreas) => set({ affectedAreas }),
  reset: () => set(initialState),
}));
