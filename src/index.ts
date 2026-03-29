import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { RadioadminClient } from "./client.js";
import { registerGeneralTools } from "./tools/general.js";
import { registerStationTools } from "./tools/stations.js";
import { registerUserTools } from "./tools/users.js";
import { registerPlaylistTools } from "./tools/playlists.js";
import { registerScheduleTools } from "./tools/schedule.js";
import { registerTrackTools } from "./tools/tracks.js";
import { registerLiveTools } from "./tools/live.js";
import { registerAutomationTools } from "./tools/automation.js";

const token = process.env.LAUTFM_TOKEN;
if (!token) {
  console.error("Error: LAUTFM_TOKEN environment variable is required.");
  process.exit(1);
}

const client = new RadioadminClient(token);

const server = new McpServer({
  name: "LautfmMCP",
  version: "1.0.0",
});

registerGeneralTools(server, client);
registerStationTools(server, client);
registerUserTools(server, client);
registerPlaylistTools(server, client);
registerScheduleTools(server, client);
registerTrackTools(server, client);
registerLiveTools(server, client);
registerAutomationTools(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);
