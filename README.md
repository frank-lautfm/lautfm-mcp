# lautfm-mcp

An [MCP](https://modelcontextprotocol.io/) server that provides access to the [laut.fm Radioadmin API](https://api.radioadmin.laut.fm).

## Requirements

- Node.js 18 or later
- A valid laut.fm Radioadmin API token

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Build

```bash
npm run build
```

### 3. Configure your MCP client

Add the server to your MCP client configuration (e.g. Claude Desktop `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "lautfm": {
      "command": "node",
      "args": ["/absolute/path/to/lautfm-mcp/dist/index.js"],
      "env": {
        "LAUTFM_TOKEN": "your-radioadmin-api-token-here"
      }
    }
  }
}
```

Generate a token by calling https://radioadmin.laut.fm/login?callback_url=LautfmMCP

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `LAUTFM_TOKEN` | ✅ Yes | Your laut.fm Radioadmin API bearer token. The server will exit immediately if this is not set. |

## Authentication & Origin

Every request to the Radioadmin API is sent with:
- `Authorization: Bearer <LAUTFM_TOKEN>`
- `Origin: LautfmMCP`

## Available Tools

### General

| Tool | Description |
|------|-------------|
| `get_server_status` | Check the laut.fm Radioadmin API server status |

### Station

| Tool | Description |
|------|-------------|
| `list_stations` | List all stations accessible with the current token |
| `get_station` | Get detailed information about a specific station |
| `update_station` | Update station information (description, format, djs, location, website, social links, genres) |
| `get_station_state` | Check if a station is active and playing on a streaming server |
| `activate_station` | Activate a station — triggers a playlist export and starts streaming |
| `get_current_playlist` | Get the currently playing playlist and its tracks |
| `get_listener_stats` | Get listener statistics (current listeners, position, switchons log, TLH log) |

### Users

| Tool | Description |
|------|-------------|
| `get_station_users` | List all users of a station |
| `add_station_user` | Add a user with a given role to a station (sends an invitation) |
| `update_station_user_role` | Change the role of a user on a station |
| `remove_station_user` | Remove a user from a station |

### Playlists

| Tool | Description |
|------|-------------|
| `get_playlists` | List all playlists for a station |
| `add_playlist` | Add a new playlist to a station |
| `get_playlist` | Get information for a single playlist including its entries |
| `update_playlist` | Modify an existing playlist |
| `delete_playlist` | Delete a playlist (the rotation playlist cannot be deleted) |
| `add_track_to_playlist` | Append a single track to a playlist |
| `get_playlist_tracks` | Get all tracks for a playlist |
| `delete_track_from_playlist` | Delete all occurrences of a track from a playlist |

### Schedule

| Tool | Description |
|------|-------------|
| `get_schedule` | Get the schedule for a station |
| `update_schedule` | Modify the schedule for a station |

### Tracks

| Tool | Description |
|------|-------------|
| `search_tracks` | Search tracks using various filters (deprecated endpoint) |
| `get_tracks_by_ids` | Get track information for one or more track IDs |
| `update_track` | Update metadata for a track |
| `delete_track` | Delete an own track from a station |
| `get_track_stats` | Get current day track statistics |
| `get_track_stats_period` | Get track statistics for a specific period (`24h` or `yyyy-mm-dd`) |
| `get_track_tags_for_ids` | Get tags for one or more specific tracks |
| `add_track_tags` | Add tags to one or more tracks |
| `remove_track_tags` | Remove tags from one or more tracks |
| `get_all_track_tags` | Get all tags used across all tracks for a station |
| `get_incomplete_tracks` | Get tracks with incomplete uploads |
| `get_queued_tracks` | Get tracks queued for processing |

### Live

| Tool | Description |
|------|-------------|
| `get_live_connection_info` | Get live streaming connection information (server, port, mountpoint, bitrate, etc.) |
| `get_live_password` | Get the live streaming password for a station |

### Automation Algorithms

| Tool | Description |
|------|-------------|
| `get_automation_algorithm` | View the definition of a specific automation algorithm |
| `create_automation_algorithm` | Create a new automation algorithm for shuffling tracks |
| `update_automation_algorithm` | Update the function used by an existing automation algorithm |
| `delete_automation_algorithm` | Delete an automation algorithm |

## Excluded Endpoints

The following API endpoints are **not** exposed as MCP tools because they involve binary data transfer which is not suitable for the MCP text protocol:

- `POST /stations/{station_id}/tracks` — MP3 file upload
- `PUT /stations/{station_id}/images/{image_type}` — Image upload (logo, website, background)
- `GET /stations/{station_id}/tracks/{track_id}/prelisten` — Returns audio/mpeg binary stream

Additionally, all **App**-tagged endpoints (which use Firebase JWT authentication) are excluded as they serve a different use case.

## Development

```bash
# Watch mode (recompiles on change)
npm run dev

# Build once
npm run build

# Run directly (requires LAUTFM_TOKEN to be set)
LAUTFM_TOKEN=your-token node dist/index.js
```

## Project Structure

```
src/
├── index.ts          # MCP server entry point
├── client.ts         # HTTP client with auth + Origin header
└── tools/
    ├── general.ts    # General tools (server status)
    ├── stations.ts   # Station tools
    ├── users.ts      # User management tools
    ├── playlists.ts  # Playlist tools
    ├── schedule.ts   # Schedule tools
    ├── tracks.ts     # Track tools
    ├── live.ts       # Live streaming tools
    └── automation.ts # Automation algorithm tools
```
