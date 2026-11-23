# Proxmox MCP Server

> Proxmox Virtual Environment를 위한 Model Context Protocol (MCP) 서버

[English](README.md) | **한국어**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

Proxmox VE의 QEMU 가상머신과 LXC 컨테이너를 관리하는 93개 도구를 제공하는 MCP 서버입니다.

## 참고 프로젝트 & 개선사항

이 프로젝트는 [mcp-proxmox-server](https://github.com/canvrno/ProxmoxMCP)를 TypeScript로 재작성한 것입니다. 원본은 [canvrno/ProxmoxMCP](https://github.com/canvrno/ProxmoxMCP) (Python)의 Node.js 포팅 버전입니다.

### 달라진 점

**아키텍처**:
- 3,147줄 단일 파일 → 110개 이상의 모듈로 분리된 TypeScript 구조
- 타입 안전성 없음 → `noUncheckedIndexedAccess` 포함 strict TypeScript
- 수작업 JSON Schema → Zod 스키마 기반 자동 JSON Schema 생성
- 55개 case의 거대한 switch문 → handler/schema 쌍의 도구 레지스트리

**품질**:
- 테스트 0건 → 1,134건
- 입력 검증 없음 → 모든 도구 호출에 Zod 런타임 검증
- 암묵적 에러 처리 → 컨텍스트를 포함한 구조화된 MCP 에러 응답
- 권한 체크 없음 → 2단계 권한 모델 (기본 / 관리자)

**개발자 경험**:
- `npx @bldg-7/proxmox-mcp`로 바로 실행
- MCP `ListTools`를 통해 93개 도구 설명 자동 노출
- Rate Limiter 미들웨어 내장
- `console.log` 대신 Pino 구조화 로깅

## 주요 기능

- **93개 관리 도구** - Proxmox 전 영역 커버
- **완전한 TypeScript 구현** - 엄격한 타입 안전성
- **QEMU VM + LXC 컨테이너** 동시 지원
- **보안 인증** - API 토큰
- **유연한 SSL 모드** - strict, verify, insecure
- **권한 기반 접근 제어** - 읽기 전용 / 관리자 분리
- **구조화된 오류 처리**
- **MCP SDK 1.25.3 기반**

## 설치

```bash
npm install @bldg-7/proxmox-mcp
# 또는
pnpm add @bldg-7/proxmox-mcp
# 또는
npx @bldg-7/proxmox-mcp
```

## 설정

### 환경 변수

| 변수 | 필수 | 설명 | 기본값 |
|------|------|------|--------|
| `PROXMOX_HOST` | **예** | Proxmox 서버 호스트명 또는 IP | - |
| `PROXMOX_USER` | 아니오 | 사용자명 (예: `root@pam`) | `root@pam` |
| `PROXMOX_TOKEN_NAME` | **예** | API 토큰 이름 | - |
| `PROXMOX_TOKEN_VALUE` | **예** | API 토큰 값 | - |
| `PROXMOX_SSL_MODE` | 아니오 | SSL 검증 모드 | `strict` |
| `PROXMOX_SSL_CA_CERT` | 아니오 | `verify` 모드에서 신뢰할 CA 인증서 경로 (PEM) | - |
| `PROXMOX_ALLOW_ELEVATED` | 아니오 | 관리자 작업 허용 여부 | `false` |
| `PROXMOX_PORT` | 아니오 | Proxmox API 포트 | `8006` |
| `PROXMOX_ALLOW_UNSAFE_COMMANDS` | 아니오 | exec 명령에서 셸 특수문자 허용 | `false` |
| `PROXMOX_SSH_ENABLED` | 아니오 | SSH 기반 LXC 실행 활성화 | `false` |
| `PROXMOX_SSH_HOST` | 아니오 | SSH 호스트 (PROXMOX_HOST로 폴백) | - |
| `PROXMOX_SSH_PORT` | 아니오 | SSH 포트 | `22` |
| `PROXMOX_SSH_USER` | 아니오 | SSH 사용자명 | `root` |
| `PROXMOX_SSH_KEY_PATH` | SSH 활성화 시 | SSH 개인 키 경로 | - |
| `PROXMOX_SSH_NODE` | SSH 활성화 시 | SSH로 접근 가능한 Proxmox 노드명 | - |
| `PROXMOX_SSH_HOST_KEY_FINGERPRINT` | 아니오 | 고정 호스트 키 지문, 가장 먼저 확인: 패딩 없는 OpenSSH `SHA256:<base64>` 또는 64자리 SHA-256 hex | - |
| `PROXMOX_SSH_KNOWN_HOSTS` | 아니오 | 확인할 known_hosts 파일 (절대 경로 또는 `~/...`). insecure 모드에서도 확인 | `~/.ssh/known_hosts` |
| `PROXMOX_SSH_ALLOW_INSECURE` | 아니오 | 위 두 설정이 모두 없을 때 호스트 키 검증 생략 (테스트 네트워크 전용) | `false` |
| `PROXMOX_LOG_LEVEL` | 아니오 | 로그 레벨 (`trace`, `debug`, `info`, `warn`, `error`, `fatal`) | `info` |

### 로컬 파일 전송 (기본 비활성)

`PROXMOX_FILE_TRANSFER_ENABLED=true`와 `PROXMOX_ALLOW_ELEVATED=true`가 **모두** 필요합니다. Linux/macOS의 신뢰된 로컬 파일시스템에 서비스 계정 소유의 전용 디렉터리(0700)를 미리 준비하세요. 서로 겹치지 않는 절대 경로를 지정하며 심볼릭 링크는 허용하지 않습니다.

| 환경 변수 | 용도 / 기본값 |
|---|---|
| `PROXMOX_UPLOAD_ROOT` | 승인된 입력 폴더. 생략하면 다운로드만 가능합니다. |
| `PROXMOX_TRANSFER_ROOT` | 임시 파일과 복원 결과를 저장할 폴더 (필수) |
| `PROXMOX_TRANSFER_JOURNAL_ROOT` | SQLite 작업 기록용 별도 폴더 (필수). MCP 인스턴스·PVE 인증 주체마다 분리합니다. |
| `PROXMOX_UPLOAD_MAX_BYTES` / `PROXMOX_DOWNLOAD_MAX_BYTES` | 파일당 한도, 각각 기본 2 GiB |
| `PROXMOX_TRANSFER_QUOTA_BYTES` | 임시 파일과 저장 결과의 합계 한도, 기본 4 GiB |
| `PROXMOX_TRANSFER_TIMEOUT_SECONDS` | 작업 전체 제한 시간, 기본 1800초 |

서버 시작 시 폴더 검증에 실패하면 시작을 거부합니다. 파일은 요청자의 PC가 아닌 **MCP 서버**에 있습니다. [전송 도구 사용 예시](docs/TOOLS_ko.md#proxmox_file_transfer)를 참고하세요. PBS 목록 조회에는 elevated 권한만 필요하며, `download_url`은 PVE가 URL을 가져오는 별개 기능입니다.

### SSH 신뢰 설정 및 진단 출력

`proxmox_lxc_exec`는 명령을 보내기 전에 노드의 SSH 호스트 키를 검증합니다. 서버는 아래 순서에서 처음 해당하는 신뢰 기준을 씁니다.

1. `PROXMOX_SSH_HOST_KEY_FINGERPRINT`가 있으면 그 지문
2. `PROXMOX_SSH_KNOWN_HOSTS`가 있으면 그 파일. insecure 모드에서도 이 파일은 확인합니다.
3. `PROXMOX_SSH_ALLOW_INSECURE=true`이면 검증하지 않음. 신뢰할 수 있는 테스트 네트워크에서만 쓰세요.
4. MCP 서버를 실행하는 사용자의 `~/.ssh/known_hosts`

그 사용자가 이미 `ssh`로 노드에 접속해 키를 받아 두었다면, 4번이 적용되므로 추가 설정이 필요 없습니다. 그렇지 않다면 그 사용자로 `ssh -p <포트> <사용자>@<호스트>`를 한 번 실행하세요. 화면의 지문이 신뢰할 수 있는 노드 콘솔의 지문(예: `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub -E sha256`)과 같을 때만 키를 받으세요. 검증되지 않은 네트워크에서 얻은 지문이나 키를 그대로 신뢰하면 안 됩니다.

서버는 22번 포트이면 `호스트`, 다른 포트이면 `[호스트]:포트` 항목을 찾습니다. 호스트는 `PROXMOX_SSH_HOST`이고, 이 값이 없으면 `PROXMOX_HOST`입니다. 해시된 호스트 이름, 와일드카드, 부정 패턴, `@revoked` 항목을 지원합니다. `@cert-authority` 항목은 지원하지 않습니다. 서버는 파일에 있는 키 종류로만 협상하므로, RSA 키만 있는 파일도 동작합니다. 새로 연결할 때마다 파일을 다시 읽습니다.

서버는 시작할 때 신뢰 기준을 확인합니다. SSH를 켰는데 해당하는 신뢰 기준이 없거나, known_hosts 파일에 노드 항목이 없으면 시작하지 않습니다. 형식이 잘못되었거나 일치하지 않는 지문은 거부합니다.

노드 진단 report는 이제 `PROXMOX_ALLOW_ELEVATED=true`가 필요합니다. 마스킹 후 report는 16,000자, 오류 응답은 4,096자로 제한하고 잘림 표시를 추가합니다. 진단 로그에도 중첩 credential 필드와 일반적인 토큰·비밀번호·인증 패턴 마스킹을 적용합니다. 이는 best-effort이며 이름표 없는 임의 비밀값까지 완벽히 제거하지는 못합니다. 자격증명 생성 성공 응답을 전역 마스킹하지는 않습니다.

### SSL 모드

- **`strict`**: 시스템 CA 저장소 기준 전체 SSL 인증서 검증 (운영 환경 권장)
- **`verify`**: `strict`와 동일하되 `PROXMOX_SSL_CA_CERT`로 지정한 CA 인증서를 추가로 신뢰. 자체 서명 인증서는 해당 인증서(또는 내부 CA)를 PEM 형식으로 `PROXMOX_SSL_CA_CERT`에 지정. `PROXMOX_SSL_CA_CERT` 없이는 `strict`와 동일하게 동작
- **`insecure`**: SSL 검증 안 함 (개발용, 비권장)

인증서 오류를 우회하려고 `NODE_TLS_REJECT_UNAUTHORIZED=0`을 사용하지 마세요. 프로세스 전체의 TLS 검증이 꺼지며, 설정되어 있으면 서버가 경고를 출력합니다. 대신 `PROXMOX_SSL_MODE`와 `PROXMOX_SSL_CA_CERT`를 사용하세요.

### 권한 모델

서버는 2단계 권한 모델을 사용합니다:

- **기본 작업**: 일반 읽기 전용 (조회, 상태 확인)
- **관리자 작업**: 생성, 수정, 삭제 및 민감 조회(노드 진단 report 포함) - `PROXMOX_ALLOW_ELEVATED=true` 필요

의도치 않은 파괴적 작업을 방지하기 위한 안전 장치입니다.

## 사용법

### 서버 시작

```bash
export PROXMOX_HOST=pve.example.com
export PROXMOX_TOKEN_NAME=mytoken
export PROXMOX_TOKEN_VALUE=abc123-def456-ghi789
export PROXMOX_SSL_MODE=verify
export PROXMOX_SSL_CA_CERT=/path/to/proxmox-ca.pem  # verify 모드에서 자체 서명 인증서 사용 시 필요
export PROXMOX_ALLOW_ELEVATED=true

proxmox-mcp
```

### Claude Desktop 연동

macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "proxmox": {
      "command": "npx",
      "args": ["-y", "@bldg-7/proxmox-mcp"],
      "env": {
        "PROXMOX_HOST": "pve.example.com",
        "PROXMOX_TOKEN_NAME": "mytoken",
        "PROXMOX_TOKEN_VALUE": "abc123-def456-ghi789",
        "PROXMOX_SSL_MODE": "verify",
        "PROXMOX_SSL_CA_CERT": "/path/to/proxmox-ca.pem",
        "PROXMOX_ALLOW_ELEVATED": "true"
      }
    }
  }
}
```

## 도구 목록

이 서버는 Proxmox 관리를 위한 **93개의 종합 도구**를 제공합니다:

| 카테고리 | 도구 수 | 권한 |
|----------|---------|------|
| 노드 관리 | 14 | 혼합 |
| 게스트 (VM/LXC) | 23 | 혼합 |
| 게스트 생성 | 2 | 🔒 관리자 |
| QEMU 에이전트 | 7 | 🔒 관리자 |
| 클러스터 운영 | 5 | 혼합 |
| 클러스터 방화벽 | 6 | 혼합 |
| 고가용성 | 2 | 혼합 |
| 스토리지 | 4 | 혼합 |
| SDN 네트워킹 | 4 | 혼합 |
| 접근 제어 | 7 | 혼합 |
| Ceph | 6 | 혼합 |
| 콘솔 접근 | 3 | 🔒 관리자 |
| 백업 | 1 | 혼합 |
| VM 디스크 | 1 | 🔒 관리자 |
| LXC 마운트 포인트 | 1 | 🔒 관리자 |
| LXC 실행 | 1 | 🔒 관리자 |
| Cloud-Init | 1 | 혼합 |
| 인증서 | 1 | 혼합 |
| ACME | 3 | 혼합 |
| 알림 | 1 | 혼합 |
| **합계** | **93** | |

📖 **[전체 도구 레퍼런스 →](docs/TOOLS_ko.md)**

## 오류 처리

### 성공 응답
```json
{
  "content": [{ "type": "text", "text": "✅ 작업이 성공적으로 완료되었습니다" }],
  "isError": false
}
```

### 오류 응답
```json
{
  "content": [{ "type": "text", "text": "❌ Error: 작업 실패\n\n원인: 상세 오류 메시지" }],
  "isError": true
}
```

### 권한 거부
```json
{
  "content": [{ "type": "text", "text": "🚫 Permission Denied: 관리자 권한 필요\n\nPROXMOX_ALLOW_ELEVATED=true 로 설정하세요." }],
  "isError": true
}
```

## 문제 해결

### 연결 오류

`ECONNREFUSED` 또는 연결 시간 초과 시:
- `PROXMOX_HOST` 주소 확인 및 네트워크 도달 가능 여부 점검
- `PROXMOX_PORT` 확인 (기본: 8006)
- 방화벽에서 Proxmox API 포트 허용 여부 확인
- 테스트 시 `PROXMOX_SSL_MODE=insecure` 시도

### 인증 오류

`401 Unauthorized` 시:
- `PROXMOX_USER` 설정 시 realm 포함 여부 확인 (예: `root@pam`, `root`만 사용 불가)
- `PROXMOX_TOKEN_NAME`과 `PROXMOX_TOKEN_VALUE` 유효성 확인
- Proxmox에서 API 토큰에 충분한 권한 부여 여부 확인

### SSL 인증서 오류

`UNABLE_TO_VERIFY_LEAF_SIGNATURE` 시:
- 자체 서명 인증서: `PROXMOX_SSL_MODE=verify` + `PROXMOX_SSL_CA_CERT=/path/to/cert.pem` (서버 인증서 또는 내부 CA). CA 인증서 없이 `verify`만 설정하면 `strict`와 동일해서 여전히 실패함
- 개발용: `PROXMOX_SSL_MODE=insecure` (운영 환경 비권장)
- 운영 환경: Proxmox 서버에 적절한 SSL 인증서 설치
- `NODE_TLS_REJECT_UNAUTHORIZED=0`은 프로세스 전체 TLS 검증을 꺼버리므로 사용 금지

### 권한 거부 오류

`🚫 Permission Denied` 시:
- `PROXMOX_ALLOW_ELEVATED=true` 설정
- 🔒 표시된 도구들이 관리자 권한 필요
- 리소스 수정/삭제가 가능해지므로 의도적인지 확인

## 개발

```bash
git clone https://github.com/Bldg-7/proxmox-mcp.git
cd proxmox-mcp
pnpm install
pnpm build
```

```bash
pnpm test              # 테스트 실행
pnpm test:watch        # 감시 모드
pnpm test:coverage     # 커버리지 포함
pnpm typecheck         # 타입 검사
pnpm lint              # ESLint
```

## 라이선스

MIT License - [LICENSE](LICENSE) 파일 참조

---

**범례**: 🔒 = 관리자 권한 필요 (`PROXMOX_ALLOW_ELEVATED=true`)
