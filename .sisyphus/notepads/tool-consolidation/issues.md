# Tool Consolidation - Issues

## 2026-02-10

- Initial generation command used `python` but environment only had `python3`; reran with `python3` successfully.
- First generated mapping file accidentally serialized literal `\n` sequences; regenerated with real newline output.

## Task 4 (Wave 2)

- Initial `pnpm build` failed after introducing `clusterFirewallRuleToolSchema`: discriminator `action` overwrote firewall rule payload `action`, causing missing required payload field in dispatcher calls.
- Resolved by introducing `rule_action` in consolidated create/update firewall-rule actions and mapping it back to the underlying handler payload field `action`.

## Task 9 (Wave 3)

- Verification grep for removed tool names can still hit legacy schema comment headers in `src/schemas/vm.ts` and `src/schemas/vm-advanced.ts`; functional references were removed from server/types/registry.
