# 실 클러스터 사용 중 발견한 버그 리포트 (2026-11-15)

- 버전: `@bldg-7/proxmox-mcp@1.2.1` (커밋 `b9536fe`)
- 환경: 2노드 클러스터 — `lab` (PVE 8.4.16), `epyc` (PVE 9.2.2), API 토큰 인증(`root@pam!<token>`), `PROXMOX_ALLOW_ELEVATED=true`
- 맥락: CVE-2026-98432 점검과 PVE 8→9 업그레이드 준비(커널 버전 조회, 게스트 백업) 중 발견

| # | 도구 | 심각도 | 증상 요약 |
|---|---|---|---|
| 1 | `proxmox_agent_exec` | 높음 | `args`/`capture-output`/`timeout`을 PVE에 그대로 보내 400. 인자를 붙일 방법이 없음 |
| 2 | `proxmox_apt` (`versions`) | 높음 | 모든 항목이 `unknown: N/A`로 출력. `package` 필터는 400 |
| 3 | `proxmox_node_task` (`get`) | 높음 | API 토큰으로 만든 작업의 UPID(`!` 포함)를 거부 |
| 4 | `proxmox_node_task` (`list`) | 중간 | 실행 중인 작업이 목록에 나오지 않음 |
| 5 | `proxmox_guest_pending` | 중간 | 실제 대기 변경이 아니라 전체 설정 키를 "Pending"으로 출력, pending 값은 누락 |
| 6 | `proxmox_agent_info` (`ping`) | 낮음 | `Result: [object Object]` 출력 |
| 7 | `proxmox_storage_config` (`cluster_usage`) | 낮음 | 클러스터 전체 조회인데 `node`가 필수 |
| 8 | `proxmox_agent_file` (`read`) | 높음 | GET 요청에 body를 실어 보내 항상 실패 |

---

## 1. `proxmox_agent_exec`: PVE API에 없는 파라미터 전송

**재현**

```jsonc
// 호출
{ "node": "lab", "vmid": 102, "operation": "exec", "command": "uname", "args": ["-a"], "capture-output": true }
// 결과
Proxmox API error: 400 - {"errors":{"args":"property is not defined in schema ...",
  "capture-output":"property is not defined in schema ..."}}
```

`args` 없이 `"command": "uname -a"`로 보내면 `Proxmox API error: 596 -`로 실패한다(공백 포함 문자열 전체를 실행 파일 이름으로 취급하는 것으로 보임).

**원인**

- `src/schemas/vm-advanced.ts:103-109` — 스키마에 `args`, `capture-output`, `timeout`이 정의돼 있음
- `src/tools/vm-advanced.ts:579-585` — 이 값들을 그대로 POST 바디에 넣음

PVE의 `POST /nodes/{node}/qemu/{vmid}/agent/exec`는 `command`(프로그램 + 인자의 **배열**)와 `input-data`만 받는다. 출력은 항상 `exec-status`로 조회하는 구조라 `capture-output`은 존재하지 않는다.

**수정 제안**

- `args`가 있으면 `command: [validated.command, ...validated.args]` 배열로 합쳐 보내고, `args`/`capture-output`/`timeout`은 바디에서 제거
- `timeout`이 필요하면 MCP 쪽에서 `exec-status` 폴링 타임아웃으로 구현
- 선택: exec 후 `exec-status`를 `exited: true`까지 폴링해 stdout/stderr를 한 번에 돌려주는 옵션. 지금은 PID만 돌려줘서 출력을 보려면 호출이 두 번 필요함
- 참고: `src/tools/command.ts:27-31`(`executeVMCommand`)는 이미 `['sh','-c', cmd]` 배열로 올바르게 보내고 있음

---

## 2. `proxmox_apt` `versions`: 응답 필드 대소문자 불일치 + 없는 파라미터

**재현**

```
{ "action": "versions", "node": "lab" }
→ "• **unknown**: N/A" 가 패키지 수만큼 반복 (58줄)

{ "action": "versions", "node": "lab", "package": "kernel" }
→ 400 {"errors":{"package":"property is not defined in schema ..."}}
```

**원인**

- `src/tools/system-operations.ts:79-86`, `:449-451` — 응답을 소문자 필드(`package`, `version`, `oldversion` …)로 읽음. PVE의 `GET /nodes/{node}/apt/versions`(그리고 `GET .../apt/update`)는 **`Package`, `Version`, `OldVersion`, `Title`, `Description`, `CurrentState`, `RunningKernel`** 처럼 대문자로 시작하는 필드를 돌려준다.
- `src/tools/system-operations.ts:437-439` — PVE `apt/versions`에는 `package` 쿼리 파라미터가 없다.

**수정 제안**

- 인터페이스와 포매터를 PVE 필드명으로 수정. `RunningKernel`/`ManagerVersion`도 같이 보여 주면 "지금 어떤 커널로 부팅됐나"를 바로 알 수 있어 유용함(이번 CVE 점검에서 바로 필요했던 정보)
- `package` 필터는 API로 보내지 말고 응답을 클라이언트 쪽에서 부분 문자열로 필터링
- `GET apt/update`(업데이트 가능한 패키지 목록)를 쓰는 곳이 있다면 같은 대소문자 문제가 있는지 확인 필요

---

## 3. `proxmox_node_task` `get`: `!`가 들어간 UPID 거부

**재현**

```
{ "action": "get", "node": "lab",
  "upid": "UPID:lab:00156910:61860286:6AF9941C:vzdump:100:root@pam!claude-mcp:" }
→ Invalid task UPID format. Only alphanumeric, colons, hyphens, underscores, dots, and @ allowed
```

이 UPID는 MCP 자신이 `proxmox_backup create` 결과로 돌려준 값이다. **API 토큰으로 인증하면 만들어지는 모든 작업의 UPID에 `user@realm!tokenid` 형식이 들어가므로**, 토큰 인증 환경에서는 MCP가 시작한 작업의 상태를 하나도 조회할 수 없다.

**원인**

- `src/validators/index.ts:66` — 정규식 `/^[a-zA-Z0-9:._@-]+$/`에 `!`가 없음

**수정 제안**

- 정규식에 `!` 추가. PVE UPID 형식(`UPID:node:pid:pstart:starttime:type:id:user@realm[!token]:`)에 맞춘 구조적 검증이면 더 좋음
- URL 경로에 넣을 때 `encodeURIComponent(safeUpid)` 적용
- `src/validators/index.test.ts:75-81`에 토큰 UPID 케이스 추가

---

## 4. `proxmox_node_task` `list`: 실행 중인 작업 누락

**재현**

vzdump 5개를 연달아 시작한 직후 `list`를 호출 → 이미 끝난 vzdump(100)만 보이고, 실행 중이거나 대기 중인 4개는 목록에 없음. 진행 상황은 `proxmox_backup list`로 백업 파일이 생기는지 보는 방법으로만 확인할 수 있었다.

**원인 (추정)**

- `src/tools/node.ts:441-443` — `GET /nodes/{node}/tasks`를 파라미터 없이 호출. PVE 이 엔드포인트의 `source` 기본값은 `archive`(끝난 작업만)이고, 실행 중인 작업은 `source=active` 또는 `all`이어야 나온다.

**수정 제안**

- 기본값을 `source=all`로 하거나 `source`/`running`/`vmid`/`typefilter`/`limit` 파라미터를 스키마에 노출
- 출력이 기본 50개라 길다(이번엔 50개 대부분이 `aptupdate`/`vncproxy`). `limit` 기본값을 낮추거나 `typefilter`/`vmid`를 노출하면 컨텍스트 낭비가 줄어듦

---

## 5. `proxmox_guest_pending`: 전체 설정을 "대기 중"으로 표시

**재현**

`scsi0`에 `discard=on`을 추가한 직후(재부팅 전) 호출:

```
**Pending Changes** (23):
• **ide2**  • Value: local-lvm:vm-102-cloudinit,media=cdrom
...
• **scsi0** • Value: local-lvm:vm-102-disk-1,size=200G     ← 현재 값. 대기 중인 discard=on 값은 안 보임
```

**원인**

- `src/tools/vm-query.ts:375-395` (LXC는 `:418` 이후 동일 구조)
- PVE `GET .../pending`은 **모든 설정 키**를 `{key, value?, pending?, delete?}`로 돌려준다. `value`는 현재 값, `pending`은 적용 대기 값이다. 지금 코드는 필터링 없이 전부 "Pending Changes"로 세고, `pending` 필드는 출력하지 않는다.

**수정 제안**

- `pending !== undefined || delete !== undefined`인 항목만 대기 변경으로 집계
- 각 항목에 `현재: <value> → 대기: <pending>` 형식으로 출력. `delete`는 `1`=삭제 예정, `2`=강제 삭제 예정으로 표시

---

## 6. `proxmox_agent_info` `ping`: `[object Object]` 출력

- `src/tools/vm-advanced.ts:368` — `${result ?? 'pong'}`. PVE는 성공 시 `{}`(또는 `{result:{}}`)를 돌려주므로 문자열 보간 결과가 `[object Object]`가 된다.
- 수정 제안: 성공 시 `pong`/`OK`를 고정 문자열로 출력하고, 비어 있지 않은 객체일 때만 `formatJsonBlock` 사용.

## 7. `proxmox_storage_config` `cluster_usage`: `node` 필수

- `src/schemas/storage-management.ts:205-208` — `node`가 `z.string().min(1)`로 필수.
- 그런데 실제 핸들러(`src/tools/vm-query.ts`의 `getStorage`)는 `node`가 없으면 모든 노드를 순회하는 로직이 이미 있다. 이름(`cluster_usage`)과도 맞지 않으므로 `.optional()`로 바꾸면 됨.

## 8. `proxmox_agent_file` `read`: GET 요청에 body 전송 (2026-11-16 추가)

**재현**

```
{ "node": "epyc", "vmid": 107, "operation": "read", "file": "/root/kernel-update-2026-11-16.log" }
→ Failed to connect to Proxmox: Request with GET/HEAD method cannot have body.
```

**원인**

- `src/tools/vm-advanced.ts:667-669` — `client.request(path, 'GET', { file })`로 호출. 클라이언트가 세 번째 인자를 form body로 인코딩하는데, Node `fetch`(undici)는 GET 요청에 body가 있으면 요청 자체를 거부한다. 그래서 파일 경로와 상관없이 항상 실패한다.

**수정 제안**

- `` `/nodes/${safeNode}/qemu/${safeVmid}/agent/file-read?file=${encodeURIComponent(safeFile)}` ``처럼 쿼리스트링으로 전달
- 근본 대책: `client.request`에서 method가 GET/HEAD/DELETE이고 body가 있으면 쿼리스트링으로 바꿔 붙이도록 처리. 같은 패턴으로 GET에 body를 넘기는 다른 호출부가 있는지 `grep "'GET', {"`로 점검 권장

**우회법 (참고)**: `proxmox_agent_exec`에 `command: "/bin/sh"`와 `input-data`(스크립트)를 넘기고 `status`의 `out-data`로 결과를 읽으면 된다. #1 버그(args 미지원)도 이 방법으로 우회할 수 있다.

---

## 참고 (버그 아님)

- `proxmox_node_info` `report`는 응답이 6~8만 자라 MCP 클라이언트 토큰 한도를 넘는다(이번엔 파일로 우회 저장됨). 섹션 필터 옵션이 있으면 좋겠다.
- 같은 `report`에는 노드의 `top` 출력이 포함되는데, 커맨드라인에 비밀값을 넘기는 프로세스(예: `cloudflared tunnel run --token ...`)가 있으면 **그 토큰이 그대로 노출**된다. PVE 자체 동작이지만, MCP가 이 출력을 LLM 컨텍스트로 넘기므로 `--token <값>`과 같은 패턴을 마스킹하는 것을 고려할 만하다.
