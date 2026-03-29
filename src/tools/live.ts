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

export function registerLiveTools(server: McpServer, client: RadioadminClient): void {
  server.tool(
    "get_live_connection_info",
    "Get live streaming connection information for a station (server, port, mountpoint, bitrate, samplerate, format, etc.)",
    { station_id: z.number().int().describe("The station ID") },
    async ({ station_id }) => {
      try { return ok(await client.get(`/stations/${station_id}/live`)); }
      catch (e) { return err(e); }
    }
  );

  server.tool(
    "get_live_password",
    "Get the live streaming password for a station",
    { station_id: z.number().int().describe("The station ID") },
    async ({ station_id }) => {
      try { return ok(await client.get(`/stations/${station_id}/live/password`)); }
      catch (e) { return err(e); }
    }
  );
}
