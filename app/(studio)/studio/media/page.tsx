"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  Image as ImageIcon,
  Video,
  Trash2,
  Search,
  ExternalLink,
  Loader2,
  X,
  Copy,
  Check,
  Folder,
  Grid3X3,
} from "lucide-react";

interface MediaItem {
  id: string;
  url: string;
  key: string;
  mimeType: string | null;
  fileSize: number | null;
  projectId: string | null;
  project?: {
    id: string;
    title: string;
  } | null;
  createdAt: string;
}

interface Project {
  id: string;
  title: string;
}

interface UploadingFile {
  name: string;
  status: "pending" | "uploading" | "success" | "error";
  progress?: number;
}

export default function StudioMediaPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter state: "all", "unassigned", or project.id
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Upload Dialog States
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadProjectId, setUploadProjectId] = useState<string>("unassigned");
  const [uploading, setUploading] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadingFile[]>([]);

  // Custom confirmation dialog states
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Drag and drop states
  const [isDragging, setIsDragging] = useState(false);

  // Load all media and projects
  const loadData = async () => {
    try {
      const [mediaRes, projectsRes] = await Promise.all([
        fetch("/api/media"),
        fetch("/api/projects"),
      ]);

      const mediaData = await mediaRes.json();
      const projectsData = await projectsRes.json();

      if (Array.isArray(mediaData)) {
        setMediaItems(mediaData);
      }
      if (Array.isArray(projectsData)) {
        setProjects(projectsData);
      }
    } catch (err) {
      console.error("Failed to load media or projects", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Direct ImageKit File Upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const newQueueItems = Array.from(files).map((f) => ({
      name: f.name,
      status: "pending" as const,
    }));
    setUploadQueue((prev) => [...prev, ...newQueueItems]);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Update status to uploading
        setUploadQueue((prev) =>
          prev.map((item) =>
            item.name === file.name ? { ...item, status: "uploading" } : item
          )
        );

        // 1. Fetch secure client auth signature
        const authRes = await fetch("/api/media/signature");
        const authData = await authRes.json();
        if (authData.error) throw new Error(authData.error);

        // 2. Build direct ImageKit upload payload
        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("fileName", file.name);
        uploadData.append("publicKey", authData.publicKey);
        uploadData.append("signature", authData.signature);
        uploadData.append("expire", authData.expire);
        uploadData.append("token", authData.token);
        uploadData.append("folder", "favurr/portfolio/projects");

        // 3. Post directly to ImageKit upload API
        const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
          method: "POST",
          body: uploadData,
        });

        if (!uploadRes.ok) {
          throw new Error(`Direct upload failed with status ${uploadRes.status}`);
        }

        const uploadResult = await uploadRes.json();

        // 4. Register the asset in local Postgres database
        const registerRes = await fetch("/api/media", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: uploadResult.url,
            key: uploadResult.fileId,
            mimeType: file.type,
            fileSize: file.size,
            projectId: uploadProjectId === "unassigned" ? undefined : uploadProjectId,
          }),
        });

        const registeredItem = await registerRes.json();
        if (registeredItem.url) {
          setMediaItems((prev) => [registeredItem, ...prev]);
          setUploadQueue((prev) =>
            prev.map((item) =>
              item.name === file.name ? { ...item, status: "success" } : item
            )
          );
        } else {
          throw new Error("Reference registration failed");
        }
      }
    } catch (err: any) {
      console.error(err);
      setUploadQueue((prev) =>
        prev.map((item) =>
          item.status === "uploading" || item.status === "pending"
            ? { ...item, status: "error" }
            : item
        )
      );
    } finally {
      setUploading(false);
    }
  };

  // Delete Media Action
  const handleDeleteMedia = async () => {
    if (!pendingDeleteId) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/media/${pendingDeleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMediaItems((prev) => prev.filter((item) => item.id !== pendingDeleteId));
        setSelectedIds((prev) => prev.filter((id) => id !== pendingDeleteId));
        setPendingDeleteId(null);
      } else {
        alert("Failed to delete media item from database.");
      }
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk Delete Media Action
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);

    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/media/${id}`, {
            method: "DELETE",
          })
        )
      );

      setMediaItems((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
      setSelectedIds([]);
      setShowBulkConfirm(false);
    } catch (err: any) {
      alert(`Bulk delete failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Copy Link Alert helper
  const handleCopyLink = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  // Filter logic based on active filter pill AND search query
  const filteredMedia = mediaItems.filter((item) => {
    // 1. Filter pill condition
    if (activeFilter === "unassigned" && item.projectId !== null) return false;
    if (activeFilter !== "all" && activeFilter !== "unassigned" && item.projectId !== activeFilter) return false;

    // 2. Search query filter
    const query = searchQuery.toLowerCase();
    const urlMatch = item.url.toLowerCase().includes(query);
    const projectMatch = item.project?.title.toLowerCase().includes(query);
    
    return urlMatch || projectMatch;
  });

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto pb-24">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="space-y-1.5">
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Favurr Media Database</span>
          </div>
          <h1 className="font-serif text-3xl font-normal text-foreground">Media Library</h1>
        </div>

        {/* Custom Upload Files Trigger Button */}
        <button
          onClick={() => {
            setUploadQueue([]);
            setIsUploadOpen(true);
          }}
          className="group font-mono text-xs uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90 px-6 py-3.5 rounded-full transition-all inline-flex items-center gap-2 cursor-pointer shadow-md self-start sm:self-auto"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Files</span>
        </button>
      </div>

      {/* Advanced Filter Component & Search Grid Control */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/10 border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground focus:outline-none focus:border-border/80 transition-all font-sans"
            placeholder="Search filenames, project tags..."
          />
        </div>

        {/* Beautiful Scrollable Horizontal Filter Row */}
        <div className="flex flex-col gap-2 pt-2">
          <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Filter by association:</span>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth w-full">
            {/* All Assets */}
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 rounded-full font-mono text-xs transition-all uppercase tracking-wider border cursor-pointer shrink-0 inline-flex items-center gap-1.5 ${
                activeFilter === "all"
                  ? "bg-foreground text-background border-foreground shadow"
                  : "bg-muted/10 text-muted-foreground border-border/40 hover:border-border/80"
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>All Assets ({mediaItems.length})</span>
            </button>

            {/* Unassigned */}
            <button
              onClick={() => setActiveFilter("unassigned")}
              className={`px-4 py-2 rounded-full font-mono text-xs transition-all uppercase tracking-wider border cursor-pointer shrink-0 inline-flex items-center gap-1.5 ${
                activeFilter === "unassigned"
                  ? "bg-foreground text-background border-foreground shadow"
                  : "bg-muted/10 text-muted-foreground border-border/40 hover:border-border/80"
              }`}
            >
              <X className="w-3.5 h-3.5" />
              <span>Unassigned ({mediaItems.filter(m => m.projectId === null).length})</span>
            </button>

            {/* Projects list */}
            {projects.map((p) => {
              const projectCount = mediaItems.filter(m => m.projectId === p.id).length;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveFilter(p.id)}
                  className={`px-4 py-2 rounded-full font-mono text-xs transition-all uppercase tracking-wider border cursor-pointer shrink-0 inline-flex items-center gap-1.5 ${
                    activeFilter === p.id
                      ? "bg-foreground text-background border-foreground shadow"
                      : "bg-muted/10 text-muted-foreground border-border/40 hover:border-border/80"
                  }`}
                >
                  <Folder className="w-3.5 h-3.5" />
                  <span className="max-w-[120px] truncate">{p.title}</span>
                  <span className="text-[10px] opacity-80">({projectCount})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="p-16 text-center text-muted-foreground font-mono text-xs border border-dashed border-border/40 bg-muted/5 rounded-2xl">
          No matching media assets found under selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 pt-4 animate-in fade-in duration-200">
          {filteredMedia.map((item) => {
            const isVideo = item.mimeType?.startsWith("video") || item.url.endsWith(".mp4");
            const isSelected = selectedIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`group relative aspect-square rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col justify-between bg-muted/5 ${
                  isSelected ? "border-emerald-500/60 ring-2 ring-emerald-500/20" : "border-border/40"
                }`}
              >
                {/* Visual Thumbnail */}
                <div className="w-full h-full relative overflow-hidden bg-background">
                  {isVideo ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950/60 p-4">
                      <Video className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">Video Asset</span>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt="Media reference catalog"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}

                  {/* Select Checkbox Check Trigger */}
                  <div className="absolute top-3 right-3 z-30">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds((prev) => [...prev, item.id]);
                        } else {
                          setSelectedIds((prev) => prev.filter((id) => id !== item.id));
                        }
                      }}
                      className="w-4.5 h-4.5 rounded border-border bg-background/80 text-foreground focus:ring-foreground accent-emerald-500 cursor-pointer shadow-md"
                    />
                  </div>

                  {/* Top Badge: Project Association */}
                  <div className="absolute top-3 left-3 z-10 max-w-[60%]">
                    <span 
                      className={`font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md border shadow-sm truncate block ${
                        item.project 
                          ? "bg-foreground/90 text-background border-foreground font-medium" 
                          : "bg-muted/80 text-muted-foreground border-border/60"
                      }`}
                      title={item.project?.title || "Unassigned"}
                    >
                      {item.project?.title || "Unassigned"}
                    </span>
                  </div>
                </div>

                {/* Hover overlay controls */}
                <div className="absolute inset-0 bg-background/95 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-3 transition-opacity duration-200 p-4 text-center z-20">
                  <div className="w-full space-y-1">
                    <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest block">URL Path</span>
                    <span className="font-mono text-[10px] text-foreground truncate block w-full px-2">
                      {item.url}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => handleCopyLink(item.id, item.url)}
                      className="p-2.5 rounded-full bg-muted hover:bg-muted/80 text-foreground transition-all cursor-pointer shadow"
                      title="Copy CDN Link"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-full bg-muted hover:bg-muted/80 text-foreground transition-all cursor-pointer shadow"
                      title="Open in browser"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => setPendingDeleteId(item.id)}
                      className="p-2.5 rounded-full bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-900/30 transition-all cursor-pointer shadow"
                      title="Delete Asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Curated shadcn Upload Dialog Modal */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="max-w-lg bg-background border border-border/40 rounded-2xl p-6 font-sans">
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-serif text-2xl font-normal text-foreground">Upload Media Assets</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Directly stream media assets to your ImageKit cloud bucket storage.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Target Project Assigner */}
            <div className="space-y-1.5">
              <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Associate with Project
              </label>
              <Select value={uploadProjectId} onValueChange={setUploadProjectId}>
                <SelectTrigger className="max-w-99 bg-muted/10 border border-border rounded-xl font-sans text-sm text-foreground focus:ring-0 focus:border-border/80 h-11">
                  <SelectValue placeholder="Select a project..." />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border/60 rounded-xl shadow-xl font-sans">
                  <SelectItem value="unassigned" className="text-muted-foreground font-mono text-xs">
                    Unassigned — Global Library
                  </SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-sm truncate">
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dotted Upload Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer relative ${
                isDragging 
                  ? "border-emerald-500 bg-emerald-500/5 text-emerald-400" 
                  : "border-border/60 hover:border-border bg-muted/5 text-muted-foreground"
              }`}
            >
              <input
                id="dialog-file-input"
                type="file"
                multiple
                accept="image/*,video/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => handleFileUpload(e.target.files)}
                disabled={uploading}
              />
              <div className="p-3 rounded-full bg-muted/20 border border-border/40">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-foreground block">
                  Drag & drop files here, or <span className="text-emerald-400 underline decoration-dotted">browse</span>
                </span>
                <span className="text-xs text-muted-foreground block font-mono">
                  Supports Images and Videos (.mp4)
                </span>
              </div>
            </div>

            {/* Live Uploading Queue Monitor */}
            {uploadQueue.length > 0 && (
              <div className="space-y-2 border border-border/40 rounded-xl p-4 bg-muted/10 max-h-40 overflow-y-auto">
                <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground block pb-1 border-b border-border/20">
                  Upload Queue ({uploadQueue.filter(q => q.status === "success").length}/{uploadQueue.length})
                </span>
                
                <div className="space-y-1.5 pt-1.5 font-mono text-[10px]">
                  {uploadQueue.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="truncate max-w-[70%] text-foreground">{file.name}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {file.status === "pending" && (
                          <span className="text-muted-foreground">Queued</span>
                        )}
                        {file.status === "uploading" && (
                          <span className="text-emerald-400 flex items-center gap-1 animate-pulse">
                            <Loader2 className="w-3 h-3 animate-spin" /> Uploading
                          </span>
                        )}
                        {file.status === "success" && (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-400 font-bold" /> Complete
                          </span>
                        )}
                        {file.status === "error" && (
                          <span className="text-rose-400">Failed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              onClick={() => setIsUploadOpen(false)}
              className="w-full bg-foreground text-background hover:bg-foreground/90 font-mono text-xs uppercase tracking-wider rounded-full py-2.5"
            >
              Done & Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <Dialog 
        open={pendingDeleteId !== null} 
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <DialogContent className="max-w-md bg-background border border-border/40 rounded-2xl p-6 font-sans">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-normal text-foreground">
              Delete Media Asset?
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground leading-relaxed font-sans">
            Are you sure you want to permanently delete this media file? It will be deleted from your ImageKit cloud storage bucket and Postgres database metadata library. This action cannot be undone.
          </div>
          <DialogFooter className="flex gap-3 sm:justify-end pt-2">
            <Button
              variant="ghost"
              disabled={isDeleting}
              onClick={() => setPendingDeleteId(null)}
              className="border border-border text-muted-foreground hover:text-foreground rounded-full px-5 py-2 font-mono text-xs uppercase tracking-wider"
            >
              Cancel
            </Button>
            <Button
              disabled={isDeleting}
              onClick={handleDeleteMedia}
              className="bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-full px-5 py-2 font-mono text-xs uppercase tracking-wider shadow-md"
            >
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog 
        open={showBulkConfirm} 
        onOpenChange={setShowBulkConfirm}
      >
        <DialogContent className="max-w-md bg-background border border-border/40 rounded-2xl p-6 font-sans">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-normal text-foreground">
              Delete Selected Assets?
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground leading-relaxed font-sans">
            Are you sure you want to delete the <span className="font-semibold text-foreground">{selectedIds.length}</span> selected media files? They will be permanently removed from both your ImageKit storage bucket and Postgres database reference records. This action cannot be undone.
          </div>
          <DialogFooter className="flex gap-3 sm:justify-end pt-2">
            <Button
              variant="ghost"
              disabled={isDeleting}
              onClick={() => setShowBulkConfirm(false)}
              className="border border-border text-muted-foreground hover:text-foreground rounded-full px-5 py-2 font-mono text-xs uppercase tracking-wider"
            >
              Cancel
            </Button>
            <Button
              disabled={isDeleting}
              onClick={handleBulkDelete}
              className="bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-full px-5 py-2 font-mono text-xs uppercase tracking-wider shadow-md"
            >
              {isDeleting ? "Deleting..." : `Delete ${selectedIds.length} Assets`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Action Bar for Bulk Selection Operations */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-background/95 border border-border/80 shadow-2xl rounded-full px-6 py-3.5 flex items-center gap-6 animate-in slide-in-from-bottom duration-200 backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs text-foreground font-medium uppercase tracking-widest">
              {selectedIds.length} file{selectedIds.length > 1 ? "s" : ""} selected
            </span>
          </div>
          <div className="h-4 w-[1px] bg-border/80" />
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedIds([])}
              className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Clear
            </button>
            <button
              onClick={() => setShowBulkConfirm(true)}
              className="font-mono text-xs uppercase tracking-widest bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 px-4 py-2 rounded-full cursor-pointer transition-colors shadow-md flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
