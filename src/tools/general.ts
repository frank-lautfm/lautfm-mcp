import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RadioadminClient, ApiError } from "../client.js";

export function registerGeneralTools(server: McpServer, client: RadioadminClient): void {
  server.tool(
    "get_server_status",
    "Check the laut.fm Radioadmin API server status",
    {},
    async () => {
      try {
        const data = await client.get("/server_status");
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );
}
