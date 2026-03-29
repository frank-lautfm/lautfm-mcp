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

const UserRoleSchema = z.enum(["owner", "editor", "dj"]).describe("User role: owner, editor, or dj");

export function registerUserTools(server: McpServer, client: RadioadminClient): void {
  server.tool(
    "get_station_users",
    "List all users of a station",
    { station_id: z.number().int().describe("The station ID") },
    async ({ station_id }) => {
      try { return ok(await client.get(`/stations/${station_id}/users`)); }
      catch (e) { return err(e); }
    }
  );

  server.tool(
    "add_station_user",
    "Add a user with a given role to a station (sends an invitation)",
    {
      station_id: z.number().int().describe("The station ID"),
      email: z.string().email().describe("Email address of the user to invite"),
      role: UserRoleSchema,
    },
    async ({ station_id, email, role }) => {
      try { return ok(await client.post(`/stations/${station_id}/users`, { email, role })); }
      catch (e) { return err(e); }
    }
  );

  server.tool(
    "update_station_user_role",
    "Change the role of a user on a station",
    {
      station_id: z.number().int().describe("The station ID"),
      user_id: z.number().int().describe("The user ID"),
      role: UserRoleSchema,
    },
    async ({ station_id, user_id, role }) => {
      try { return ok(await client.patch(`/stations/${station_id}/users/${user_id}`, { role })); }
      catch (e) { return err(e); }
    }
  );

  server.tool(
    "remove_station_user",
    "Remove a user from a station",
    {
      station_id: z.number().int().describe("The station ID"),
      user_id: z.number().int().describe("The user ID"),
    },
    async ({ station_id, user_id }) => {
      try { return ok(await client.delete(`/stations/${station_id}/users/${user_id}`)); }
      catch (e) { return err(e); }
    }
  );
}
