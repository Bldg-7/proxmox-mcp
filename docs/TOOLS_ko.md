# Proxmox MCP 도구 레퍼런스

> 사용 가능한 모든 도구 및 계획된 Proxmox API 통합에 대한 완전한 레퍼런스

**현재 버전**: 0.1.5  
**총 도구 수**: 72  
**최종 업데이트**: 2026-02-05

---

## 목차

- [개요](#개요)
- [권한 모델](#권한-모델)
- [구현된 도구](#구현된-도구)
  - [노드 & 클러스터 (7개)](#노드--클러스터-7개)
  - [노드 관리 (8개)](#노드-관리-8개)
  - [VM 조회 (5개)](#vm-조회-5개)
  - [VM 라이프사이클 (12개)](#vm-라이프사이클-12개)
  - [VM 수정 (4개)](#vm-수정-4개)
  - [스냅샷 (8개)](#스냅샷-8개)
  - [백업 (6개)](#백업-6개)
  - [디스크 (8개)](#디스크-8개)
  - [VM/LXC 네트워크 (6개)](#vmlxc-네트워크-6개)
  - [명령어 실행 (1개)](#명령어-실행-1개)
  - [VM 생성 (3개)](#vm-생성-3개)
  - [노드 디스크 조회 (4개)](#노드-디스크-조회-4개)
- [미구현 Proxmox API](#미구현-proxmox-api)
  - [높은 우선순위](#높은-우선순위)
  - [중간 우선순위](#중간-우선순위)
  - [낮은 우선순위](#낮은-우선순위)

---

## 개요

이 문서는 Proxmox MCP 서버에서 사용 가능한 모든 도구에 대한 완전한 레퍼런스를 기능별 카테고리로 정리하여 제공합니다. 또한 아직 구현되지 않은 Proxmox VE API 엔드포인트를 우선순위별로 문서화합니다.

### 도구 분포

| 카테고리 | 개수 | 권한 |
|----------|------|------|
| 노드 & 클러스터 | 7 | 혼합 |
| 노드 관리 | 8 | 혼합 |
| VM 조회 | 5 | 기본 |
| VM 라이프사이클 | 12 | 관리자 |
| VM 수정 | 4 | 관리자 |
| 스냅샷 | 8 | 혼합 |
| 백업 | 6 | 관리자 |
| 디스크 | 8 | 관리자 |
| VM/LXC 네트워크 | 6 | 관리자 |
| 명령어 실행 | 1 | 관리자 |
| VM 생성 | 3 | 혼합 |
| 노드 디스크 조회 | 4 | 기본 |
| **합계** | **72** | |

---

## 권한 모델

도구는 두 가지 권한 수준으로 분류됩니다:

| 수준 | 기호 | 설명 | 환경 변수 |
|------|------|------|-----------|
| **기본** | - | 읽기 전용 작업, 항상 허용 | (필요 없음) |
| **관리자** | 🔒 | 생성/수정/삭제 작업 | `PROXMOX_ALLOW_ELEVATED=true` |

---

## 구현된 도구

### 노드 & 클러스터 (7개)

#### `proxmox_get_nodes`
모든 Proxmox 클러스터 노드의 상태와 리소스를 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes` |
| 매개변수 | 없음 |

**예시**:
```json
{}
```

**반환값**: `node`, `status`, `cpu`, `maxcpu`, `mem`, `maxmem`, `disk`, `maxdisk`, `uptime`을 포함한 노드 배열.

---

#### `proxmox_get_node_status` 🔒
특정 Proxmox 노드의 상세 상태 정보를 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 관리자 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/status` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |

**예시**:
```json
{
  "node": "pve1"
}
```

---

#### `proxmox_get_node_network`
Proxmox 노드의 네트워크 인터페이스 목록을 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/network` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `type` | string | 아니오 | 필터: `bridge`, `bond`, `eth`, `alias`, `vlan`, `OVSBridge`, `OVSBond`, `OVSPort`, `OVSIntPort`, `any_bridge`, `any_local_bridge` |

**예시**:
```json
{
  "node": "pve1",
  "type": "bridge"
}
```

---

#### `proxmox_get_node_dns`
Proxmox 노드의 DNS 설정을 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/dns` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |

**예시**:
```json
{
  "node": "pve1"
}
```

**반환값**: `dns1`, `dns2`, `dns3`, `search` (검색 도메인).

---

#### `proxmox_get_network_iface`
특정 네트워크 인터페이스의 상세 설정을 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/network/{iface}` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `iface` | string | 예 | 인터페이스 이름 (예: `vmbr0`, `eth0`) |

**예시**:
```json
{
  "node": "pve1",
  "iface": "vmbr0"
}
```

---

#### `proxmox_get_cluster_status`
노드 및 리소스 사용량을 포함한 전체 클러스터 상태를 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/cluster/status` |
| 매개변수 | 없음 |

**예시**:
```json
{}
```

---

#### `proxmox_get_next_vmid`
사용 가능한 다음 VM/컨테이너 ID 번호를 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/cluster/nextid` |
| 매개변수 | 없음 |

**예시**:
```json
{}
```

**반환값**: 정수로 된 다음 사용 가능한 VMID.

---

### 노드 관리 (8개)

#### `proxmox_get_node_services`
Proxmox 노드의 시스템 서비스를 조회합니다.

| 속성 | 값 |
|------|----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/services` |

**파라미터**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |

**예시**:
```json
{
  "node": "pve1"
}
```

**반환**: `name`, `state`, `enabled`, 설명 필드를 포함한 서비스 목록.

---

#### `proxmox_control_node_service` 🔒
노드의 서비스를 시작/중지/재시작합니다.

| 속성 | 값 |
|------|----|
| 권한 | 관리자 |
| API 엔드포인트 | `POST /api2/json/nodes/{node}/services/{service}` |

**파라미터**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `service` | string | 예 | 서비스 이름 (예: `pveproxy`, `ssh`, `pvedaemon`) |
| `command` | string | 예 | `start`, `stop`, `restart` |

**예시**:
```json
{
  "node": "pve1",
  "service": "pveproxy",
  "command": "restart"
}
```

---

#### `proxmox_get_node_syslog`
노드의 syslog 로그를 읽습니다.

| 속성 | 값 |
|------|----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/syslog` |

**파라미터**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |

**예시**:
```json
{
  "node": "pve1"
}
```

---

#### `proxmox_get_node_journal`
노드의 systemd journal 로그를 읽습니다.

| 속성 | 값 |
|------|----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/journal` |

**파라미터**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |

**예시**:
```json
{
  "node": "pve1"
}
```

---

#### `proxmox_get_node_tasks`
노드의 최근 작업 목록을 조회합니다.

| 속성 | 값 |
|------|----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/tasks` |

**파라미터**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |

**예시**:
```json
{
  "node": "pve1"
}
```

---

#### `proxmox_get_node_task`
특정 작업의 상태 정보를 조회합니다.

| 속성 | 값 |
|------|----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/tasks/{upid}` |

**파라미터**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `upid` | string | 예 | 작업 UPID |

**예시**:
```json
{
  "node": "pve1",
  "upid": "UPID:pve1:0002E0B4:0000001D:64A539CB:qmstart:100:root@pam:"
}
```

---

#### `proxmox_get_node_aplinfo`
노드에서 사용 가능한 어플라이언스 템플릿을 조회합니다.

| 속성 | 값 |
|------|----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/aplinfo` |

**파라미터**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |

**예시**:
```json
{
  "node": "pve1"
}
```

---

#### `proxmox_get_node_netstat`
노드의 네트워크 연결 통계를 조회합니다.

| 속성 | 값 |
|------|----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/netstat` |

**파라미터**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |

**예시**:
```json
{
  "node": "pve1"
}
```

---

### VM 조회 (5개)

#### `proxmox_get_vms`
클러스터 전체의 모든 가상 머신 상태를 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/cluster/resources?type=vm` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 아니오 | 특정 노드로 필터링 |
| `type` | string | 아니오 | 필터: `qemu` 또는 `lxc` |

**예시**:
```json
{
  "node": "pve1",
  "type": "qemu"
}
```

---

#### `proxmox_get_vm_status`
특정 VM의 상세 상태 정보를 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/{type}/{vmid}/status/current` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | VM/컨테이너 ID |
| `type` | string | 예 | `qemu` 또는 `lxc` |

**예시**:
```json
{
  "node": "pve1",
  "vmid": 100,
  "type": "qemu"
}
```

---

#### `proxmox_get_vm_config`
QEMU VM의 하드웨어 구성을 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/qemu/{vmid}/config` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | VM ID |

**예시**:
```json
{
  "node": "pve1",
  "vmid": 101
}
```

**반환값**: CPU, 메모리, 디스크, 네트워크 인터페이스, 부팅 순서 및 기타 VM 설정.

---

#### `proxmox_get_lxc_config`
LXC 컨테이너의 하드웨어 구성을 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/lxc/{vmid}/config` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | 컨테이너 ID |

**예시**:
```json
{
  "node": "pve1",
  "vmid": 100
}
```

**반환값**: CPU, 메모리, 마운트 포인트, 네트워크 인터페이스 및 기타 컨테이너 설정.

---

#### `proxmox_get_storage`
클러스터 전체의 모든 스토리지 풀과 사용량을 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/storage` 또는 `GET /api2/json/nodes/{node}/storage` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 아니오 | 특정 노드로 필터링 |

**예시**:
```json
{
  "node": "pve1"
}
```

---

### VM 라이프사이클 (12개)

모든 라이프사이클 도구는 **관리자 권한**(`PROXMOX_ALLOW_ELEVATED=true`)이 필요합니다.

#### `proxmox_start_lxc` 🔒
LXC 컨테이너를 시작합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `POST /api2/json/nodes/{node}/lxc/{vmid}/status/start` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | 컨테이너 ID |

---

#### `proxmox_start_vm` 🔒
QEMU 가상 머신을 시작합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `POST /api2/json/nodes/{node}/qemu/{vmid}/status/start` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | VM ID |

---

#### `proxmox_stop_lxc` 🔒
LXC 컨테이너를 강제 중지합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `POST /api2/json/nodes/{node}/lxc/{vmid}/status/stop` |

**매개변수**: `proxmox_start_lxc`와 동일

---

#### `proxmox_stop_vm` 🔒
QEMU 가상 머신을 강제 중지합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `POST /api2/json/nodes/{node}/qemu/{vmid}/status/stop` |

**매개변수**: `proxmox_start_vm`과 동일

---

#### `proxmox_shutdown_lxc` 🔒
LXC 컨테이너를 정상 종료합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `POST /api2/json/nodes/{node}/lxc/{vmid}/status/shutdown` |

**매개변수**: `proxmox_start_lxc`와 동일

---

#### `proxmox_shutdown_vm` 🔒
QEMU 가상 머신을 정상 종료합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `POST /api2/json/nodes/{node}/qemu/{vmid}/status/shutdown` |

**매개변수**: `proxmox_start_vm`과 동일

---

#### `proxmox_reboot_lxc` 🔒
LXC 컨테이너를 재부팅합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `POST /api2/json/nodes/{node}/lxc/{vmid}/status/reboot` |

**매개변수**: `proxmox_start_lxc`와 동일

---

#### `proxmox_reboot_vm` 🔒
QEMU 가상 머신을 재부팅합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `POST /api2/json/nodes/{node}/qemu/{vmid}/status/reboot` |

**매개변수**: `proxmox_start_vm`과 동일

---

#### `proxmox_pause_vm` 🔒
QEMU 가상 머신을 일시정지합니다 (RAM에 일시중단).

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `POST /api2/json/nodes/{node}/qemu/{vmid}/status/suspend` |

**매개변수**: `proxmox_start_vm`과 동일

---

#### `proxmox_resume_vm` 🔒
일시정지된 QEMU 가상 머신을 재개합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `POST /api2/json/nodes/{node}/qemu/{vmid}/status/resume` |

**매개변수**: `proxmox_start_vm`과 동일

---

#### `proxmox_delete_lxc` 🔒
LXC 컨테이너를 영구 삭제합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `DELETE /api2/json/nodes/{node}/lxc/{vmid}` |

**매개변수**: `proxmox_start_lxc`와 동일

---

#### `proxmox_delete_vm` 🔒
QEMU 가상 머신을 영구 삭제합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `DELETE /api2/json/nodes/{node}/qemu/{vmid}` |

**매개변수**: `proxmox_start_vm`과 동일

---

### VM 수정 (4개)

모든 수정 도구는 **관리자 권한**이 필요합니다.

#### `proxmox_clone_lxc` 🔒
LXC 컨테이너를 복제합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `POST /api2/json/nodes/{node}/lxc/{vmid}/clone` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | 소스 컨테이너 ID |
| `newid` | number | 예 | 새 컨테이너 ID |
| `hostname` | string | 아니오 | 새 호스트명 |

---

#### `proxmox_clone_vm` 🔒
QEMU 가상 머신을 복제합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `POST /api2/json/nodes/{node}/qemu/{vmid}/clone` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | 소스 VM ID |
| `newid` | number | 예 | 새 VM ID |
| `name` | string | 아니오 | 새 VM 이름 |

---

#### `proxmox_resize_lxc` 🔒
LXC 컨테이너의 CPU/메모리를 조정합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `PUT /api2/json/nodes/{node}/lxc/{vmid}/config` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | 컨테이너 ID |
| `memory` | number | 아니오 | 메모리 (MB) |
| `cores` | number | 아니오 | CPU 코어 수 |

---

#### `proxmox_resize_vm` 🔒
QEMU VM의 CPU/메모리를 조정합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `PUT /api2/json/nodes/{node}/qemu/{vmid}/config` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | VM ID |
| `memory` | number | 아니오 | 메모리 (MB) |
| `cores` | number | 아니오 | CPU 코어 수 |

---

### 스냅샷 (8개)

#### `proxmox_create_snapshot_lxc` 🔒
LXC 컨테이너의 스냅샷을 생성합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `POST /api2/json/nodes/{node}/lxc/{vmid}/snapshot` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | 컨테이너 ID |
| `snapname` | string | 예 | 스냅샷 이름 |
| `description` | string | 아니오 | 스냅샷 설명 |

---

#### `proxmox_create_snapshot_vm` 🔒
QEMU 가상 머신의 스냅샷을 생성합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `POST /api2/json/nodes/{node}/qemu/{vmid}/snapshot` |

**매개변수**: `proxmox_create_snapshot_lxc`와 동일

---

#### `proxmox_list_snapshots_lxc`
LXC 컨테이너의 모든 스냅샷을 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/lxc/{vmid}/snapshot` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | 컨테이너 ID |

---

#### `proxmox_list_snapshots_vm`
QEMU 가상 머신의 모든 스냅샷을 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/qemu/{vmid}/snapshot` |

**매개변수**: `proxmox_list_snapshots_lxc`와 동일 (VM ID 사용)

---

#### `proxmox_rollback_snapshot_lxc` 🔒
LXC 컨테이너를 스냅샷으로 롤백합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `POST /api2/json/nodes/{node}/lxc/{vmid}/snapshot/{snapname}/rollback` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | 컨테이너 ID |
| `snapname` | string | 예 | 스냅샷 이름 |

---

#### `proxmox_rollback_snapshot_vm` 🔒
QEMU 가상 머신을 스냅샷으로 롤백합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `POST /api2/json/nodes/{node}/qemu/{vmid}/snapshot/{snapname}/rollback` |

**매개변수**: `proxmox_rollback_snapshot_lxc`와 동일

---

#### `proxmox_delete_snapshot_lxc` 🔒
LXC 컨테이너의 스냅샷을 삭제합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `DELETE /api2/json/nodes/{node}/lxc/{vmid}/snapshot/{snapname}` |

**매개변수**: `proxmox_rollback_snapshot_lxc`와 동일

---

#### `proxmox_delete_snapshot_vm` 🔒
QEMU 가상 머신의 스냅샷을 삭제합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `DELETE /api2/json/nodes/{node}/qemu/{vmid}/snapshot/{snapname}` |

**매개변수**: `proxmox_rollback_snapshot_vm`과 동일

---

### 백업 (6개)

모든 백업 도구는 **관리자 권한**이 필요합니다.

#### `proxmox_create_backup_lxc` 🔒
LXC 컨테이너의 백업을 생성합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `POST /api2/json/nodes/{node}/vzdump` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | 컨테이너 ID |
| `storage` | string | 아니오 | 스토리지 이름 (기본값: `local`) |
| `mode` | string | 아니오 | `snapshot`, `suspend`, `stop` (기본값: `snapshot`) |
| `compress` | string | 아니오 | `none`, `lzo`, `gzip`, `zstd` (기본값: `zstd`) |

---

#### `proxmox_create_backup_vm` 🔒
QEMU 가상 머신의 백업을 생성합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `POST /api2/json/nodes/{node}/vzdump` |

**매개변수**: `proxmox_create_backup_lxc`와 동일

---

#### `proxmox_list_backups` 🔒
스토리지의 모든 백업을 조회합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `GET /api2/json/nodes/{node}/storage/{storage}/content` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `storage` | string | 예 | 스토리지 이름 |

---

#### `proxmox_restore_backup_lxc` 🔒
백업에서 LXC 컨테이너를 복원합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `POST /api2/json/nodes/{node}/lxc` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | 새 컨테이너 ID |
| `archive` | string | 예 | 백업 아카이브 경로 |
| `storage` | string | 아니오 | 대상 스토리지 |

---

#### `proxmox_restore_backup_vm` 🔒
백업에서 QEMU 가상 머신을 복원합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `POST /api2/json/nodes/{node}/qemu` |

**매개변수**: `proxmox_restore_backup_lxc`와 동일

---

#### `proxmox_delete_backup` 🔒
스토리지에서 백업 파일을 삭제합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `DELETE /api2/json/nodes/{node}/storage/{storage}/content/{volume}` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `storage` | string | 예 | 스토리지 이름 |
| `volume` | string | 예 | 볼륨 ID |

---

### 디스크 (8개)

모든 디스크 도구는 **관리자 권한**이 필요합니다.

#### `proxmox_add_disk_vm` 🔒
QEMU 가상 머신에 새 디스크를 추가합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `PUT /api2/json/nodes/{node}/qemu/{vmid}/config` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | VM ID |
| `disk` | string | 예 | 디스크 ID (`scsi0`, `virtio0`, `sata0`, `ide0`) |
| `storage` | string | 예 | 스토리지 이름 |
| `size` | string | 예 | 디스크 크기 (예: `10` = 10GB) |

---

#### `proxmox_add_mountpoint_lxc` 🔒
LXC 컨테이너에 마운트 포인트를 추가합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `PUT /api2/json/nodes/{node}/lxc/{vmid}/config` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | 컨테이너 ID |
| `mp` | string | 예 | 마운트 포인트 ID (`mp0`, `mp1`) |
| `storage` | string | 예 | 스토리지 이름 |
| `size` | string | 예 | 크기 (예: `10` = 10GB) |

---

#### `proxmox_resize_disk_vm` 🔒
QEMU VM 디스크 크기를 확장합니다 (확장만 가능).

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `PUT /api2/json/nodes/{node}/qemu/{vmid}/resize` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | VM ID |
| `disk` | string | 예 | 디스크 ID |
| `size` | string | 예 | 새 크기 (`+10G` 또는 `50G`) |

---

#### `proxmox_resize_disk_lxc` 🔒
LXC 컨테이너 디스크 또는 마운트 포인트 크기를 확장합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `PUT /api2/json/nodes/{node}/lxc/{vmid}/resize` |

**매개변수**: `proxmox_resize_disk_vm`과 동일

---

#### `proxmox_remove_disk_vm` 🔒
QEMU 가상 머신에서 디스크를 제거합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `PUT /api2/json/nodes/{node}/qemu/{vmid}/config` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | VM ID |
| `disk` | string | 예 | 디스크 ID |

---

#### `proxmox_remove_mountpoint_lxc` 🔒
LXC 컨테이너에서 마운트 포인트를 제거합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `PUT /api2/json/nodes/{node}/lxc/{vmid}/config` |

**매개변수**: `proxmox_remove_disk_vm`과 동일 (`disk` 대신 `mp`)

---

#### `proxmox_move_disk_vm` 🔒
QEMU VM 디스크를 다른 스토리지로 이동합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `POST /api2/json/nodes/{node}/qemu/{vmid}/move_disk` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | VM ID |
| `disk` | string | 예 | 디스크 ID |
| `storage` | string | 예 | 대상 스토리지 |
| `delete` | boolean | 아니오 | 이동 후 소스 삭제 (기본값: `true`) |

---

#### `proxmox_move_disk_lxc` 🔒
LXC 컨테이너 디스크를 다른 스토리지로 이동합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `POST /api2/json/nodes/{node}/lxc/{vmid}/move_volume` |

**매개변수**: `proxmox_move_disk_vm`과 동일

---

### VM/LXC 네트워크 (6개)

모든 네트워크 도구는 **관리자 권한**이 필요합니다.

#### `proxmox_add_network_vm` 🔒
QEMU VM에 네트워크 인터페이스를 추가합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `PUT /api2/json/nodes/{node}/qemu/{vmid}/config` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | VM ID |
| `net` | string | 예 | 네트워크 인터페이스 ID (`net0`, `net1`) |
| `bridge` | string | 예 | 브릿지 이름 (`vmbr0`) |
| `model` | string | 아니오 | `virtio`, `e1000`, `rtl8139`, `vmxnet3` |
| `macaddr` | string | 아니오 | MAC 주소 |
| `tag` | number | 아니오 | VLAN 태그 |
| `firewall` | boolean | 아니오 | 방화벽 활성화 |

---

#### `proxmox_add_network_lxc` 🔒
LXC 컨테이너에 네트워크 인터페이스를 추가합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `PUT /api2/json/nodes/{node}/lxc/{vmid}/config` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | 컨테이너 ID |
| `net` | string | 예 | 네트워크 인터페이스 ID |
| `bridge` | string | 예 | 브릿지 이름 |
| `ip` | string | 아니오 | CIDR 표기 IP 주소 또는 `dhcp` |
| `gw` | string | 아니오 | 게이트웨이 IP |
| `firewall` | boolean | 아니오 | 방화벽 활성화 |

---

#### `proxmox_update_network_vm` 🔒
VM 네트워크 인터페이스 설정을 수정합니다.

**매개변수**: `proxmox_add_network_vm`과 동일

---

#### `proxmox_update_network_lxc` 🔒
LXC 네트워크 인터페이스 설정을 수정합니다.

**매개변수**: `proxmox_add_network_lxc`와 동일

---

#### `proxmox_remove_network_vm` 🔒
QEMU VM에서 네트워크 인터페이스를 제거합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `PUT /api2/json/nodes/{node}/qemu/{vmid}/config` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | VM ID |
| `net` | string | 예 | 네트워크 인터페이스 ID |

---

#### `proxmox_remove_network_lxc` 🔒
LXC 컨테이너에서 네트워크 인터페이스를 제거합니다.

**매개변수**: `proxmox_remove_network_vm`과 동일

---

### 명령어 실행 (1개)

#### `proxmox_execute_vm_command` 🔒
Proxmox API를 통해 가상 머신에서 셸 명령어를 실행합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 관리자 |
| API 엔드포인트 | `POST /api2/json/nodes/{node}/{type}/{vmid}/agent/exec` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | VM/컨테이너 ID |
| `type` | string | 예 | `qemu` 또는 `lxc` |
| `command` | string | 예 | 실행할 셸 명령어 |

**참고**: QEMU Guest Agent 또는 LXC exec 기능이 필요합니다. 명령어 검증으로 잠재적으로 위험한 문자를 차단합니다.

---

### VM 생성 (3개)

#### `proxmox_list_templates`
스토리지에서 사용 가능한 LXC 컨테이너 템플릿을 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/storage/{storage}/content` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `storage` | string | 예 | 스토리지 이름 |

---

#### `proxmox_create_lxc` 🔒
새 LXC 컨테이너를 생성합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `POST /api2/json/nodes/{node}/lxc` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | 컨테이너 ID |
| `ostemplate` | string | 예 | 템플릿 경로 |
| `hostname` | string | 예 | 컨테이너 호스트명 |
| `password` | string | 아니오 | 루트 비밀번호 (미제공 시 자동 생성) |
| `memory` | number | 아니오 | 메모리 MB (기본값: 512) |
| `storage` | string | 아니오 | 스토리지 이름 (기본값: `local-lvm`) |
| `rootfs_size` | string | 아니오 | 루트 파일시스템 크기 GB (기본값: `8`) |

---

#### `proxmox_create_vm` 🔒
새 QEMU 가상 머신을 생성합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `POST /api2/json/nodes/{node}/qemu` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | VM ID |
| `name` | string | 예 | VM 이름 |
| `memory` | number | 아니오 | 메모리 MB (기본값: 512) |
| `cores` | number | 아니오 | CPU 코어 (기본값: 1) |
| `sockets` | number | 아니오 | CPU 소켓 (기본값: 1) |
| `disk_size` | string | 아니오 | 디스크 크기 (기본값: `8G`) |
| `storage` | string | 아니오 | 스토리지 이름 (기본값: `local-lvm`) |
| `iso` | string | 아니오 | ISO 이미지 경로 |
| `ostype` | string | 아니오 | OS 타입 (기본값: `l26`) |
| `bridge` | string | 아니오 | 네트워크 브릿지 (기본값: `vmbr0`) |

---

### 노드 디스크 조회 (4개)

#### `proxmox_get_node_disks`
Proxmox 노드의 물리 디스크 목록을 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/disks/list` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `type` | string | 아니오 | 필터: `unused`, `journal_disks` |

**반환값**: 디바이스 경로, 크기, 모델, 시리얼 번호 및 사용 상태를 포함한 물리 디스크 목록.

---

#### `proxmox_get_disk_smart`
특정 디스크의 SMART 상태 데이터를 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/disks/smart` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `disk` | string | 예 | 디스크 디바이스 경로 (예: `/dev/sda`) |

**반환값**: SMART 상태, 속성 및 디스크 진단 정보.

---

#### `proxmox_get_node_lvm`
노드의 LVM 볼륨 그룹과 논리 볼륨을 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/disks/lvm` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |

**반환값**: 논리 볼륨, 크기 및 여유 공간을 포함한 볼륨 그룹.

---

#### `proxmox_get_node_zfs`
Proxmox 노드의 ZFS 풀을 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/disks/zfs` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |

**반환값**: 상태, 크기, 할당/여유 공간 및 단편화를 포함한 ZFS 풀.

---

## 미구현 Proxmox API

이 섹션은 아직 이 MCP 서버에 구현되지 않은 Proxmox VE API 엔드포인트를 우선순위별로 나열합니다.

### 높은 우선순위

기능을 크게 향상시킬 API:

#### 클러스터 관리

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/cluster/ha/resources` | GET/POST/PUT/DELETE | 고가용성 리소스 관리 |
| `/cluster/ha/groups` | GET/POST/PUT/DELETE | HA 그룹 관리 |
| `/cluster/ha/status` | GET | HA 상태 개요 |
| `/cluster/firewall/rules` | GET/POST/PUT/DELETE | 클러스터 전체 방화벽 규칙 |
| `/cluster/firewall/groups` | GET/POST/PUT/DELETE | 방화벽 보안 그룹 |
| `/cluster/backup` | GET/POST/PUT/DELETE | 예약된 백업 작업 |
| `/cluster/replication` | GET/POST/PUT/DELETE | 스토리지 복제 작업 |
| `/cluster/options` | GET/PUT | 클러스터 전체 옵션 |

#### VM/LXC 고급

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/nodes/{node}/qemu/{vmid}/migrate` | POST | VM을 다른 노드로 마이그레이션 |
| `/nodes/{node}/lxc/{vmid}/migrate` | POST | 컨테이너를 다른 노드로 마이그레이션 |
| `/nodes/{node}/qemu/{vmid}/template` | POST | VM을 템플릿으로 변환 |
| `/nodes/{node}/lxc/{vmid}/template` | POST | 컨테이너를 템플릿으로 변환 |
| `/nodes/{node}/qemu/{vmid}/agent/*` | 다양 | QEMU Guest Agent 명령 |
| `/nodes/{node}/qemu/{vmid}/firewall/*` | 다양 | VM별 방화벽 규칙 |
| `/nodes/{node}/lxc/{vmid}/firewall/*` | 다양 | 컨테이너별 방화벽 규칙 |
| `/nodes/{node}/qemu/{vmid}/rrddata` | GET | VM 성능 메트릭 (RRD) |
| `/nodes/{node}/lxc/{vmid}/rrddata` | GET | 컨테이너 성능 메트릭 |

---

### 중간 우선순위

특수 사용 사례를 위한 API:

#### 스토리지 관리

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/storage` | POST/PUT/DELETE | 스토리지 구성 CRUD |
| `/nodes/{node}/storage/{storage}/upload` | POST | ISO/템플릿 파일 업로드 |
| `/nodes/{node}/storage/{storage}/download-url` | POST | URL에서 다운로드 |
| `/nodes/{node}/storage/{storage}/file-restore` | GET/POST | 파일 수준 백업 복원 |
| `/nodes/{node}/storage/{storage}/prunebackups` | DELETE | 오래된 백업 정리 |

#### 접근 제어

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/access/users` | GET/POST/PUT/DELETE | 사용자 관리 |
| `/access/groups` | GET/POST/PUT/DELETE | 그룹 관리 |
| `/access/roles` | GET/POST/PUT/DELETE | 역할 관리 |
| `/access/acl` | GET/PUT | ACL 관리 |
| `/access/domains` | GET/POST/PUT/DELETE | 인증 도메인 |
| `/access/tfa` | GET/POST/PUT/DELETE | 2단계 인증 |
| `/access/password` | PUT | 비밀번호 변경 |

#### 풀 관리

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/pools` | GET/POST | 리소스 풀 목록/생성 |
| `/pools/{poolid}` | GET/PUT/DELETE | 풀 관리 |

#### Ceph 통합

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/nodes/{node}/ceph/status` | GET | Ceph 클러스터 상태 |
| `/nodes/{node}/ceph/osd` | GET/POST/DELETE | OSD 관리 |
| `/nodes/{node}/ceph/mon` | GET/POST/DELETE | 모니터 관리 |
| `/nodes/{node}/ceph/mds` | GET/POST/DELETE | MDS 관리 |
| `/nodes/{node}/ceph/pools` | GET/POST/PUT/DELETE | Ceph 풀 관리 |
| `/nodes/{node}/ceph/fs` | GET/POST | CephFS 관리 |

---

### 낮은 우선순위

엣지 케이스 또는 고급 관리를 위한 API:

#### 노드 하드웨어

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/nodes/{node}/hardware/pci` | GET | PCI 장치 목록 |
| `/nodes/{node}/hardware/usb` | GET | USB 장치 목록 |
| `/nodes/{node}/capabilities/qemu/cpu` | GET | 사용 가능한 CPU 타입 목록 |
| `/nodes/{node}/capabilities/qemu/machines` | GET | 머신 타입 목록 |

#### 인증서 & SSL

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/nodes/{node}/certificates/info` | GET | 인증서 정보 |
| `/nodes/{node}/certificates/custom` | POST/DELETE | 사용자 정의 인증서 |
| `/nodes/{node}/certificates/acme/*` | 다양 | ACME/Let's Encrypt |

#### 디스크 작업

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/nodes/{node}/disks/initgpt` | POST | GPT로 디스크 초기화 |
| `/nodes/{node}/disks/wipedisk` | PUT | 디스크 초기화 |
| `/nodes/{node}/disks/lvmthin` | GET/POST/DELETE | LVM thin 풀 |
| `/nodes/{node}/disks/directory` | GET/POST/DELETE | 디렉토리 스토리지 |

#### 노드 네트워크 구성

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/nodes/{node}/network` | POST | 네트워크 인터페이스 생성 |
| `/nodes/{node}/network/{iface}` | PUT/DELETE | 인터페이스 수정/삭제 |
| `/nodes/{node}/network` | PUT | 네트워크 변경 적용 (보류 중인 것 되돌리기) |

#### 시스템 작업

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/nodes/{node}/time` | GET/PUT | 노드 시간/시간대 |
| `/nodes/{node}/dns` | PUT | DNS 설정 업데이트 |
| `/nodes/{node}/hosts` | GET/POST | hosts 파일 관리 |
| `/nodes/{node}/subscription` | GET/POST/DELETE | 구독 관리 |
| `/nodes/{node}/apt/*` | 다양 | 패키지 관리 |
| `/nodes/{node}/startall` | POST | 모든 VM/컨테이너 시작 |
| `/nodes/{node}/stopall` | POST | 모든 VM/컨테이너 중지 |
| `/nodes/{node}/migrateall` | POST | 모두 다른 노드로 마이그레이션 |

#### 콘솔 접근

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/nodes/{node}/qemu/{vmid}/vncproxy` | POST | VNC 티켓 받기 |
| `/nodes/{node}/qemu/{vmid}/spiceproxy` | POST | SPICE 티켓 받기 |
| `/nodes/{node}/qemu/{vmid}/termproxy` | POST | 터미널 프록시 티켓 받기 |
| `/nodes/{node}/lxc/{vmid}/vncproxy` | POST | 컨테이너 VNC 접근 |
| `/nodes/{node}/lxc/{vmid}/termproxy` | POST | 컨테이너 터미널 접근 |

#### SDN (소프트웨어 정의 네트워킹)

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/cluster/sdn/vnets` | GET/POST/PUT/DELETE | 가상 네트워크 |
| `/cluster/sdn/zones` | GET/POST/PUT/DELETE | SDN 존 |
| `/cluster/sdn/controllers` | GET/POST/PUT/DELETE | SDN 컨트롤러 |
| `/cluster/sdn/subnets` | GET/POST/PUT/DELETE | 서브넷 |

---

## API 레퍼런스

### 기본 URL
```
https://{proxmox-host}:8006/api2/json
```

### 인증
모든 API 요청에는 API 토큰을 통한 인증이 필요합니다:
```
Authorization: PVEAPIToken={user}@{realm}!{tokenname}={token-value}
```

### 공식 문서
- [Proxmox VE API Viewer](https://pve.proxmox.com/pve-docs/api-viewer/)
- [Proxmox VE Administration Guide](https://pve.proxmox.com/pve-docs/pve-admin-guide.html)

---

## 기여하기

새 도구를 추가하려면:

1. `src/types/tools.ts`에 도구 이름 추가
2. `src/schemas/`에 Zod 스키마 생성
3. `src/tools/`에 핸들러 구현
4. `src/tools/registry.ts`에 등록
5. `src/server.ts`에 설명 추가
6. `src/tools/*.test.ts`에 테스트 작성
7. 이 문서 업데이트

---

**범례**: 🔒 = 관리자 권한 필요 (`PROXMOX_ALLOW_ELEVATED=true`)
