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

const ScheduleEntrySchema = z.object({
  playlist_id: z.number().int().describe("Playlist ID for this schedule entry"),
  slot: z.number().int().describe("Time slot index"),
  duration: z.number().int().describe("Duration in seconds"),
});

export function registerScheduleTools(server: McpServer, client: RadioadminClient): void {
  server.tool(
    "get_schedule",
    "Get the schedule for a station",
    { station_id: z.number().int().describe("The station ID") },
    async ({ station_id }) => {
      try { return ok(await client.get(`/stations/${station_id}/schedule`)); }
      catch (e) { return err(e); }
    }
  );

  server.tool(
    "update_schedule",
    "Modify the schedule for a station. You cannot add an entry for the Base Playlist into entries. If you change the base_playlist_id, any entries containing that ID will be deleted.",
    {
      station_id: z.number().int().describe("The station ID"),
      base_playlist_id: z.number().int().optional().describe("ID of the base (fallback) playlist"),
      entries: z.array(ScheduleEntrySchema).optional().describe("Array of schedule entries"),
    },
    async ({ station_id, ...body }) => {
      try { return ok(await client.patch(`/stations/${station_id}/schedule`, body)); }
      catch (e) { return err(e); }
    }
  );
}
