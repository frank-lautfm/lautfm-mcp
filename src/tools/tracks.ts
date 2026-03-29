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

export function registerTrackTools(server: McpServer, client: RadioadminClient): void {
  server.tool(
    "search_tracks",
    "Search tracks for a station using various filters. Note: this endpoint is deprecated and will be replaced in a future version.",
    {
      station_id: z.number().int().describe("The station ID"),
      own: z.boolean().optional().describe("Filter to own tracks only"),
      private: z.boolean().optional().describe("Filter to private tracks"),
      release_year: z.number().int().optional().describe("Exact release year"),
      min_release_year: z.number().int().optional().describe("Minimum release year"),
      max_release_year: z.number().int().optional().describe("Maximum release year"),
      type: z.string().optional().describe("Track type"),
      artist: z.string().optional().describe("Artist name filter"),
      title: z.string().optional().describe("Title filter"),
      album: z.string().optional().describe("Album filter"),
      genre: z.string().optional().describe("Genre filter"),
      created_at: z.string().optional().describe("Created at date filter"),
      min_created_at: z.string().optional().describe("Minimum created at date"),
      max_created_at: z.string().optional().describe("Maximum created at date"),
      playlist: z.string().optional().describe("Playlist filter"),
      duration: z.number().int().optional().describe("Exact duration in seconds"),
      min_duration: z.number().int().optional().describe("Minimum duration in seconds"),
      max_duration: z.number().int().optional().describe("Maximum duration in seconds"),
      order: z.string().optional().describe("Sort order"),
    },
    async ({ station_id, ...query }) => {
      try {
        const q: Record<string, string | number | boolean | undefined> = {};
        for (const [k, v] of Object.entries(query)) {
          if (v !== undefined) q[k] = v as string | number | boolean;
        }
        return ok(await client.get(`/stations/${station_id}/tracks`, q));
      }
      catch (e) { return err(e); }
    }
  );

  server.tool(
    "get_tracks_by_ids",
    "Get track information for one or more track IDs (comma-separated list)",
    {
      station_id: z.number().int().describe("The station ID"),
      track_ids: z.array(z.number().int()).min(1).describe("Array of track IDs to retrieve"),
    },
    async ({ station_id, track_ids }) => {
      try { return ok(await client.get(`/stations/${station_id}/tracks/${track_ids.join(",")}`)); }
      catch (e) { return err(e); }
    }
  );

  server.tool(
    "update_track",
    "Update metadata for a track",
    {
      station_id: z.number().int().describe("The station ID"),
      track_id: z.number().int().describe("The track ID"),
      title: z.string().optional().describe("Track title"),
      artist: z.string().optional().describe("Artist name"),
      album: z.string().optional().describe("Album name"),
      genre: z.string().optional().describe("Genre"),
      release_year: z.number().int().optional().describe("Release year"),
      release_month: z.number().int().optional().describe("Release month"),
      release_day: z.number().int().optional().describe("Release day"),
      type: z.string().optional().describe("Track type"),
    },
    async ({ station_id, track_id, ...body }) => {
      try { return ok(await client.patch(`/stations/${station_id}/tracks/${track_id}`, body)); }
      catch (e) { return err(e); }
    }
  );

  server.tool(
    "delete_track",
    "Delete an own track from a station",
    {
      station_id: z.number().int().describe("The station ID"),
      track_id: z.number().int().describe("The track ID to delete"),
    },
    async ({ station_id, track_id }) => {
      try { return ok(await client.delete(`/stations/${station_id}/tracks/${track_id}`)); }
      catch (e) { return err(e); }
    }
  );

  server.tool(
    "get_track_stats",
    "Get current day track statistics (play time, listener count, live flag) for a station",
    { station_id: z.number().int().describe("The station ID") },
    async ({ station_id }) => {
      try { return ok(await client.get(`/stations/${station_id}/tracks/stats`)); }
      catch (e) { return err(e); }
    }
  );

  server.tool(
    "get_track_stats_period",
    "Get track statistics for a specific period. Use '24h' for the last 24 hours or a date in 'yyyy-mm-dd' format.",
    {
      station_id: z.number().int().describe("The station ID"),
      period: z.string().describe("Period: '24h' or a date in yyyy-mm-dd format"),
    },
    async ({ station_id, period }) => {
      try { return ok(await client.get(`/stations/${station_id}/tracks/stats/${period}`)); }
      catch (e) { return err(e); }
    }
  );

  server.tool(
    "get_track_tags_for_ids",
    "Get tags for one or more specific tracks",
    {
      station_id: z.number().int().describe("The station ID"),
      track_ids: z.array(z.number().int()).min(1).describe("Array of track IDs"),
    },
    async ({ station_id, track_ids }) => {
      try { return ok(await client.get(`/stations/${station_id}/tracks/${track_ids.join(",")}/tags`)); }
      catch (e) { return err(e); }
    }
  );

  server.tool(
    "add_track_tags",
    "Add tags to one or more tracks",
    {
      station_id: z.number().int().describe("The station ID"),
      track_ids: z.array(z.number().int()).min(1).describe("Array of track IDs"),
      tags: z.array(z.string()).describe("Array of tag strings to add"),
    },
    async ({ station_id, track_ids, tags }) => {
      try { return ok(await client.post(`/stations/${station_id}/tracks/${track_ids.join(",")}/tags`, { tags })); }
      catch (e) { return err(e); }
    }
  );

  server.tool(
    "remove_track_tags",
    "Remove tags from one or more tracks",
    {
      station_id: z.number().int().describe("The station ID"),
      track_ids: z.array(z.number().int()).min(1).describe("Array of track IDs"),
      tags: z.array(z.string()).describe("Array of tag strings to remove"),
    },
    async ({ station_id, track_ids, tags }) => {
      try { return ok(await client.delete(`/stations/${station_id}/tracks/${track_ids.join(",")}/tags`, { tags })); }
      catch (e) { return err(e); }
    }
  );

  server.tool(
    "get_all_track_tags",
    "Get all tags used across all tracks for a station",
    { station_id: z.number().int().describe("The station ID") },
    async ({ station_id }) => {
      try { return ok(await client.get(`/stations/${station_id}/tracks/tags`)); }
      catch (e) { return err(e); }
    }
  );

  server.tool(
    "get_incomplete_tracks",
    "Get tracks with incomplete uploads for a station",
    { station_id: z.number().int().describe("The station ID") },
    async ({ station_id }) => {
      try { return ok(await client.get(`/stations/${station_id}/tracks;incomplete`)); }
      catch (e) { return err(e); }
    }
  );

  server.tool(
    "get_queued_tracks",
    "Get tracks that are queued for processing for a station",
    { station_id: z.number().int().describe("The station ID") },
    async ({ station_id }) => {
      try { return ok(await client.get(`/stations/${station_id}/tracks;queued`)); }
      catch (e) { return err(e); }
    }
  );
}
