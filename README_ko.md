# Proxmox MCP Server

> Proxmox Virtual Environment를 위한 Model Context Protocol (MCP) 서버

[English](README.md) | **한국어**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

Proxmox VE의 QEMU 가상머신과 LXC 컨테이너를 관리하는 64개 도구를 제공하는 MCP 서버입니다.

## 참고 프로젝트 & 개선사항

이 프로젝트는 [mcp-proxmox-server](https://github.com/canvrno/ProxmoxMCP)를 TypeScript로 재작성한 것입니다. 원본은 [canvrno/ProxmoxMCP](https://github.com/canvrno/ProxmoxMCP) (Python)의 Node.js 포팅 버전입니다.

### 달라진 점

**아키텍처**:
- 3,147줄 단일 파일 → 30개 이상의 모듈로 분리된 TypeScript 구조
- 타입 안전성 없음 → `noUncheckedIndexedAccess` 포함 strict TypeScript
- 수작업 JSON Schema → Zod 스키마 기반 자동 JSON Schema 생성
- 55개 case의 거대한 switch문 → handler/schema 쌍의 도구 레지스트리

**품질**:
- 테스트 0건 → 405건 (단위 351 + 통합 22)
- 입력 검증 없음 → 모든 도구 호출에 Zod 런타임 검증
- 암묵적 에러 처리 → 컨텍스트를 포함한 구조화된 MCP 에러 응답
- 권한 체크 없음 → 2단계 권한 모델 (기본 / 관리자)

**개발자 경험**:
- `npx @bldg-7/proxmox-mcp`로 바로 실행
- MCP `ListTools`를 통해 64개 도구 설명 자동 노출
- Rate Limiter 미들웨어 내장
- `console.log` 대신 Pino 구조화 로깅

## 주요 기능

- **64개 관리 도구** - Proxmox 전 영역 커버
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

### 노드 & 클러스터 관리 (4개)

| 도구 | 설명 | 권한 |
|------|------|------|
| `proxmox_get_nodes` | 클러스터 내 모든 노드 상태 조회 | 기본 |
| `proxmox_get_node_status` | 특정 노드 상세 상태 조회 | 🔒 관리자 |
| `proxmox_get_cluster_status` | 클러스터 전체 상태 및 리소스 조회 | 기본 |
| `proxmox_get_next_vmid` | 사용 가능한 다음 VM/컨테이너 ID 조회 | 기본 |

**예시** - 노드 상태 조회:
```json
{ "node": "pve1" }
```

---

### VM 조회 (3개)

| 도구 | 설명 | 권한 |
|------|------|------|
| `proxmox_get_vms` | 클러스터 내 모든 VM 목록 조회 | 기본 |
| `proxmox_get_vm_status` | 특정 VM 상세 상태 조회 | 기본 |
| `proxmox_get_storage` | 스토리지 풀 및 사용량 조회 | 기본 |

**예시** - VM 목록 (노드/타입 필터):
```json
{ "node": "pve1", "type": "qemu" }
```

**예시** - VM 상태:
```json
{ "node": "pve1", "vmid": 100, "type": "qemu" }
```

---

### VM/LXC 구성 조회 (2개)

#### `proxmox_get_vm_config`
QEMU 가상머신의 하드웨어 구성을 조회합니다.

**매개변수**:
- `node` (string): 노드 이름
- `vmid` (number): VM ID

**예시**:
```json
{
  "node": "pve1",
  "vmid": 101
}
```

**반환값**: CPU, 메모리, 디스크, 네트워크 인터페이스, 부팅 순서 및 기타 VM 설정.

#### `proxmox_get_lxc_config`
LXC 컨테이너의 하드웨어 구성을 조회합니다.

**매개변수**:
- `node` (string): 노드 이름
- `vmid` (number): 컨테이너 ID

**예시**:
```json
{
  "node": "pve1",
  "vmid": 100
}
```

**반환값**: CPU, 메모리, 마운트 포인트, 네트워크 인터페이스 및 기타 컨테이너 설정.

---

### VM 라이프사이클 (12개) 🔒

모든 라이프사이클 작업은 관리자 권한이 필요합니다.

| 도구 | 설명 |
|------|------|
| `proxmox_start_lxc` | LXC 컨테이너 시작 |
| `proxmox_start_vm` | QEMU VM 시작 |
| `proxmox_stop_lxc` | LXC 컨테이너 강제 중지 |
| `proxmox_stop_vm` | QEMU VM 강제 중지 |
| `proxmox_shutdown_lxc` | LXC 컨테이너 정상 종료 |
| `proxmox_shutdown_vm` | QEMU VM 정상 종료 |
| `proxmox_reboot_lxc` | LXC 컨테이너 재부팅 |
| `proxmox_reboot_vm` | QEMU VM 재부팅 |
| `proxmox_pause_vm` | QEMU VM 일시정지 (메모리 유지) |
| `proxmox_resume_vm` | 일시정지된 QEMU VM 재개 |
| `proxmox_delete_lxc` | LXC 컨테이너 영구 삭제 |
| `proxmox_delete_vm` | QEMU VM 영구 삭제 |

**공통 매개변수**: `node` (string), `vmid` (number)

**예시**:
```json
{ "node": "pve1", "vmid": 100 }
```

---

### VM 수정 (4개) 🔒

| 도구 | 설명 |
|------|------|
| `proxmox_clone_lxc` | LXC 컨테이너 복제 |
| `proxmox_clone_vm` | QEMU VM 복제 |
| `proxmox_resize_lxc` | LXC 컨테이너 CPU/메모리 조정 |
| `proxmox_resize_vm` | QEMU VM CPU/메모리 조정 |

**예시** - 복제:
```json
{ "node": "pve1", "vmid": 100, "newid": 200, "hostname": "cloned" }
```

**예시** - 리사이즈:
```json
{ "node": "pve1", "vmid": 100, "memory": 2048, "cores": 2 }
```

---

### 스냅샷 (8개)

| 도구 | 설명 | 권한 |
|------|------|------|
| `proxmox_create_snapshot_lxc` | LXC 스냅샷 생성 | 🔒 관리자 |
| `proxmox_create_snapshot_vm` | VM 스냅샷 생성 | 🔒 관리자 |
| `proxmox_list_snapshots_lxc` | LXC 스냅샷 목록 | 기본 |
| `proxmox_list_snapshots_vm` | VM 스냅샷 목록 | 기본 |
| `proxmox_rollback_snapshot_lxc` | LXC 스냅샷 롤백 | 🔒 관리자 |
| `proxmox_rollback_snapshot_vm` | VM 스냅샷 롤백 | 🔒 관리자 |
| `proxmox_delete_snapshot_lxc` | LXC 스냅샷 삭제 | 🔒 관리자 |
| `proxmox_delete_snapshot_vm` | VM 스냅샷 삭제 | 🔒 관리자 |

**예시** - 스냅샷 생성:
```json
{
  "node": "pve1",
  "vmid": 100,
  "snapname": "before-update",
  "description": "시스템 업데이트 전 스냅샷"
}
```

**예시** - 스냅샷 목록:
```json
{ "node": "pve1", "vmid": 100 }
```

**예시** - 스냅샷 롤백/삭제:
```json
{ "node": "pve1", "vmid": 100, "snapname": "before-update" }
```

---

### 백업 (6개) 🔒

모든 백업 작업은 관리자 권한이 필요합니다.

| 도구 | 설명 |
|------|------|
| `proxmox_create_backup_lxc` | LXC 컨테이너 백업 생성 |
| `proxmox_create_backup_vm` | QEMU VM 백업 생성 |
| `proxmox_list_backups` | 스토리지 내 백업 목록 조회 |
| `proxmox_restore_backup_lxc` | 백업에서 LXC 컨테이너 복원 |
| `proxmox_restore_backup_vm` | 백업에서 QEMU VM 복원 |
| `proxmox_delete_backup` | 백업 파일 삭제 |

**예시** - 백업 생성:
```json
{
  "node": "pve1",
  "vmid": 100,
  "storage": "backup-storage",
  "mode": "snapshot",
  "compress": "zstd"
}
```

- `mode`: `snapshot` (기본), `suspend`, `stop`
- `compress`: `zstd` (기본), `none`, `lzo`, `gzip`

**예시** - 백업 목록:
```json
{ "node": "pve1", "storage": "backup-storage" }
```

**예시** - 복원:
```json
{
  "node": "pve1",
  "vmid": 300,
  "archive": "local:backup/vzdump-lxc-100-2024_01_01-12_00_00.tar.zst",
  "storage": "local-lvm"
}
```

**예시** - 백업 삭제:
```json
{
  "node": "pve1",
  "storage": "local",
  "volume": "local:backup/vzdump-lxc-100-2024_01_01-12_00_00.tar.zst"
}
```

---

### 디스크 (8개) 🔒

모든 디스크 작업은 관리자 권한이 필요합니다.

| 도구 | 설명 |
|------|------|
| `proxmox_add_disk_vm` | QEMU VM에 디스크 추가 |
| `proxmox_add_mountpoint_lxc` | LXC 컨테이너에 마운트 포인트 추가 |
| `proxmox_resize_disk_vm` | VM 디스크 크기 확장 |
| `proxmox_resize_disk_lxc` | LXC 디스크/마운트 포인트 크기 확장 |
| `proxmox_remove_disk_vm` | VM 디스크 제거 |
| `proxmox_remove_mountpoint_lxc` | LXC 마운트 포인트 제거 |
| `proxmox_move_disk_vm` | VM 디스크를 다른 스토리지로 이동 |
| `proxmox_move_disk_lxc` | LXC 디스크를 다른 스토리지로 이동 |

**예시** - VM 디스크 추가:
```json
{
  "node": "pve1",
  "vmid": 101,
  "disk": "scsi1",
  "storage": "local-lvm",
  "size": "50"
}
```

**예시** - LXC 마운트 포인트 추가:
```json
{
  "node": "pve1",
  "vmid": 100,
  "mp": "mp0",
  "storage": "local-lvm",
  "size": "20"
}
```

**예시** - 디스크 크기 확장:
```json
{ "node": "pve1", "vmid": 101, "disk": "scsi0", "size": "+20G" }
```

- `size`: `+10G` (상대적 증가) 또는 `50G` (절대 크기). 축소 불가.

**예시** - 디스크 이동:
```json
{
  "node": "pve1",
  "vmid": 101,
  "disk": "scsi0",
  "storage": "fast-ssd",
  "delete": true
}
```

---

### 네트워크 (6개) 🔒

모든 네트워크 작업은 관리자 권한이 필요합니다.

| 도구 | 설명 |
|------|------|
| `proxmox_add_network_vm` | QEMU VM에 네트워크 인터페이스 추가 |
| `proxmox_add_network_lxc` | LXC 컨테이너에 네트워크 인터페이스 추가 |
| `proxmox_update_network_vm` | VM 네트워크 설정 수정 |
| `proxmox_update_network_lxc` | LXC 네트워크 설정 수정 |
| `proxmox_remove_network_vm` | VM 네트워크 인터페이스 제거 |
| `proxmox_remove_network_lxc` | LXC 네트워크 인터페이스 제거 |

**예시** - VM 네트워크 추가:
```json
{
  "node": "pve1",
  "vmid": 101,
  "net": "net1",
  "bridge": "vmbr0",
  "model": "virtio",
  "tag": 100,
  "firewall": true
}
```

**예시** - LXC 네트워크 추가:
```json
{
  "node": "pve1",
  "vmid": 100,
  "net": "net1",
  "bridge": "vmbr0",
  "ip": "192.168.1.100/24",
  "gw": "192.168.1.1",
  "firewall": true
}
```

**예시** - 네트워크 제거:
```json
{ "node": "pve1", "vmid": 101, "net": "net1" }
```

---

### 명령어 실행 (1개) 🔒

| 도구 | 설명 |
|------|------|
| `proxmox_execute_vm_command` | Proxmox API를 통해 VM에서 셸 명령어 실행 |

**예시**:
```json
{
  "node": "pve1",
  "vmid": 101,
  "type": "qemu",
  "command": "uptime"
}
```

> 보안을 위해 위험 문자(`;`, `&`, `|`, `` ` ``, `$` 등)는 차단됩니다.

---

### VM 생성 (3개)

| 도구 | 설명 | 권한 |
|------|------|------|
| `proxmox_list_templates` | 스토리지 내 LXC 템플릿 목록 조회 | 기본 |
| `proxmox_create_lxc` | 새 LXC 컨테이너 생성 | 🔒 관리자 |
| `proxmox_create_vm` | 새 QEMU VM 생성 | 🔒 관리자 |

**예시** - 템플릿 조회:
```json
{ "node": "pve1", "storage": "local" }
```

**예시** - LXC 컨테이너 생성:
```json
{
  "node": "pve1",
  "vmid": 100,
  "ostemplate": "local:vztmpl/debian-12-standard_12.2-1_amd64.tar.gz",
  "hostname": "my-container",
  "password": "SecurePassword123!",
  "memory": 1024,
  "storage": "local-lvm",
  "rootfs_size": "16"
}
```

**예시** - QEMU VM 생성:
```json
{
  "node": "pve1",
  "vmid": 101,
  "name": "my-vm",
  "memory": 2048,
  "cores": 2,
  "disk_size": "50G",
  "storage": "local-lvm",
  "iso": "local:iso/debian-12.2-amd64-netinst.iso",
  "bridge": "vmbr0"
}
```

---

### 노드 디스크 조회 (4개)

#### `proxmox_get_node_disks`
Proxmox 노드의 물리 디스크 목록을 조회합니다.

**매개변수**:
- `node` (string): 노드 이름
- `type` (string, optional): 디스크 타입으로 필터링 (`unused`, `journal_disks`)

**예시**:
```json
{
  "node": "pve1"
}
```

**반환값**: 디바이스 경로, 크기, 모델, 시리얼 번호 및 사용 상태를 포함한 물리 디스크 목록.

#### `proxmox_get_node_disk_smart`
특정 디스크의 SMART 상태 데이터를 조회합니다.

**매개변수**:
- `node` (string): 노드 이름
- `disk` (string): 디스크 디바이스 경로 (예: `/dev/sda`)

**예시**:
```json
{
  "node": "pve1",
  "disk": "/dev/sda"
}
```

**반환값**: SMART 상태, 속성 및 디스크 진단 정보.

#### `proxmox_get_node_lvm`
노드의 LVM 볼륨 그룹 및 논리 볼륨을 조회합니다.

**매개변수**:
- `node` (string): 노드 이름

**예시**:
```json
{
  "node": "pve1"
}
```

**반환값**: 논리 볼륨, 크기 및 여유 공간을 포함한 볼륨 그룹.

#### `proxmox_get_node_zfs`
Proxmox 노드의 ZFS 풀을 조회합니다.

**매개변수**:
- `node` (string): 노드 이름

**예시**:
```json
{
  "node": "pve1"
}
```

**반환값**: 상태, 크기, 할당/여유 공간 및 단편화를 포함한 ZFS 풀.

---

### 노드 네트워크 조회 (3개)

#### `proxmox_get_node_network`
Proxmox 노드의 네트워크 인터페이스 목록을 조회합니다.

**매개변수**:
- `node` (string): 노드 이름
- `type` (string, optional): 인터페이스 타입으로 필터링 (`bridge`, `bond`, `eth`, `alias`, `vlan`, `OVSBridge`, `OVSBond`, `OVSPort`, `OVSIntPort`, `any_bridge`, `any_local_bridge`)

**예시**:
```json
{
  "node": "pve1",
  "type": "bridge"
}
```

**반환값**: IP 주소, 상태 및 설정을 포함한 네트워크 인터페이스 목록.

#### `proxmox_get_node_dns`
Proxmox 노드의 DNS 설정을 조회합니다.

**매개변수**:
- `node` (string): 노드 이름

**예시**:
```json
{
  "node": "pve1"
}
```

**반환값**: DNS 서버 (dns1, dns2, dns3) 및 검색 도메인.

#### `proxmox_get_network_iface`
특정 네트워크 인터페이스의 상세 설정을 조회합니다.

**매개변수**:
- `node` (string): 노드 이름
- `iface` (string): 인터페이스 이름 (예: `vmbr0`, `eth0`)

**예시**:
```json
{
  "node": "pve1",
  "iface": "vmbr0"
}
```

**반환값**: 타입, IP 주소, 넷마스크, 게이트웨이, 브릿지 포트 및 활성 상태를 포함한 인터페이스 상세 정보.

---

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
