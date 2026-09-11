"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Loader2,
  MapPin,
  ShieldCheck,
  Upload,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type FileField =
  | "businessRegistration"
  | "businessLicense"
  | "pharmacyLicense"
  | "pharmacyPhoto"
  | "ownerIdDocument";

type FormState = {
  pharmacyName: string;
  phone: string;
  address: string;
  pharmacyEmail: string;
  tinNumber: string;
  openingHours: string;

  ownerName: string;
  ownerIdNumber: string;
  ownerEmail: string;

  password: string;
  confirmPassword: string;

  latitude: string;
  longitude: string;
};

type ApiErrorResponse = {
  message?: string | string[];
};

const initialForm: FormState = {
  pharmacyName: "",
  phone: "",
  address: "",
  pharmacyEmail: "",
  tinNumber: "",
  openingHours: "",

  ownerName: "",
  ownerIdNumber: "",
  ownerEmail: "",

  password: "",
  confirmPassword: "",

  latitude: "",
  longitude: "",
};

const initialFiles: Record<FileField, File | null> = {
  businessRegistration: null,
  businessLicense: null,
  pharmacyLicense: null,
  pharmacyPhoto: null,
  ownerIdDocument: null,
};

export default function PharmacyRegisterPage() {
  const [form, setForm] = useState<FormState>(initialForm);

  const [files, setFiles] =
    useState<Record<FileField, File | null>>(initialFiles);

  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function detectLocation() {
    setError("");
    setSuccess("");

    if (!navigator.geolocation) {
      setError("Location detection is not supported by your browser.");
      return;
    }

    setDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toFixed(6);
        const longitude = position.coords.longitude.toFixed(6);

        setForm((current) => ({
          ...current,
          latitude,
          longitude,
        }));

        setDetectingLocation(false);
      },
      (locationError) => {
        setDetectingLocation(false);

        switch (locationError.code) {
          case locationError.PERMISSION_DENIED:
            setError(
              "Location permission was denied. Please allow location access in your browser and try again.",
            );
            break;

          case locationError.POSITION_UNAVAILABLE:
            setError(
              "Your current location could not be determined. Please try again.",
            );
            break;

          case locationError.TIMEOUT:
            setError("Location detection timed out. Please try again.");
            break;

          default:
            setError("Unable to detect your location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }

  function handleFileChange(
    field: FileField,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setFiles((current) => ({
        ...current,
        [field]: null,
      }));

      return;
    }

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setError("Only PDF, JPG, JPEG, and PNG files are allowed.");

      event.target.value = "";
      return;
    }

    if (file.size > maxSize) {
      setError("Each uploaded file must be 5 MB or smaller.");

      event.target.value = "";
      return;
    }

    setError("");

    setFiles((current) => ({
      ...current,
      [field]: file,
    }));
  }

  function validateForm(): string | null {
    if (!form.pharmacyName.trim()) {
      return "Pharmacy name is required.";
    }

    if (!form.address.trim()) {
      return "Pharmacy address is required.";
    }

    if (!form.phone.trim()) {
      return "Pharmacy phone number is required.";
    }

    if (!form.pharmacyEmail.trim()) {
      return "Pharmacy email is required.";
    }

    if (!form.tinNumber.trim()) {
      return "TIN number is required.";
    }

    if (!form.ownerName.trim()) {
      return "Owner name is required.";
    }

    if (!form.ownerIdNumber.trim()) {
      return "Owner ID number is required.";
    }

    if (!form.ownerEmail.trim()) {
      return "Owner email is required.";
    }

    if (!form.password) {
      return "Password is required.";
    }

    if (form.password.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (form.password !== form.confirmPassword) {
      return "Passwords do not match.";
    }

    if (!files.pharmacyLicense) {
      return "Pharmacy license document is required.";
    }

    if (!files.ownerIdDocument) {
      return "Owner ID document is required.";
    }

    if (
      form.latitude.trim() &&
      (Number.isNaN(Number(form.latitude)) ||
        Number(form.latitude) < -90 ||
        Number(form.latitude) > 90)
    ) {
      return "Latitude must be between -90 and 90.";
    }

    if (
      form.longitude.trim() &&
      (Number.isNaN(Number(form.longitude)) ||
        Number(form.longitude) < -180 ||
        Number(form.longitude) > 180)
    ) {
      return "Longitude must be between -180 and 180.";
    }

    return null;
  }

  function getApiErrorMessage(
    data: ApiErrorResponse,
    fallback: string,
  ): string {
    if (Array.isArray(data.message)) {
      return data.message.join(", ");
    }

    if (typeof data.message === "string") {
      return data.message;
    }

    return fallback;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("pharmacyName", form.pharmacyName.trim());

      formData.append("phone", form.phone.trim());

      formData.append("address", form.address.trim());

      formData.append("pharmacyEmail", form.pharmacyEmail.trim());

      formData.append("tinNumber", form.tinNumber.trim());

      if (form.openingHours.trim()) {
        formData.append("openingHours", form.openingHours.trim());
      }

      formData.append("ownerName", form.ownerName.trim());

      formData.append("ownerIdNumber", form.ownerIdNumber.trim());

      formData.append("email", form.ownerEmail.trim());

      formData.append("password", form.password);

      /*
       * Send coordinates only when they exist.
       * Empty strings are not sent because the backend
       * expects numeric values when coordinates are present.
       */
      if (form.latitude.trim()) {
        formData.append("latitude", String(Number(form.latitude)));
      }

      if (form.longitude.trim()) {
        formData.append("longitude", String(Number(form.longitude)));
      }

      if (files.businessRegistration) {
        formData.append("businessRegistration", files.businessRegistration);
      }

      if (files.businessLicense) {
        formData.append("businessLicense", files.businessLicense);
      }

      if (files.pharmacyLicense) {
        formData.append("pharmacyLicense", files.pharmacyLicense);
      }

      if (files.pharmacyPhoto) {
        formData.append("pharmacyPhoto", files.pharmacyPhoto);
      }

      if (files.ownerIdDocument) {
        formData.append("ownerIdDocument", files.ownerIdDocument);
      }

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as ApiErrorResponse;

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(data, "Unable to submit pharmacy registration."),
        );
      }

      setSuccess(
        "Pharmacy registration submitted successfully. Your application is now pending administrator verification.",
      );

      setForm(initialForm);
      setFiles(initialFiles);

      const fileInputs =
        document.querySelectorAll<HTMLInputElement>('input[type="file"]');

      fileInputs.forEach((input) => {
        input.value = "";
      });
    } catch (registrationError) {
      setError(
        registrationError instanceof Error
          ? registrationError.message
          : "Unable to submit pharmacy registration.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
              <Image
                src="/images/smartpharma logo.png"
                alt="SmartPharma"
                width={56}
                height={56}
                className="h-full w-full object-contain"
                priority
              />
            </div>

            <div>
              <p className="font-bold text-slate-900">SmartPharma</p>

              <p className="text-xs text-slate-500">Pharmacy registration</p>
            </div>
          </Link>

          <Link
            href="/pharmacy/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Pharmacy login
          </Link>
        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        {/* Title */}
        <div className="mb-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Register your pharmacy
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Submit your pharmacy information and legal documents for
                SmartPharma verification.
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p>{success}</p>

              <p className="mt-1 font-normal text-emerald-600">
                An administrator must review the submitted information before
                the pharmacy becomes visible to patients.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pharmacy Information */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
              number="1"
              title="Pharmacy information"
              description="Provide the official information for your pharmacy."
            />

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Input
                label="Pharmacy name"
                required
                value={form.pharmacyName}
                onChange={(value) => updateField("pharmacyName", value)}
                placeholder="Sunrise Community Pharmacy"
              />

              <Input
                label="Phone number"
                required
                value={form.phone}
                onChange={(value) => updateField("phone", value)}
                placeholder="0911223344"
              />

              <Input
                label="Pharmacy email"
                type="email"
                required
                value={form.pharmacyEmail}
                onChange={(value) => updateField("pharmacyEmail", value)}
                placeholder="pharmacy@example.com"
              />

              <Input
                label="TIN number"
                required
                value={form.tinNumber}
                onChange={(value) => updateField("tinNumber", value)}
                placeholder="Enter your Ethiopian TIN"
              />

              <div className="md:col-span-2">
                <Input
                  label="Pharmacy address"
                  required
                  value={form.address}
                  onChange={(value) => updateField("address", value)}
                  placeholder="Jimma, Oromia, Ethiopia"
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Opening hours"
                  value={form.openingHours}
                  onChange={(value) => updateField("openingHours", value)}
                  placeholder="Monday - Sunday, 8:00 AM - 8:00 PM"
                />
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
              number="2"
              title="Pharmacy location"
              description="Detect your current location automatically or enter the coordinates manually."
            />

            <div className="mt-6">
              <button
                type="button"
                onClick={detectLocation}
                disabled={detectingLocation}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {detectingLocation ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Detecting location...
                  </>
                ) : (
                  <>
                    <MapPin className="h-5 w-5" />
                    Detect my location
                  </>
                )}
              </button>

              <p className="mt-2 text-xs text-slate-500">
                Your browser will ask for permission to access your location.
              </p>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Input
                label="Latitude"
                type="number"
                value={form.latitude}
                onChange={(value) => updateField("latitude", value)}
                placeholder="7.6731"
                min="-90"
                max="90"
                step="any"
              />

              <Input
                label="Longitude"
                type="number"
                value={form.longitude}
                onChange={(value) => updateField("longitude", value)}
                placeholder="36.8344"
                min="-180"
                max="180"
                step="any"
              />
            </div>

            {form.latitude && form.longitude && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                  <div>
                    <p className="text-sm font-semibold text-emerald-800">
                      Location detected successfully
                    </p>

                    <p className="mt-1 text-sm text-emerald-700">
                      Latitude: {form.latitude}
                    </p>

                    <p className="text-sm text-emerald-700">
                      Longitude: {form.longitude}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 flex items-start gap-3 rounded-xl bg-slate-50 p-4">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />

              <p className="text-sm leading-6 text-slate-600">
                These coordinates help patients find your pharmacy on the
                SmartPharma map. You can also edit them manually if necessary.
              </p>
            </div>
          </section>

          {/* Owner */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
              number="3"
              title="Owner information"
              description="The owner identity must correspond to the submitted business information."
            />

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Input
                label="Owner full name"
                required
                value={form.ownerName}
                onChange={(value) => updateField("ownerName", value)}
                placeholder="Abebe Bekele"
              />

              <Input
                label="Owner ID number"
                required
                value={form.ownerIdNumber}
                onChange={(value) => updateField("ownerIdNumber", value)}
                placeholder="Enter government-issued ID number"
              />

              <div className="md:col-span-2">
                <Input
                  label="Owner email"
                  type="email"
                  required
                  value={form.ownerEmail}
                  onChange={(value) => updateField("ownerEmail", value)}
                  placeholder="owner@example.com"
                />
              </div>
            </div>
          </section>

          {/* Security */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
              number="4"
              title="Account security"
              description="Create the login credentials for the pharmacy owner account."
            />

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Input
                label="Password"
                type="password"
                required
                value={form.password}
                onChange={(value) => updateField("password", value)}
                placeholder="At least 8 characters"
              />

              <Input
                label="Confirm password"
                type="password"
                required
                value={form.confirmPassword}
                onChange={(value) => updateField("confirmPassword", value)}
                placeholder="Repeat your password"
              />
            </div>
          </section>

          {/* Documents */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
              number="5"
              title="Legal documents"
              description="Upload documents that allow the administrator to verify your pharmacy."
            />

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <FileInput
                label="Business registration"
                field="businessRegistration"
                file={files.businessRegistration}
                onChange={handleFileChange}
              />

              <FileInput
                label="Business license"
                field="businessLicense"
                file={files.businessLicense}
                onChange={handleFileChange}
              />

              <FileInput
                label="Pharmacy license"
                required
                field="pharmacyLicense"
                file={files.pharmacyLicense}
                onChange={handleFileChange}
              />

              <FileInput
                label="Pharmacy photo"
                field="pharmacyPhoto"
                file={files.pharmacyPhoto}
                onChange={handleFileChange}
              />

              <div className="md:col-span-2">
                <FileInput
                  label="Owner ID document"
                  required
                  field="ownerIdDocument"
                  file={files.ownerIdDocument}
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-800">
                Document requirements
              </p>

              <p className="mt-1 text-sm leading-6 text-amber-700">
                Files must be PDF, JPG, JPEG, or PNG format and must not exceed
                5 MB each. Pharmacy license and owner ID are required.
              </p>
            </div>
          </section>

          {/* Verification Process */}
          <section className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
            <div className="flex items-start gap-4">
              <ShieldCheck className="mt-1 h-6 w-6 shrink-0" />

              <div>
                <h2 className="text-lg font-bold">Verification process</h2>

                <div className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                  <p>1. Submit your pharmacy information and documents.</p>

                  <p>
                    2. SmartPharma places your application into pending
                    verification.
                  </p>

                  <p>
                    3. An administrator reviews the owner identity, TIN,
                    business documents, and pharmacy license.
                  </p>

                  <p>4. Approved pharmacies become visible to patients.</p>

                  <p>
                    5. Applications with incorrect or insufficient documentation
                    may be rejected with a reason.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-slate-900">Ready to submit?</p>

              <p className="mt-1 text-sm text-slate-500">
                Make sure your information and documents are accurate before
                submitting.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  Submit registration
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

function SectionHeader({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
        {number}
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  min,
  max,
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  min?: string;
  max?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        step={step}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
      />
    </label>
  );
}

function FileInput({
  label,
  field,
  file,
  required = false,
  onChange,
}: {
  label: string;
  field: FileField;
  file: File | null;
  required?: boolean;
  onChange: (field: FileField, event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="block cursor-pointer">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </span>

      <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 transition hover:border-slate-400 hover:bg-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
            {file ? (
              <FileText className="h-5 w-5" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
          </div>

          <div className="min-w-0">
            {file ? (
              <>
                <p className="truncate text-sm font-semibold text-slate-900">
                  {file.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {formatFileSize(file.size)}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-slate-700">
                  Choose a file
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  PDF, JPG, JPEG, or PNG · Max 5 MB
                </p>
              </>
            )}
          </div>
        </div>

        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          onChange={(event) => onChange(field, event)}
          className="sr-only"
        />
      </div>
    </label>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
