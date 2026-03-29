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

export function registerPlaylistTools(server: McpServer, client: RadioadminClient): void {
  server.tool(
    "get_playlists",
    "List all playlists for a station",
    { station_id: z.number().int().describe("The station ID") },
    async ({ station_id }) => {
      try { return ok(await client.get(`/stations/${station_id}/playlists`)); }
      catch (e) { return err(e); }
    }
  );

  server.tool(
    "add_playlist",
    "Add a new playlist to a station. Requires at minimum a title and color (full 6-digit hex, e.g. #ff0000)",
    {
      station_id: z.number().int().describe("The station ID"),
      title: z.string().describe("Playlist title"),
      color: z.string().regex(/^#[a-fA-F0-9]{6}$/).describe("Color in full hex format, e.g. #ff0000"),
      description: z.string().optional().describe("Playlist description"),
      shuffled: z.boolean().optional().describe("Whether the playlist is shuffled"),
      shuffle_opts: z.record(z.unknown()).optional().describe("Shuffle options object"),
    },
    async ({ station_id, ...body }) => {
      try { return ok(await client.post(`/stations/${station_id}/playlists`, body)); }
      catch (e) { return err(e); }
    }
  );

  server.tool(
    "get_playlist",
    "Get information for a single playlist including its entries",
    {
      station_id: z.number().int().describe("The station ID"),
      playlist_id: z.number().int().describe("The playlist ID"),
    },
    async ({ station_id, playlist_id }) => {
      try { return ok(await client.get(`/stations/${station_id}/playlists/${playlist_id}`)); }
      catch (e) { return err(e); }
    }
  );

  server.tool(
    "update_playlist",
    "Modify an existing playlist for a station",
    {
      station_id: z.number().int().describe("The station ID"),
      playlist_id: z.number().int().describe("The playlist ID"),
      title: z.string().optional().describe("Playlist title"),
      color: z.string().regex(/^#[a-fA-F0-9]{6}$/).optional().describe("Color in full hex format"),
      description: z.string().optional().describe("Playlist description"),
      shuffled: z.boolean().optional().describe("Whether the playlist is shuffled"),
      shuffle_opts: z.record(z.unknown()).optional().describe("Shuffle options object"),
    },
    async ({ station_id, playlist_id, ...body }) => {
      try { return ok(await client.patch(`/stations/${station_id}/playlists/${playlist_id}`, body)); }
      catch (e) { return err(e); }
    }
  );

  server.tool(
    "delete_playlist",
    "Delete a single playlist for a station. The rotation playlist cannot be deleted.",
    {
      station_id: z.number().int().describe("The station ID"),
      playlist_id: z.number().int().describe("The playlist ID"),
    },
    async ({ station_id, playlist_id }) => {
      try { return ok(await client.delete(`/stations/${station_id}/playlists/${playlist_id}`)); }
      catch (e) { return err(e); }
    }
  );

  server.tool(
    "add_track_to_playlist",
    "Append a single track to a playlist. The track must not already be in the playlist.",
    {
      station_id: z.number().int().describe("The station ID"),
      playlist_id: z.number().int().describe("The playlist ID"),
      track_id: z.number().int().describe("The track ID to add"),
    },
    async ({ station_id, playlist_id, track_id }) => {
      try { return ok(await client.post(`/stations/${station_id}/playlists/${playlist_id}`, { track_id })); }
      catch (e) { return err(e); }
    }
  );

  server.tool(
    "get_playlist_tracks",
    "Get all tracks for a playlist (tracks are unique and not necessarily in playlist order)",
    {
      station_id: z.number().int().describe("The station ID"),
      playlist_id: z.number().int().describe("The playlist ID"),
    },
    async ({ station_id, playlist_id }) => {
      try { return ok(await client.get(`/stations/${station_id}/playlists/${playlist_id}/tracks`)); }
      catch (e) { return err(e); }
    }
  );

  server.tool(
    "delete_track_from_playlist",
    "Delete all occurrences of a track from a playlist",
    {
      station_id: z.number().int().describe("The station ID"),
      playlist_id: z.number().int().describe("The playlist ID"),
      track_id: z.number().int().describe("The track ID to remove"),
    },
    async ({ station_id, playlist_id, track_id }) => {
      try { return ok(await client.delete(`/stations/${station_id}/playlists/${playlist_id}/entries/${track_id}`)); }
      catch (e) { return err(e); }
    }
  );
}
