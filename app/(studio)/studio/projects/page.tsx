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
  ChevronDown
} from "lucide-react";
import {
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
  addSectionAction,
  updateSectionAction,
  deleteSectionAction,
  reorderSectionsAction
} from "../actions";

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
  
  // Dropdown & Search filters
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Editor panel tab configuration
  const [activeTab, setActiveTab] = useState<"details" | "sections" | "media">("details");
  
  // Creation dialog state
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  
  // Action state trackers
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [uploading, setUploading] = useState(false);
  
  // Custom media storage log
  const [mediaLibrary, setMediaLibrary] = useState<Array<{ id: string; url: string; mimeType: string }>>([]);

  const router = useRouter();

  // Load project list
  const loadProjects = () => {
    fetch("/api/projects")
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

  // Sync general media catalog
  useEffect(() => {
    fetch("/api/media")
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
        status: "draft",
      });
      setIsCreating(false);
      setSelectedProjectId(newProject.id);
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
    if (!selectedProjectId || !localProjectState) return;
    setSaveStatus("saving");
    try {
      // 1. Save general meta fields
      const { sections, ...metaFields } = localProjectState;
      const updatedProject = await updateProjectAction(selectedProjectId, metaFields);

      // 2. Save all sections sequentially
      for (const section of sections) {
        await updateSectionAction(selectedProjectId, section.id, {
          title: section.title,
          subtitle: section.subtitle,
          content: section.content,
          props: section.props
        });
      }

      // Sync master list
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
        const formData = new FormData();
        formData.append("file", file);
        formData.append("projectId", selectedProjectId);

        const res = await fetch("/api/media", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
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
    if (!confirm("Are you sure you want to delete this project? This cannot be undone.")) return;
    try {
      await deleteProjectAction(selectedProjectId);
      setSelectedProjectId(null);
      loadProjects();
    } catch (err) {}
  };

  // Dropdown list computation
  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const currentProjectName = localProjectState?.title || "Select Project Case Study...";

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="space-y-3">
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Favurr Engine Workspace</span>
          </div>
          
          {/* Custom Dropdown Selector with Search Input */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="px-5 py-3 rounded-xl border border-border bg-muted/10 text-left font-serif text-2xl text-foreground flex items-center justify-between gap-4 cursor-pointer hover:border-border/80 min-w-[280px]"
            >
              <span>{currentProjectName}</span>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
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
                        if (isDirty && !confirm("Discard unsaved changes?")) return;
                        setSelectedProjectId(p.id);
                        setShowDropdown(false);
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

        <div className="flex items-center gap-4 self-end sm:self-auto">
          {saveStatus === "saving" && <span className="text-xs font-mono text-muted-foreground animate-pulse">Saving changes...</span>}
          {saveStatus === "saved" && <span className="text-xs font-mono text-emerald-400 font-medium">Saved to Database</span>}
          {saveStatus === "error" && <span className="text-xs font-mono text-rose-400 font-medium">Failed to save</span>}

          {/* Explicit Save Button for unsaved states */}
          {localProjectState && (
            <button
              onClick={handleSaveChanges}
              disabled={!isDirty || saveStatus === "saving"}
              className={`font-mono text-xs uppercase tracking-widest px-5 py-3 rounded-full transition-all inline-flex items-center gap-2 cursor-pointer ${
                isDirty 
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md"
                  : "bg-muted text-muted-foreground border border-border cursor-not-allowed"
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isDirty ? "Save Changes" : "No Changes"}</span>
            </button>
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

      {/* Editor Space */}
      <div className="w-full">
        {localProjectState ? (
          <div className="border border-border/40 rounded-2xl bg-muted/10 overflow-hidden">
            
            {/* Header tab controller */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/40 px-6 py-4 bg-muted/20 gap-4">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab("details")}
                  className={`px-3 py-1.5 rounded-md font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${activeTab === "details" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Settings &amp; Specs
                </button>
                <button
                  onClick={() => setActiveTab("sections")}
                  className={`px-3 py-1.5 rounded-md font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${activeTab === "sections" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Markdown / Dynamic Layout
                </button>
                <button
                  onClick={() => setActiveTab("media")}
                  className={`px-3 py-1.5 rounded-md font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${activeTab === "media" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Media Library
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
            {activeTab === "details" && (
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
                          <option value="draft">Draft (CMS Editor only)</option>
                          <option value="live">Live (Case Study Online)</option>
                          <option value="in progress">In Progress (Work in Progress status)</option>
                          <option value="archived">Archived (Archived status badge)</option>
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

                    <div className="flex items-center gap-2 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer font-mono text-[10px] uppercase tracking-wider text-foreground">
                        <input
                          type="checkbox"
                          checked={localProjectState.featured}
                          onChange={(e) => updateLocalMetaField({ featured: e.target.checked })}
                          className="rounded border-border bg-background focus:ring-0 text-foreground cursor-pointer"
                        />
                        <span>Featured on Home (Show on Landing Page)</span>
                      </label>
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
                                  </div>
                                ) : section.componentKey === "gallery" ? (
                                  <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-border/40 rounded-xl p-3 bg-muted/10 text-xs font-mono">
                                      <div className="flex items-center gap-6">
                                        {/* Bento Grid Option */}
                                        <label className="flex items-center gap-2 cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={section.props?.bento || false}
                                            onChange={(e) => updateLocalSection(section.id, { props: { ...section.props, bento: e.target.checked } })}
                                            className="rounded border-border focus:ring-0"
                                          />
                                          <span>Bento Grid Layout</span>
                                        </label>

                                        {/* Compact Padding Option */}
                                        <label className="flex items-center gap-2 cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={section.props?.compact || false}
                                            onChange={(e) => updateLocalSection(section.id, { props: { ...section.props, compact: e.target.checked } })}
                                            className="rounded border-border focus:ring-0"
                                          />
                                          <span>Compact Spacing</span>
                                        </label>

                                        {/* Full Bleed Layout Option */}
                                        <label className="flex items-center gap-2 cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={section.props?.fullBleed || false}
                                            onChange={(e) => updateLocalSection(section.id, { props: { ...section.props, fullBleed: e.target.checked } })}
                                            className="rounded border-border focus:ring-0"
                                          />
                                          <span>Full Bleed Layout</span>
                                        </label>
                                      </div>

                                      {/* Custom Border Radius Options */}
                                      <div className="flex items-center gap-2">
                                        <span>Border Radius:</span>
                                        <select
                                          value={section.props?.radius || "md"}
                                          onChange={(e) => updateLocalSection(section.id, { props: { ...section.props, radius: e.target.value } })}
                                          className="bg-background border border-border rounded px-2 py-0.5"
                                        >
                                          <option value="none">None</option>
                                          <option value="sm">Small</option>
                                          <option value="md">Medium</option>
                                          <option value="lg">Large</option>
                                          <option value="full">Full Rounded</option>
                                        </select>
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
    </div>
  );
}
