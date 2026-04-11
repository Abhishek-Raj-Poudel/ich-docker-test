"use client";

import { create } from "zustand";
import { DevModeRole, getDevModeRole, setDevModeRole } from "./dev-mode";

const STORE_KEY = "claimhelp.devMode.store";
const DAY_MS = 24 * 60 * 60 * 1000;
const FALLBACK_MEDIA_URL =
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800";

type RoleName = "homeowner" | "client" | "builder" | "admin" | "claim_handler";

interface MockUser {
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  contact_number: string;
  is_active: number;
  role: {
    id: number;
    role: RoleName;
  };
  created_at: string;
  kyc_status: string;
  email_verified: boolean;
}

interface MockProperty {
  id: number;
  user_id: number;
  address_line: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  postcode: string;
  address_type: string;
  property_type: string;
  latitude?: number;
  longitude?: number;
  ownership_verified: boolean;
  created_at: string;
  updated_at: string;
  media?: Array<{ id: number; url: string; label?: string }>;
}

interface MockRoom {
  id: number;
  property_id: number;
  room_name: string;
  window_count: number;
  door_count: number;
  dimensions: {
    floor_area: number;
    ceiling_height: number;
    wall_lengths?: number[];
  };
  damages: Array<{
    type: string;
    severity: string;
    area: number;
    notes: string;
  }>;
  scan_status: "pending" | "processing" | "complete";
  created_at: string;
  updated_at: string;
  media: Array<{ id: number; url: string; label?: string; created_at?: string; estimated_material_cost?: number }>;
}

interface MockReport {
  id: number;
  reference_number: string;
  total_cost: number;
  vat_amount: number;
  labour_total: number;
  materials_total: number;
  status: "draft" | "submitted" | "approved" | "rejected" | "completed";
  property_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  insurer_notes?: string;
}

interface MockJob {
  id: number;
  report_id: number;
  builder_id?: number;
  status: "pending" | "accepted" | "declined" | "completed" | "cancelled" | "in_progress" | "site_visit_booked";
  contract_amount: number;
  site_visit_scheduled_at?: string;
  actual_start_date?: string;
  agreed_start_date?: string;
  agreed_completion_date?: string;
  final_invoice_amount?: number;
  notes?: string;
  media: Array<{ id: number; url: string; label?: string; created_at?: string }>;
  progress_updates: Array<{
    id: number;
    notes: string;
    materials_used: { material_id: number; qty: number; cost: number }[];
    created_at: string;
  }>;
  status_history: Array<{
    id: number;
    status: MockJob["status"];
    changed_at: string;
    changed_by_user_id: number;
    note?: string;
  }>;
  created_at: string;
  updated_at: string;
}

interface MockReview {
  id: number;
  job_details_id: number;
  user_id: number;
  rating: number;
  review: string;
  created_at: string;
}

interface MockMessage {
  id: number;
  job_details_id: number;
  user_id: number;
  sender_name: string;
  sender_role: "client" | "builder" | "admin";
  message: string;
  type: "text" | "photo";
  attachment_url?: string;
  is_read: boolean;
  created_at: string;
}

interface MockKycSubmission {
  id: number;
  user_id: number;
  document_type: string;
  status: string;
  rejection_reason: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}

interface MockStore {
  counters: Record<string, number>;
  users: MockUser[];
  properties: MockProperty[];
  rooms: MockRoom[];
  reports: MockReport[];
  jobs: MockJob[];
  reviews: MockReview[];
  messages: MockMessage[];
  kycSubmissions: MockKycSubmission[];
}

interface MockDataState {
  store: MockStore;
  hydrated: boolean;
  hydrate: () => void;
  replaceStore: (store: MockStore) => void;
}

function nowIso(offsetDays = 0) {
  return new Date(Date.now() + offsetDays * DAY_MS).toISOString();
}

function createStatusHistoryEntry(
  id: number,
  status: MockJob["status"],
  changed_at: string,
  changed_by_user_id: number,
  note?: string,
) {
  return {
    id,
    status,
    changed_at,
    changed_by_user_id,
    note,
  };
}

function createInitialStore(): MockStore {
  const createdAt = nowIso(-30);

  const users: MockUser[] = [
    {
      id: 1,
      first_name: "Amelia",
      last_name: "Stone",
      name: "Amelia Stone",
      email: "homeowner@dev.local",
      contact_number: "+44 7700 900111",
      is_active: 1,
      role: { id: 1, role: "homeowner" },
      created_at: createdAt,
      kyc_status: "approved",
      email_verified: true,
    },
    {
      id: 2,
      first_name: "Jack",
      last_name: "Turner",
      name: "Jack Turner",
      email: "builder@dev.local",
      contact_number: "+44 7700 900222",
      is_active: 1,
      role: { id: 2, role: "builder" },
      created_at: createdAt,
      kyc_status: "approved",
      email_verified: true,
    },
    {
      id: 3,
      first_name: "Nora",
      last_name: "Patel",
      name: "Nora Patel",
      email: "admin@dev.local",
      contact_number: "+44 7700 900333",
      is_active: 1,
      role: { id: 3, role: "admin" },
      created_at: createdAt,
      kyc_status: "approved",
      email_verified: true,
    },
    {
      id: 4,
      first_name: "Elliot",
      last_name: "Reed",
      name: "Elliot Reed",
      email: "handler@dev.local",
      contact_number: "+44 7700 900444",
      is_active: 1,
      role: { id: 4, role: "claim_handler" },
      created_at: createdAt,
      kyc_status: "approved",
      email_verified: true,
    },
  ];

  const properties: MockProperty[] = [
    {
      id: 1,
      user_id: 1,
      address_line: "14 Willow Crescent",
      address_line_1: "14 Willow Crescent",
      city: "Leeds",
      postcode: "LS1 4AB",
      address_type: "residential",
      property_type: "owned",
      latitude: 53.8008,
      longitude: -1.5491,
      ownership_verified: true,
      created_at: nowIso(-20),
      updated_at: nowIso(-3),
      media: [{ id: 1, url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800", label: "Ownership proof" }],
    },
    {
      id: 2,
      user_id: 1,
      address_line: "82 Riverside View",
      address_line_1: "82 Riverside View",
      city: "Manchester",
      postcode: "M3 5FS",
      address_type: "residential",
      property_type: "owned",
      latitude: 53.4808,
      longitude: -2.2426,
      ownership_verified: false,
      created_at: nowIso(-12),
      updated_at: nowIso(-6),
    },
  ];

  const rooms: MockRoom[] = [
    {
      id: 1,
      property_id: 1,
      room_name: "Kitchen",
      window_count: 1,
      door_count: 1,
      dimensions: { floor_area: 16, ceiling_height: 2.5 },
      damages: [{ type: "water", severity: "medium", area: 8, notes: "Ceiling leak above hob" }],
      scan_status: "complete",
      created_at: nowIso(-9),
      updated_at: nowIso(-8),
      media: [{ id: 1, url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800", label: "Leak damage", created_at: nowIso(-9) }],
    },
    {
      id: 2,
      property_id: 1,
      room_name: "Living Room",
      window_count: 2,
      door_count: 1,
      dimensions: { floor_area: 28, ceiling_height: 2.6 },
      damages: [{ type: "water", severity: "low", area: 5, notes: "Skirting swelling near bay window" }],
      scan_status: "complete",
      created_at: nowIso(-9),
      updated_at: nowIso(-8),
      media: [{ id: 2, url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800", label: "Wall staining", created_at: nowIso(-9) }],
    },
  ];

  const reports: MockReport[] = [
    {
      id: 1,
      reference_number: "CLM-2026-001",
      total_cost: 8420,
      vat_amount: 1403,
      labour_total: 4600,
      materials_total: 3820,
      status: "approved",
      property_id: 1,
      user_id: 1,
      created_at: nowIso(-8),
      updated_at: nowIso(-4),
      insurer_notes: "Approved for urgent remediation and redecoration.",
    },
    {
      id: 2,
      reference_number: "CLM-2026-002",
      total_cost: 2975,
      vat_amount: 496,
      labour_total: 1550,
      materials_total: 1425,
      status: "submitted",
      property_id: 2,
      user_id: 1,
      created_at: nowIso(-5),
      updated_at: nowIso(-2),
    },
  ];

  const jobs: MockJob[] = [
    {
      id: 1,
      report_id: 1,
      builder_id: 2,
      status: "in_progress",
      contract_amount: 8420,
      site_visit_scheduled_at: nowIso(-3),
      actual_start_date: nowIso(-2),
      agreed_start_date: nowIso(-2),
      agreed_completion_date: nowIso(5),
      media: [{ id: 3, url: "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&q=80&w=800", label: "Progress photo", created_at: nowIso(-1) }],
      progress_updates: [
        {
          id: 1,
          notes: "Drying equipment installed and damaged plaster stripped back.",
          materials_used: [{ material_id: 1, qty: 2, cost: 180 }],
          created_at: nowIso(-1),
        },
      ],
      status_history: [
        createStatusHistoryEntry(1, "pending", nowIso(-4), 1, "Claim submitted by homeowner."),
        createStatusHistoryEntry(2, "accepted", nowIso(-3), 2, "Builder accepted the repair work."),
        createStatusHistoryEntry(3, "in_progress", nowIso(-2), 2, "On-site remediation started."),
      ],
      created_at: nowIso(-4),
      updated_at: nowIso(-1),
    },
    {
      id: 2,
      report_id: 2,
      status: "pending",
      contract_amount: 2975,
      media: [],
      progress_updates: [],
      status_history: [
        createStatusHistoryEntry(4, "pending", nowIso(-2), 1, "Claim submitted and waiting for a builder."),
      ],
      created_at: nowIso(-2),
      updated_at: nowIso(-2),
    },
  ];

  const reviews: MockReview[] = [
    {
      id: 1,
      job_details_id: 1,
      user_id: 1,
      rating: 5,
      review: "Clear updates and tidy workmanship so far.",
      created_at: nowIso(-1),
    },
  ];

  const messages: MockMessage[] = [
    {
      id: 1,
      job_details_id: 1,
      user_id: 1,
      sender_name: "Amelia Stone",
      sender_role: "client",
      message: "Please confirm whether the ceiling repaint is included.",
      type: "text",
      is_read: true,
      created_at: nowIso(-1),
    },
    {
      id: 2,
      job_details_id: 1,
      user_id: 2,
      sender_name: "Jack Turner",
      sender_role: "builder",
      message: "Yes, primer and final coat are included after drying completes.",
      type: "text",
      is_read: false,
      created_at: nowIso(-1),
    },
  ];

  const kycSubmissions: MockKycSubmission[] = [
    {
      id: 1,
      user_id: 1,
      document_type: "passport",
      status: "approved",
      rejection_reason: null,
      submitted_at: nowIso(-25),
      reviewed_at: nowIso(-24),
    },
    {
      id: 2,
      user_id: 2,
      document_type: "company_registration",
      status: "approved",
      rejection_reason: null,
      submitted_at: nowIso(-22),
      reviewed_at: nowIso(-21),
    },
    {
      id: 3,
      user_id: 4,
      document_type: "passport",
      status: "pending",
      rejection_reason: null,
      submitted_at: nowIso(-2),
      reviewed_at: null,
    },
  ];

  return {
    counters: {
      users: 5,
      properties: 3,
      rooms: 3,
      reports: 3,
      jobs: 3,
      reviews: 2,
      messages: 3,
      kycSubmissions: 4,
      media: 4,
      statusHistory: 5,
    },
    users,
    properties,
    rooms,
    reports,
    jobs,
    reviews,
    messages,
    kycSubmissions,
  };
}

function readStoredMockData(): MockStore {
  if (typeof window === "undefined") {
    return createInitialStore();
  }

  const existing = localStorage.getItem(STORE_KEY);
  if (!existing) {
    const initial = createInitialStore();
    localStorage.setItem(STORE_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    return JSON.parse(existing) as MockStore;
  } catch {
    const reset = createInitialStore();
    localStorage.setItem(STORE_KEY, JSON.stringify(reset));
    return reset;
  }
}

const useMockDataStore = create<MockDataState>((set) => ({
  store: createInitialStore(),
  hydrated: false,
  hydrate: () => {
    set({
      store: readStoredMockData(),
      hydrated: true,
    });
  },
  replaceStore: (store) => {
    set({
      store,
      hydrated: true,
    });
  },
}));

function getStore(): MockStore {
  const state = useMockDataStore.getState();
  if (!state.hydrated) {
    state.hydrate();
  }
  return useMockDataStore.getState().store;
}

function normalizePersistedMediaUrl(url?: string) {
  if (!url) return FALLBACK_MEDIA_URL;
  if (url.startsWith("data:") || url.startsWith("blob:")) {
    return FALLBACK_MEDIA_URL;
  }
  return url;
}

function sanitizeStoreForPersistence(store: MockStore): MockStore {
  return {
    ...store,
    properties: store.properties.map((property) => ({
      ...property,
      media: property.media?.map((media) => ({
        ...media,
        url: normalizePersistedMediaUrl(media.url),
      })),
    })),
    rooms: store.rooms.map((room) => ({
      ...room,
      media: room.media.map((media) => ({
        ...media,
        url: normalizePersistedMediaUrl(media.url),
      })),
    })),
    jobs: store.jobs.map((job) => ({
      ...job,
      media: job.media.map((media) => ({
        ...media,
        url: normalizePersistedMediaUrl(media.url),
      })),
    })),
    messages: store.messages.map((message) => ({
      ...message,
      attachment_url: message.attachment_url
        ? normalizePersistedMediaUrl(message.attachment_url)
        : undefined,
    })),
  };
}

function setStore(store: MockStore) {
  if (typeof window === "undefined") return;
  let nextStore = store;

  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch (error) {
    const isQuotaError =
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED");

    if (!isQuotaError) {
      throw error;
    }

    console.warn("[mock-store] localStorage quota exceeded, stripping oversized media payloads", {
      error,
    });

    nextStore = sanitizeStoreForPersistence(store);
    localStorage.setItem(STORE_KEY, JSON.stringify(nextStore));
  }

  useMockDataStore.getState().replaceStore(nextStore);
  window.dispatchEvent(new Event("storage"));
}

function updateStore<T>(updater: (store: MockStore) => T): T {
  const store = getStore();
  const result = updater(store);
  setStore(store);
  return result;
}

function nextId(store: MockStore, key: keyof MockStore["counters"]) {
  const id = store.counters[key];
  store.counters[key] += 1;
  return id;
}

function getRoleName(role: DevModeRole): RoleName {
  if (role === "homeowner") return "homeowner";
  if (role === "claim_handler") return "claim_handler";
  return role;
}

function getDevRoleFromUserRole(role: RoleName): DevModeRole {
  if (role === "builder" || role === "admin" || role === "claim_handler") return role;
  return "homeowner";
}

export function resetMockStore() {
  if (typeof window === "undefined") return;
  setStore(createInitialStore());
}

export function getMockCurrentUser() {
  const roleName = getRoleName(getDevModeRole());
  return getStore().users.find((user) => user.role.role === roleName) ?? getStore().users[0];
}

export function mockLogin(email: string) {
  const normalized = email.trim().toLowerCase();
  const store = getStore();
  const user =
    store.users.find((candidate) => candidate.email.toLowerCase() === normalized) ??
    store.users.find((candidate) => candidate.role.role === normalized) ??
    store.users.find((candidate) => candidate.role.role === getRoleName(getDevModeRole())) ??
    store.users[0];

  setDevModeRole(getDevRoleFromUserRole(user.role.role));

  return {
    success: true,
    token: `dev-mode-token:${user.role.role}`,
    user_id: user.id,
    email_verified: true,
    verification_required: false,
    user,
    message: "Signed in with dev mode",
  };
}

export function mockGetProfile() {
  return {
    success: true,
    data: getMockCurrentUser(),
  };
}

export function mockGetCurrentUser() {
  return getMockCurrentUser();
}

export function mockLogout() {
  return { success: true };
}

function enrichProperty(property: MockProperty) {
  return property;
}

function enrichRoom(room: MockRoom) {
  return {
    ...room,
    media: dedupeRoomMedia(room.media),
  };
}

function getRoomMediaSignature(media: MockRoom["media"][number]) {
  return [
    media.url,
    media.label || "",
    media.created_at || "",
  ].join("::");
}

function dedupeRoomMedia(media: MockRoom["media"]) {
  const seen = new Set<string>();

  return media.filter((entry) => {
    const signature = getRoomMediaSignature(entry);
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  });
}

function getPropertyRooms(store: MockStore, propertyId: number) {
  const groupedRooms = new Map<string, MockRoom>();

  for (const room of store.rooms.filter((entry) => entry.property_id === propertyId)) {
    const key = room.room_name.trim().toLowerCase();
    const existing = groupedRooms.get(key);

    if (!existing) {
      groupedRooms.set(key, {
        ...room,
        damages: [...room.damages],
        media: [...room.media],
      });
      continue;
    }

    existing.window_count = Math.max(existing.window_count, room.window_count);
    existing.door_count = Math.max(existing.door_count, room.door_count);
    existing.dimensions = {
      ...existing.dimensions,
      floor_area: Math.max(existing.dimensions.floor_area, room.dimensions.floor_area),
      ceiling_height: Math.max(existing.dimensions.ceiling_height, room.dimensions.ceiling_height),
    };
    existing.damages.push(...room.damages);
    existing.media = dedupeRoomMedia([...existing.media, ...room.media]);
    existing.updated_at = existing.updated_at > room.updated_at ? existing.updated_at : room.updated_at;
  }

  return Array.from(groupedRooms.values()).map(enrichRoom);
}

function enrichJob(job: MockJob) {
  const store = getStore();
  const report = store.reports.find((item) => item.id === job.report_id);
  const property = report ? store.properties.find((item) => item.id === report.property_id) : undefined;
  const builder = job.builder_id ? store.users.find((item) => item.id === job.builder_id) : undefined;

  return {
    ...job,
    report: report
      ? {
          ...report,
          property: property
            ? {
                ...property,
                room_details: getPropertyRooms(store, property.id),
              }
            : undefined,
          user: store.users.find((item) => item.id === report.user_id),
        }
      : undefined,
    builder: builder
      ? {
          id: builder.id,
          name: builder.name,
          email: builder.email,
          phone: builder.contact_number,
        }
      : undefined,
    status_history: (job.status_history ?? []).map((entry) => ({
      ...entry,
      changed_by: store.users.find((item) => item.id === entry.changed_by_user_id)
        ? {
            id: store.users.find((item) => item.id === entry.changed_by_user_id)!.id,
            name: store.users.find((item) => item.id === entry.changed_by_user_id)!.name,
            role: store.users.find((item) => item.id === entry.changed_by_user_id)!.role.role,
          }
        : undefined,
    })),
  };
}

function appendJobStatusHistory(
  store: MockStore,
  job: MockJob,
  status: MockJob["status"],
  changedByUserId: number,
  note?: string,
) {
  job.status_history = job.status_history ?? [];
  job.status_history.unshift(
    createStatusHistoryEntry(
      nextId(store, "statusHistory"),
      status,
      nowIso(),
      changedByUserId,
      note,
    ),
  );
}

function recalculateReportFinancials(store: MockStore, report: MockReport) {
  const roomCount = store.rooms.filter((room) => room.property_id === report.property_id).length || 1;
  const base = Math.max(roomCount * 1650, 1650);
  report.labour_total = Math.round(base * 0.55);
  report.materials_total = Math.round(base * 0.45);
  report.vat_amount = Math.round((report.labour_total + report.materials_total) * 0.2);
  report.total_cost = report.labour_total + report.materials_total + report.vat_amount;
}

function enrichReport(report: MockReport) {
  const store = getStore();
  const property = store.properties.find((item) => item.id === report.property_id);
  const job = store.jobs.find((item) => item.report_id === report.id);

  return {
    ...report,
    property: property
      ? {
          ...property,
          room_details: getPropertyRooms(store, property.id),
        }
      : undefined,
    job: job ? enrichJob(job) : undefined,
  };
}

export function mockCreateProperty(data: Partial<MockProperty>) {
  return updateStore((store) => {
    const user = getMockCurrentUser();
    const id = nextId(store, "properties");
    const now = nowIso();
    const property: MockProperty = {
      id,
      user_id: user.id,
      address_line: String(data.address_line ?? data.address_line_1 ?? "New Property"),
      address_line_1: String(data.address_line_1 ?? data.address_line ?? "New Property"),
      city: String(data.city ?? "London"),
      postcode: String(data.postcode ?? "SW1A 1AA"),
      address_type: String(data.address_type ?? "residential"),
      property_type: String(data.property_type ?? data.property_type ?? "owned"),
      latitude: data.latitude,
      longitude: data.longitude,
      ownership_verified: false,
      created_at: now,
      updated_at: now,
      media: [],
    };

    store.properties.unshift(property);
    return { success: true, property: enrichProperty(property), message: "Property created in dev mode" };
  });
}

export function mockGetMyProperties() {
  const user = getMockCurrentUser();
  const properties = getStore().properties.filter((property) => property.user_id === user.id).map(enrichProperty);
  return { success: true, data: properties };
}

export function mockGetProperty(id: number) {
  const property = getStore().properties.find((item) => item.id === id);
  return property ? { success: true, data: enrichProperty(property) } : { success: false, message: "Property not found" };
}

export function mockUpdateProperty(id: number, data: Partial<MockProperty>) {
  return updateStore((store) => {
    const property = store.properties.find((item) => item.id === id);
    if (!property) return { success: false, message: "Property not found" };
    Object.assign(property, data, {
      updated_at: nowIso(),
      address_line: String(data.address_line ?? property.address_line),
      address_line_1: String(data.address_line_1 ?? data.address_line ?? property.address_line_1),
    });
    return { success: true, property: enrichProperty(property), message: "Property updated in dev mode" };
  });
}

export function mockDeleteProperty(id: number) {
  return updateStore((store) => {
    store.properties = store.properties.filter((item) => item.id !== id);
    store.rooms = store.rooms.filter((item) => item.property_id !== id);
    return { success: true, message: "Property removed in dev mode" };
  });
}

export function mockUploadOwnershipProof(propertyId: number, fileName: string) {
  return updateStore((store) => {
    const property = store.properties.find((item) => item.id === propertyId);
    if (!property) return { success: false, message: "Property not found" };
    const mediaId = nextId(store, "media");
    property.media = property.media ?? [];
    property.media.push({
      id: mediaId,
      url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800",
      label: fileName,
    });
    property.updated_at = nowIso();
    return { success: true, message: "Ownership proof captured in dev mode" };
  });
}

export function mockAddRoom(
  data: Omit<Partial<MockRoom>, "media"> & {
    property_id: number;
    room_name: string;
    media?: Array<{ url: string; label?: string; estimated_material_cost?: number }>;
  },
) {
  return updateStore((store) => {
    const id = nextId(store, "rooms");
    const room: MockRoom = {
      id,
      property_id: data.property_id,
      room_name: data.room_name,
      window_count: data.window_count ?? 0,
      door_count: data.door_count ?? 0,
      dimensions: data.dimensions ?? { floor_area: 0, ceiling_height: 0 },
      damages: data.damages ?? [],
      scan_status: "complete",
      created_at: nowIso(),
      updated_at: nowIso(),
      media: (data.media ?? []).map((media) => ({
        id: nextId(store, "media"),
        url: media.url,
        label: media.label,
        created_at: nowIso(),
        estimated_material_cost: media.estimated_material_cost,
      })),
    };
    store.rooms.push(room);
    return { success: true, data: enrichRoom(room), message: "Room created in dev mode" };
  });
}

export function mockListRooms(propertyId: number) {
  return { success: true, data: getStore().rooms.filter((room) => room.property_id === propertyId).map(enrichRoom) };
}

export function mockGetRoom(id: number) {
  const room = getStore().rooms.find((item) => item.id === id);
  return room ? { success: true, data: enrichRoom(room) } : { success: false, message: "Room not found" };
}

export function mockUpdateRoom(id: number, data: Partial<MockRoom>) {
  return updateStore((store) => {
    const room = store.rooms.find((item) => item.id === id);
    if (!room) return { success: false, message: "Room not found" };

    const matchingRooms = data.media
      ? store.rooms.filter(
          (item) =>
            item.property_id === room.property_id &&
            item.room_name.trim().toLowerCase() === room.room_name.trim().toLowerCase(),
        )
      : [room];

    for (const targetRoom of matchingRooms) {
      Object.assign(targetRoom, data, {
        media: data.media ? dedupeRoomMedia(data.media as MockRoom["media"]) : targetRoom.media,
        updated_at: nowIso(),
        scan_status: "complete",
      });
    }

    return { success: true, data: enrichRoom(room), message: "Room updated in dev mode" };
  });
}

export function mockUploadRoomPhoto(roomId: number, fileName: string) {
  return updateStore((store) => {
    const room = store.rooms.find((item) => item.id === roomId);
    if (!room) return { success: false, message: "Room not found" };
    const mediaId = nextId(store, "media");
    room.media.push({
      id: mediaId,
      url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=800",
      label: fileName,
      created_at: nowIso(),
    });
    room.updated_at = nowIso();
    return { success: true, message: "Photo added in dev mode" };
  });
}

export function mockGenerateReport(propertyId: number) {
  return updateStore((store) => {
    const property = store.properties.find((item) => item.id === propertyId);
    if (!property) return { success: false, message: "Property not found" };
    const id = nextId(store, "reports");
    const report: MockReport = {
      id,
      reference_number: `CLM-2026-${String(id).padStart(3, "0")}`,
      total_cost: 3850,
      vat_amount: 642,
      labour_total: 2100,
      materials_total: 1750,
      status: "draft",
      property_id: propertyId,
      user_id: getMockCurrentUser().id,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    recalculateReportFinancials(store, report);
    store.reports.unshift(report);
    return { success: true, data: enrichReport(report), message: "Draft report generated in dev mode" };
  });
}

export function mockSubmitReport(reportId: number) {
  return updateStore((store) => {
    const report = store.reports.find((item) => item.id === reportId);
    if (!report) return { success: false, message: "Report not found" };
    report.status = "submitted";
    report.updated_at = nowIso();

    const existingJob = store.jobs.find((item) => item.report_id === reportId);
    if (!existingJob) {
      const createdAt = nowIso();
      const newJob: MockJob = {
        id: nextId(store, "jobs"),
        report_id: report.id,
        status: "pending",
        contract_amount: report.total_cost,
        media: [],
        progress_updates: [],
        status_history: [],
        created_at: createdAt,
        updated_at: createdAt,
      };
      appendJobStatusHistory(store, newJob, "pending", report.user_id, "Claim submitted and waiting for builder acceptance.");
      store.jobs.unshift(newJob);
    }

    return { success: true, data: enrichReport(report), message: "Report submitted in dev mode" };
  });
}

export function mockListReports() {
  const user = getMockCurrentUser();
  const role = user.role.role;
  const store = getStore();
  const reports =
    role === "admin" || role === "claim_handler"
      ? store.reports
      : store.reports.filter((report) => report.user_id === user.id || store.jobs.some((job) => job.report_id === report.id && job.builder_id === user.id));
  return { success: true, data: reports.map(enrichReport) };
}

export function mockGetReport(id: number) {
  const report = getStore().reports.find((item) => item.id === id);
  return report ? { success: true, data: enrichReport(report) } : { success: false, message: "Report not found" };
}

export function mockApproveReport(id: number, insurerNotes?: string) {
  return updateStore((store) => {
    const report = store.reports.find((item) => item.id === id);
    if (!report) return { success: false, message: "Report not found" };
    report.status = "approved";
    report.insurer_notes = insurerNotes ?? "Approved in dev mode.";
    report.updated_at = nowIso();
    let job = store.jobs.find((item) => item.report_id === report.id);
    if (!job) {
      const createdAt = nowIso();
      job = {
        id: nextId(store, "jobs"),
        report_id: report.id,
        status: "pending",
        contract_amount: report.total_cost,
        media: [],
        progress_updates: [],
        status_history: [],
        created_at: createdAt,
        updated_at: createdAt,
      };
      appendJobStatusHistory(store, job, "pending", report.user_id, "Claim approved and released to builders.");
      store.jobs.unshift(job);
    }
    return { success: true, message: "Report approved in dev mode" };
  });
}

export function mockRejectReport(id: number, reason: string) {
  return updateStore((store) => {
    const report = store.reports.find((item) => item.id === id);
    if (!report) return { success: false, message: "Report not found" };
    report.status = "rejected";
    report.insurer_notes = reason;
    report.updated_at = nowIso();
    return { success: true, message: "Report rejected in dev mode" };
  });
}

export function mockDeleteReport(id: number) {
  return updateStore((store) => {
    const report = store.reports.find((item) => item.id === id);
    if (!report) return { success: false, message: "Claim not found" };

    const relatedJobIds = store.jobs
      .filter((job) => job.report_id === id)
      .map((job) => job.id);

    store.reports = store.reports.filter((item) => item.id !== id);
    store.jobs = store.jobs.filter((job) => job.report_id !== id);
    store.messages = store.messages.filter((message) => !relatedJobIds.includes(message.job_details_id));
    store.reviews = store.reviews.filter((review) => !relatedJobIds.includes(review.job_details_id));

    return { success: true, message: "Claim deleted in dev mode" };
  });
}

export function mockListAvailableJobs() {
  return {
    success: true,
    data: getStore().jobs.filter((job) => !job.builder_id && job.status === "pending").map(enrichJob),
  };
}

export function mockListJobs() {
  const user = getMockCurrentUser();
  const role = user.role.role;
  const jobs =
    role === "builder"
      ? getStore().jobs.filter((job) => job.builder_id === user.id || (!job.builder_id && job.status === "pending"))
      : role === "admin" || role === "claim_handler"
        ? getStore().jobs
        : getStore().jobs.filter((job) => {
            const report = getStore().reports.find((item) => item.id === job.report_id);
            return report?.user_id === user.id;
          });

  return { success: true, data: jobs.map(enrichJob) };
}

export function mockGetJob(id: number | string) {
  const job = getStore().jobs.find((item) => item.id === Number(id));
  return job ? { success: true, data: enrichJob(job) } : { success: false, message: "Job not found" };
}

export function mockUpdateJob(
  id: number | string,
  data: Partial<MockJob> & { total_cost?: number | string },
) {
  return updateStore((store) => {
    const job = store.jobs.find((item) => item.id === Number(id));
    if (!job) return { success: false, message: "Job not found" };
    const currentUser = getMockCurrentUser();
    const nextStatus = data.status;
    Object.assign(job, data, { updated_at: nowIso() });

    const report = store.reports.find((item) => item.id === job.report_id);
    if (report) {
      report.updated_at = nowIso();
      if (typeof data.total_cost === "number") {
        report.total_cost = data.total_cost;
      } else if (typeof data.total_cost === "string") {
        const parsedCost = Number(data.total_cost);
        if (Number.isFinite(parsedCost)) {
          report.total_cost = parsedCost;
        }
      }
      if (nextStatus === "completed") {
        report.status = "completed";
      } else if (nextStatus && ["accepted", "in_progress", "site_visit_booked"].includes(nextStatus)) {
        report.status = "approved";
      }
    }

    if (nextStatus && nextStatus !== job.status_history?.[0]?.status) {
      appendJobStatusHistory(store, job, nextStatus, currentUser.id, data.notes);
    }

    return { success: true, data: enrichJob(job), message: "Job updated in dev mode" };
  });
}

export function mockAcceptJob(reportId: number) {
  return updateStore((store) => {
    const job = store.jobs.find((item) => item.report_id === reportId) ?? store.jobs.find((item) => item.id === reportId);
    const currentUser = getMockCurrentUser();
    const builder =
      currentUser.role.role === "builder"
        ? currentUser
        : store.users.find((user) => user.role.role === "builder");
    if (!job || !builder) return { success: false, message: "Job not found" };
    job.builder_id = builder.id;
    job.status = "accepted";
    job.updated_at = nowIso();
    appendJobStatusHistory(store, job, "accepted", builder.id, "Builder accepted the claim.");
    return { success: true, data: enrichJob(job), message: "Job accepted in dev mode" };
  });
}

export function mockStartJob(id: number | string) {
  return mockUpdateJob(id, {
    status: "in_progress",
    actual_start_date: nowIso(),
  });
}

export function mockCompleteJob(id: number | string, finalInvoiceAmount?: number, notes?: string) {
  return mockUpdateJob(id, {
    status: "completed",
    final_invoice_amount: finalInvoiceAmount ?? 0,
    notes: notes ?? "Completed in dev mode",
  });
}

export function mockAddProgressUpdate(id: number | string, notes: string, materialsUsed?: { material_id: number; qty: number; cost: number }[]) {
  return updateStore((store) => {
    const job = store.jobs.find((item) => item.id === Number(id));
    if (!job) return { success: false, message: "Job not found" };
    job.status = "in_progress";
    job.progress_updates.unshift({
      id: job.progress_updates.length + 1,
      notes,
      materials_used: materialsUsed ?? [],
      created_at: nowIso(),
    });
    job.updated_at = nowIso();
    appendJobStatusHistory(store, job, "in_progress", getMockCurrentUser().id, notes);
    return { success: true, data: enrichJob(job), message: "Progress update saved in dev mode" };
  });
}

export function mockCreateClaimFromRoom(roomId: number) {
  return updateStore((store) => {
    const room = store.rooms.find((item) => item.id === roomId);
    if (!room) {
      return { success: false, message: "Room not found" };
    }

    const property = store.properties.find((item) => item.id === room.property_id);
    if (!property) {
      return { success: false, message: "Property not found" };
    }

    const currentUser = getMockCurrentUser();
    let report = store.reports.find(
      (item) =>
        item.property_id === property.id &&
        item.user_id === currentUser.id &&
        ["draft", "submitted", "approved"].includes(item.status),
    );

    if (!report) {
      const reportId = nextId(store, "reports");
      report = {
        id: reportId,
        reference_number: `CLM-2026-${String(reportId).padStart(3, "0")}`,
        total_cost: 0,
        vat_amount: 0,
        labour_total: 0,
        materials_total: 0,
        status: "submitted",
        property_id: property.id,
        user_id: currentUser.id,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      store.reports.unshift(report);
    } else {
      report.status = "submitted";
      report.updated_at = nowIso();
    }

    recalculateReportFinancials(store, report);

    let job = store.jobs.find((item) => item.report_id === report.id);
    if (!job) {
      const createdAt = nowIso();
      job = {
        id: nextId(store, "jobs"),
        report_id: report.id,
        status: "pending",
        contract_amount: report.total_cost,
        media: [],
        progress_updates: [],
        status_history: [],
        created_at: createdAt,
        updated_at: createdAt,
      };
      appendJobStatusHistory(store, job, "pending", currentUser.id, `Claim created from ${room.room_name}.`);
      store.jobs.unshift(job);
    } else {
      job.contract_amount = report.total_cost;
      job.updated_at = nowIso();
    }

    return {
      success: true,
      data: {
        id: job.id,
        room_id: room.id,
        homeowner_id: currentUser.id,
        report_id: report.id,
        status: job.status,
        total_cost: String(job.contract_amount),
        report_path: "",
        materials_used: [],
        report_media: null,
      },
      message: "Claim created in dev mode",
    };
  });
}

export function mockUploadProgressPhoto(jobId: number | string, fileName: string) {
  return updateStore((store) => {
    const job = store.jobs.find((item) => item.id === Number(jobId));
    if (!job) return { success: false, message: "Job not found" };
    job.media.unshift({
      id: nextId(store, "media"),
      url: "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&q=80&w=800",
      label: fileName,
      created_at: nowIso(),
    });
    job.updated_at = nowIso();
    return { success: true, message: "Progress photo saved in dev mode" };
  });
}

export function mockSignOffJob(id: number | string) {
  return mockUpdateJob(id, { notes: "Signed off by client in dev mode" });
}

export function mockGetJobInvoiceUrl(id: number | string) {
  return {
    success: true,
    url: `https://example.com/dev-mode/invoices/job-${id}.pdf`,
    message: "Using mock invoice",
  };
}

export function mockGetJobArchiveUrl(id: number | string) {
  return {
    success: true,
    url: `https://example.com/dev-mode/archive/job-${id}.zip`,
    message: "Using mock archive",
  };
}

export function mockSubmitReview(jobDetailsId: number, rating: number, review: string) {
  return updateStore((store) => {
    const entry: MockReview = {
      id: nextId(store, "reviews"),
      job_details_id: jobDetailsId,
      user_id: getMockCurrentUser().id,
      rating,
      review,
      created_at: nowIso(),
    };
    store.reviews.unshift(entry);
    return { success: true, data: { ...entry, user: getMockCurrentUser() } };
  });
}

export function mockListReviews() {
  const store = getStore();
  return {
    success: true,
    data: store.reviews.map((review) => ({
      ...review,
      user: store.users.find((item) => item.id === review.user_id),
    })),
  };
}

export function mockGetJobReview(jobDetailsId: number) {
  const review = getStore().reviews.find((item) => item.job_details_id === jobDetailsId);
  return review ? { success: true, data: { ...review, user: getStore().users.find((item) => item.id === review.user_id) } } : { success: true, data: undefined };
}

export function mockGetKycStatus() {
  const user = getMockCurrentUser();
  const submissions = getStore().kycSubmissions.filter((item) => item.user_id === user.id).sort((a, b) => b.id - a.id);
  return {
    kyc_status: user.kyc_status,
    latest_submission: submissions[0],
  };
}

export function mockSubmitKyc(documentType: string) {
  return updateStore((store) => {
    const user = store.users.find((item) => item.id === getMockCurrentUser().id);
    if (!user) throw new Error("User not found");
    user.kyc_status = "pending";
    store.kycSubmissions.unshift({
      id: nextId(store, "kycSubmissions"),
      user_id: user.id,
      document_type: documentType,
      status: "pending",
      rejection_reason: null,
      submitted_at: nowIso(),
      reviewed_at: null,
    });
    return { success: true, message: "KYC submitted in dev mode" };
  });
}

export function mockGetAdminKycList() {
  const store = getStore();
  return {
    data: store.kycSubmissions.map((submission) => ({
      ...submission,
      user: store.users.find((item) => item.id === submission.user_id),
    })),
    current_page: 1,
    last_page: 1,
    total: store.kycSubmissions.length,
  };
}

export function mockGetAdminKycDetail(kycId: string) {
  const store = getStore();
  const submission = store.kycSubmissions.find((item) => item.id === Number(kycId));
  if (!submission) throw new Error("KYC detail not found");
  return {
    ...submission,
    user: store.users.find((item) => item.id === submission.user_id),
  };
}

export function mockApproveKyc(kycId: string) {
  return updateStore((store) => {
    const submission = store.kycSubmissions.find((item) => item.id === Number(kycId));
    if (!submission) throw new Error("KYC detail not found");
    submission.status = "approved";
    submission.reviewed_at = nowIso();
    const user = store.users.find((item) => item.id === submission.user_id);
    if (user) user.kyc_status = "approved";
    return { success: true };
  });
}

export function mockRejectKyc(kycId: string, reason: string) {
  return updateStore((store) => {
    const submission = store.kycSubmissions.find((item) => item.id === Number(kycId));
    if (!submission) throw new Error("KYC detail not found");
    submission.status = "rejected";
    submission.rejection_reason = reason;
    submission.reviewed_at = nowIso();
    const user = store.users.find((item) => item.id === submission.user_id);
    if (user) user.kyc_status = "rejected";
    return { success: true };
  });
}

export function mockGetAdminUsers(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  role?: string;
  status?: string;
}) {
  let users = [...getStore().users];
  if (params?.search) {
    const search = params.search.toLowerCase();
    users = users.filter((user) => user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search));
  }
  if (params?.role) {
    users = users.filter((user) => user.role.role === params.role);
  }
  if (params?.status === "active") {
    users = users.filter((user) => user.is_active === 1);
  }
  return {
    success: true,
    data: users.map((user) => ({
      ...user,
      properties_count: getStore().properties.filter((property) => property.user_id === user.id).length,
      reports_count: getStore().reports.filter((report) => report.user_id === user.id).length,
    })),
    total: users.length,
    per_page: users.length,
    current_page: 1,
    last_page: 1,
  };
}

export function mockGetAdminUser(id: number) {
  const user = getStore().users.find((item) => item.id === id);
  return user ? { success: true, data: user } : { success: false, message: "User not found" };
}

export function mockUpdateAdminUser(id: number, data: Partial<MockUser> & { role_id?: number }) {
  return updateStore((store) => {
    const user = store.users.find((item) => item.id === id);
    if (!user) return { success: false, message: "User not found" };
    if (typeof data.is_active === "number") user.is_active = data.is_active;
    if (typeof data.contact_number === "string") user.contact_number = data.contact_number;
    if (typeof data.name === "string") user.name = data.name;
    if (typeof data.role_id === "number") {
      const roles: Record<number, RoleName> = { 1: "client", 2: "builder", 3: "admin", 4: "claim_handler" };
      user.role = { id: data.role_id, role: roles[data.role_id] ?? user.role.role };
    }
    return { success: true, data: user, message: "User updated in dev mode" };
  });
}

export function mockDeleteAdminUser(id: number) {
  return updateStore((store) => {
    store.users = store.users.filter((item) => item.id !== id);
    return { success: true };
  });
}

export function mockGetChatHistory(jobId: number | string) {
  return {
    success: true,
    data: getStore().messages.filter((message) => message.job_details_id === Number(jobId)),
  };
}

export function mockSendMessage(jobId: number | string, data: { message: string; type: "text" | "photo"; attachment_url?: string }) {
  return updateStore((store) => {
    const user = getMockCurrentUser();
    const role = user.role.role === "builder" ? "builder" : user.role.role === "admin" ? "admin" : "client";
    const message: MockMessage = {
      id: nextId(store, "messages"),
      job_details_id: Number(jobId),
      user_id: user.id,
      sender_name: user.name,
      sender_role: role,
      message: data.message,
      type: data.type,
      attachment_url: data.attachment_url,
      is_read: false,
      created_at: nowIso(),
    };
    store.messages.push(message);
    return { success: true, data: message };
  });
}

export function mockGetUnreadCount(jobId: number | string) {
  return {
    success: true,
    count: getStore().messages.filter((message) => message.job_details_id === Number(jobId) && !message.is_read).length,
  };
}
