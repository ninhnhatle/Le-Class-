import type { VideoQuestion } from "@/lib/interactive-video/types";
import { getStepSettingsKey, STEP_IDS } from "@/lib/step-settings/keys";

export const KNOWLEDGE_SETTINGS_STORAGE_KEY = getStepSettingsKey(STEP_IDS.knowledge);

/** Bundled sample video served from `public/assets/`. */
export const KNOWLEDGE_SAMPLE_VIDEO_PATH = "/assets/knowledge-sample.mp4";
export const KNOWLEDGE_SAMPLE_VIDEO_NAME = "knowledge-sample.mp4";

export type KnowledgeVideoSource = "sample" | "custom";

export type KnowledgeSettings = {
  videoSource: KnowledgeVideoSource;
  videoName: string;
  questions: VideoQuestion[];
};

export const DEFAULT_KNOWLEDGE_SETTINGS: KnowledgeSettings = {
  videoSource: "sample",
  videoName: KNOWLEDGE_SAMPLE_VIDEO_NAME,
  questions: [],
};
