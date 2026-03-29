import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { RadioadminClient, ApiError } from "../client.js";

function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}
function err(e: unknown) {
  const msg = e instanceof ApiError ? e.message : String(e);
  return { content: [{ type: "text" as const, text: `Error: ${msg}` }], isError: true as const };
}

export function registerAutomationTools(server: McpServer, client: RadioadminClient): void {
  server.tool(
    "get_automation_algorithm",
    "View the definition of a specific automation algorithm",
    { name: z.string().describe("The automation algorithm name") },
    async ({ name }) => {
      try { return ok(await client.get(`/automation_algorithms/${name}`)); }
      catch (e) { return err(e); }
    }
  );

  server.tool(
    "create_automation_algorithm",
    "Create a new automation algorithm for shuffling tracks",
    {
      name: z.string().describe("The automation algorithm name"),
      body: z.string().describe("JavaScript function body, e.g. (function(tracks){return tracks.reverse()})"),
    },
    async ({ name, body }) => {
      try { return ok(await client.put(`/automation_algorithms/${name}`, { body })); }
      catch (e) { return err(e); }
    }
  );

  server.tool(
    "update_automation_algorithm",
    "Update the function used by an existing automation algorithm",
    {
      name: z.string().describe("The automation algorithm name"),
      body: z.string().describe("JavaScript function body, e.g. (function(tracks){return tracks.reverse()})"),
    },
    async ({ name, body }) => {
      try { return ok(await client.patch(`/automation_algorithms/${name}`, { body })); }
      catch (e) { return err(e); }
    }
  );

  server.tool(
    "delete_automation_algorithm",
    "Delete an automation algorithm",
    { name: z.string().describe("The automation algorithm name") },
    async ({ name }) => {
      try { return ok(await client.delete(`/automation_algorithms/${name}`)); }
      catch (e) { return err(e); }
    }
  );
}
