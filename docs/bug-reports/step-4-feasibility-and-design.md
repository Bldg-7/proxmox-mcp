# 4단계 사전 검토: 파일 전송 가능성 및 구체 설계

## 1. 결론 및 이번 작업 범위

**조건부 구현 가능(Go). 단, 기존 제안에 Content-Length, 원격 덮어쓰기, 복원 무결성, 장시간 MCP 호출에 대한 보완이 필요하다.**

검토 기준 애플리케이션: `212e555` 이후 작업 트리. Node v24.11.0, 설치된 undici 7.20.0, MCP SDK 1.25.3.

이번에는 운영 코드를 변경하지 않았다. 공개 upstream 소스·설치된 라이브러리·로컬 loopback HTTP 실험으로 설계를 검증했다. 실제 PVE/PBS/SSH 접속, 인증 시도, 운영 파일 전송은 없다. 로컬 실험은 임시 디렉터리의 합성 파일만 사용하고 정리한다.

| 항목 | 판정 | 근거/제한 |
|---|---|---|
| API 토큰으로 ISO/template 업로드 | 구현 가능 | PVE HTTP 인증과 upload 권한 경로 확인. 실제 토큰 ACL은 별도 검증 필요 |
| 대용량 메모리 비례 증가 없는 전송 | 구현 가능 | FD 기반 stream, 고정 크기 버퍼, Content-Length 사전 계산 |
| PBS 파일 목록 및 파일/디렉터리 다운로드 | 구현 가능 | PBS 전용, opaque base64 filepath와 binary stream 처리 필요 |
| 로컬 저장 시 기존 파일 덮어쓰기 금지 | 조건부 보장 가능 | POSIX의 신뢰된 private 디렉터리, exclusive create + hard-link publish |
| 원격 PVE 파일의 원자적 no-overwrite | **API만으로 보장 불가** | upload가 기존 경로를 덮어쓰며 조건부 생성 옵션 없음 |
| 다운로드 완료 = 원본 복원 성공/무결성 보장 | **일반적으로 보장 불가** | 길이·원본 digest 없는 FIFO stream은 정상 EOF와 upstream 조기 EOF를 완전히 구별 못함 |
| 악성 동일 UID 프로세스까지 파일 경로 격리 | **순수 Node 경로 검사만으로 보장 불가** | 별도 사용자/컨테이너 등 OS 격리 필요 |
| 장시간 전송을 한 번의 MCP 호출로 항상 완료 | **클라이언트 독립적으로 보장 불가** | SDK 기본 요청 timeout 60초, progress로 자동 연장되지 않음 |

## 2. 확인한 실제 API 계약

### 2.1 업로드

`POST /api2/json/nodes/{node}/storage/{storage}/upload`

- `Authorization: PVEAPIToken=...` 인증을 사용할 수 있는 코드 경로가 있다. 토큰 인증에 별도 CSRF ticket을 얻는 과정은 필요하지 않다. endpoint의 allowtoken 기본값은 RESTHandler에서 true로 설정된다.
- 업로드 권한은 `/storage/{storage}`의 `Datastore.AllocateTemplate`을 확인한다. 토큰과 소유자의 실제 ACL/privilege separation까지 로컬에서 보장할 수는 없다.
- multipart의 파일 필드명은 **`filename`**이다. `filename=<로컬 경로 문자열>`만 보내는 방식은 파일 전송이 아니다.
- UI와 파서는 `content`, `checksum-algorithm`, `checksum`, 마지막으로 파일 part 순서를 사용한다. 이를 그대로 따른다.
- **Content-Length가 필요하며 Transfer-Encoding: chunked는 501로 거부한다.** 길이를 모르는 일반 stream을 그대로 fetch에 전달하면 안 된다.
- 파일은 PVE 진입 노드의 `/var/tmp/pveupload-*`로 먼저 저장된다. MCP 서버뿐 아니라 PVE 임시 디스크와 대상 저장소의 공간도 필요하다.
- upload 응답은 UPID 문자열을 담은 JSON envelope다. HTTP 업로드가 끝났다는 뜻이지 원격 imgcopy 작업이 성공했다는 뜻이 아니다. 이후 `/tasks/{upid}/status`를 확인해야 한다.
- 확인한 stable-8 및 현재 소스는 `iso`, `vztmpl`, `import`를 허용한다. **현재 프로젝트의 `backup` upload 값은 잘못된 계약**이다. 1차 구현은 공통 범위인 `iso|vztmpl`만 지원하고 `import`는 별도 검증 후 확장한다.
- PVE가 파일명을 정규화하며 기존 대상은 덮어쓴다. content 목록 조회 후 존재 여부를 확인해도 check/use race를 없애지 못한다.
- 업로드 handler에는 일반 `proxyto=node`가 없고, 업로드 후 필요하면 노드 간 파일 복사 경로를 사용한다. 따라서 API 접속 노드와 목적 노드가 다를 때의 임시 공간·원격 복사·노드 신뢰 설정은 실환경 검증 항목이다. MCP가 임의로 다른 노드 URL을 추측해 인증 토큰을 보내지는 않는다.

### 2.2 PBS 파일 복원

`GET /api2/json/nodes/{node}/storage/{storage}/file-restore/list`

- `volume`과 `filepath` 필요. root 조회는 `filepath=/`.
- 이후 경로는 **base64로 인코딩된 경로 식별자**. 목록에서 받은 `filepath`를 그대로 다음 요청에 전달한다.
- 응답: `filepath`, 표시 이름 `text`, `type`, `leaf`, 선택적 `size`, `mtime`.
- Perl 구현은 `leaf`를 0/1로 변환하기도 하므로 boolean과 0/1을 정규화한다.
- 백업 내부 경로는 단순 `/etc/passwd`로 가정할 수 없다. 가상 디스크/partition/PXAR 탐색 구조와 비 UTF-8 파일명이 있을 수 있어 decode/re-encode하지 않는다.
- 현 `path` 파라미터는 API 계약과 맞지 않는다. optional legacy alias를 남기더라도 base64인지 자동 추측하지 않는다.
- **PBS 저장소만 지원**한다. 로컬 vzdump 백업의 일반 파일 복원 도구라고 광고하면 안 된다.
- 권한은 실제 `check_volume_access`에서 검증한다. 현재 소스의 backup 경로는 `Datastore.Allocate` 또는 저장소 `Datastore.AllocateSpace` + 게스트 `VM.Backup` 등의 조건을 사용하므로 단순히 `Datastore.Audit`만 있으면 된다고 안내하면 안 된다.
- 목록 조회도 서버 측 복원 준비/보조 VM 기동 비용이 발생할 수 있다. 단순 cheap read로 가정하지 않는다.

`GET .../file-restore/download?volume=...&filepath=...&tar=0|1`

- 디렉터리는 기본 zip, `tar=1`은 tar.zst. 일반 파일은 파일 바이트.
- `download_allowed`와 HTTPServer가 내부 `download` 객체를 소비해 실제 **application/octet-stream**을 전송한다. `/api2/json` URL이어도 JSON 응답이 아니다.
- 서버는 worker를 시작하고 FIFO를 stream한다. 응답에 공개 UPID를 함께 돌려주는 계약은 없다.
- stream 응답은 Content-Length 없이 connection close로 끝날 수 있다. Content-Length 없는 정상 응답을 거부하면 안 된다.
- 원본 checksum 및 완료 상태를 따로 얻지 못한 경우, 로컬 SHA-256은 **받은 바이트의 식별값**이지 원본과의 일치 증명이 아니다.
- 클라이언트 취소로 다운로드를 끊어도 서버의 복원 worker가 즉시 종료된다고 보장하지 않는다.

### 2.3 현재 코드에서 추가 발견한 인접 불일치

`download_url`에도 `backup` content 허용과 optional filename 문제가 있다. 확인한 upstream은 content를 `iso|vztmpl|import`로 제한하고 filename을 필수로 받는다. 4단계에서 잘못된 schema는 바로잡되, 이 기능은 **PVE 서버가 외부 URL을 가져오는 별도 동작**이다. MCP 로컬 업로드 디렉터리 제한으로 URL fetch의 SSRF 위험까지 해결했다고 주장하지 않는다. URL 접근 정책 확대는 별도 범위로 기록한다.

## 3. 로컬 실행으로 확인한 사항

재현 코드: `evidence/file-transfer-feasibility.mjs`

```sh
node docs/bug-reports/evidence/file-transfer-feasibility.mjs
```

Node v24.11.0 / undici 7.20.0 / 현재 macOS에서 실행:

- 262,161바이트 합성 binary를 열린 FD의 stream으로 업로드.
- multipart 전체 길이 = UTF-8 header 바이트 + 파일 stat 크기 + trailer 바이트.
- loopback 서버에서 Content-Length 일치 및 Transfer-Encoding 부재 확인.
- content/checksum/file part 순서와 전송 bytes 일치 확인.
- 길이 없는 close-delimited binary 응답을 JSON 파싱 없이 파일로 저장.
- exclusive 생성한 partial 파일을 hard link로 publish; 기존 final path에는 EEXIST로 실패하고 원본 보존.
- 최종 파일 symlink는 O_NOFOLLOW로 거부.
- HTTP redirect를 따르지 않음.
- 임시 파일·서버·HTTP Agent 정리 완료.

**이 실험이 증명하지 않는 것:** 실제 PVE multipart parser 수용, 대용량 RSS 상한, 모든 OS/파일시스템의 동작, parent-directory race 차단, PBS 복원 무결성, 실제 ACL. 프로브의 모의 서버는 작은 fixture만 메모리에 모으므로 production parser/부하 테스트로 취급하지 않는다.

## 4. 제안 아키텍처

```text
MCP schema / elevated policy
  ├─ listFileRestore → PVE JSON adapter (bounded result)
  ├─ upload / download → LocalTransferService.start(request_id, input)
  └─ proxmox_file_transfer(status | cancel) → local transfer metadata
       ├─ FilePolicy / ArtifactStore: 승인된 파일 접근 및 저장
       ├─ transfer journal: idempotency, 상태, 중단 기록 (자격증명 미저장)
       └─ ProxmoxApiClient
            ├─ requestJson / 기존 request 호환 wrapper
            ├─ uploadMultipart: known-length stream → JSON UPID
            └─ downloadStream: HTTP status + headers + readable body
```

- 인증과 TLS dispatcher는 기존 설정을 재사용한다. 파일 도구가 arbitrary URL/헤더/인증 정보를 받지 않도록 endpoint는 adapter가 생성한다.
- 전송부는 `undici.request` 사용을 우선한다. 설치된 라이브러리에서 async iterable request body와 Node readable response를 지원하고, low-level response를 자동으로 JSON 파싱하지 않는다.
- download에 `Accept-Encoding: identity`; 예상하지 않은 Content-Encoding은 거부한다. 압축 파일 자체의 바이트와 HTTP 전송 압축을 구별한다.
- transfer 요청은 redirect 자동 추적 금지. 3xx는 명시적 오류. 다른 호스트에 토큰을 전달하는 fallback 없음.
- 응답은 항상 소비하거나 destroy/cancel. upload JSON/에러 본문에도 실제 읽기 byte 제한 적용(예: 64 KiB); 3단계의 문자열 출력 제한만으로 네트워크 메모리 사용을 제한했다고 보지 않는다.
- transport 공통화를 하더라도 기존 JSON 도구를 한 번에 바꾸지 않는다. 기존 request 테스트를 유지하고 새 전송 메서드부터 추가한다.

## 5. 설정과 파일 접근 정책

다음은 **설계 제안이며 아직 구현된 환경 변수는 아니다.**

| 설정 | 제안 기본값 / 정책 |
|---|---|
| `PROXMOX_FILE_TRANSFER_ENABLED` | false |
| `PROXMOX_UPLOAD_ROOT` | 미지정. 업로드에 필요, 승인된 파일만 담은 디렉터리 |
| `PROXMOX_TRANSFER_ROOT` | 미지정. staging/다운로드 산출물/metadata를 위한 전용 private 디렉터리 |
| `PROXMOX_UPLOAD_MAX_BYTES` | 2 GiB |
| `PROXMOX_DOWNLOAD_MAX_BYTES` | 2 GiB |
| `PROXMOX_TRANSFER_QUOTA_BYTES` | 4 GiB, staging + 산출물 합계에 적용 |
| `PROXMOX_TRANSFER_TIMEOUT_SECONDS` | 1800, 전체 전송 deadline |
| `PROXMOX_TRANSFER_IDLE_TIMEOUT_SECONDS` | 60, 데이터 진행 없는 구간 제한 |
| 동시 전송 | 초기 1개; 무제한 대기열 없이 busy 응답 |

- 업로드/다운로드/상태/취소는 elevated 권한 필요. 복원 목록도 백업 경로 노출 및 서버 비용을 고려해 elevated로 강화하는 것을 권장한다. list만 사용하는 경우 로컬 파일 전송 디렉터리는 필요하지 않다.
- 데이터 전송 gate와 권한을 통과하기 전에 파일 읽기·HTTP 호출을 하지 않는다.
- config root는 MCP 서버가 실행되는 호스트의 경로다. PVE 호스트나 원격 MCP 사용자 PC 경로가 아니다.
- 초기 파일 전송 지원은 POSIX Linux/macOS로 제한한다. Windows 및 no-follow/exclusive link publish를 보장하지 않는 파일시스템은 fail-closed. 기존 일반 JSON 도구의 OS 지원을 제한하는 것은 아니다.
- root를 시작 시 canonicalize하고 전용 private 디렉터리(0700), 서비스 UID 소유 및 신뢰된 부모 경로를 검증한다. roots는 서로 겹치지 않게 한다. 광범위한 `/`, home 전체 등을 업로드 승인 영역으로 쓰지 않는다.
- **초기 upload 입력은 root 바로 아래의 basename만 허용**한다. 하위 디렉터리, 절대경로, `..`, slash/backslash, NUL/control 문자는 거부한다. 범위를 넓힐 때는 별도 경로 sandbox 설계가 필요하다.
- O_NOFOLLOW + O_NONBLOCK로 열고 fstat으로 regular file만 허용한다. FIFO/device/socket을 열어 대기하거나 읽지 않는다. source hard link(nlink > 1)도 거부한다.
- O_NOFOLLOW는 마지막 경로 요소만 보호한다. parent directory를 바꿀 수 있는 공격자까지 막는다고 설명하지 않는다. 동일 UID/root 공격자는 별도 OS 격리 범위다.
- 원본 파일을 열린 FD에서 private staging으로 streaming snapshot, byte cap 및 SHA-256 계산. 복사 전후 stat 변화 검사. checksum part와 길이가 결정된 **snapshot FD**를 실제 업로드에 사용한다.
- snapshot은 중복 디스크를 사용하지만 파일 전체를 RAM에 올리지 않는다. source/managed quota/실제 여유 공간을 구별하고 ENOSPC를 처리한다.

### 저장 및 no-overwrite

- 사용자나 Content-Disposition가 로컬 저장 경로를 정하지 않는다. artifact ID와 안전한 고정/generated 파일명만 사용한다. 원래 파일 이름은 표시용 metadata다.
- 같은 managed filesystem에서 `.partial`을 O_CREAT|O_EXCL|O_NOFOLLOW, 0600으로 생성한다.
- stream byte 제한, hash 계산, 선택적 expected checksum 확인, fsync/close 후 **link(partial, final)**로 publish하고 partial을 unlink한다. link는 기존 final을 덮어쓰지 않는다.
- `rename(partial, final)`은 플랫폼에 따라 기존 파일을 덮어쓰므로 단순 no-overwrite 구현으로 사용하지 않는다. hard link를 지원하지 않는 환경은 조용히 rename으로 fallback하지 않는다.
- 취소/오류 시 자신이 만든 partial만 제거하고 source 또는 기존 artifact는 삭제하지 않는다. publish 직후 crash면 journal 복구 시 ID/size/hash를 확인한다.
- 성공 파일은 사용자가 꺼내갈 때까지 보존한다. quota가 차면 실패시키고 자동으로 기존 산출물을 삭제하지 않는다. 초기에는 운영자가 명시적으로 관리 디렉터리를 정리하며, 전용 삭제 도구는 별도 결정한다.
- archive는 저장만 하고 자동으로 압축 해제/실행하지 않는다. Zip Slip·압축 폭탄을 파일 전송 기능 안으로 끌어들이지 않는다.

### 원격 파일명 정책

- `mcp-<random-uuid>-<safe-basename>` 형태로 서비스가 생성하고 PVE 정규화 후에도 같은 값이 되는 ASCII subset만 사용한다. 확장자는 유지한다.
- 전송 전에 동일 이름 존재를 확인하되 **경쟁 상황까지 막는 원자적 검증은 아니라고 명시**한다.
- remote overwrite 보장이 반드시 필요하면 현재 API를 이용한 구현은 No-Go다. 별도 서버 측 조건부 저장 지원이 필요하다.
- 명시적 덮어쓰기/사용자 지정 고정 remote filename 옵션은 1차 구현에서 제공하지 않는다.

## 6. 공개 입력과 호환성

### upload

```json
{
  "action": "upload",
  "node": "lab",
  "storage": "local",
  "content": "iso",
  "filename": "installer.iso",
  "request_id": "<client-generated-uuid>"
}
```

- 기존 filename 필드는 **UPLOAD_ROOT 아래의 승인된 로컬 basename**으로 명확히 정의한다. 실제 원격 이름은 생성 후 응답에 표시한다.
- checksum/checksum-algorithm을 제공하면 snapshot의 digest와 일치하는지 전송 전에 확인한다. PVE에는 기본 SHA-256을 함께 보내 원격 import 단계에서도 검증하게 한다.
- `backup` content는 명확한 validation 오류. `import`는 초기 범위 밖.
- 시작 응답은 local transfer ID와 `preparing` 상태다. 아직 PVE UPID가 없는 상태를 원격 task 시작으로 표시하지 않는다.

### restore list

```json
{"action":"list","node":"lab","storage":"pbs","volume":"pbs:backup/vm/100/<timestamp>","filepath":"/"}
```

- `filepath` 생략 시 `/` 적용. 반환된 base64 식별자를 다음 요청에 그대로 사용한다.
- 새로운 filepath는 root marker 또는 canonical standard base64로 검증하되, decode한 경로를 로컬 path로 사용하지 않는다.
- 기존 `path`는 호환 별칭으로 사용할 경우에도 `/` 또는 같은 opaque base64만 허용한다. 둘 다 있으면 오류. 일반 경로를 자동으로 base64 변환하는 추측은 하지 않는다.
- 표시 이름은 text, 식별자는 filepath로 분리한다. 목록 응답 크기/항목 수를 제한하고 생략되었음을 표시한다. API 자체 pagination 지원이 없는데 로컬 slicing을 서버 pagination이라고 광고하지 않는다.

### restore download

```json
{
  "action":"download", "node":"lab", "storage":"pbs",
  "volume":"pbs:backup/vm/100/<timestamp>",
  "filepath":"<filepath returned by list>", "archive":"zip",
  "request_id":"<client-generated-uuid>"
}
```

- archive는 디렉터리 다운로드의 zip/tar.zst 선택을 tar=0/1로 변환한다. 일반 파일의 내용은 변환하지 않는다.
- 선택적 `expected_sha256`는 수신 bytes digest와 비교한다. directory archive는 포맷/생성 조건에 따라 재생성 digest가 다를 수 있다는 점을 문서화한다.
- 결과는 artifact ID, 서버 측 상대 위치, 크기, 수신 SHA-256, 검증 수준만 반환. 파일 본문/base64 또는 사용자의 PC에서 접근 가능한 것처럼 꾸민 file:// 링크를 반환하지 않는다.

## 7. 장시간 호출·취소·재시도

**추천: 파일 전송만 작은 application-level async job 모델을 사용한다.**

- 설치된 MCP SDK 기본 요청 timeout은 60초다. progress 알림으로 연장하려면 클라이언트가 별도 옵션을 켜야 한다. MCP의 실험적 task 기능을 모든 클라이언트가 지원한다고 가정하지 않는다.
- upload/download 시작은 request_id를 기록하고 빠르게 반환한다. `proxmox_file_transfer`의 status/cancel로 추적한다. 이 ID는 Proxmox UPID와 별개임을 표시한다.
- 로컬 상태: preparing → transferring → submitted(업로드 UPID 확보) 또는 received(다운로드 수신 완료), failed/cancelled/interrupted.
- upload submitted 후에는 기존 `proxmox_node_task get`으로 PVE 작업 결과 확인. PVE 작업을 취소/삭제하는 것은 local 전송 취소와 구별하며 초기에는 자동 수행하지 않는다.
- request_id는 client-generated UUID로 필수화하고 canonical input digest와 함께 journal에 보관한다. 동일 ID+동일 입력 재요청은 기존 상태, 동일 ID+다른 입력은 오류. 무응답을 이유로 동일 파일을 새 job으로 자동 재전송하지 않는다.
- journal에는 경로 식별자·상태·bytes/hash·UPID만 저장하고 API 인증정보/파일 본문은 저장하지 않는다. 고정 개수 상한(예: 1,000개) 도달 시 새 job을 거부하고 운영자 정리를 요구한다. eviction 때문에 idempotency가 조용히 깨지지 않게 한다.
- restart 시 전송 중 journal을 interrupted로 표시하고 자동 재개/재전송하지 않는다. 업로드 body를 보낸 뒤 응답을 잃으면 `remote_outcome_unknown`으로 남긴다.
- cancel은 전송 stream/HTTP AbortController/파일 writer를 중단하고 partial/snapshot을 정리한다. PVE remote worker의 종료까지 보장하지 않는다.
- MCP 연결 종료/프로세스 정상 종료 시 진행 전송 abort, journal 기록, 파일/dispatcher close. 강제 종료 후에는 시작 시 partial 검증·정리.
- 초기 구현에서 resumable upload/download 및 Range 재개는 지원하지 않는다.

## 8. 성공의 의미와 무결성 표시

| 상태 | 의미 |
|---|---|
| upload submitted | 파일 전송과 PVE 작업 접수 완료, UPID 확보. 아직 작업 성공은 아님 |
| download received / integrity=unverified | 응답 stream을 수신해 저장. 원본 복원 성공 여부까지 확정하지 않음 |
| download received / integrity=checksum_matched | 사용자 제공 expected SHA-256과 수신 결과가 일치 |
| failed / length_mismatch | 알려진 Content-Length와 실제 수신량 불일치 |
| interrupted / remote_outcome_unknown | 연결/프로세스 중단으로 원격 결과 불명 |

HTTP 200이어도 예상하지 않은 content-type/encoding이면 거부하고 본문을 제한적으로 읽어 마스킹된 오류로 처리한다. raw binary 다운로드가 JSON 파일 내용을 담을 수 있으므로 **파일 바이트가 `{`로 시작한다는 이유만으로 API 오류로 오인하지 않는다.**

## 9. 테스트 및 구현 순서

### A. 계약 및 전송 기반

1. stable-8/current 소스에서 익명 fixture와 요청 규약 작성.
2. 기존 request 유지 + requestJson/uploadMultipart/downloadStream 추가.
3. `Content-Length` 정확성, part 순서, binary roundtrip, redirect 거부, TLS/auth 재사용, 제한된 오류 body 소비 테스트.

### B. 로컬 파일 안전성

4. private root 검증, basename-only source, FD 검사, snapshot/hash, quota.
5. link publish, EEXIST, symlink/hardlink/FIFO/device 거부, source 변경, ENOSPC, 중간 오류와 취소 정리.
6. Linux/macOS에서 반복 실행. 대용량 fixture는 sparse/생성 stream으로 구성해 테스트가 파일 크기만큼 RAM을 쓰지 않게 한다.

### C. 도구 연결

7. PBS list 파라미터/응답 정규화, 권한 정책 및 schema 문서 수정.
8. async start/status/cancel, journal과 idempotency, 연결 종료 정리.
9. upload/download handler 연결, 기존 잘못된 mock 기대값 교체.
10. 프로세스 crash 시뮬레이션, 중복 start, limit 초과, malformed response, timeout 및 partial 파일 검증.

### D. 실환경 진입 조건

- 파일 전송 설정이 기본 off이고 모든 local gate 테스트 통과.
- 임의 경로·redirect·무제한 body·묵시적 overwrite 동작이 없음.
- 원격 no-overwrite와 복원 무결성의 한계가 사용자 응답과 문서에 명시됨.
- 전체 typecheck/build/test 통과, 변경 파일 lint 통과.

그 후 별도 승인된 테스트 자원에서만:

1. 정확한 PVE/libpve-storage-perl/libpve-http-server-perl/PBS 패키지 버전 기록.
2. 제한된 토큰 ACL로 작은 ISO/template 업로드, checksum 오류/권한 거부, UPID 종료 확인.
3. 같은 노드/다른 노드 업로드와 PVE 임시 공간 부족 케이스.
4. PBS LXC/PXAR 및 VM 이미지 각각 root→하위 목록→일반 파일→작은 디렉터리 복원.
5. 암호화 백업, 복원 보조 VM 준비/503, 연결 중단, 클라이언트 취소는 실제 사용 조건에 해당하면 추가 검증.

## 10. 근거 및 버전 범위

정확한 설치 PVE 8.4.16/9.2.2 패키지와 동일한 소스임을 보장하지 않는다. stable-8 브랜치와 최신 소스를 함께 비교했으며, 아래 commit으로 참고를 고정한다.

- pve-storage stable-8 `9aab8f6f52b314fda5e2aceef6472ffd21b7d5b3`
  - [upload](https://github.com/proxmox/pve-storage/blob/9aab8f6f52b314fda5e2aceef6472ffd21b7d5b3/src/PVE/API2/Storage/Status.pm)
  - [file restore](https://github.com/proxmox/pve-storage/blob/9aab8f6f52b314fda5e2aceef6472ffd21b7d5b3/src/PVE/API2/Storage/FileRestore.pm)
- pve-storage current `b877a00a807cda994d6a77079ec86ed0c961df49`
  - [upload](https://github.com/proxmox/pve-storage/blob/b877a00a807cda994d6a77079ec86ed0c961df49/src/PVE/API2/Storage/Status.pm)
  - [file restore](https://github.com/proxmox/pve-storage/blob/b877a00a807cda994d6a77079ec86ed0c961df49/src/PVE/API2/Storage/FileRestore.pm)
  - [volume permissions / filename normalization](https://github.com/proxmox/pve-storage/blob/b877a00a807cda994d6a77079ec86ed0c961df49/src/PVE/Storage.pm)
- pve-http-server `3d0d58d940d42bce4e5a5020e1f1b776cc437ec5`
  - [AnyEvent HTTP parser / multipart / download streaming](https://github.com/proxmox/pve-http-server/blob/3d0d58d940d42bce4e5a5020e1f1b776cc437ec5/src/PVE/APIServer/AnyEvent.pm)
- pve-manager stable-8 `5aee9c094b1d5608e36fec9cf35c6f71c38a1bdc`
  - [token/CSRF/upload authentication](https://github.com/proxmox/pve-manager/blob/5aee9c094b1d5608e36fec9cf35c6f71c38a1bdc/PVE/HTTPServer.pm)
- [RESTHandler allowtoken default](https://github.com/proxmox/pve-common/blob/master/src/PVE/RESTHandler.pm), [Upload UI](https://github.com/proxmox/pve-manager/blob/master/www/manager6/window/UploadToStorage.js), [FileBrowser UI](https://github.com/proxmox/proxmox-widget-toolkit/blob/master/src/window/FileBrowser.js): 조회 시점 master 참고.
- [Node 24 fs](https://nodejs.org/docs/latest-v24.x/api/fs.html): filehandle streams, O_NOFOLLOW, exclusive open/link/rename 의미.
- [undici 7.20.0](https://github.com/nodejs/undici/blob/v7.20.0/README.md) 및 설치된 `types/dispatcher.d.ts`: streaming, timeout, response consumption.
- 설치된 MCP SDK `dist/esm/shared/protocol.d.ts:55-88,175-177`: 60초 기본 timeout, progress 연장 opt-in, request cancellation signal.
