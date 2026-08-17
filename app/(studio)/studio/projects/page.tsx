"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TiptapEditor } from "@/components/tiptap-editor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  ExternalLink,
  Sparkles,
  FolderKanban,
  Upload,
  Image as ImageIcon,
  Video,
  FileText,
  Trash2,
  Save,
  Search,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Eye,
  X,
  Loader2,
} from "lucide-react";
import {
  createProjectAction,
  updateProjectAction,
  batchSaveProjectAction,
  deleteProjectAction,
  addSectionAction,
  updateSectionAction,
  deleteSectionAction,
  reorderSectionsAction
} from "../actions";
import { SectionRenderer } from "@/components/project/section-renderer";
import { sanitizeHtmlClient } from "@/lib/sanitize-client";

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  featuredImage: string;
  published: boolean;
  featured: boolean;
  repository?: string | null;
  liveDemo?: string | null;
  year?: number | null;
  client?: string | null;
  duration?: string | null;
  projectType: string[];
  category?: string | null;
  device?: string | null;
  industry?: string | null;
  role?: string | null;
  overview?: string | null;
  status: string;
}

interface ProjectSection {
  id: string;
  componentKey: string;
  title?: string | null;
  subtitle?: string | null;
  content?: string | null;
  props?: any;
}

const AVAILABLE_PROJECT_TYPES = ["UI", "UX", "Web Dev", "Full Stack", "Mobile App", "AI Systems"];

export default function StudioProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  // Single active state container holding local changes before hitting database save
  const [localProjectState, setLocalProjectState] = useState<(Project & { sections: ProjectSection[] }) | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Custom confirmation dialog states (to replace native confirm boxes)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionLabel: string;
  }>({
    isOpen: false,
    title: "",
    description: "",
    actionLabel: "",
  });

  const triggerConfirmation = (title: string, description: string, actionLabel: string, action: () => void) => {
    setPendingAction(() => action);
    setConfirmDialog({
      isOpen: true,
      title,
      description,
      actionLabel,
    });
  };
  
  // Dropdown & Search filters
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Editor panel tab configuration
  const [activeTab, setActiveTab] = useState<"metadata" | "sections" | "media">("metadata");
  
  // Creation dialog state
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  
  // Action state trackers
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  // Track which section IDs have local unsaved edits so we only re-save those
  const [dirtySectionIds, setDirtySectionIds] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [showPreviewHeader, setShowPreviewHeader] = useState(true);
  const lastPreviewScrollY = useRef(0);

  // Scroll-hide/show for sticky toolbar
  const [showToolbar, setShowToolbar] = useState(true);
  const lastScrollY = useRef(0);

  const handlePreviewScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    if (currentScrollY > lastPreviewScrollY.current && currentScrollY > 80) {
      setShowPreviewHeader(false);
    } else {
      setShowPreviewHeader(true);
    }
    lastPreviewScrollY.current = currentScrollY;
  };
  
  // Custom media storage log
  const [mediaLibrary, setMediaLibrary] = useState<Array<{ id: string; url: string; mimeType: string }>>([]);

  const router = useRouter();

  // Load project list
  const loadProjects = () => {
    fetch("/api/projects?all=true")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data)) {
          setProjects(data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Scroll direction tracker — hide toolbar on down, show on up
  useEffect(() => {
    const mainEl = document.querySelector("main");
    if (!mainEl) return;
    const handleScroll = () => {
      const currentY = mainEl.scrollTop;
      if (currentY < 80) {
        setShowToolbar(true);
      } else if (currentY > lastScrollY.current + 8) {
        setShowToolbar(false);
      } else if (currentY < lastScrollY.current - 8) {
        setShowToolbar(true);
      }
      lastScrollY.current = currentY;
    };
    mainEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => mainEl.removeEventListener("scroll", handleScroll);
  }, []);

  // 1. Browser tab closing/reloading warning (system native prompt block)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "Discard unsaved changes?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // 2. Global client-side route click interceptor (for studio layout sidebar navigation links)
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      if (!isDirty) return;

      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (anchor && anchor.getAttribute("target") !== "_blank") {
        const href = anchor.getAttribute("href");
        if (href && (href.startsWith("/") || href.startsWith("http"))) {
          e.preventDefault();
          triggerConfirmation(
            "Unsaved Changes",
            "You have unsaved changes in this project. Leaving the editor will discard them. Do you want to proceed?",
            "Discard & Leave",
            () => {
              // Reset isDirty so the beforeunload and interceptor let navigation succeed
              setIsDirty(false);
              router.push(href);
            }
          );
        }
      }
    };

    document.addEventListener("click", handleAnchorClick, true);
    return () => document.removeEventListener("click", handleAnchorClick, true);
  }, [isDirty, router]);

  // Fetch full project structure when selection changes
  useEffect(() => {
    if (!selectedProjectId) {
      setLocalProjectState(null);
      setIsDirty(false);
      return;
    }

    fetch(`/api/projects/${selectedProjectId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          // Normalize projectType array format
          if (!data.projectType) data.projectType = [];
          setLocalProjectState(data);
          setIsDirty(false);
        }
      })
      .catch(() => {});
  }, [selectedProjectId]);

  // Sync project-specific media catalog
  useEffect(() => {
    if (!selectedProjectId) return;
    fetch(`/api/media?projectId=${selectedProjectId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMediaLibrary(data);
        }
      })
      .catch(() => {});
  }, [selectedProjectId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const newProject = await createProjectAction({
        title,
        slug,
        description,
        projectType: [],
        status: "in progress",
      });
      setIsCreating(false);
      setSelectedProjectId(newProject.id);
      // Add to local list without a refetch
      setProjects((prev) => [...prev, newProject as any]);
      setTitle("");
      setSlug("");
      setDescription("");
      loadProjects();
    } catch (err: any) {
      setError(err.message || "Failed to create project.");
    } finally {
      setLoading(false);
    }
  };

  // Perform project updates to save local state to database
  const handleSaveChanges = async () => {
    if (!selectedProjectId || !localProjectState || saveStatus === "saving") return;
    setSaveStatus("saving");
    try {
      const { sections, ...metaFields } = localProjectState;

      // Only send sections that were actually edited (dirty tracking)
      const sectionsToSave = sections
        .filter((s) => dirtySectionIds.has(s.id))
        .map((s) => ({ id: s.id, title: s.title, subtitle: s.subtitle, content: s.content, props: s.props }));

      // ONE server action → ONE DB transaction → ONE network round-trip
      const updatedProject = await batchSaveProjectAction(selectedProjectId, metaFields, sectionsToSave);

      // Clear dirty tracking and sync master list
      setDirtySectionIds(new Set());
      setProjects((prev) => prev.map((p) => (p.id === selectedProjectId ? { ...p, ...updatedProject } : p)));
      setIsDirty(false);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1500);
    } catch (err) {
      setSaveStatus("error");
    }
  };

  // Mutate local state helper
  const updateLocalMetaField = (fields: Partial<Project>) => {
    setLocalProjectState((prev: any) => {
      if (!prev) return null;
      return { ...prev, ...fields };
    });
    setIsDirty(true);
  };

  const updateLocalSection = (sectionId: string, fields: Partial<ProjectSection>) => {
    setLocalProjectState((prev: any) => {
      if (!prev) return null;
      return {
        ...prev,
        sections: prev.sections.map((s: any) => s.id === sectionId ? { ...s, ...fields } : s)
      };
    });
    // Mark this specific section as dirty so we only save it (not all sections)
    setDirtySectionIds((prev) => new Set(prev).add(sectionId));
    setIsDirty(true);
  };

  // Reorder layouts locally before saving
  const handleMoveSection = async (index: number, direction: "up" | "down") => {
    if (!localProjectState) return;
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= localProjectState.sections.length) return;

    const sections = [...localProjectState.sections];
    const temp = sections[index];
    sections[index] = sections[nextIndex];
    sections[nextIndex] = temp;

    setLocalProjectState((prev: any) => ({ ...prev, sections }));
    setIsDirty(true);

    try {
      const orderIds = sections.map((s) => s.id);
      await reorderSectionsAction(selectedProjectId!, orderIds);
    } catch (err) {}
  };

  // Media asset uploads
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField?: "featuredImage" | "sectionContent" | "galleryBlock", sectionId?: string) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedProjectId) return;

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 1. Fetch secure client authorization signature
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
            projectId: selectedProjectId,
          }),
        });

        const data = await registerRes.json();
        if (data.url) {
          uploadedUrls.push(data.url);
          setMediaLibrary((prev) => [data, ...prev]);

          if (targetField === "featuredImage" && i === 0) {
            updateLocalMetaField({ featuredImage: data.url });
          }
          if (targetField === "sectionContent" && sectionId) {
            const section = localProjectState?.sections.find((s) => s.id === sectionId);
            const originalContent = section?.content || "";
            const imgTag = `<img src="${data.url}" alt="Project image" class="rounded-xl border border-border/60 max-w-full my-4" />`;
            updateLocalSection(sectionId, { content: originalContent + imgTag });
          }
        }
      }

      // Bulk append for gallery blocks to avoid trigger race updates
      if (targetField === "galleryBlock" && sectionId && uploadedUrls.length > 0) {
        const section = localProjectState?.sections.find((s) => s.id === sectionId);
        const currentProps = section?.props || {};
        const currentImages = [...(currentProps.images || [])];
        const newImages = uploadedUrls.map((url) => ({
          url,
          caption: "",
          alt: "Gallery asset"
        }));
        updateLocalSection(sectionId, { props: { ...currentProps, images: [...currentImages, ...newImages] } });
      }

    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const handleAddSection = async (key: string) => {
    if (!selectedProjectId) return;
    try {
      await addSectionAction(selectedProjectId, key);
      const res = await fetch(`/api/projects/${selectedProjectId}`);
      const data = await res.json();
      if (data && !data.error) {
        setLocalProjectState(data);
        setIsDirty(false);
      }
    } catch (err) {}
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!selectedProjectId) return;
    try {
      await deleteSectionAction(selectedProjectId, sectionId);
      setLocalProjectState((prev: any) => {
        if (!prev) return null;
        return {
          ...prev,
          sections: prev.sections.filter((s: any) => s.id !== sectionId)
        };
      });
    } catch (err) {}
  };

  const handleDeleteProject = async () => {
    if (!selectedProjectId) return;
    triggerConfirmation(
      "Delete Project Case Study?",
      "Are you sure you want to delete this project? This will permanently erase all sections, descriptions, and metadata. This action cannot be undone.",
      "Delete Case Study",
      async () => {
        try {
          await deleteProjectAction(selectedProjectId);
          // Remove from local list without refetch
          setProjects((prev) => prev.filter((p) => p.id !== selectedProjectId));
          setSelectedProjectId(null);
        } catch (err) {}
      }
    );
  };

  // Dropdown list computation
  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const currentProjectName = localProjectState?.title || "Select Project Case Study...";

  return (
    <div className="space-y-2 w-full max-w-7xl mx-auto">
      {/* Scroll-aware toolbar: hides on scroll down, reveals immediately on scroll up */}
      <div
        className={`sticky top-0 z-40 -mx-6 md:-mx-10 transition-transform duration-300 ease-in-out ${
          showToolbar ? "translate-y-0" : "translate-y-[-200%]"
        }`}
      >
        <div className="px-6 md:px-10 py-2 bg-background/95 backdrop-blur border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-3">
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Favurr Engine Workspace</span>
          </div>
          
          {/* Custom Dropdown Selector with Search Input */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="px-5 py-3 rounded-xl border border-border bg-muted/10 text-left font-serif text-xl sm:text-2xl text-foreground flex items-center justify-between gap-4 cursor-pointer hover:border-border/80 w-full sm:w-auto sm:min-w-[320px]"
            >
              <span className="truncate max-w-62.5 sm:max-w-87.5 md:max-w-112.5 block">{currentProjectName}</span>
              <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
            </button>
            
            {showDropdown && (
              <div className="absolute top-full left-0 z-50 mt-2 w-80 rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl p-3 space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-muted/20 border border-border rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-foreground"
                    placeholder="Search projects..."
                  />
                </div>
                
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {filteredProjects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        if (isDirty) {
                          triggerConfirmation(
                            "Unsaved Changes",
                            "You have unsaved changes in this project. Switching case studies will discard them. Do you want to proceed?",
                            "Discard & Switch",
                            () => {
                              setIsDirty(false);
                              setSelectedProjectId(p.id);
                              setShowDropdown(false);
                            }
                          );
                        } else {
                          setSelectedProjectId(p.id);
                          setShowDropdown(false);
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-sans hover:bg-muted transition-colors flex items-center justify-between"
                    >
                      <span className="font-medium text-foreground">{p.title}</span>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{p.status}</span>
                    </button>
                  ))}
                  {filteredProjects.length === 0 && (
                    <div className="text-center py-4 text-xs font-mono text-muted-foreground">No matches found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
           {/* Explicit Save/Preview Button for unsaved states */}
           {localProjectState && (
             <>
               <button
                 type="button"
                 onClick={() => setIsPreviewing(true)}
                 className="font-mono text-xs uppercase tracking-widest px-5 py-3 rounded-full transition-all inline-flex items-center gap-2 cursor-pointer bg-background hover:bg-muted border border-border text-foreground shadow-sm"
               >
                 <Eye className="w-3.5 h-3.5" />
                 <span>Preview Page</span>
               </button>
               
               <button
                 onClick={handleSaveChanges}
                 disabled={!isDirty || saveStatus === "saving"}
                 className={`font-mono text-xs uppercase tracking-widest px-5 py-3 rounded-full transition-all inline-flex items-center gap-2 min-w-36.25 justify-center cursor-pointer ${
                   saveStatus === "saving"
                     ? "bg-emerald-500/70 text-white cursor-wait"
                     : saveStatus === "saved"
                     ? "bg-emerald-600 text-white"
                     : saveStatus === "error"
                     ? "bg-rose-950 border border-rose-800 text-rose-300"
                     : isDirty
                     ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md"
                     : "bg-muted text-muted-foreground border border-border cursor-not-allowed"
                 }`}
               >
                 {saveStatus === "saving" ? (
                   <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Saving...</span></>
                 ) : saveStatus === "saved" ? (
                   <><Save className="w-3.5 h-3.5" /><span>Saved ✓</span></>
                 ) : saveStatus === "error" ? (
                   <><Save className="w-3.5 h-3.5" /><span>Failed — Retry</span></>
                 ) : (
                   <><Save className="w-3.5 h-3.5" /><span>{isDirty ? "Save Changes" : "No Changes"}</span></>
                 )}
               </button>
             </>
           )}

          <button
            onClick={() => setIsCreating(true)}
            className="group/btn active:scale-97 font-mono text-xs uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90 px-5 py-3 rounded-full transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        </div>
        </div>
      </div>

      {/* Editor Space */}
      <div className="w-full">
        {localProjectState ? (
          <div className="border border-border/40 rounded-2xl bg-muted/10 overflow-hidden">
            
            {/* Header tab controller */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/40 px-6 py-4 bg-muted/20 gap-4">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab("metadata")}
                  className={`px-3 py-1.5 rounded-md font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${activeTab === "metadata" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
                >
                  MetaData
                </button>
                <button
                  onClick={() => setActiveTab("sections")}
                  className={`px-3 py-1.5 rounded-md font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${activeTab === "sections" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Sections
                </button>
                <button
                  onClick={() => setActiveTab("media")}
                  className={`px-3 py-1.5 rounded-md font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${activeTab === "media" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Media
                </button>
              </div>

              <div className="flex items-center gap-3">
                {isDirty && <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 uppercase font-medium">Unsaved Changes</span>}
                <Link
                  href={`/projects/${localProjectState.slug}`}
                  target="_blank"
                  className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
                >
                  <span>View Study</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={handleDeleteProject}
                  className="text-rose-400 hover:text-rose-300 p-1.5 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* TAB CONTENT: Details & Specifications */}
            {activeTab === "metadata" && (
              <div className="p-6 md:p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* General Specifications */}
                  <div className="space-y-6">
                    <h3 className="font-serif text-lg text-foreground border-b border-border/30 pb-2">Case Metadata</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Status States</label>
                        <select
                          value={localProjectState.status}
                          onChange={(e) => updateLocalMetaField({ status: e.target.value })}
                          className="w-full rounded-md border border-border/60 bg-background/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:border-foreground"
                        >
                          <option value="live">Live (Case Study Online)</option>
                          <option value="in progress">In Progress (Work in Progress)</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">General Category</label>
                        <input
                          type="text"
                          value={localProjectState.category || ""}
                          onChange={(e) => updateLocalMetaField({ category: e.target.value })}
                          className="w-full rounded-md border border-border/60 bg-background/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:border-foreground"
                          placeholder="e.g. Design Engineering"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Year</label>
                        <input
                          type="number"
                          value={localProjectState.year || ""}
                          onChange={(e) => updateLocalMetaField({ year: e.target.value ? parseInt(e.target.value) : null })}
                          className="w-full rounded-md border border-border/60 bg-background/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:border-foreground"
                          placeholder="e.g. 2026"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Duration</label>
                        <input
                          type="text"
                          value={localProjectState.duration || ""}
                          onChange={(e) => updateLocalMetaField({ duration: e.target.value })}
                          className="w-full rounded-md border border-border/60 bg-background/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:border-foreground"
                          placeholder="e.g. 4 Weeks"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Device Specs</label>
                        <input
                          type="text"
                          value={localProjectState.device || ""}
                          onChange={(e) => updateLocalMetaField({ device: e.target.value })}
                          className="w-full rounded-md border border-border/60 bg-background/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:border-foreground"
                          placeholder="e.g. Web, Desktop"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Client / Org</label>
                        <input
                          type="text"
                          value={localProjectState.client || ""}
                          onChange={(e) => updateLocalMetaField({ client: e.target.value })}
                          className="w-full rounded-md border border-border/60 bg-background/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:border-foreground"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Industry</label>
                        <input
                          type="text"
                          value={localProjectState.industry || ""}
                          onChange={(e) => updateLocalMetaField({ industry: e.target.value })}
                          className="w-full rounded-md border border-border/60 bg-background/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:border-foreground"
                          placeholder="e.g. Fintech, Edtech"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">My Role</label>
                      <input
                        type="text"
                        value={localProjectState.role || ""}
                        onChange={(e) => updateLocalMetaField({ role: e.target.value })}
                        className="w-full rounded-md border border-border/60 bg-background/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:border-foreground"
                        placeholder="e.g. Lead Frontend Engineer"
                      />
                    </div>

                    {/* Project Types checklist selection */}
                    <div className="space-y-2">
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Project Types</label>
                      <div className="flex flex-wrap gap-3">
                        {AVAILABLE_PROJECT_TYPES.map((type) => {
                          const isChecked = localProjectState.projectType?.includes(type);
                          return (
                            <label
                              key={type}
                              className={`px-3 py-1.5 rounded-full border text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                                isChecked 
                                  ? "bg-foreground text-background border-foreground font-medium"
                                  : "border-border/60 text-muted-foreground bg-background/30 hover:border-border"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  let newTypes = [...(localProjectState.projectType || [])];
                                  if (e.target.checked) {
                                    newTypes.push(type);
                                  } else {
                                    newTypes = newTypes.filter((t) => t !== type);
                                  }
                                  updateLocalMetaField({ projectType: newTypes });
                                }}
                                className="hidden"
                              />
                              <span>{type}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Short Description</label>
                      <textarea
                        value={localProjectState.description || ""}
                        onChange={(e) => updateLocalMetaField({ description: e.target.value })}
                        rows={3}
                        className="w-full rounded-md border border-border/60 bg-background/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:border-foreground resize-none"
                        placeholder="Brief summary description..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Live Site Link</label>
                        <input
                          type="text"
                          value={localProjectState.liveDemo || ""}
                          onChange={(e) => updateLocalMetaField({ liveDemo: e.target.value })}
                          className="w-full rounded-md border border-border/60 bg-background/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:border-foreground"
                          placeholder="https://..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Git Repository</label>
                        <input
                          type="text"
                          value={localProjectState.repository || ""}
                          onChange={(e) => updateLocalMetaField({ repository: e.target.value })}
                          className="w-full rounded-md border border-border/60 bg-background/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:border-foreground"
                          placeholder="https://github.com..."
                        />
                      </div>
                    </div>


                  </div>

                  {/* Banner & Detailed Overview fields */}
                  <div className="space-y-6">
                    <h3 className="font-serif text-lg text-foreground border-b border-border/30 pb-2">Branding &amp; Case Introduction</h3>
                    
                    <div className="space-y-1.5">
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Showcase Hero Banner (Image or Video CDN Link)</label>
                      <div className="aspect-video w-full rounded-xl overflow-hidden border border-border bg-background/30 relative group">
                        {localProjectState.featuredImage ? (
                          localProjectState.featuredImage.endsWith(".mp4") ? (
                            <video src={localProjectState.featuredImage} autoPlay muted loop className="w-full h-full object-cover" />
                          ) : (
                            <img src={localProjectState.featuredImage} alt="Banner" className="w-full h-full object-cover" />
                          )
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs font-mono">No Banner Uploaded</div>
                        )}
                        <label className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer">
                          <Upload className="w-6 h-6 text-foreground" />
                          <span className="font-mono text-xs uppercase tracking-wider text-foreground">Upload Media</span>
                          <input
                            type="file"
                            accept="image/*,video/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, "featuredImage")}
                          />
                        </label>
                      </div>
                      
                      <input
                        type="text"
                        value={localProjectState.featuredImage}
                        onChange={(e) => updateLocalMetaField({ featuredImage: e.target.value })}
                        className="w-full rounded-md border border-border/60 bg-background/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:border-foreground"
                        placeholder="https://ik.imagekit.io/..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Project Case Overview (Markdown Intro text)</label>
                      <TiptapEditor
                        content={localProjectState.overview || ""}
                        onChange={(newContent) => updateLocalMetaField({ overview: newContent })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Layout Blocks Reordering & Notion Text Editors */}
            {activeTab === "sections" && (
              <div className="p-6 md:p-8 space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-border/30 pb-2">
                    <h3 className="font-serif text-xl font-normal text-foreground">Layout Blocks</h3>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAddSection("rich-text")}
                        className="px-3 py-1 rounded-md border border-border hover:border-foreground bg-background hover:bg-muted text-foreground font-mono text-xs uppercase tracking-wider cursor-pointer inline-flex items-center gap-1.5 animate-pulse"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>+ Markdown Block</span>
                      </button>
                      <button
                        onClick={() => handleAddSection("gallery")}
                        className="px-3 py-1 rounded-md border border-border hover:border-foreground bg-background hover:bg-muted text-foreground font-mono text-xs uppercase tracking-wider cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>+ Gallery Block</span>
                      </button>
                    </div>
                  </div>

                  {localProjectState.sections.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground font-mono text-xs border border-dashed border-border/60 rounded-xl">
                      No sections configured. Click dynamic blocks buttons above to start building.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {localProjectState.sections.map((section, idx) => {
                        const isCollapsed = collapsedSections[section.id] || false;
                        return (
                          <div key={section.id} className="border border-border/60 rounded-xl bg-background/40 p-5 space-y-4">
                            <div className="flex items-center justify-between border-b border-border/20 pb-3">
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => setCollapsedSections(prev => ({ ...prev, [section.id]: !isCollapsed }))}
                                  className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer transition-transform duration-250"
                                >
                                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? "-rotate-90" : "rotate-0"}`} />
                                </button>
                                <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                  <span>Block #{idx + 1} &bull; {section.componentKey}</span>
                                  {section.title && (
                                    <span className="text-[10px] text-foreground lowercase bg-muted px-2 py-0.5 rounded font-sans tracking-normal">
                                      ({section.title})
                                    </span>
                                  )}
                                </span>
                                {/* Position Reordering arrows */}
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleMoveSection(idx, "up")}
                                    disabled={idx === 0}
                                    className="p-1 border border-border/60 hover:border-foreground rounded disabled:opacity-30 disabled:hover:border-border/60 cursor-pointer"
                                    title="Move Up"
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleMoveSection(idx, "down")}
                                    disabled={idx === localProjectState.sections.length - 1}
                                    className="p-1 border border-border/60 hover:border-foreground rounded disabled:opacity-30 disabled:hover:border-border/60 cursor-pointer"
                                    title="Move Down"
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              <button
                                onClick={() => handleDeleteSection(section.id)}
                                className="text-rose-400 hover:text-rose-300 p-1 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {!isCollapsed && (
                              <>
                                {/* Block title/subtitle specifications */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1.5">
                                    <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Block Title</label>
                                    <input
                                      type="text"
                                      value={section.title || ""}
                                      onChange={(e) => updateLocalSection(section.id, { title: e.target.value })}
                                      className="w-full rounded-md border border-border/60 bg-background/50 px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-foreground"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Block Subtitle</label>
                                    <input
                                      type="text"
                                      value={section.subtitle || ""}
                                      onChange={(e) => updateLocalSection(section.id, { subtitle: e.target.value })}
                                      className="w-full rounded-md border border-border/60 bg-background/50 px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-foreground"
                                    />
                                  </div>
                                </div>

                                {section.componentKey === "rich-text" ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Markdown / Notion Editor</label>
                                      <label className="text-xs font-mono text-muted-foreground hover:text-foreground cursor-pointer inline-flex items-center gap-1">
                                        <Upload className="w-3 h-3" />
                                        <span>Insert Image</span>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(e) => handleFileUpload(e, "sectionContent", section.id)}
                                        />
                                      </label>
                                    </div>
                                    <TiptapEditor
                                      content={section.content || ""}
                                      onChange={(newContent) => updateLocalSection(section.id, { content: newContent })}
                                      onImageUploadClick={() => {
                                        const input = document.getElementById(`section-file-${section.id}`);
                                        input?.click();
                                      }}
                                    />
                                    <input
                                      id={`section-file-${section.id}`}
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => handleFileUpload(e, "sectionContent", section.id)}
                                    />

                                    {/* Rich Text styling and animations controls */}
                                    <div className="flex flex-wrap items-center gap-4 border border-border/40 rounded-xl p-3 bg-muted/10 text-xs font-mono mt-2">
                                      
                                      {/* Background Style */}
                                      <div className="flex items-center gap-1.5">
                                        <span>Background:</span>
                                        <select
                                          value={section.props?.bgStyle || "transparent"}
                                          onChange={(e) => updateLocalSection(section.id, { props: { ...section.props, bgStyle: e.target.value } })}
                                          className="bg-background border border-border rounded px-2 py-0.5"
                                        >
                                          <option value="transparent">Transparent</option>
                                          <option value="card">Subtle Card</option>
                                        </select>
                                      </div>

                                      {/* Scroll Animation style */}
                                      <div className="flex items-center gap-1.5">
                                        <span>Scroll Entrance:</span>
                                        <select
                                          value={section.props?.animation || "slide"}
                                          onChange={(e) => updateLocalSection(section.id, { props: { ...section.props, animation: e.target.value } })}
                                          className="bg-background border border-border rounded px-2 py-0.5"
                                        >
                                          <option value="slide">Slide Up (Smooth)</option>
                                          <option value="fade">Fade In (Gentle)</option>
                                          <option value="scale">Scale Up (Dynamic)</option>
                                          <option value="none">None (Instant)</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                ) : section.componentKey === "gallery" ? (
                                  <div className="space-y-4">
                                      <div className="flex flex-col gap-4 border border-border/40 rounded-xl p-4 bg-muted/10 text-xs font-mono">
                                        <div className="flex flex-wrap items-center gap-6">
                                          {/* Layout Style Dropdown */}
                                          <div className="flex items-center gap-2">
                                            <span className="font-semibold text-foreground">Layout Style:</span>
                                            <select
                                              value={section.props?.fullBleed ? "bleed" : section.props?.carousel ? "carousel" : section.props?.bento ? "bento" : "grid"}
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                const newProps = { ...section.props };
                                                newProps.fullBleed = val === "bleed";
                                                newProps.carousel = val === "carousel";
                                                newProps.bento = val === "bento";
                                                updateLocalSection(section.id, { props: newProps });
                                              }}
                                              className="bg-background border border-border rounded px-2.5 py-1 text-foreground"
                                            >
                                              <option value="grid">Grid (Classic 2-Column)</option>
                                              <option value="bento">Bento Grid (Asymmetric Collage)</option>
                                              <option value="carousel">Carousel (Horizontal Slider)</option>
                                              <option value="bleed">Full Screen (Edge-to-Edge)</option>
                                            </select>
                                          </div>

                                          {/* Image Fit Selection */}
                                          <div className="flex items-center gap-2">
                                            <span className="font-semibold text-foreground">Image Fit:</span>
                                            <select
                                              value={section.props?.fitMode || "cover"}
                                              onChange={(e) => updateLocalSection(section.id, { props: { ...section.props, fitMode: e.target.value } })}
                                              className="bg-background border border-border rounded px-2.5 py-1 text-foreground"
                                            >
                                              <option value="cover">Crop & Fill Box (Cover)</option>
                                              <option value="contain">Fit Box with Borders (Contain)</option>
                                              <option value="natural">Original Proportions (No Crop)</option>
                                            </select>
                                          </div>

                                          {/* Lightbox Zoom Option */}
                                          <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                              type="checkbox"
                                              checked={section.props?.lightbox || false}
                                              onChange={(e) => updateLocalSection(section.id, { props: { ...section.props, lightbox: e.target.checked } })}
                                              className="rounded border-border focus:ring-0 text-foreground bg-background"
                                            />
                                            <span className="font-semibold">Enable Click to Zoom (Lightbox)</span>
                                          </label>
                                        </div>

                                        {/* Secondary layout settings - hidden on Full Bleed since it spans full screen */}
                                        {!section.props?.fullBleed && (
                                          <div className="flex flex-wrap items-center gap-6 border-t border-border/20 pt-3.5">
                                            {/* Box Proportions (Aspect Ratio) - Hidden if fitMode is natural (which enforces actual height) */}
                                            {section.props?.fitMode !== "natural" && (
                                              <div className="flex items-center gap-2">
                                                <span>Box Proportions:</span>
                                                <select
                                                  value={section.props?.aspectRatio || "video"}
                                                  onChange={(e) => updateLocalSection(section.id, { props: { ...section.props, aspectRatio: e.target.value } })}
                                                  className="bg-background border border-border rounded px-2 py-0.5"
                                                >
                                                  <option value="video">16:9 Landscape</option>
                                                  <option value="square">1:1 Square</option>
                                                  <option value="4-3">4:3 Standard</option>
                                                  <option value="21-9">21:9 Widescreen</option>
                                                  <option value="auto">Auto Dimensions</option>
                                                </select>
                                              </div>
                                            )}

                                            {/* Spacing Gap */}
                                            <div className="flex items-center gap-2">
                                              <span>Image Spacing:</span>
                                              <select
                                                value={section.props?.gapSize || "md"}
                                                onChange={(e) => updateLocalSection(section.id, { props: { ...section.props, gapSize: e.target.value } })}
                                                className="bg-background border border-border rounded px-2 py-0.5"
                                              >
                                                <option value="none">Seamless (No Gap)</option>
                                                <option value="sm">Tight</option>
                                                <option value="md">Balanced</option>
                                                <option value="lg">Spacious</option>
                                              </select>
                                            </div>

                                            {/* Border Corners */}
                                            <div className="flex items-center gap-2">
                                              <span>Image Corners:</span>
                                              <select
                                                value={section.props?.radius || "md"}
                                                onChange={(e) => updateLocalSection(section.id, { props: { ...section.props, radius: e.target.value } })}
                                                className="bg-background border border-border rounded px-2 py-0.5"
                                              >
                                                <option value="none">Square Edge</option>
                                                <option value="sm">Soft Round</option>
                                                <option value="md">Rounded</option>
                                                <option value="lg">Deep Round</option>
                                                <option value="full">Circle / Pill</option>
                                              </select>
                                            </div>
                                          </div>
                                        )}

                                        {/* Simple photographer helper hints */}
                                        <div className="text-[10px] text-muted-foreground/80 leading-relaxed border-t border-border/20 pt-2 font-sans">
                                          💡 {section.props?.fullBleed 
                                            ? "Full Screen layout spans edge-to-edge. Spacing, corners, and ratios are locked." 
                                            : section.props?.carousel 
                                            ? "Carousel Slider lays images in a swipeable horizontal row. Perfect for a series of photos." 
                                            : section.props?.bento 
                                            ? "Bento Collage alternates between full-width and square frames for a stylized, non-uniform grid look." 
                                            : "Classic Grid places photos in a balanced 2-column layout side-by-side."}
                                          {section.props?.fitMode === "natural" && " | Natural Fit displays images in their original proportions without cropping."}
                                        </div>
                                      </div>

                                    <div className="flex items-center justify-between border-t border-border/20 pt-2">
                                      <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Gallery Images / Video Assets</label>
                                      <label className="text-xs font-mono text-muted-foreground hover:text-foreground cursor-pointer inline-flex items-center gap-1">
                                        <Upload className="w-3 h-3" />
                                        <span>Upload Asset</span>
                                        <input
                                          type="file"
                                          multiple
                                          accept="image/*,video/*"
                                          className="hidden"
                                          onChange={(e) => handleFileUpload(e, "galleryBlock", section.id)}
                                        />
                                      </label>
                                    </div>

                                    {/* Asset preview layout cards */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                      {(section.props?.images || []).map((img: any, imgIdx: number) => (
                                        <div key={imgIdx} className="relative aspect-video rounded-lg overflow-hidden border border-border group bg-background/50">
                                          {img.url.endsWith(".mp4") ? (
                                            <video src={img.url} muted className="w-full h-full object-cover" />
                                          ) : (
                                            <img src={img.url} alt="Gallery item" className="w-full h-full object-cover" />
                                          )}
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const currentImages = [...(section.props?.images || [])];
                                              currentImages.splice(imgIdx, 1);
                                              updateLocalSection(section.id, { props: { ...section.props, images: currentImages } });
                                            }}
                                            className="absolute top-2 right-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : null}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: Media library logs */}
            {activeTab === "media" && (
              <div className="p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-border/30 pb-2">
                  <h3 className="font-serif text-lg text-foreground">Media Asset Database (ImageKit Uploaded CDN Links)</h3>
                  
                  <label className="group/btn active:scale-97 font-mono text-xs uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90 px-4 py-2 rounded-full transition-all inline-flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e)}
                    />
                  </label>
                </div>

                {mediaLibrary.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground font-mono text-xs border border-dashed border-border/60 rounded-xl">
                    No assets recorded in Database. Click "Upload File" to start seeding.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {mediaLibrary.map((item) => (
                      <div key={item.id} className="relative aspect-video rounded-xl overflow-hidden border border-border group bg-background/50">
                        {item.mimeType?.startsWith("video") || item.url.endsWith(".mp4") ? (
                          <div className="w-full h-full bg-zinc-900/60 flex items-center justify-center">
                            <Video className="w-6 h-6 text-foreground" />
                          </div>
                        ) : (
                          <img src={item.url} alt="Library visual" className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-all p-3 text-center">
                          <span className="font-mono text-[9px] truncate w-full text-foreground">{item.url}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(item.url);
                              alert("URL copied to clipboard!");
                            }}
                            className="px-2 py-1 rounded bg-foreground text-background font-mono text-[9px] uppercase tracking-wider cursor-pointer"
                          >
                            Copy Link
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="border border-border/40 rounded-2xl bg-muted/10 p-12 text-center space-y-4">
            <Sparkles className="w-10 h-10 text-muted-foreground mx-auto" />
            <h2 className="font-serif text-2xl text-foreground font-normal">Active Editor Console</h2>
            <p className="font-sans text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Select a project case study from the dropdown panel above to begin editing metadata, layouts, markdown contents, and media assets.
            </p>
          </div>
        )}
      </div>

      {/* Creation Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="border-border/60 bg-background text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-normal">Create Project</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400 font-mono">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Project Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                }}
                className="w-full rounded-md border border-border/60 bg-muted/20 px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-foreground transition-colors"
                placeholder="e.g. Constella Design System"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Slug Path
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full rounded-md border border-border/60 bg-muted/20 px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-foreground transition-colors"
                placeholder="constella-design-system"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Description
              </label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-20 w-full rounded-md border border-border/60 bg-muted/20 px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-foreground transition-colors resize-none"
                placeholder="Describe this project's process and approach..."
              />
            </div>

            <DialogFooter className="flex gap-3 pt-4 sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreating(false)}
                className="flex-1 border border-border text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-foreground text-background hover:bg-foreground/90 font-mono text-xs uppercase tracking-wider"
              >
                {loading ? "Creating..." : "Save Project"}
              </Button>
            </DialogFooter>
          </form>
          </DialogContent>
        </Dialog>

        {/* Full-Screen Live Project Preview Overlay (Sandboxed & Instant) */}
        {isPreviewing && localProjectState && (
          <div 
            onScroll={handlePreviewScroll}
            className="fixed inset-0 z-9999 bg-background overflow-y-auto animate-in fade-in duration-200"
          >
            {/* Sticky top bar controls */}
            <div className={`sticky top-0 z-10000 w-full px-6 md:px-12 py-5 bg-background/95 backdrop-blur-md border-b border-border/40 flex items-center justify-between transition-all duration-300 ${
              showPreviewHeader ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
            }`}>
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                Live Preview Mode (Unsaved Draft)
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsPreviewing(false);
                  setShowPreviewHeader(true);
                }}
                className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest bg-muted/80 border border-border hover:bg-muted text-foreground px-4 py-2.5 rounded-full cursor-pointer transition-colors shadow-md"
              >
                <X className="w-4 h-4" />
                <span>Close Preview</span>
              </button>
            </div>

            {/* Preview Body Container */}
            <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
              {/* General Meta Info */}
              <div className="flex items-center justify-between mb-16 pb-6 border-b border-border/40 font-mono text-xs text-muted-foreground">
                <span>Selected Work Preview</span>
                <span>Project Archive &bull; {localProjectState.year || "2026"}</span>
              </div>

             {/* Headline intro details */}
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-20">
               <div className="lg:col-span-8 space-y-6">
                 <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                   {localProjectState.category || "Design Engineering"}
                 </span>
                 <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-foreground leading-[1.05]">
                   {localProjectState.title}
                 </h1>
               </div>

               <div className="lg:col-span-4 lg:pt-10 space-y-6">
                 <p className="font-sans text-base sm:text-lg text-muted-foreground leading-relaxed">
                   {localProjectState.description}
                 </p>
                 {localProjectState.liveDemo && (
                   <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest bg-foreground text-background px-6 py-3 rounded-full">
                     <span>Live Demo</span>
                     <ExternalLink className="w-3 h-3" />
                   </div>
                 )}
               </div>
              {/* Dynamic Metadata Attributes */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-border/40 mb-20 font-mono text-xs">
                <div>
                  <span className="text-muted-foreground uppercase tracking-widest block mb-2">Client</span>
                  <span className="text-foreground">{localProjectState.client || "Self-Initiated"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground uppercase tracking-widest block mb-2">Role</span>
                  <span className="text-foreground">{localProjectState.role || "Design Engineer"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground uppercase tracking-widest block mb-2">Timeline</span>
                  <span className="text-foreground">{localProjectState.duration || "Ongoing"}</span>
                </div>
                {localProjectState.projectType && localProjectState.projectType.length > 0 && (
                  <div>
                    <span className="text-muted-foreground uppercase tracking-widest block mb-2">Focus</span>
                    <span className="text-foreground">{localProjectState.projectType.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>

{/* Client Overview Block */}
              {localProjectState.overview && (
                <div className="max-w-4xl mb-24 space-y-4">
                  <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground block mb-2">Overview</span>
                  <div
                    className="prose prose-invert max-w-none text-muted-foreground text-base sm:text-lg leading-relaxed prose-headings:font-serif prose-headings:font-normal prose-headings:text-foreground prose-a:text-foreground prose-a:underline"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtmlClient(localProjectState.overview) }}
                  />
                </div>
              )}

             {/* Featured Image */}
             {localProjectState.featuredImage && (
               <div className="mb-28 overflow-hidden rounded-2xl border border-border/60 bg-muted/20 aspect-video w-full">
                 {localProjectState.featuredImage.endsWith(".mp4") ? (
                   <video src={localProjectState.featuredImage} autoPlay muted loop className="w-full h-full object-cover object-top" />
                 ) : (
                   <img
                     src={localProjectState.featuredImage}
                     alt={localProjectState.title}
                     className="w-full h-full object-cover object-top"
                   />
                 )}
               </div>
             )}

             {/* Dynamic Section Blocks Render list */}
             <div className="space-y-24 border-t border-border/20 pt-16">
               {(localProjectState.sections || []).map((sec, idx) => (
                 <div key={sec.id} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start border-b border-border/10 pb-16">
                   {/* Left heading info */}
                   <div className="lg:col-span-3">
                     <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">
                       0{idx + 1} &bull; {sec.componentKey}
                     </span>
                     {sec.title && (
                       <h3 className="font-serif text-2xl text-foreground font-medium tracking-tight">
                         {sec.title}
                       </h3>
                     )}
                     {sec.subtitle && (
                       <p className="font-sans text-xs text-muted-foreground mt-2 leading-relaxed">
                         {sec.subtitle}
                       </p>
                     )}
                   </div>

                   {/* Right layout block preview */}
                   <div className="lg:col-span-9">
{sec.componentKey === "rich-text" ? (
                        <div className={`prose prose-invert max-w-none text-muted-foreground leading-relaxed text-left ${sec.props?.bgStyle === "card" ? "p-8 bg-muted/10 border border-border/40 rounded-xl" : ""}`}>
                          {sec.content ? (
                            <div dangerouslySetInnerHTML={{ __html: sanitizeHtmlClient(sec.content) }} />
                          ) : (
                           <p className="font-mono text-xs italic text-muted-foreground/60">Empty Text Block</p>
                         )}
                       </div>
                     ) : sec.componentKey === "gallery" ? (
                        sec.props?.carousel ? (
                          <div className="relative w-full">
                            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 no-scrollbar pb-2">
                              {(sec.props?.images || []).map((img: any, imgIdx: number) => {
                                const radiusMap = { none: "rounded-none", sm: "rounded-md", md: "rounded-lg", lg: "rounded-xl", full: "rounded-2xl" };
                                const radClass = radiusMap[sec.props?.radius as keyof typeof radiusMap] || radiusMap.md;
                                const isNatural = sec.props?.fitMode === "natural";
                                
                                return (
                                  <div 
                                    key={imgIdx} 
                                    className={`relative shrink-0 snap-start overflow-hidden border border-border/40 ${radClass} ${isNatural ? "h-50 w-auto aspect-auto" : "h-50 w-75"}`}
                                  >
                                    {img.url.endsWith(".mp4") ? (
                                      <video src={img.url} autoPlay muted loop className={`h-full ${isNatural ? "w-auto object-contain" : "w-full object-cover"}`} />
                                    ) : (
                                      <img src={img.url} alt="Gallery item" className={`h-full ${isNatural ? "w-auto object-contain" : "w-full object-cover"}`} />
                                    )}
                                  </div>
                                );
                              })}
                              {(sec.props?.images || []).length === 0 && (
                                <div className="w-full border border-dashed border-border/60 py-6 text-center text-muted-foreground/60 text-xs font-mono">
                                  Empty Gallery Block
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className={`grid grid-cols-2 ${sec.props?.gapSize === "none" ? "gap-0" : sec.props?.gapSize === "sm" ? "gap-2" : sec.props?.gapSize === "lg" ? "gap-8" : "gap-4"}`}>
                            {(sec.props?.images || []).map((img: any, imgIdx: number) => {
                              const radiusMap = { none: "rounded-none", sm: "rounded-md", md: "rounded-lg", lg: "rounded-xl", full: "rounded-2xl" };
                              const radClass = radiusMap[sec.props?.radius as keyof typeof radiusMap] || radiusMap.md;
                              const isNatural = sec.props?.fitMode === "natural";
                              const aspectClass = isNatural ? "h-auto" : "aspect-video";
                              const fitClass = isNatural ? "w-full h-auto object-contain" : "w-full h-full object-cover";
                              
                              return (
                                <div 
                                  key={imgIdx} 
                                  className={`relative ${aspectClass} overflow-hidden border border-border/40 ${radClass} ${sec.props?.fullBleed ? "col-span-2 aspect-auto h-62.5" : "col-span-1"}`}
                                >
                                  {img.url.endsWith(".mp4") ? (
                                    <video src={img.url} autoPlay muted loop className={fitClass} />
                                  ) : (
                                    <img src={img.url} alt="Gallery item" className={fitClass} />
                                  )}
                                </div>
                              );
                            })}
                            {(sec.props?.images || []).length === 0 && (
                              <div className="col-span-2 border border-dashed border-border/60 py-6 text-center text-muted-foreground/60 text-xs font-mono">
                                Empty Gallery Block
                              </div>
                            )}
                          </div>
                        )
                     ) : (
                       <div className="font-mono text-xs text-muted-foreground bg-muted/20 p-4 rounded-xl">
                         Preview not supported for component: {sec.componentKey}
                       </div>
                     )}
                   </div>
                 </div>
               ))}
             </div>
           </div>
         </div>
       )}

        {/* Custom Confirmation Alert Dialog Modal */}
        <Dialog 
          open={confirmDialog.isOpen} 
          onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, isOpen: open }))}
        >
          <DialogContent className="max-w-md bg-background border border-border/40 rounded-2xl p-6 font-sans">
            <DialogHeader>
              <DialogTitle className="font-serif text-lg font-normal text-foreground">
                {confirmDialog.title}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 text-sm text-muted-foreground leading-relaxed">
              {confirmDialog.description}
            </div>
            <DialogFooter className="flex gap-3 sm:justify-end pt-2">
              <Button
                variant="ghost"
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                className="border border-border text-muted-foreground hover:text-foreground rounded-full px-5 py-2 font-mono text-xs uppercase tracking-wider"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (pendingAction) pendingAction();
                  setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                }}
                className="bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-full px-5 py-2 font-mono text-xs uppercase tracking-wider shadow-md"
              >
                {confirmDialog.actionLabel}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
