# 버그 리포트 검증 및 아키텍처 감사

## 1. 범위와 결론

- 대상: `@bldg-7/proxmox-mcp@1.2.1`, HEAD `b9536fe`.
- 기준 리포트: `2026-11-15-live-cluster-findings.md`.
- 방법: 코드 정적 검토, 전체 기존 테스트·타입 검사·린트·커버리지, 네트워크 없는 로컬 재현 13건, Proxmox upstream API 구현과 대조.
- 환경: Node `v24.11.0`, pnpm `10.13.1`.
- 프로덕션 TypeScript 71파일, 22,752줄, 등록 도구 92개. 테스트·fixture·mock 제외. 정적 import/export 그래프에서 순환 의존은 발견하지 못함(동적 import까지 포함한 완전한 분석은 아님).
- 실 클러스터 HTTP/SSH 호출, 게스트 명령 실행, 인프라 변경은 수행하지 않음. 운영 코드 수정 없음.
- 기존 `.sisyphus/boulder.json` 변경과 원본 버그 리포트는 건드리지 않음.

**결론: 리포트 7건 모두 현재 코드에서 재현되는 문제가 맞다. 다만 #3과 #7의 제안만 적용해서는 해당 기능을 완전히 복구할 수 없고, #5의 삭제 판정도 보완해야 한다.**

계층 분리와 기본 안전 설정은 마련되어 있으나, **PVE API 계약을 검증하는 계층·테스트가 부족**하다. 내부 가정을 그대로 반영한 mock 때문에 잘못된 필드명·엔드포인트도 테스트를 통과한다. 전면 재작성보다는 API 계약 테스트와 어댑터 경계 보강이 우선이다.

본 검토는 전체 구조와 주요 위험 경로에 대한 감사이지, 92개 도구의 모든 action을 PVE 8/9 실서버에서 검증했다는 의미는 아니다. 외부 자료는 조회 시점 upstream `master`이며, 배포된 PVE 8.4.16/9.2.2의 정확한 패키지 소스와 일치하는지까지 확인하지 않았다. 원본 리포트의 CVE 주장은 이번 감사 범위가 아니다.

## 2. 실행 결과

| 검사 | 결과 |
|---|---|
| `pnpm typecheck` | 통과 |
| `pnpm lint` | 실패: 오류 274개, 경고 0개 |
| `pnpm test` | 43파일, 1,142테스트 통과 |
| `pnpm test:coverage` | 동일한 1,142테스트 통과 |
| 임시 감사 재현 테스트 | 13/13 통과 — **잘못된 현재 동작을 확인하는 테스트** |
| `src/server.ts` LSP diagnostics | 오류 없음, SDK `Server` deprecated 힌트 3개 |

커버리지:

| 범위 | Lines | Branches |
|---|---:|---:|
| 전체 | 85.17% | 67.38% |
| `src/tools` | 84.03% | 65.93% |
| `src/client/proxmox.ts` | 18.97% | 50.00% |
| `src/client/ssh.ts` | 10.04% | 100.00% |
| `src/config` | 0% | 0% |

SSH branch 100%는 연결·검증을 충분히 테스트했다는 뜻이 아니다. 기존 `src/client/__tests__/ssh.test.ts`의 7건은 `shellQuote`만 검사한다. 커버리지는 파일 로드와 계측 방식까지 영향을 받으므로 전체 퍼센트만으로 전송 계층 신뢰성을 판단하면 안 된다.

린트 실패는 `any`, 미사용 `_action` 변수, 불필요한 Boolean 변환 등이 주류다. 타입 검사는 `*.test.ts`를 제외하므로 타입 검사 통과가 테스트 코드의 타입 안전성까지 보장하지 않는다.

### 재현 자료

`evidence/architecture-audit-probes.test.ts.txt`에 실행한 13개 재현을 보관했다. 기본 테스트와 혼동하지 않도록 실행 대상 밖의 텍스트 파일로 저장했다.

```sh
# 저장소 루트에서 실행. 같은 이름의 파일이 없는지 먼저 확인할 것.
cp docs/bug-reports/evidence/architecture-audit-probes.test.ts.txt src/__tests__/audit-probes.test.ts
pnpm exec vitest run src/__tests__/audit-probes.test.ts
rm src/__tests__/audit-probes.test.ts
```

이 테스트는 수정 후 통과해야 하는 회귀 테스트가 아니다. 현재 결함을 입증하기 위해 결함 있는 결과를 assert한다. 수정 시 기대값을 올바른 계약으로 바꿔 정식 회귀 테스트로 옮겨야 한다. SSH 검증은 `Client.connect`를 mock하여 실제 접속 전에 중단한다.

## 3. 원본 리포트 검증

### #1 Guest agent exec — 확인 / 높음

- `src/schemas/vm-advanced.ts:103-108, 218-225`: 외부·내부 스키마에 `args`, `capture-output`, `timeout` 존재.
- `src/tools/vm-advanced.ts:579-587`: `command` 문자열과 이 세 필드를 그대로 전송.
- upstream `Qemu/Agent.pm`의 exec는 프로그램+인자의 `command` 배열과 `input-data`를 받으며 추가 속성을 금지한다.
- 재현: `uname`, `args=['-a']`, capture/timeout 입력이 잘못된 payload로 전달됨을 확인.

**조치:** 입력 모델과 PVE wire payload를 분리하고 `command: [command, ...args]`로 변환. capture/timeout을 PVE에 전송하지 않는다. timeout을 유지할 경우 MCP 폴링 의미로 명확히 정의한다. 기존 클라이언트는 배열을 반복 form key로 직렬화하므로 그 실제 HTTP 표현까지 테스트할 것. `command='uname -a'`를 임의 shell split/실행으로 바꾸지 말고 argv 계약을 명시해야 한다.

### #2 APT versions — 확인 / 높음

- `src/tools/system-operations.ts:79-86, 437-455`: 소문자 응답 필드 사용 및 `?package=` 전송.
- upstream APT는 `Package`, `Version`, `OldVersion`, `RunningKernel`, `ManagerVersion` 등의 필드를 사용한다. versions의 입력은 node뿐이다.
- 재현: `{Package:'proxmox-ve', Version:'9.0'}`가 `unknown`, `N/A`로 출력됨.
- `src/__fixtures__/system-operations.ts:52`, `src/tools/system-operations.test.ts:267`도 소문자 필드를 사용해 잘못된 계약을 강화한다.

**조치:** 응답 DTO/스키마와 fixture를 실제 계약으로 교체. package는 클라이언트 측 필터로 구현. `GET apt/update` 역시 upstream 필드가 대문자로 시작하지만, 현재 `aptUpdate`는 POST 작업을 시작하는 경로이므로 같은 출력 버그가 있다고 단정하면 안 된다.

### #3 Token UPID — 확인, 원인 추가 / 높음

- `src/validators/index.ts:66`: `!` 제외.
- 재현: API 호출 전에 오류 발생.
- **원본 리포트에 빠진 두 번째 결함:** `src/tools/node.ts:483-485`는 `/tasks/{upid}`를 조회한다. 이 경로는 `[{name:'log'}, {name:'status'}]`를 반환하는 디렉터리 인덱스다. 상태는 `/tasks/{upid}/status`에서 조회해야 한다.
- 토큰 없는 정상 UPID와 실제 인덱스 모양을 넣으면 오류 없이 `Status: N/A`를 출력하는 것까지 재현했다.
- `src/tools/node.test.ts:683`은 잘못된 경로를 정답으로 assert한다.

**조치:** `!` 허용/구조 검증 + 경로 세그먼트 인코딩 + `/status` 추가를 한 수정 단위로 처리한다. 상태와 로그 API는 별도 계약으로 취급한다.

### #4 Active tasks 누락 — 확인 / 중간

- `src/tools/node.ts:441-443`: source 없는 호출.
- upstream `Tasks.pm`: `source=archive`가 기본값이며 `active`, `all`을 지원한다. 기본 limit은 50.
- 재현: 목록 호출에 쿼리가 없는 것을 확인. 원본의 추정 원인은 upstream 계약으로 뒷받침된다.

**조치:** 기본 `source=all` 또는 명시적 source 선택, limit·vmid·typefilter 등 노출. active/all/빈 목록/필터 조합 회귀 테스트 추가.

### #5 Pending config — 확인, 제안 수정 필요 / 중간

- `src/tools/vm-query.ts:375-395, 417-437`: 모든 행을 집계하고 `pending`을 출력하지 않음.
- VM/LXC 각각 현재 값만 있는 행과 pending이 있는 행을 함께 넣어, 잘못된 개수와 pending 값 누락을 재현했다.
- upstream은 `value`=현재 값, `pending`=대기 값, `delete`=0..2를 정의한다.
- **원본의 `delete !== undefined` 조건은 불충분하다.** `delete=0`은 삭제 대기가 아니므로 포함하면 안 된다.

**조치:** `pending !== undefined || delete === 1 || delete === 2`로 판정. 빈 문자열·숫자 0·false pending을 truthy 검사로 누락하지 않는다. 현재/대기 값을 나란히 표시하고 삭제/강제 삭제를 구별한다.

### #6 Ping 출력 — 확인 / 낮음

- `src/tools/vm-advanced.ts:364-368`: 객체 문자열 보간.
- 재현: `{result:{}}`가 `[object Object]`로 출력.

**조치:** 성공 상태는 `pong`/`OK`로 표시. 응답 wrapper 정규화 후 유의미한 부가 데이터만 JSON으로 출력한다.

### #7 Cluster storage usage — 확인, 후속 결함 존재 / 중간 권고

- `src/schemas/storage-management.ts:205-208`: node 필수.
- `src/tools/storage-management.ts:587-589` → `getStorage`는 node 없이도 전체 조회 가능.
- 재현: `{action:'cluster_usage'}`가 스키마 단계에서 거부됨.
- **node를 optional로 바꾼 뒤에도 문제가 남는다:** `src/tools/vm-query.ts:318-327`이 storage ID만으로 중복을 제거한다. 서로 다른 노드의 `local`은 같은 물리 저장소가 아닌데 두 번째 노드가 사라진다. 두 노드 fixture로 재현했다.

**조치:** node optional + `(node, storage)` 기준 결과 보존. 공유 스토리지 집계는 shared 여부와 별도 집계 정책을 명시한다. 원본은 낮음으로 분류했지만 잘못된 용량 판단까지 고려하면 후속 집계 결함은 중간 우선순위다.

## 4. 추가 결함 및 위험

### A1. SSH fingerprint 검증 불능 / 높음

위치: `src/client/ssh.ts:100-114`.

`hostVerifier` 인자를 string이라고 선언하고 fingerprint와 `===` 비교하지만 `hostHash`를 설정하지 않는다. 설치된 `ssh2`의 README와 `lib/client.js:273-287`에 따르면 이 경우 인자는 원시 공개키 **Buffer**다. 설정한 fingerprint가 올바르더라도 비교는 실패한다. 로컬 재현으로 확인했다.

fingerprint를 생략하면 verifier도 생략되며 ssh2 기본값은 자동 수락이다. 즉 **검증 설정 시 연결 실패, 설정하지 않으면 서버 신원 검증 없음**이라는 문제가 있다. 이것은 임의 명령 실행 취약점을 입증한 것은 아니지만, SSH 사용 환경에서 MITM 방어를 손상시킨다.

조치: 지원 fingerprint 포맷을 명시하고 Buffer에서 SHA-256/base64를 계산하거나 `hostHash:'sha256'`의 hex 결과를 일관되게 비교한다. OpenSSH `SHA256:...`와 hex 문자열을 혼동하지 않는다. 검증 생략은 명시적 insecure opt-in으로 분리하고, 일치/불일치/미설정 테스트를 추가한다.

### A2. Guest 목록 CPU 수치 오류 / 중간

위치: `src/tools/vm-query.ts:78`.

CPU가 `vm.cpu` 대신 `vm.mem / vm.maxmem`로 계산된다. CPU 10%, 메모리 50%인 입력에서 `CPU: 50.00%`가 출력되는 것을 재현했다.

같은 파일의 상세 조회·스토리지 출력에는 0을 falsy로 취급해 N/A 또는 생략하는 패턴도 있다(`:144-154`, `:341-347`). 0과 미제공 값을 구별해야 한다.

### A3. Storage 업로드에 파일 데이터 전송 경로가 없음 / 높음

위치: `src/tools/storage-management.ts:283-319`, `src/schemas/storage-management.ts:101-109`, `src/client/proxmox.ts:109-113`.

upload 입력은 파일명과 메타데이터뿐이고, 파일을 읽거나 stream/multipart를 만드는 경로가 없다. 공통 클라이언트는 form-urlencoded로 문자열만 전송한다. upstream storage upload는 REST 업로드 처리기가 제공하는 임시 파일을 요구하며 파일이 없으면 `missing temporary file name`으로 실패한다.

**코드+upstream 계약으로 확인**, 실제 대용량 업로드는 수행하지 않음. 로컬 경로를 지원한다면 접근 허용 디렉터리·크기 제한·stream·취소·timeout 정책도 함께 설계해야 한다. 단순히 임시파일 경로를 사용자 입력으로 추가하는 해결책은 부적절하다.

### A4. File restore가 API 계약 및 응답 형식과 불일치 / 높음

위치: `src/tools/storage-management.ts:457-529`.

- list는 `path` 쿼리를 전송하지만 upstream은 필수 `filepath`를 요구한다. root는 `/`, 나머지는 base64 path 계약이다.
- download의 filepath 설명도 일반 파일 경로로 되어 있어 base64 계약과 맞지 않는다.
- download는 binary/stream 응답인데 공통 클라이언트는 `response.text()` 후 무조건 JSON envelope `{data:T}`로 해석한다. 정상 파일을 JSON parse 오류로 처리하거나 올바른 파일 전달 없이 결과를 문자열화하게 된다.

**코드+upstream 계약으로 확인**, PBS 복원 호출은 수행하지 않음. list/query 변환과 binary download 전송을 분리해야 한다.

### A5. 진단 출력 및 오류에 공통 민감정보/크기 제어 부재 / 보안 개선

위치: `src/tools/node.ts:680-690`, `src/client/proxmox.ts:128-132`, `src/formatters/index.ts:71-76`, `src/utils/index.ts`.

report는 원문 전체를 반환한다. API 오류 body는 로그와 LLM 응답으로 전달되고 공통 redaction은 없다. 원본에 기록된 프로세스 인자 토큰 노출은 이 흐름으로 가능하다. 이번 감사에서 실제 비밀값을 수집하거나 노출을 실환경 재현한 것은 아니다.

조치: report의 민감 action 취급 여부 결정, 토큰·비밀번호 패턴 및 구조화 필드 redaction, 응답 길이 제한과 truncated 표시, 페이지/섹션 선택. 마스킹만으로 모든 임의 텍스트 비밀을 제거할 수 있다고 보장하면 안 된다. 로그와 MCP 응답 양쪽에 적용해야 한다.

## 5. 아키텍처 평가

### 현재 실행 구조

```text
index.ts: 환경 설정 + 클라이언트 생성 + stdio 시작
  └─ server.ts: tools/list, tools/call, JSON Schema 변환
       └─ registry.ts: ToolName → schema + handler
            └─ consolidated handler: action/type/operation 분기
                 └─ leaf handler: 재검증 + 권한 + API payload + 문자열 출력
                      ├─ ProxmoxApiClient: HTTP/form/JSON envelope
                      └─ SshClient: LXC exec용 별도 전송
```

좋은 점:

- config/schema/validator/handler/client/formatter가 디렉터리 단위로 분리되어 있다.
- HTTP는 토큰 인증과 30초 timeout을 공통 적용한다.
- TLS strict, elevated=false, SSH=false가 기본값이다.
- 로그를 stderr로 보내 stdio JSON-RPC를 오염시키지 않는다.
- 레지스트리 키는 `Record<ToolName, ...>`로 관리하고 누락 개수 검사도 있다.
- LXC SSH 경로는 노드 일치 검사, VMID 검증, 고정 pct 명령 템플릿과 shell quoting을 사용한다.

### B1. 외부 API 계약 검증이 가장 약한 경계

`request<T>`는 실제 검증 없이 `JSON.parse(...) as {data:T}`를 신뢰하고, handler도 `as ProxmoxTask`, `as Array<...>`로 응답을 단언한다. PVE의 필드명/배열/객체 차이를 TypeScript가 잡아주지 못한다. report #2와 task 상세가 직접적인 사례다.

권고: 도메인별 PVE adapter에서 입력 변환과 응답 Zod 검증/정규화를 수행한다. fixture는 익명화한 실제 응답 또는 공식 스키마에서 유래해야 한다. 호환성 검증은 PVE 8/9 버전 fixture로 분리한다.

### B2. 공통 HTTP client의 추상화가 JSON/form에 한정됨

JSON API, multipart upload, binary download가 같은 `request<T>`로 표현된다. 또한 GET에 body가 주어지면 JSON body를 만들고 fetch가 거부할 수 있는 잠재 설계 결함이 있다. 기존 호출에서 이 GET-body 실패가 발생한다고 확인한 것은 아니다.

권고: `requestJson`, `upload`, `download`의 반환 타입·메모리·취소 정책을 구별한다. URL query builder와 path encoding도 공통화한다. 자동 재시도는 GET 등 안전한 경우에 제한하고 작업 생성 POST를 무조건 재시도하지 않는다.

### B3. LLM에 공개한 스키마와 런타임 스키마가 다름

위치: `src/server.ts:32-115`.

`flattenAnyOfSchema`가 required의 교집합만 남기고 같은 이름의 일반 속성은 첫 정의를 선택한다. action별 필수 조건과 branch별 제약이 손실된다. 재현: node_task 공개 스키마에는 get일 때 필요한 upid가 필수로 표현되지 않지만, 런타임 Zod는 거부한다.

이는 검증 우회라기보다 **도구 발견/입력 생성 계약의 불일치**다. 분기 스키마를 보존하는 표현을 우선 검토하고, 클라이언트 호환성 때문에 flatten이 필요하면 action별 요구 조건을 설명·테스트에 명시한다. schema 변환의 snapshot 및 유효/무효 예제 동등성 테스트가 필요하다.

### B4. 권한 메타데이터와 실제 집행이 이원화됨

`src/tools/permissions.ts`의 `toolPermissions`는 운영 코드에서 소비되지 않는다. `RateLimiter`도 정의와 테스트만 있고 서버에는 연결되지 않았다. 실제 권한은 leaf/consolidated handler의 `requireElevated` 호출에 의존한다.

현재 변경 도구가 전부 무방비라는 뜻은 아니다. 검토한 주요 변경 경로에는 guard가 있다. 문제는 메타데이터를 수정해도 런타임 정책이 바뀌지 않으며 신규 action의 누락을 중앙에서 차단하지 못한다는 점이다.

권고: action-aware policy를 registry와 결합하고 미정의 action은 fail-closed로 처리한다. read/list와 destructive action을 분리하며 모든 write action에 대해 elevated=false일 때 API 호출이 0회임을 검사한다. 단일 사용자의 stdio 서버에서 rate limit보다 먼저 bounded concurrency·중복 파괴 요청 방지·취소 정책의 필요성을 평가한다.

### B5. 도구 메타데이터 및 검증 중복

도구명(`types/tools.ts`), 설명(`server.ts`), schema-handler 연결(`registry.ts`), 권한(`permissions.ts`), 문서가 각각 관리된다. registry의 handler 입력은 `any`여서 schema와 handler 타입의 대응 관계를 검증하지 못한다(`registry.ts:231-241`).

`tools/call` → consolidated wrapper → leaf에서 같은 입력을 여러 번 parse하는 경로가 있다. 타입 안전성과 유지보수 비용에 비해 API 응답 검증은 비어 있다.

권고: `defineTool({name, description, schema, policy, handler})` 같은 typed descriptor를 단일 원천으로 삼는다. 공개 입력 검증 1회 → 도메인 모델 → PVE wire DTO로 책임을 나눈다. 예전 handler를 한 번에 지우기보다 기존 tests를 유지하며 adapter부터 추출한다.

### B6. 클러스터 조회가 부분 장애를 전체 실패로 만듦

`src/tools/vm-query.ts:49-61, 310-315`: 노드 순차 호출 중 하나라도 실패하면 전체 함수 catch로 빠져 이미 얻은 결과도 사라진다. 오프라인 노드 건너뛰기나 부분 성공 표현이 없다. 노드 수에 따라 호출량과 지연도 증가한다.

권고: 가능하면 cluster resources endpoint 사용, 또는 bounded concurrency + 노드별 결과/오류 보존. 부분 결과임을 명시하고 누락을 정상적인 빈 목록으로 숨기지 않는다.

### B7. 유지보수·품질 게이트

- `cluster-management.ts` 2,397줄, `vm-advanced.ts` 1,754줄, `access-control.ts` 1,208줄로 라우팅·API 변환·포맷 책임이 집중된다.
- integration 테스트는 SDK의 private `_requestHandlers`를 직접 호출하고 API client는 mock한다. 실제 stdio framing과 wire serialization 검증이 아니다.
- `.github/workflows/release.yml`은 main push에서 build/test를 실행하지만 lint는 하지 않는다. 확인한 workflows에는 PR 대상 품질 게이트가 없다.
- `ProxmoxApiClient` dispatcher 종료 API와 `index.ts`의 정상 종료 시 SSH/HTTP cleanup 연결이 없다. 즉각적인 유출 사고로 단정하지 않지만 graceful shutdown·테스트 격리에는 부족하다.
- resources/prompts 모듈은 빈 export이고 서버도 tools만 광고한다. 미구현 scaffolding이지 잘못 광고한 기능은 아니다.

권고: PR CI에 typecheck/lint/test를 추가하고 기존 lint 부채를 정리한다. stdio/in-memory transport 통합 테스트와 fetch 경계 테스트를 추가한다. 파일 분리는 기능별 API adapter·서비스·formatter 책임으로 수행한다.

## 6. 개선 순서와 완료 기준

### 1단계 — 기능 복구 및 보안 경계

1. UPID + `/status`, agent exec, APT 계약 수정.
2. SSH fingerprint 검증 수정 및 미설정 정책 결정.
3. active tasks, pending 표시와 `delete=0` 처리.
4. cluster_usage 스키마와 노드별 storage 보존, CPU 지표, ping 수정.
5. storage upload/file restore는 올바른 전송 구현 전까지 지원 범위를 축소하거나 명시적 미지원 오류를 반환.

완료 기준: 공식 응답 모양 기반 회귀 테스트, 실제 HTTP URL/body 검증, 기존 테스트 전체 통과. 파괴적 동작은 mock으로 검증하고 별도 승인된 disposable 환경에서만 smoke test.

### 2단계 — 계약/테스트 기반 보강

- PVE adapter와 응답 validation, form/JSON/binary/multipart 분리.
- 실응답 익명화 fixture, token UPID, 0/빈 값/null/wrapper, 부분 장애 케이스.
- schema 공개값과 runtime 일치 검증.
- report/오류 redaction 및 크기 제한.
- PR CI와 lint 정상화.

### 3단계 — 구조 정리

- typed tool descriptor에서 schema/handler/description/policy 파생.
- 중앙 policy enforcement와 write-action 매트릭스 테스트.
- 도메인별 파일 분리, 중복 parse 제거, cluster 조회 병렬성/부분 결과 정책.
- 취소·정상 종료·작업 상태 추적을 공통 서비스로 정리.

**우선순위 판단:** 지금 가장 필요한 것은 더 많은 mock 기반 happy-path 테스트나 대규모 파일 이동이 아니라, 실제 PVE 계약을 정답으로 삼는 테스트와 경계 설계다.

## 7. 참고한 외부/로컬 계약 자료

아래 외부 자료는 조회 시점 `master`이므로 후속 구현 시 지원 PVE 버전/tag 기준으로 고정할 것.

- [PVE tasks](https://github.com/proxmox/pve-manager/blob/master/PVE/API2/Tasks.pm): source 기본값, task index/status 구별.
- [PVE APT](https://github.com/proxmox/pve-manager/blob/master/PVE/API2/APT.pm): versions 파라미터·필드명.
- [QEMU guest agent](https://github.com/proxmox/qemu-server/blob/master/src/PVE/API2/Qemu/Agent.pm): exec argv/input-data.
- [QEMU API](https://github.com/proxmox/qemu-server/blob/master/src/PVE/API2/Qemu.pm): pending/delete 계약.
- [LXC API](https://github.com/proxmox/pve-container/blob/master/src/PVE/API2/LXC.pm): pending/delete 계약.
- [Storage status/upload](https://github.com/proxmox/pve-storage/blob/master/src/PVE/API2/Storage/Status.pm): 임시 업로드 파일 요구.
- [File restore](https://github.com/proxmox/pve-storage/blob/master/src/PVE/API2/Storage/FileRestore.pm): base64 filepath, binary stream.
- 설치된 `node_modules/ssh2/README.md:953-955`, `node_modules/ssh2/lib/client.js:273-287`: hostHash와 hostVerifier 계약.
