import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "..");

const MAX_READ_CHARS = 20000;
const MAX_SEARCH_RESULTS = 50;

function withinWorkspace(targetPath) {
  const resolved = path.resolve(workspaceRoot, targetPath);
  const relative = path.relative(workspaceRoot, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Path escapes workspace: ${targetPath}`);
  }
  return resolved;
}

async function walk(dir, results = [], maxDepth = 4, depth = 0) {
  if (depth > maxDepth) return results;
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist" || entry.name === "coverage") {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    results.push({
      path: path.relative(workspaceRoot, fullPath).replace(/\\/g, "/"),
      type: entry.isDirectory() ? "directory" : "file",
    });
    if (entry.isDirectory()) {
      await walk(fullPath, results, maxDepth, depth + 1);
    }
  }
  return results;
}

async function searchText(pattern, options = {}) {
  const { cwd = workspaceRoot, maxResults = MAX_SEARCH_RESULTS } = options;
  const args = ["-n", "-S", "--hidden", "--glob", "!node_modules/**", "--glob", "!.git/**"];
  if (pattern.startsWith("/") && pattern.endsWith("/") && pattern.length > 2) {
    args.push("-e", pattern.slice(1, -1));
  } else {
    args.push(pattern);
  }
  args.push(".");
  const { stdout } = await execFileAsync("rg", args, { cwd, maxBuffer: 1024 * 1024 });
  const lines = stdout.trim().split(/\r?\n/).filter(Boolean).slice(0, maxResults);
  return lines.map((line) => line.replace(new RegExp(`^${escapeRegExp(cwd === workspaceRoot ? "" : cwd.replace(workspaceRoot + path.sep, ""))}`), ""));
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function readProjectMap() {
  const mapPath = path.join(workspaceRoot, "PROJECT_MAP.md");
  try {
    return await fs.readFile(mapPath, "utf8");
  } catch {
    return null;
  }
}

async function ensureProjectMap() {
  const mapPath = path.join(workspaceRoot, "PROJECT_MAP.md");
  const exists = await fs
    .access(mapPath)
    .then(() => true)
    .catch(() => false);
  if (!exists) {
    await execFileAsync("node", ["scripts/generate-map.js"], {
      cwd: workspaceRoot,
      maxBuffer: 1024 * 1024 * 8,
    });
  }
  return fs.readFile(mapPath, "utf8");
}

const server = new Server(
  {
    name: "shop-quan-ao-understand",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "repo_overview",
      description: "Get a high-level overview of the repository and project map.",
      inputSchema: {
        type: "object",
        properties: {
          refresh: {
            type: "boolean",
            description: "Regenerate PROJECT_MAP.md before returning it.",
            default: false,
          },
        },
      },
    },
    {
      name: "list_files",
      description: "List files and folders inside the workspace with depth-limited traversal.",
      inputSchema: {
        type: "object",
        properties: {
          root: {
            type: "string",
            description: "Relative path inside the workspace.",
            default: ".",
          },
          maxDepth: {
            type: "number",
            description: "Traversal depth limit.",
            default: 4,
          },
        },
      },
    },
    {
      name: "search_text",
      description: "Search text across the workspace using ripgrep.",
      inputSchema: {
        type: "object",
        properties: {
          pattern: {
            type: "string",
            description: "Literal text or /regex/ to search for.",
          },
          root: {
            type: "string",
            description: "Relative root path to search from.",
            default: ".",
          },
        },
        required: ["pattern"],
      },
    },
    {
      name: "read_file",
      description: "Read a file from the workspace with a safe path guard.",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Relative path to the file.",
          },
          maxChars: {
            type: "number",
            description: "Maximum number of characters to return.",
            default: MAX_READ_CHARS,
          },
        },
        required: ["path"],
      },
    },
    {
      name: "find_project_map",
      description: "Read the generated PROJECT_MAP.md file.",
      inputSchema: { type: "object", properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  if (name === "repo_overview") {
    const content = args.refresh ? await ensureProjectMap() : await readProjectMap();
    if (!content) {
      return {
        content: [
          {
            type: "text",
            text: "PROJECT_MAP.md not found. Use refresh=true to generate it.",
          },
        ],
      };
    }
    return {
      content: [
        {
          type: "text",
          text: content.slice(0, 50000),
        },
      ],
    };
  }

  if (name === "list_files") {
    const root = withinWorkspace(args.root || ".");
    const maxDepth = Number.isFinite(args.maxDepth) ? Number(args.maxDepth) : 4;
    const items = await walk(root, [], maxDepth);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ root: path.relative(workspaceRoot, root) || ".", items }, null, 2),
        },
      ],
    };
  }

  if (name === "search_text") {
    const root = withinWorkspace(args.root || ".");
    const pattern = String(args.pattern || "").trim();
    if (!pattern) throw new Error("pattern is required");
    const results = await searchText(pattern, { cwd: root });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ root: path.relative(workspaceRoot, root) || ".", pattern, results }, null, 2),
        },
      ],
    };
  }

  if (name === "read_file") {
    const filePath = withinWorkspace(args.path);
    const maxChars = Number.isFinite(args.maxChars) ? Number(args.maxChars) : MAX_READ_CHARS;
    const content = await fs.readFile(filePath, "utf8");
    return {
      content: [
        {
          type: "text",
          text: content.slice(0, maxChars),
        },
      ],
    };
  }

  if (name === "find_project_map") {
    const content = await readProjectMap();
    return {
      content: [
        {
          type: "text",
          text: content || "PROJECT_MAP.md not found.",
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
