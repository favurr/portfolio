import { vectorIndex } from "@/lib/vector";
import { knowledgeDal } from "@/dal/knowledge";
import { projectDal } from "@/dal/project";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const VECTOR_CACHE_PREFIX = "vector:search:";

async function invalidateVectorCache(): Promise<void> {
  try {
    // Note: Upstash Redis doesn't support SCAN/KEYS pattern deletion directly
    // In production, you'd use a different approach (e.g., Redis SCAN + DEL)
    // For now, we rely on TTL expiration (5 minutes)
    console.log("[VECTOR-SYNC] Vector search cache will expire via TTL (5 min)");
  } catch (err) {
    console.warn("[VECTOR-SYNC] Cache invalidation note:", err);
  }
}

export const vectorSyncService = {
  async syncKnowledgeToVector(entry: { id: string; title: string; content: string; category?: string | null }) {
    if (!vectorIndex) return;
    try {
      console.log(`[VECTOR-SYNC] Syncing knowledge entry: ${entry.id}`);
      await vectorIndex.upsert([
        {
          id: `knowledge:${entry.id}`,
          data: `Title: ${entry.title}\nCategory: ${entry.category || "General"}\nContent: ${entry.content}`,
          metadata: {
            type: "knowledge",
            id: entry.id,
            title: entry.title,
            category: entry.category || "General",
          },
        },
      ]);
      await invalidateVectorCache();
    } catch (err) {
      console.error(`[VECTOR-SYNC] Failed to sync knowledge ${entry.id}:`, err);
    }
  },

  async deleteKnowledgeFromVector(id: string) {
    if (!vectorIndex) return;
    try {
      console.log(`[VECTOR-SYNC] Deleting knowledge entry from vector: ${id}`);
      await vectorIndex.delete([`knowledge:${id}`]);
      await invalidateVectorCache();
    } catch (err) {
      console.error(`[VECTOR-SYNC] Failed to delete knowledge ${id}:`, err);
    }
  },

  async syncProjectToVector(project: { id: string; title: string; description: string; overview?: string | null; category?: string | null; role?: string | null }) {
    if (!vectorIndex) return;
    try {
      console.log(`[VECTOR-SYNC] Syncing project: ${project.id}`);
      const content = `Project Title: ${project.title}\nRole: ${project.role || ""}\nDescription: ${project.description}\nOverview: ${project.overview || ""}`;
      await vectorIndex.upsert([
        {
          id: `project:${project.id}`,
          data: content,
          metadata: {
            type: "project",
            id: project.id,
            title: project.title,
            category: project.category || "Design Engineering",
          },
        },
      ]);
      await invalidateVectorCache();
    } catch (err) {
      console.error(`[VECTOR-SYNC] Failed to sync project ${project.id}:`, err);
    }
  },

  async deleteProjectFromVector(id: string) {
    if (!vectorIndex) return;
    try {
      console.log(`[VECTOR-SYNC] Deleting project from vector: ${id}`);
      await vectorIndex.delete([`project:${id}`]);
      await invalidateVectorCache();
    } catch (err) {
      console.error(`[VECTOR-SYNC] Failed to delete project ${id}:`, err);
    }
  },

  async reindexAll() {
    if (!vectorIndex) {
      throw new Error("Vector index is not initialized. Environment variables are missing.");
    }

    console.log("[VECTOR-SYNC] Reindexing all knowledge base entries and projects...");

    const knowledgeEntries = await knowledgeDal.getAllEntries();
    const enabledKnowledge = knowledgeEntries.filter((e) => e.enabled);
    const projects = await projectDal.getProjects();
    const activeProjects = projects.filter((p) => p.status !== "archived");

    const upserts: any[] = [];

    for (const entry of enabledKnowledge) {
      upserts.push({
        id: `knowledge:${entry.id}`,
        data: `Title: ${entry.title}\nCategory: ${entry.category || "General"}\nContent: ${entry.content}`,
        metadata: {
          type: "knowledge",
          id: entry.id,
          title: entry.title,
          category: entry.category || "General",
        },
      });
    }

    for (const project of activeProjects) {
      const content = `Project Title: ${project.title}\nRole: ${project.role || ""}\nDescription: ${project.description}\nOverview: ${project.overview || ""}`;
      upserts.push({
        id: `project:${project.id}`,
        data: content,
        metadata: {
          type: "project",
          id: project.id,
          title: project.title,
          category: project.category || "Design Engineering",
        },
      });
    }

    if (upserts.length > 0) {
      // Chunk upserts in batches of 100 to respect Upstash payload limits
      const chunkSize = 100;
      for (let i = 0; i < upserts.length; i += chunkSize) {
        const chunk = upserts.slice(i, i + chunkSize);
        await vectorIndex.upsert(chunk);
      }
    }

    await invalidateVectorCache();

    console.log(`[VECTOR-SYNC] Reindexing complete. Indexed ${enabledKnowledge.length} facts and ${activeProjects.length} projects.`);
    return {
      indexedFacts: enabledKnowledge.length,
      indexedProjects: activeProjects.length,
    };
  },
};
