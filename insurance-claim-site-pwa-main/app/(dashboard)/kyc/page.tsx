"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  FileText,
  Loader2,
  Mail,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import {
  BuilderKycRecord,
  getKYCStatus,
  submitKYC,
  updateKYC,
} from "@/lib/kyc";

function isBuilderRole(role?: string) {
  return role?.toLowerCase() === "builder";
}

export default function KYCPage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [existingKyc, setExistingKyc] = useState<BuilderKycRecord | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessContact, setBusinessContact] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [companyRegistrationNumber, setCompanyRegistrationNumber] = useState("");
  const [newUploads, setNewUploads] = useState<File[]>([]);
  const [removeDocumentIds, setRemoveDocumentIds] = useState<number[]>([]);

  const role = user?.role?.role;
  const isBuilder = isBuilderRole(role);

  useEffect(() => {
    if (authLoading) return;
    if (!token || !isBuilder) {
      setIsLoading(false);
      return;
    }

    const loadKyc = async () => {
      try {
        const status = await getKYCStatus(token);
        if (status.data) {
          setExistingKyc(status.data);
          setBusinessName(status.data.business_name || "");
          setBusinessEmail(status.data.business_email || "");
          setBusinessContact(status.data.business_contact || "");
          setVatNumber(status.data.business_vat_number || "");
          setPanNumber(status.data.business_pan_number || "");
          setCompanyRegistrationNumber(
            status.data.company_registration_number || "",
          );
        } else {
          setBusinessEmail(user?.email || "");
          setBusinessContact(user?.contact_number || "");
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load KYC";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadKyc();
  }, [authLoading, isBuilder, token, user?.contact_number, user?.email]);

  const visibleDocuments = useMemo(
    () =>
      (existingKyc?.documents || []).filter(
        (document) => !removeDocumentIds.includes(document.id),
      ),
    [existingKyc?.documents, removeDocumentIds],
  );

  const handleUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    setNewUploads((current) => [...current, ...files]);
    event.target.value = "";
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) {
      toast.error("You must be logged in to save KYC.");
      return;
    }

    if (!businessName.trim() || !businessEmail.trim() || !businessContact.trim()) {
      toast.error("Business name, email, and contact are required.");
      return;
    }

    if (!existingKyc && newUploads.length === 0) {
      toast.error("Add at least one supporting document.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        business_name: businessName.trim(),
        business_email: businessEmail.trim(),
        business_contact: businessContact.trim(),
        business_vat_number: vatNumber.trim(),
        business_pan_number: panNumber.trim(),
        company_registration_number: companyRegistrationNumber.trim(),
        uploads: newUploads,
        remove_document_ids: removeDocumentIds,
      };

      const saved = existingKyc
        ? await updateKYC(payload, token)
        : await submitKYC(payload, token);

      setExistingKyc(saved);
      setBusinessName(saved.business_name || "");
      setBusinessEmail(saved.business_email || "");
      setBusinessContact(saved.business_contact || "");
      setVatNumber(saved.business_vat_number || "");
      setPanNumber(saved.business_pan_number || "");
      setCompanyRegistrationNumber(saved.company_registration_number || "");
      setNewUploads([]);
      setRemoveDocumentIds([]);

      toast.success(
        existingKyc
          ? "Builder KYC updated successfully."
          : "Builder KYC submitted successfully.",
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save KYC.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!isBuilder) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4">
        <div className="bg-white border border-neutral-100 rounded-3xl p-10 text-center space-y-6">
          <div className="mx-auto size-20 rounded-3xl bg-neutral-100 flex items-center justify-center text-neutral-500">
            <ShieldCheck className="size-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
              Builder KYC Only
            </h1>
            <p className="text-neutral-500 max-w-lg mx-auto">
              Homeowner KYC is not required right now. This page is only used for
              builder business verification.
            </p>
          </div>
          <Link href="/dashboard">
            <Button className="rounded-full h-12 px-6">
              Return to Dashboard
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-bold uppercase tracking-widest border border-primary/10">
          <ShieldCheck className="size-4" />
          Builder Verification
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900">
          Builder KYC
        </h1>
        <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
          Add your business details and supporting documents so the platform can
          keep your builder profile on file.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-neutral-100 rounded-3xl p-8 space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-neutral-900">
                Business Details
              </h2>
              <p className="text-neutral-500">
                These fields map directly to the current `/api/kyc/` backend.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="business_name">Business Name</Label>
                <Input
                  id="business_name"
                  value={businessName}
                  onChange={(event) => setBusinessName(event.target.value)}
                  placeholder="Acme Restoration Ltd"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_email">Business Email</Label>
                <Input
                  id="business_email"
                  type="email"
                  value={businessEmail}
                  onChange={(event) => setBusinessEmail(event.target.value)}
                  placeholder="trade@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_contact">Business Contact</Label>
                <Input
                  id="business_contact"
                  value={businessContact}
                  onChange={(event) => setBusinessContact(event.target.value)}
                  placeholder="+44 20 1234 5678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vat_number">VAT Number</Label>
                <Input
                  id="vat_number"
                  value={vatNumber}
                  onChange={(event) => setVatNumber(event.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pan_number">PAN Number</Label>
                <Input
                  id="pan_number"
                  value={panNumber}
                  onChange={(event) => setPanNumber(event.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="company_registration_number">
                  Company Registration Number
                </Label>
                <Input
                  id="company_registration_number"
                  value={companyRegistrationNumber}
                  onChange={(event) =>
                    setCompanyRegistrationNumber(event.target.value)
                  }
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="documents">Supporting Documents</Label>
                <div className="rounded-2xl border border-dashed border-neutral-200 p-5 bg-neutral-50/70">
                  <input
                    id="documents"
                    type="file"
                    multiple
                    onChange={handleUploadChange}
                    className="block w-full text-sm text-neutral-600 file:mr-4 file:rounded-full file:border-0 file:bg-neutral-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-neutral-800"
                  />
                  <p className="text-xs text-neutral-500 mt-3">
                    Upload company registration, insurance, trade certificates, or
                    other supporting files. You can attach multiple documents.
                  </p>
                </div>
              </div>

              {visibleDocuments.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-neutral-700">
                    Current Documents
                  </p>
                  {visibleDocuments.map((document) => (
                    <div
                      key={document.id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-100 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {document.file.split("/").pop()}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {document.file_type || "document"} · {Math.round(document.file_size / 1024)} KB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setRemoveDocumentIds((current) => [...current, document.id])
                        }
                        className="shrink-0 rounded-full"
                      >
                        <Trash2 className="size-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : null}

              {newUploads.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-neutral-700">
                    New Uploads
                  </p>
                  {newUploads.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-100 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {Math.round(file.size / 1024)} KB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setNewUploads((current) =>
                            current.filter((_, fileIndex) => fileIndex !== index),
                          )
                        }
                        className="shrink-0 rounded-full"
                      >
                        <Trash2 className="size-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
              <p className="text-sm text-neutral-500">
                {existingKyc
                  ? "Update your existing builder KYC record."
                  : "Submit your builder KYC record for the first time."}
              </p>
              <Button
                type="submit"
                disabled={isSaving}
                className="rounded-full h-12 px-6"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Saving
                  </>
                ) : existingKyc ? (
                  "Update Builder KYC"
                ) : (
                  "Submit Builder KYC"
                )}
              </Button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-neutral-100 rounded-3xl p-6 space-y-4">
            <div className="size-14 rounded-2xl bg-primary/5 text-primary border border-primary/10 flex items-center justify-center">
              <Building2 className="size-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">
                What This Saves
              </h3>
              <p className="text-sm text-neutral-500 mt-1">
                Business profile fields plus any uploaded supporting documents.
              </p>
            </div>
            <div className="space-y-3 text-sm text-neutral-600">
              <div className="flex items-center gap-3">
                <Mail className="size-4 text-neutral-400" />
                Business email and contact details
              </div>
              <div className="flex items-center gap-3">
                <FileText className="size-4 text-neutral-400" />
                VAT, PAN, and company registration info
              </div>
              <div className="flex items-center gap-3">
                <Upload className="size-4 text-neutral-400" />
                Uploaded verification documents
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 text-white rounded-3xl p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
              Current State
            </p>
            <p className="text-lg font-semibold mt-2">
              {existingKyc ? "Builder KYC on file" : "Builder KYC not submitted"}
            </p>
            <p className="text-sm text-neutral-300 mt-2 leading-relaxed">
              The current backend supports builder create, fetch, and update at
              `/api/kyc/`. Homeowner KYC is intentionally disabled in the UI.
            </p>
          </div>

          <div className="bg-white border border-neutral-100 rounded-3xl p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
              Need Help
            </p>
            <Textarea
              value="If backend validation changes later, keep this page aligned to the six current fields and the uploads/remove_document_ids arrays."
              readOnly
              className="mt-3 bg-neutral-50 border-neutral-100 text-neutral-600 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
