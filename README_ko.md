# Proxmox MCP Server

> Proxmox Virtual Environment를 위한 Model Context Protocol (MCP) 서버

[English](README.md) | **한국어**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

Proxmox VE의 QEMU 가상머신과 LXC 컨테이너를 관리하는 307개 도구를 제공하는 MCP 서버입니다.

## 참고 프로젝트 & 개선사항

이 프로젝트는 [mcp-proxmox-server](https://github.com/canvrno/ProxmoxMCP)를 TypeScript로 재작성한 것입니다. 원본은 [canvrno/ProxmoxMCP](https://github.com/canvrno/ProxmoxMCP) (Python)의 Node.js 포팅 버전입니다.

### 달라진 점

**아키텍처**:
- 3,147줄 단일 파일 → 110개 이상의 모듈로 분리된 TypeScript 구조
- 타입 안전성 없음 → `noUncheckedIndexedAccess` 포함 strict TypeScript
- 수작업 JSON Schema → Zod 스키마 기반 자동 JSON Schema 생성
- 55개 case의 거대한 switch문 → handler/schema 쌍의 도구 레지스트리

**품질**:
- 테스트 0건 → 808건
- 입력 검증 없음 → 모든 도구 호출에 Zod 런타임 검증
- 암묵적 에러 처리 → 컨텍스트를 포함한 구조화된 MCP 에러 응답
- 권한 체크 없음 → 2단계 권한 모델 (기본 / 관리자)

**개발자 경험**:
- `npx @bldg-7/proxmox-mcp`로 바로 실행
- MCP `ListTools`를 통해 307개 도구 설명 자동 노출
- Rate Limiter 미들웨어 내장
- `console.log` 대신 Pino 구조화 로깅

## 주요 기능

- **307개 관리 도구** - Proxmox 전 영역 커버
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
| `PROXMOX_ALLOW_ELEVATED` | 아니오 | 관리자 작업 허용 여부 | `false` |
| `PROXMOX_PORT` | 아니오 | Proxmox API 포트 | `8006` |

### SSL 모드

- **`strict`**: 전체 SSL 인증서 검증 (운영 환경 권장)
- **`verify`**: SSL 검증하되 자체 서명 인증서 허용
- **`insecure`**: SSL 검증 안 함 (개발용, 비권장)

### 권한 모델

서버는 2단계 권한 모델을 사용합니다:

- **기본 작업**: 읽기 전용 (조회, 상태 확인) - 항상 허용
- **관리자 작업**: 생성, 수정, 삭제 - `PROXMOX_ALLOW_ELEVATED=true` 필요

의도치 않은 파괴적 작업을 방지하기 위한 안전 장치입니다.

## 사용법

### 서버 시작

```bash
export PROXMOX_HOST=pve.example.com
export PROXMOX_TOKEN_NAME=mytoken
export PROXMOX_TOKEN_VALUE=abc123-def456-ghi789
export PROXMOX_SSL_MODE=verify
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
        "PROXMOX_ALLOW_ELEVATED": "true"
      }
    }
  }
}
```

## 도구 목록

이 서버는 Proxmox 관리를 위한 **307개의 종합 도구**를 제공합니다:

| 카테고리 | 도구 수 | 권한 |
|----------|---------|------|
| 노드 & 클러스터 | 7 | 혼합 |
| 노드 관리 | 8 | 혼합 |
| 시스템 운영 | 20 | 혼합 |
| 노드 네트워크 구성 | 4 | 🔒 관리자 |
| 클러스터 관리 | 54 | 혼합 |
| 스토리지 관리 | 12 | 혼합 |
| 접근 제어 | 25 | 혼합 |
| 풀 관리 | 5 | 혼합 |
| SDN 네트워킹 | 20 | 혼합 |
| Ceph | 16 | 혼합 |
| VM 조회 | 9 | 기본 |
| VM 라이프사이클 | 12 | 🔒 관리자 |
| VM 수정 | 4 | 🔒 관리자 |
| VM/LXC 고급 | 30 | 혼합 |
| 스냅샷 | 8 | 혼합 |
| 백업 | 6 | 🔒 관리자 |
| 디스크 | 16 | 혼합 |
| VM/LXC 네트워크 | 6 | 🔒 관리자 |
| 콘솔 접근 | 5 | 🔒 관리자 |
| 명령어 실행 | 1 | 🔒 관리자 |
| VM 생성 | 6 | 혼합 |
| 인증서 | 7 | 혼합 |
| ACME | 8 | 혼합 |
| 알림 | 5 | 혼합 |
| **합계** | **307** | |

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
- 자체 서명 인증서: `PROXMOX_SSL_MODE=verify`
- 개발용: `PROXMOX_SSL_MODE=insecure` (운영 환경 비권장)
- 운영 환경: Proxmox 서버에 적절한 SSL 인증서 설치

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
