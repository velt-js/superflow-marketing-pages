// Types for the WebMCP browser API (W3C Web Machine Learning CG).
//
// Hand-written because TypeScript's DOM library does not describe this API
// yet: it is an origin trial, not a shipped standard, and the shape has moved
// twice already (window.agent -> navigator.modelContext -> document.modelContext).
// Declaring it here rather than reaching for `any` keeps the tool descriptors
// type-checked against what the spec actually says.
//
// Spec: https://webmachinelearning.github.io/webmcp/

import type { ToolInputSchema } from "@/lib/tools/api-catalog";

/**
 * Hints that tell an agent how a tool behaves before it calls it.
 *
 * `readOnlyHint` is the one that matters most here: every tool this site
 * registers reads or computes and none of them change anything the visitor
 * owns, so an agent can call them without asking permission first.
 */
export type WebMcpToolAnnotations = {
  readOnlyHint?: boolean;
  untrustedContentHint?: boolean;
  consequentialHint?: boolean;
  /**
   * Not in the WebMCP annotation set, but carried by the same entries over
   * MCP, where it tells a client the tool reaches the open internet rather
   * than a closed dataset. Harmless to a client that does not read it.
   */
  openWorldHint?: boolean;
};

/** Options the handler is called with. Carries the abort signal. */
export type WebMcpExecuteOptions = { signal?: AbortSignal };

/**
 * One tool, as `registerTool` takes it.
 *
 * The return value of `execute` is serialised to JSON by the browser and
 * handed to the agent, so it must be a plain value - no DOM nodes, no
 * functions, nothing with a cycle.
 */
export type WebMcpTool = {
  name: string;
  title?: string;
  description: string;
  inputSchema?: ToolInputSchema;
  annotations?: WebMcpToolAnnotations;
  execute: (input: Record<string, unknown>, options: WebMcpExecuteOptions) => Promise<unknown>;
};

export type WebMcpRegisterOptions = {
  /** Aborting this unregisters the tool. The spec's only removal mechanism. */
  signal?: AbortSignal;
  exposedTo?: string[];
};

export type ModelContext = {
  registerTool: (tool: WebMcpTool, options?: WebMcpRegisterOptions) => Promise<void>;
};

/**
 * Finds the API wherever this browser puts it.
 *
 * `document.modelContext` is the current home (Chrome 150+). Chrome 149
 * exposes only `navigator.modelContext`, and Chrome 150-152 keep it as a
 * deprecated alias that logs a console warning; it is gone again by 153. So
 * read the document first and treat the navigator path as the fallback it now
 * is, rather than picking one and breaking on half the origin trial.
 *
 * @returns The model context, or null in a browser without WebMCP.
 */
export function getModelContext(): ModelContext | null {
  try {
    if (typeof document === "undefined") return null;
    const fromDocument = (document as Document & { modelContext?: ModelContext }).modelContext;
    if (fromDocument?.registerTool) return fromDocument;
    const fromNavigator = (navigator as Navigator & { modelContext?: ModelContext }).modelContext;
    if (fromNavigator?.registerTool) return fromNavigator;
    return null;
  } catch {
    return null;
  }
}
