"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  FileImage,
  ImagePlus,
  MapPin,
  Phone,
  ScanLine,
  Upload,
  X,
} from "lucide-react";
import PatientNavigation from "@/components/patient/PatientNavigation";
import { Button } from "@/components/ui/button";

type PharmacyResult = {
  pharmacyId: number;
  pharmacyName: string;
  address: string;
  phone?: string | null;
  quantity: number;
  price: number;
  stockStatus: string;
  section?: string | null;
  shelf?: string | null;
  row?: string | null;
};

type MatchedMedicine = {
  id: number;
  name: string;
  genericName?: string | null;
  category?: string | null;
  pharmacies: PharmacyResult[];
};

type ScanResponse = {
  success: boolean;
  message?: string;
  filename?: string;
  text?: string;
  medicines?: MatchedMedicine[];
};

export default function ScanPrescriptionPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [message, setMessage] = useState("");
  const [scanning, setScanning] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [medicines, setMedicines] = useState<MatchedMedicine[]>([]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setMessage("");
    setOcrText("");
    setMedicines([]);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const clearFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl("");
    setMessage("");
    setOcrText("");
    setMedicines([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleScan = async () => {
    if (!selectedFile) {
      setMessage("Please upload a prescription image first.");
      return;
    }

    setScanning(true);
    setMessage("");
    setOcrText("");
    setMedicines([]);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("http://localhost:4000/prescription/scan", {
        method: "POST",
        body: formData,
      });

      const data: ScanResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to scan the prescription.");
      }

      setOcrText(data.text || "");
      setMedicines(data.medicines || []);

      if (data.text) {
        setMessage("Prescription scanned successfully.");
      } else {
        setMessage(
          "The prescription was uploaded, but no readable text was detected.",
        );
      }
    } catch (error) {
      console.error("Prescription scan error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while scanning the prescription.",
      );
    } finally {
      setScanning(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <PatientNavigation activePath="/scan-prescription" />

      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="max-w-3xl">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <ScanLine className="h-7 w-7" />
            </div>

            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Smart prescription scanning
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Scan Your Prescription
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Upload a clear photo of your prescription and SmartPharma will
              read the text and check which medicines are available in approved
              pharmacies.
            </p>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Upload Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <FileImage className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Upload prescription
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Use JPG, JPEG, PNG, or another common image format.
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {!previewUrl ? (
              <button
                type="button"
                onClick={handleUploadClick}
                className="mt-8 flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center transition hover:border-slate-500 hover:bg-white"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">
                  <Upload className="h-7 w-7" />
                </div>

                <h3 className="mt-5 text-base font-semibold text-slate-900">
                  Choose prescription image
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Click here to select an image from your computer
                </p>
              </button>
            ) : (
              <div className="mt-8">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex min-h-[360px] items-center justify-center">
                    <Image
                      src={previewUrl}
                      alt="Uploaded prescription preview"
                      width={1000}
                      height={1000}
                      unoptimized
                      className="max-h-[520px] max-w-full rounded-xl object-contain shadow-sm"
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    onClick={handleScan}
                    disabled={scanning}
                    className="h-12 flex-1 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                  >
                    <ScanLine className="mr-2 h-5 w-5" />

                    {scanning
                      ? "Scanning prescription..."
                      : "Scan Prescription"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUploadClick}
                    disabled={scanning}
                    className="h-12 rounded-xl border-slate-300"
                  >
                    <ImagePlus className="mr-2 h-5 w-5" />
                    Choose Another
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearFile}
                    disabled={scanning}
                    className="h-12 rounded-xl border-slate-300"
                  >
                    <X className="mr-2 h-5 w-5" />
                    Clear
                  </Button>
                </div>
              </div>
            )}

            {message && (
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  {message.includes("successfully") ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  ) : (
                    <Camera className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
                  )}

                  <p>{message}</p>
                </div>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">
                Get better results
              </h2>

              <div className="mt-6 space-y-5">
                <div className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700">
                    1
                  </div>

                  <div>
                    <h3 className="font-medium text-slate-900">
                      Use good lighting
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Make sure the prescription is bright and easy to read.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700">
                    2
                  </div>

                  <div>
                    <h3 className="font-medium text-slate-900">
                      Keep the image sharp
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Avoid blurry or heavily compressed prescription photos.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700">
                    3
                  </div>

                  <div>
                    <h3 className="font-medium text-slate-900">
                      Capture the whole prescription
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Include all medicine names and instructions in the image.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
              <h2 className="text-xl font-semibold">How SmartPharma helps</h2>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                After reading the prescription, SmartPharma compares detected
                medicine names with its medicine database and shows currently
                available stock from approved pharmacies.
              </p>
            </div>
          </div>
        </div>

        {/* Scan Results */}
        {ocrText && (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {/* Results Header */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                <ScanLine className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Scan Results
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Medicines and pharmacy availability found from your
                  prescription
                </p>
              </div>
            </div>

            {/* Matched Medicines */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Matched medicines
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Medicines matched with the SmartPharma database
                  </p>
                </div>

                {medicines.length > 0 && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {medicines.length}{" "}
                    {medicines.length === 1 ? "medicine" : "medicines"}
                  </span>
                )}
              </div>

              {medicines.length > 0 ? (
                <div className="mt-5 space-y-6">
                  {medicines.map((medicine) => (
                    <div
                      key={medicine.id}
                      className="overflow-hidden rounded-2xl border border-slate-200"
                    >
                      {/* Medicine Header */}
                      <div className="bg-slate-50 p-5 sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h4 className="text-xl font-bold text-slate-900">
                              {medicine.name}
                            </h4>

                            {medicine.genericName && (
                              <p className="mt-1 text-sm text-slate-500">
                                Generic name:{" "}
                                <span className="font-medium text-slate-700">
                                  {medicine.genericName}
                                </span>
                              </p>
                            )}
                          </div>

                          {medicine.category && (
                            <span className="w-fit rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                              {medicine.category}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Pharmacy Section */}
                      <div className="p-5 sm:p-6">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h5 className="font-semibold text-slate-900">
                              Available pharmacies
                            </h5>

                            <p className="mt-1 text-xs text-slate-500">
                              Pharmacies with available stock
                            </p>
                          </div>

                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                            {medicine.pharmacies.length}{" "}
                            {medicine.pharmacies.length === 1
                              ? "pharmacy"
                              : "pharmacies"}
                          </span>
                        </div>

                        {medicine.pharmacies.length > 0 ? (
                          <div className="mt-5 grid gap-5 lg:grid-cols-2">
                            {medicine.pharmacies.map((pharmacy) => (
                              <div
                                key={`${medicine.id}-${pharmacy.pharmacyId}`}
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                              >
                                {/* Pharmacy Name */}
                                <div className="flex items-start gap-4">
                                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                                    <MapPin className="h-5 w-5" />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                      <div>
                                        <h6 className="font-semibold text-slate-900">
                                          {pharmacy.pharmacyName}
                                        </h6>

                                        <p className="mt-1 text-sm leading-5 text-slate-500">
                                          {pharmacy.address}
                                        </p>
                                      </div>

                                      <span
                                        className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                                          pharmacy.stockStatus === "AVAILABLE"
                                            ? "bg-slate-900 text-white"
                                            : pharmacy.stockStatus ===
                                                "LOW_STOCK"
                                              ? "bg-slate-200 text-slate-700"
                                              : "bg-slate-100 text-slate-500"
                                        }`}
                                      >
                                        {pharmacy.stockStatus.replace(
                                          /_/g,
                                          " ",
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Price & Stock */}
                                <div className="mt-5 grid grid-cols-2 gap-3">
                                  <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                      Price
                                    </p>

                                    <p className="mt-1 text-xl font-bold text-slate-900">
                                      {pharmacy.price.toFixed(2)}
                                    </p>
                                  </div>

                                  <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                      In stock
                                    </p>

                                    <p className="mt-1 text-xl font-bold text-slate-900">
                                      {pharmacy.quantity}
                                    </p>

                                    <p className="text-xs text-slate-500">
                                      units
                                    </p>
                                  </div>
                                </div>

                                {/* Contact */}
                                {pharmacy.phone && (
                                  <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                                      <Phone className="h-4 w-4" />
                                    </div>

                                    <div>
                                      <p className="text-xs text-slate-400">
                                        Phone
                                      </p>

                                      <p className="text-sm font-medium text-slate-700">
                                        {pharmacy.phone}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Store Location */}
                                {(pharmacy.section ||
                                  pharmacy.shelf ||
                                  pharmacy.row) && (
                                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                      Store location
                                    </p>

                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {pharmacy.section && (
                                        <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                                          Section {pharmacy.section}
                                        </span>
                                      )}

                                      {pharmacy.shelf && (
                                        <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                                          Shelf {pharmacy.shelf}
                                        </span>
                                      )}

                                      {pharmacy.row && (
                                        <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                                          Row {pharmacy.row}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Pharmacy Footer */}
                                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                                  <span className="text-xs text-slate-400">
                                    SmartPharma approved pharmacy
                                  </span>

                                  <Link
                                    href="/pharmacies"
                                    className="text-sm font-medium text-slate-700 transition hover:text-slate-900"
                                  >
                                    View pharmacies →
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
                            <p className="text-sm leading-6 text-slate-500">
                              No currently available pharmacy stock was found
                              for this medicine.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm leading-6 text-slate-600">
                    No medicine from the prescription was matched with the
                    SmartPharma medicine database.
                  </p>
                </div>
              )}
            </div>

            {/* OCR Text */}
            <div className="mt-8 border-t border-slate-200 pt-8">
              <h3 className="text-lg font-semibold text-slate-900">
                Extracted text
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Raw text detected by the prescription scanner
              </p>

              <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-5 text-sm leading-6 text-slate-700 ring-1 ring-slate-200">
                {ocrText}
              </pre>
            </div>

            {/* Safety Notice */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm leading-6 text-slate-500">
                <strong className="font-semibold text-slate-700">
                  Important:
                </strong>{" "}
                OCR can make mistakes, especially with handwritten
                prescriptions. Always verify the medicine name and dosage with a
                pharmacist or healthcare professional before purchasing or
                taking any medicine.
              </p>
            </div>
          </div>
        )}

        {/* Manual Search */}
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Looking for a medicine manually?
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Search the SmartPharma medicine database and compare available
                pharmacies without uploading a prescription.
              </p>
            </div>

            <Link
              href="/find-medicine"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Find Medicine
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-slate-900">SmartPharma</p>

            <p className="mt-1 text-sm text-slate-500">
              Smarter access to medicines and pharmacies.
            </p>
          </div>

          <div className="flex gap-5 text-sm text-slate-500">
            <Link href="/about-us" className="transition hover:text-slate-900">
              About Us
            </Link>

            <Link
              href="/contact-us"
              className="transition hover:text-slate-900"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
