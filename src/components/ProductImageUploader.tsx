"use client";

import { useState, useRef } from "react";
import { Upload, Link as LinkIcon, Trash2, Plus, Star, AlertCircle, Loader2, Image as ImageIcon } from "lucide-react";

interface ProductImageUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export default function ProductImageUploader({
  photos,
  onChange,
  maxPhotos = 5,
}: ProductImageUploaderProps) {
  const [activeTab, setActiveTab] = useState<"file" | "url">("file");
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const availableSlots = maxPhotos - photos.length;
    if (availableSlots <= 0) {
      setUploadError(`Vous avez déjà atteint le maximum de ${maxPhotos} photos.`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, availableSlots);
    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      filesToUpload.forEach((f) => formData.append("files", f));

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.urls) {
        onChange([...photos, ...data.urls]);
      } else {
        setUploadError(data.error || "Échec de l'importation de l'image.");
      }
    } catch (err) {
      setUploadError("Erreur réseau lors de l'envoi de l'image.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("/")) {
      setUploadError("Le lien doit commencer par http:// ou https://");
      return;
    }

    if (photos.length >= maxPhotos) {
      setUploadError(`Maximum de ${maxPhotos} photos atteint.`);
      return;
    }

    onChange([...photos, trimmed]);
    setUrlInput("");
    setUploadError("");
  };

  const handleRemove = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const target = photos[index];
    const rest = photos.filter((_, i) => i !== index);
    onChange([target, ...rest]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--color-border)] pb-3">
        <div>
          <label className="block text-xs font-bold text-[var(--color-ink)]">
            Photographies de l'article ({photos.length} / {maxPhotos})
          </label>
          <span className="text-[11px] text-[var(--color-ink-soft)]">
            Importez directement depuis votre appareil ou saisissez un lien web.
          </span>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-[var(--color-surface)] p-1 rounded-xl border border-[var(--color-border)] self-start sm:self-center">
          <button
            type="button"
            onClick={() => setActiveTab("file")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "file"
                ? "bg-white text-[var(--color-ink)] shadow-xs"
                : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
            }`}
          >
            <Upload size={14} />
            <span>Depuis l'ordinateur</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "url"
                ? "bg-white text-[var(--color-ink)] shadow-xs"
                : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
            }`}
          >
            <LinkIcon size={14} />
            <span>Lien Web (URL)</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Input section based on tab */}
      {photos.length < maxPhotos && (
        <div>
          {activeTab === "file" ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-faso-green)] bg-[var(--color-surface)]/60 hover:bg-green-50/30 p-6 rounded-2xl text-center cursor-pointer transition-all space-y-2 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
              <div className="w-12 h-12 bg-white rounded-2xl shadow-xs border border-[var(--color-border)] flex items-center justify-center mx-auto text-[var(--color-faso-green)] group-hover:scale-105 transition-transform">
                {uploading ? (
                  <Loader2 size={24} className="animate-spin text-[var(--color-faso-green)]" />
                ) : (
                  <Upload size={24} />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--color-ink)]">
                  {uploading ? "Importation en cours..." : "Cliquez pour choisir une ou plusieurs photos"}
                </p>
                <p className="text-[11px] text-[var(--color-ink-soft)] mt-0.5">
                  Formats acceptés : JPG, PNG, WEBP (Max 10 Mo par photo)
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddUrl();
                    }
                  }}
                  placeholder="Collez ici l'adresse directe de l'image (https://...)"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)]"
                />
                <LinkIcon size={14} className="absolute left-3 top-3 text-gray-400" />
              </div>
              <button
                type="button"
                onClick={handleAddUrl}
                className="px-4 py-2.5 bg-[var(--color-ink)] hover:bg-black text-white text-xs font-bold rounded-xl transition-colors shrink-0"
              >
                Ajouter
              </button>
            </div>
          )}
        </div>
      )}

      {/* Grid of added photos */}
      {photos.length === 0 ? (
        <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-500">
          Aucune photo ajoutée. Veuillez importer au moins 1 photo pour illustrer votre produit.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
          {photos.map((url, idx) => (
            <div
              key={idx}
              className={`relative rounded-xl overflow-hidden border-2 bg-white group shadow-xs transition-all ${
                idx === 0
                  ? "border-[var(--color-faso-green)] ring-2 ring-[var(--color-faso-green)]/20"
                  : "border-[var(--color-border)] hover:border-gray-400"
              }`}
            >
              <div className="h-28 w-full bg-gray-100 relative">
                <img
                  src={url}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback visually if image fails to render
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop";
                  }}
                />
              </div>

              {/* Badges & Actions */}
              <div className="p-2 flex items-center justify-between bg-white text-[10px]">
                {idx === 0 ? (
                  <span className="px-1.5 py-0.5 rounded font-bold bg-[var(--color-faso-green)] text-white">
                    ★ Principale
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(idx)}
                    className="text-[10px] text-gray-600 hover:text-[var(--color-faso-green)] font-semibold flex items-center gap-0.5"
                    title="Mettre en photo principale"
                  >
                    <Star size={11} /> Mettre #1
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors ml-auto"
                  title="Supprimer cette photo"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
