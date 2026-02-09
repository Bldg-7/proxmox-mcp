import { TOOL_NAMES, type PermissionLevel, type ToolName } from '../types/tools.js';

export type Action = string;

export type ToolPermissions = Record<ToolName, Record<Action, PermissionLevel>>;

export const toolPermissions: ToolPermissions = Object.fromEntries(
  TOOL_NAMES.map((toolName) => [toolName, {}])
) as ToolPermissions;
