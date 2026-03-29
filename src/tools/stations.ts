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

export function registerStationTools(server: McpServer, client: RadioadminClient): void {
  server.tool(
    "list_stations",
    "List all stations accessible with the current token",
    {},
    async () => {
      try { return ok(await client.get("/stations")); }
      catch (e) { return err(e); }
    }
  );

  server.tool(
    "get_station",
    "Get detailed information about a specific station",
    { station_id: z.number().int().describe("The station ID") },
    async ({ station_id }) => {
      try { return ok(await client.get(`/stations/${station_id}`)); }
      catch (e) { return err(e); }
    }
  );

  server.tool(
    "update_station",
    "Update station information (description, format, djs, location, website, twitter_name, facebook_page, instagram_name, genres)",
    {
      station_id: z.number().int().describe("The station ID"),
      description: z.string().optional().describe("Station description"),
      format: z.string().optional().describe("Station format"),
      djs: z.string().optional().describe("DJs string"),
      location: z.string().optional().describe("Station location"),
      website: z.string().nullable().optional().describe("Station website URL"),
      twitter_name: z.string().nullable().optional().describe("Twitter handle"),
      facebook_page: z.string().nullable().optional().describe("Facebook page"),
      instagram_name: z.string().nullable().optional().describe("Instagram handle"),
      genres: z.array(z.string()).max(3).optional().describe("Up to 3 genres"),
    },
    async ({ station_id, ...body }) => {
      try { return ok(await client.patch(`/stations/${station_id}`, body)); }
      catch (e) { return err(e); }
    }
  );

  server.tool(
    "get_station_state",
    "Check if a station is active and playing on a streaming server",
    { station_id: z.number().int().describe("The station ID") },
    async ({ station_id }) => {
      try { return ok(await client.get(`/stations/${station_id}/state`)); }
      catch (e) { return err(e); }
    }
  );

  server.tool(
    "activate_station",
    "Activate a station — triggers a playlist export and starts the station on a streaming server if assigned and not running",
    { station_id: z.number().int().describe("The station ID") },
    async ({ station_id }) => {
      try { return ok(await client.post(`/stations/${station_id}/state`)); }
      catch (e) { return err(e); }
    }
  );

  server.tool(
    "get_current_playlist",
    "Get the currently playing playlist and its tracks for a station",
    { station_id: z.number().int().describe("The station ID") },
    async ({ station_id }) => {
      try { return ok(await client.get(`/stations/${station_id}/current_playlist`)); }
      catch (e) { return err(e); }
    }
  );

  server.tool(
    "get_listener_stats",
    "Get listener statistics for a station (current listeners, position, switchons log, TLH log)",
    { station_id: z.number().int().describe("The station ID") },
    async ({ station_id }) => {
      try { return ok(await client.get(`/stations/${station_id}/stats`)); }
      catch (e) { return err(e); }
    }
  );
}
