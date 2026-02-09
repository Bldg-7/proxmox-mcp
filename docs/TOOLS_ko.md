# Proxmox MCP 도구 레퍼런스

> 사용 가능한 모든 도구 및 계획된 Proxmox API 통합에 대한 완전한 레퍼런스

**현재 버전**: 0.6.0  
**총 도구 수**: 309  
**최종 업데이트**: 2026-02-08

---

## 목차

- [개요](#개요)
- [권한 모델](#권한-모델)
- [구현된 도구](#구현된-도구)
  - [노드 & 클러스터 (7개)](#노드--클러스터-7개)
  - [노드 관리 (8개)](#노드-관리-8개)
  - [클러스터 관리 (33개)](#클러스터-관리-33개)
  - [스토리지 관리 (12개)](#스토리지-관리-12개)
  - [VM 조회 (5개)](#vm-조회-5개)
- [VM 라이프사이클 (12개)](#vm-라이프사이클-12개)
- [VM 수정 (6개)](#vm-수정-6개)
- [VM/LXC 고급 (26개)](#vmlxc-고급-26개)
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
| 시스템 운영 | 20 | 혼합 |
| 노드 네트워크 구성 | 4 | 관리자 |
| 클러스터 관리 | 54 | 혼합 |
| 스토리지 관리 | 12 | 혼합 |
| 접근 제어 | 25 | 혼합 |
| 풀 관리 | 5 | 혼합 |
| SDN 네트워킹 | 20 | 혼합 |
| Ceph | 16 | 혼합 |
| VM 조회 | 9 | 기본 |
| VM 라이프사이클 | 12 | 관리자 |
| VM 수정 | 6 | 관리자 |
| VM/LXC 고급 | 30 | 혼합 |
| 스냅샷 | 8 | 혼합 |
| 백업 | 6 | 관리자 |
| 디스크 | 16 | 혼합 |
| VM/LXC 네트워크 | 6 | 관리자 |
| 콘솔 접근 | 5 | 관리자 |
| 명령어 실행 | 1 | 관리자 |
| VM 생성 | 6 | 혼합 |
| 인증서 | 7 | 혼합 |
| ACME | 8 | 혼합 |
| 알림 | 5 | 혼합 |
| **합계** | **309** | |

> **참고**: 새로 추가된 도구(인증서, ACME, 알림 등)는 영문 버전을 참조하세요: [TOOLS.md](TOOLS.md)

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

### 클러스터 관리 (33개)

#### `proxmox_get_ha_resources`
클러스터의 고가용성(HA) 리소스를 조회합니다.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/ha/resources` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `type` | string | No | 필터: `vm`, `ct` |

**Example**:
```json
{
  "type": "vm"
}
```

---

#### `proxmox_get_ha_resource`
ID로 HA 리소스 상세 정보를 가져옵니다.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/ha/resources/{sid}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `sid` | string | Yes | HA 리소스 ID (예: `vm:100`) |

**Example**:
```json
{
  "sid": "vm:100"
}
```

---

#### `proxmox_create_ha_resource` 🔒
HA 리소스를 생성합니다.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/cluster/ha/resources` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `sid` | string | Yes | HA 리소스 ID (예: `vm:100`) |
| `type` | string | No | 리소스 타입 (`vm`, `ct`) |
| `group` | string | No | HA 그룹 ID |
| `state` | string | No | `started`, `stopped`, `enabled`, `disabled`, `ignored` |
| `comment` | string | No | 설명 |

**Example**:
```json
{
  "sid": "vm:100",
  "type": "vm",
  "group": "prod",
  "state": "started"
}
```

---

#### `proxmox_update_ha_resource` 🔒
HA 리소스를 수정합니다.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/cluster/ha/resources/{sid}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `sid` | string | Yes | HA 리소스 ID |
| `state` | string | No | `started`, `stopped`, `enabled`, `disabled`, `ignored` |
| `group` | string | No | HA 그룹 ID |
| `comment` | string | No | 설명 |
| `delete` | string | No | 삭제할 설정 목록 |

**Example**:
```json
{
  "sid": "vm:100",
  "state": "enabled"
}
```

---

#### `proxmox_delete_ha_resource` 🔒
HA 리소스를 삭제합니다.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/cluster/ha/resources/{sid}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `sid` | string | Yes | HA 리소스 ID |

**Example**:
```json
{
  "sid": "vm:100"
}
```

---

#### `proxmox_get_ha_groups`
HA 그룹 목록을 조회합니다.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/ha/groups` |
| Parameters | None |

**Example**:
```json
{}
```

---

#### `proxmox_get_ha_group`
HA 그룹 상세 정보를 조회합니다.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/ha/groups/{group}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group` | string | Yes | HA 그룹 ID |

**Example**:
```json
{
  "group": "prod"
}
```

---

#### `proxmox_create_ha_group` 🔒
HA 그룹을 생성합니다.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/cluster/ha/groups` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group` | string | Yes | HA 그룹 ID |
| `nodes` | string | Yes | 노드 목록(우선순위 포함, 예: `pve1:1,pve2:2`) |
| `comment` | string | No | 설명 |
| `restricted` | boolean | No | 목록 노드로 제한 |
| `nofailback` | boolean | No | 페일백 방지 |

**Example**:
```json
{
  "group": "prod",
  "nodes": "pve1:1,pve2:2",
  "restricted": true
}
```

---

#### `proxmox_update_ha_group` 🔒
HA 그룹을 수정합니다.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/cluster/ha/groups/{group}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group` | string | Yes | HA 그룹 ID |
| `nodes` | string | No | 노드 목록 |
| `comment` | string | No | 설명 |
| `restricted` | boolean | No | 목록 노드로 제한 |
| `nofailback` | boolean | No | 페일백 방지 |
| `delete` | string | No | 삭제할 설정 목록 |

**Example**:
```json
{
  "group": "prod",
  "nodes": "pve1:1,pve3:2"
}
```

---

#### `proxmox_delete_ha_group` 🔒
HA 그룹을 삭제합니다.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/cluster/ha/groups/{group}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group` | string | Yes | HA 그룹 ID |

**Example**:
```json
{
  "group": "prod"
}
```

---

#### `proxmox_get_ha_status`
HA 매니저 상태를 조회합니다.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/ha/status` |
| Parameters | None |

**Example**:
```json
{}
```

---

#### `proxmox_list_cluster_firewall_rules`
클러스터 방화벽 규칙을 조회합니다.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/firewall/rules` |
| Parameters | None |

**Example**:
```json
{}
```

---

#### `proxmox_get_cluster_firewall_rule`
위치로 클러스터 방화벽 규칙을 조회합니다.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/firewall/rules/{pos}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `pos` | number | Yes | 규칙 위치 |

**Example**:
```json
{
  "pos": 0
}
```

---

#### `proxmox_create_cluster_firewall_rule` 🔒
클러스터 방화벽 규칙을 생성합니다.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/cluster/firewall/rules` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `ACCEPT`, `REJECT`, `DROP` |
| `type` | string | Yes | `in`, `out`, `group` |
| `proto` | string | No | 프로토콜 (예: `tcp`) |
| `dport` | string | No | 목적지 포트 |
| `source` | string | No | 소스 CIDR |
| `dest` | string | No | 목적지 CIDR |

**Example**:
```json
{
  "action": "ACCEPT",
  "type": "in",
  "proto": "tcp",
  "dport": "22"
}
```

---

#### `proxmox_update_cluster_firewall_rule` 🔒
클러스터 방화벽 규칙을 수정합니다.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/cluster/firewall/rules/{pos}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `pos` | number | Yes | 규칙 위치 |
| `action` | string | No | 규칙 액션 |
| `type` | string | No | `in`, `out`, `group` |
| `comment` | string | No | 설명 |
| `delete` | string | No | 삭제할 설정 목록 |

**Example**:
```json
{
  "pos": 0,
  "comment": "Allow SSH"
}
```

---

#### `proxmox_delete_cluster_firewall_rule` 🔒
클러스터 방화벽 규칙을 삭제합니다.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/cluster/firewall/rules/{pos}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `pos` | number | Yes | 규칙 위치 |
| `digest` | string | No | 구성 해시 |

**Example**:
```json
{
  "pos": 0
}
```

---

#### `proxmox_list_cluster_firewall_groups`
클러스터 방화벽 그룹을 조회합니다.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/firewall/groups` |
| Parameters | None |

**Example**:
```json
{}
```

---

#### `proxmox_get_cluster_firewall_group`
이름으로 클러스터 방화벽 그룹을 조회합니다.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/firewall/groups/{group}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group` | string | Yes | 방화벽 그룹 이름 |

**Example**:
```json
{
  "group": "web-servers"
}
```

---

#### `proxmox_create_cluster_firewall_group` 🔒
클러스터 방화벽 그룹을 생성합니다.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/cluster/firewall/groups` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group` | string | Yes | 방화벽 그룹 이름 |
| `comment` | string | No | 설명 |
| `rename` | string | No | 새 이름으로 변경 |

**Example**:
```json
{
  "group": "web-servers",
  "comment": "Web tier rules"
}
```

---

#### `proxmox_update_cluster_firewall_group` 🔒
클러스터 방화벽 그룹을 수정합니다.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/cluster/firewall/groups/{group}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group` | string | Yes | 방화벽 그룹 이름 |
| `comment` | string | No | 설명 |
| `rename` | string | No | 새 이름으로 변경 |
| `delete` | string | No | 삭제할 설정 목록 |
| `digest` | string | No | 구성 해시 |

**Example**:
```json
{
  "group": "web-servers",
  "comment": "Updated description"
}
```

---

#### `proxmox_delete_cluster_firewall_group` 🔒
클러스터 방화벽 그룹을 삭제합니다.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/cluster/firewall/groups/{group}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group` | string | Yes | 방화벽 그룹 이름 |

**Example**:
```json
{
  "group": "web-servers"
}
```

---

#### `proxmox_list_cluster_backup_jobs`
클러스터 백업 작업 목록을 조회합니다.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/backup` |
| Parameters | None |

**Example**:
```json
{}
```

---

#### `proxmox_get_cluster_backup_job`
ID로 클러스터 백업 작업을 조회합니다.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/backup/{id}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | 백업 작업 ID |

**Example**:
```json
{
  "id": "daily-backup"
}
```

---

#### `proxmox_create_cluster_backup_job` 🔒
클러스터 백업 작업을 생성합니다.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/cluster/backup` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `starttime` | string | Yes | 시작 시간 (`HH:MM`) |
| `dow` | string | Yes | 요일 (예: `mon,tue`) |
| `storage` | string | Yes | 스토리지 ID |
| `all` | boolean | No | 전체 VM 백업 |
| `compress` | string | No | `gzip`, `lzo`, `zstd` |
| `mode` | string | No | `snapshot`, `suspend`, `stop` |

**Example**:
```json
{
  "starttime": "02:00",
  "dow": "mon,tue,wed,thu,fri",
  "storage": "backup-nfs",
  "mode": "snapshot"
}
```

---

#### `proxmox_update_cluster_backup_job` 🔒
클러스터 백업 작업을 수정합니다.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/cluster/backup/{id}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | 백업 작업 ID |
| `starttime` | string | No | 시작 시간 (`HH:MM`) |
| `dow` | string | No | 요일 |
| `storage` | string | No | 스토리지 ID |
| `enabled` | boolean | No | 활성/비활성 |
| `delete` | string | No | 삭제할 설정 목록 |

**Example**:
```json
{
  "id": "daily-backup",
  "enabled": false
}
```

---

#### `proxmox_delete_cluster_backup_job` 🔒
클러스터 백업 작업을 삭제합니다.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/cluster/backup/{id}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | 백업 작업 ID |

**Example**:
```json
{
  "id": "daily-backup"
}
```

---

#### `proxmox_list_cluster_replication_jobs`
클러스터 복제 작업 목록을 조회합니다.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/replication` |
| Parameters | None |

**Example**:
```json
{}
```

---

#### `proxmox_get_cluster_replication_job`
ID로 클러스터 복제 작업을 조회합니다.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/replication/{id}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | 복제 작업 ID (`<guest>-<jobnum>`) |

**Example**:
```json
{
  "id": "101-0"
}
```

---

#### `proxmox_create_cluster_replication_job` 🔒
클러스터 복제 작업을 생성합니다.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/cluster/replication` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | 복제 작업 ID (`<guest>-<jobnum>`) |
| `target` | string | Yes | 대상 노드 이름 |
| `type` | string | Yes | 복제 타입 (`local`) |
| `schedule` | string | No | 복제 스케줄 |

**Example**:
```json
{
  "id": "101-0",
  "target": "pve2",
  "type": "local",
  "schedule": "*/15"
}
```

---

#### `proxmox_update_cluster_replication_job` 🔒
클러스터 복제 작업을 수정합니다.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/cluster/replication/{id}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | 복제 작업 ID |
| `disable` | boolean | No | 복제 비활성화 |
| `schedule` | string | No | 복제 스케줄 |
| `delete` | string | No | 삭제할 설정 목록 |

**Example**:
```json
{
  "id": "101-0",
  "disable": true
}
```

---

#### `proxmox_delete_cluster_replication_job` 🔒
클러스터 복제 작업을 삭제합니다.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/cluster/replication/{id}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | 복제 작업 ID |
| `force` | boolean | No | 강제 삭제 |
| `keep` | boolean | No | 복제 데이터 유지 |

**Example**:
```json
{
  "id": "101-0",
  "keep": true
}
```

---

#### `proxmox_get_cluster_options`
클러스터 옵션을 조회합니다.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/cluster/options` |
| Parameters | None |

**Example**:
```json
{}
```

---

#### `proxmox_update_cluster_options` 🔒
클러스터 옵션을 수정합니다.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/cluster/options` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `console` | string | No | 콘솔 타입 (예: `xtermjs`) |
| `language` | string | No | UI 언어 |
| `keyboard` | string | No | 키보드 레이아웃 |

**Example**:
```json
{
  "console": "xtermjs",
  "language": "en"
}
```

---

### 스토리지 관리 (12개)

#### `proxmox_list_storage_config`
스토리지 구성 목록을 조회합니다.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/storage` |
| Parameters | None |

**Example**:
```json
{}
```

---

#### `proxmox_get_storage_config`
스토리지 구성을 조회합니다.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/storage/{storage}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `storage` | string | Yes | 스토리지 ID |

**Example**:
```json
{
  "storage": "backup-nfs"
}
```

---

#### `proxmox_create_storage` 🔒
스토리지 구성을 생성합니다.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/storage` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `storage` | string | Yes | 스토리지 ID |
| `type` | string | Yes | 스토리지 타입 (예: `dir`, `nfs`, `lvmthin`) |
| `content` | string | No | 콘텐츠 유형 (쉼표로 구분) |
| `path` | string | No | dir 스토리지 경로 |
| `server` | string | No | 원격 서버 주소 |
| `export` | string | No | NFS export 경로 |

**Example**:
```json
{
  "storage": "backup-nfs",
  "type": "nfs",
  "server": "10.0.0.10",
  "export": "/exports/backups",
  "content": "backup"
}
```

---

#### `proxmox_update_storage` 🔒
스토리지 구성을 업데이트합니다.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `PUT /api2/json/storage/{storage}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `storage` | string | Yes | 스토리지 ID |
| `content` | string | No | 콘텐츠 유형 (쉼표로 구분) |
| `nodes` | string | No | 적용 노드 제한 |
| `delete` | string | No | 삭제할 설정 목록 |
| `digest` | string | No | 설정 digest |

**Example**:
```json
{
  "storage": "backup-nfs",
  "content": "backup,iso"
}
```

---

#### `proxmox_delete_storage` 🔒
스토리지 구성을 삭제합니다.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/storage/{storage}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `storage` | string | Yes | 스토리지 ID |

**Example**:
```json
{
  "storage": "backup-nfs"
}
```

---

#### `proxmox_upload_to_storage` 🔒
ISO/템플릿 파일을 스토리지에 업로드합니다.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/storage/{storage}/upload` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | 노드 이름 |
| `storage` | string | Yes | 스토리지 ID |
| `content` | string | Yes | `iso`, `vztmpl`, `backup` |
| `filename` | string | Yes | 업로드 파일명 |

**Example**:
```json
{
  "node": "pve1",
  "storage": "local",
  "content": "iso",
  "filename": "ubuntu.iso"
}
```

---

#### `proxmox_download_url_to_storage` 🔒
URL에서 파일을 다운로드하여 스토리지에 저장합니다.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `POST /api2/json/nodes/{node}/storage/{storage}/download-url` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | 노드 이름 |
| `storage` | string | Yes | 스토리지 ID |
| `url` | string | Yes | 다운로드 URL |
| `content` | string | Yes | `iso`, `vztmpl`, `backup` |
| `filename` | string | No | 대상 파일명 |

**Example**:
```json
{
  "node": "pve1",
  "storage": "local",
  "url": "https://example.com/ubuntu.iso",
  "content": "iso",
  "filename": "ubuntu.iso"
}
```

---

#### `proxmox_list_storage_content`
스토리지 콘텐츠 목록을 조회합니다.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/storage/{storage}/content` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | 노드 이름 |
| `storage` | string | Yes | 스토리지 ID |
| `content` | string | No | 콘텐츠 유형 필터 |
| `vmid` | number | No | VMID 필터 |

**Example**:
```json
{
  "node": "pve1",
  "storage": "local",
  "content": "iso"
}
```

---

#### `proxmox_delete_storage_content` 🔒
스토리지의 콘텐츠를 삭제합니다.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/nodes/{node}/storage/{storage}/content/{volume}` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | 노드 이름 |
| `storage` | string | Yes | 스토리지 ID |
| `volume` | string | Yes | 볼륨 식별자 (volid) |

**Example**:
```json
{
  "node": "pve1",
  "storage": "local",
  "volume": "local:iso/ubuntu.iso"
}
```

---

#### `proxmox_list_file_restore`
백업 아카이브 내 파일 목록을 조회합니다.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/storage/{storage}/file-restore/list` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | 노드 이름 |
| `storage` | string | Yes | 스토리지 ID |
| `volume` | string | Yes | 백업 볼륨 식별자 |
| `path` | string | No | 백업 내 경로 |

**Example**:
```json
{
  "node": "pve1",
  "storage": "backup-nfs",
  "volume": "backup-nfs:backup/vzdump-qemu-100-2024_01_01-12_00_00.vma.zst"
}
```

---

#### `proxmox_download_file_restore`
백업 아카이브에서 파일을 다운로드합니다.

| Property | Value |
|----------|-------|
| Permission | Basic |
| API Endpoint | `GET /api2/json/nodes/{node}/storage/{storage}/file-restore/download` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | 노드 이름 |
| `storage` | string | Yes | 스토리지 ID |
| `volume` | string | Yes | 백업 볼륨 식별자 |
| `filepath` | string | Yes | 백업 내 파일 경로 |

**Example**:
```json
{
  "node": "pve1",
  "storage": "backup-nfs",
  "volume": "backup-nfs:backup/vzdump-qemu-100-2024_01_01-12_00_00.vma.zst",
  "filepath": "/etc/hosts"
}
```

---

#### `proxmox_prune_backups` 🔒
스토리지의 오래된 백업을 정리합니다.

| Property | Value |
|----------|-------|
| Permission | Elevated |
| API Endpoint | `DELETE /api2/json/nodes/{node}/storage/{storage}/prunebackups` |

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `node` | string | Yes | 노드 이름 |
| `storage` | string | Yes | 스토리지 ID |
| `keep-last` | number | No | 최근 N개 유지 |
| `keep-daily` | number | No | 일간 백업 유지 |
| `keep-weekly` | number | No | 주간 백업 유지 |
| `keep-monthly` | number | No | 월간 백업 유지 |
| `keep-yearly` | number | No | 연간 백업 유지 |
| `dry-run` | boolean | No | 시뮬레이션만 수행 |

**Example**:
```json
{
  "node": "pve1",
  "storage": "backup-nfs",
  "keep-last": 3
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

### VM 수정 (6개)

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

#### `proxmox_update_vm_config` 🔒
임의의 키-값 쌍으로 QEMU VM 구성을 업데이트합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `PUT /api2/json/nodes/{node}/qemu/{vmid}/config` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | VM이 위치한 노드 이름 |
| `vmid` | number | 예 | VM ID 번호 |
| `config` | object | 아니오 | 설정할 VM 구성의 키-값 쌍 (ciuser, cipassword, ipconfig0 클라우드-초기화, boot, agent, serial0, vga, cpu, balloon, tags, description) |
| `delete` | string | 아니오 | 제거할 구성 키의 쉼표 구분 목록 (예: "ciuser,cipassword") |

**예제**:
```json
{
  "node": "pve1",
  "vmid": 100,
  "config": {
    "ciuser": "ubuntu",
    "cipassword": "secret",
    "ipconfig0": "ip=192.168.1.100/24,gw=192.168.1.1"
  }
}
```

**참고**: 유효한 매개변수를 찾으려면 `proxmox_get_vm_config`를 사용하세요.

---

#### `proxmox_update_lxc_config` 🔒
임의의 키-값 쌍으로 LXC 컨테이너 구성을 업데이트합니다.

| 속성 | 값 |
|------|-----|
| API 엔드포인트 | `PUT /api2/json/nodes/{node}/lxc/{vmid}/config` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 컨테이너가 위치한 노드 이름 |
| `vmid` | number | 예 | 컨테이너 ID 번호 |
| `config` | object | 아니오 | 설정할 컨테이너 구성의 키-값 쌍 (hostname, memory, swap, cores, cpulimit, cpuunits, nameserver, searchdomain, tags, description, mp0-mpN 마운트 포인트) |
| `delete` | string | 아니오 | 제거할 구성 키의 쉼표 구분 목록 (예: "mp0,nameserver") |

**예제**:
```json
{
  "node": "pve1",
  "vmid": 200,
  "config": {
    "hostname": "mycontainer",
    "memory": 2048,
    "cores": 2
  }
}
```

**참고**: 유효한 매개변수를 찾으려면 `proxmox_get_lxc_config`를 사용하세요.

---

### VM/LXC 고급 (26개)

마이그레이션, 템플릿 전환, 게스트 에이전트 명령, 방화벽 규칙, 성능 메트릭을 포함한 고급 VM/LXC 작업입니다.

#### `proxmox_migrate_vm` 🔒
QEMU VM을 다른 노드로 마이그레이션합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 관리자 |
| API 엔드포인트 | `POST /api2/json/nodes/{node}/qemu/{vmid}/migrate` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 소스 노드 이름 |
| `vmid` | number | 예 | VM ID |
| `target` | string | 예 | 대상 노드 이름 |
| `online` | boolean | 아니오 | 라이브 마이그레이션 |
| `force` | boolean | 아니오 | 강제 마이그레이션 |
| `bwlimit` | number | 아니오 | 대역폭 제한 (MB/s) |
| `with-local-disks` | boolean | 아니오 | 로컬 디스크 포함 |
| `with-local-storage` | boolean | 아니오 | 로컬 스토리지 포함 |

---

#### `proxmox_migrate_lxc` 🔒
LXC 컨테이너를 다른 노드로 마이그레이션합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 관리자 |
| API 엔드포인트 | `POST /api2/json/nodes/{node}/lxc/{vmid}/migrate` |

**매개변수**: `proxmox_migrate_vm`과 동일.

---

#### `proxmox_create_template_vm` 🔒
QEMU VM을 템플릿으로 전환합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 관리자 |
| API 엔드포인트 | `POST /api2/json/nodes/{node}/qemu/{vmid}/template` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | VM ID |

---

#### `proxmox_create_template_lxc` 🔒
LXC 컨테이너를 템플릿으로 전환합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 관리자 |
| API 엔드포인트 | `POST /api2/json/nodes/{node}/lxc/{vmid}/template` |

**매개변수**: `proxmox_create_template_vm`과 동일.

---

#### `proxmox_get_vm_rrddata`
QEMU VM 성능 메트릭(RRD)을 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/qemu/{vmid}/rrddata` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | VM ID |
| `timeframe` | string | 아니오 | 기간 (hour/day/week/month/year) |
| `cf` | string | 아니오 | 집계 함수 (AVERAGE, MAX) |

---

#### `proxmox_get_lxc_rrddata`
LXC 컨테이너 성능 메트릭(RRD)을 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/lxc/{vmid}/rrddata` |

**매개변수**: `proxmox_get_vm_rrddata`와 동일.

---

#### `proxmox_agent_ping`
QEMU 게스트 에이전트를 핑합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `POST /api2/json/nodes/{node}/qemu/{vmid}/agent/ping` |

**매개변수**: `proxmox_create_template_vm`과 동일.

---

#### `proxmox_agent_get_osinfo`
QEMU 게스트 에이전트를 통해 OS 정보를 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/qemu/{vmid}/agent/get-osinfo` |

**매개변수**: `proxmox_create_template_vm`과 동일.

---

#### `proxmox_agent_get_fsinfo`
QEMU 게스트 에이전트를 통해 파일시스템 정보를 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/qemu/{vmid}/agent/get-fsinfo` |

**매개변수**: `proxmox_create_template_vm`과 동일.

---

#### `proxmox_agent_get_memory_blocks`
QEMU 게스트 에이전트를 통해 메모리 블록 정보를 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/qemu/{vmid}/agent/get-memory-blocks` |

**매개변수**: `proxmox_create_template_vm`과 동일.

---

#### `proxmox_agent_get_network_interfaces`
QEMU 게스트 에이전트를 통해 네트워크 인터페이스를 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/qemu/{vmid}/agent/network-get-interfaces` |

**매개변수**: `proxmox_create_template_vm`과 동일.

---

#### `proxmox_agent_get_time`
QEMU 게스트 에이전트를 통해 시간을 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/qemu/{vmid}/agent/get-time` |

**매개변수**: `proxmox_create_template_vm`과 동일.

---

#### `proxmox_agent_get_timezone`
QEMU 게스트 에이전트를 통해 시간대를 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/qemu/{vmid}/agent/get-timezone` |

**매개변수**: `proxmox_create_template_vm`과 동일.

---

#### `proxmox_agent_get_vcpus`
QEMU 게스트 에이전트를 통해 vCPU 정보를 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/qemu/{vmid}/agent/get-vcpus` |

**매개변수**: `proxmox_create_template_vm`과 동일.

---

#### `proxmox_agent_exec` 🔒
QEMU 게스트 에이전트를 통해 명령을 실행합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 관리자 |
| API 엔드포인트 | `POST /api2/json/nodes/{node}/qemu/{vmid}/agent/exec` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | VM ID |
| `command` | string | 예 | 실행할 명령 |
| `args` | string[] | 아니오 | 명령 인자 |
| `input-data` | string | 아니오 | stdin 입력 |
| `capture-output` | boolean | 아니오 | stdout/stderr 캡처 |
| `timeout` | number | 아니오 | 제한 시간(초) |

---

#### `proxmox_agent_exec_status`
QEMU 게스트 에이전트 명령 상태를 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/qemu/{vmid}/agent/exec-status` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | VM ID |
| `pid` | number | 예 | exec에서 받은 PID |

---

#### `proxmox_list_vm_firewall_rules`
VM별 방화벽 규칙을 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/qemu/{vmid}/firewall/rules` |

**매개변수**: `proxmox_create_template_vm`과 동일.

---

#### `proxmox_get_vm_firewall_rule`
VM 방화벽 규칙을 위치로 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/qemu/{vmid}/firewall/rules/{pos}` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | VM ID |
| `pos` | number | 예 | 규칙 위치 |

---

#### `proxmox_create_vm_firewall_rule` 🔒
VM 방화벽 규칙을 생성합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 관리자 |
| API 엔드포인트 | `POST /api2/json/nodes/{node}/qemu/{vmid}/firewall/rules` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | VM ID |
| `action` | string | 예 | `ACCEPT`, `REJECT`, `DROP` |
| `type` | string | 예 | `in`, `out`, `group` |
| `proto` | string | 아니오 | 프로토콜 |
| `dport` | string | 아니오 | 목적지 포트 |
| `source` | string | 아니오 | 소스 CIDR |
| `dest` | string | 아니오 | 목적지 CIDR |

---

#### `proxmox_update_vm_firewall_rule` 🔒
VM 방화벽 규칙을 수정합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 관리자 |
| API 엔드포인트 | `PUT /api2/json/nodes/{node}/qemu/{vmid}/firewall/rules/{pos}` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | VM ID |
| `pos` | number | 예 | 규칙 위치 |
| `comment` | string | 아니오 | 설명 |
| `delete` | string | 아니오 | 삭제할 설정 목록 |

---

#### `proxmox_delete_vm_firewall_rule` 🔒
VM 방화벽 규칙을 삭제합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 관리자 |
| API 엔드포인트 | `DELETE /api2/json/nodes/{node}/qemu/{vmid}/firewall/rules/{pos}` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | VM ID |
| `pos` | number | 예 | 규칙 위치 |
| `digest` | string | 아니오 | 구성 해시 |

---

#### `proxmox_list_lxc_firewall_rules`
LXC별 방화벽 규칙을 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/lxc/{vmid}/firewall/rules` |

**매개변수**: `proxmox_create_template_vm`과 동일.

---

#### `proxmox_get_lxc_firewall_rule`
LXC 방화벽 규칙을 위치로 조회합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 기본 |
| API 엔드포인트 | `GET /api2/json/nodes/{node}/lxc/{vmid}/firewall/rules/{pos}` |

**매개변수**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `node` | string | 예 | 노드 이름 |
| `vmid` | number | 예 | 컨테이너 ID |
| `pos` | number | 예 | 규칙 위치 |

---

#### `proxmox_create_lxc_firewall_rule` 🔒
LXC 방화벽 규칙을 생성합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 관리자 |
| API 엔드포인트 | `POST /api2/json/nodes/{node}/lxc/{vmid}/firewall/rules` |

**매개변수**: `proxmox_create_vm_firewall_rule`과 동일(컨테이너 ID 사용).

---

#### `proxmox_update_lxc_firewall_rule` 🔒
LXC 방화벽 규칙을 수정합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 관리자 |
| API 엔드포인트 | `PUT /api2/json/nodes/{node}/lxc/{vmid}/firewall/rules/{pos}` |

**매개변수**: `proxmox_update_vm_firewall_rule`과 동일(컨테이너 ID 사용).

---

#### `proxmox_delete_lxc_firewall_rule` 🔒
LXC 방화벽 규칙을 삭제합니다.

| 속성 | 값 |
|------|-----|
| 권한 | 관리자 |
| API 엔드포인트 | `DELETE /api2/json/nodes/{node}/lxc/{vmid}/firewall/rules/{pos}` |

**매개변수**: `proxmox_delete_vm_firewall_rule`과 동일(컨테이너 ID 사용).

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
| `type` | string | 아니오 | VM 유형 (기본값: `qemu`, QEMU 전용) |
| `command` | string | 예 | 실행할 셸 명령어 |

**참고**: VM 내부에 QEMU Guest Agent가 실행 중이어야 합니다. LXC 컨테이너는 지원되지 않습니다 (exec API 없음).

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
| `net0` | string | 아니오 | 네트워크 인터페이스 설정 (예: `name=eth0,bridge=vmbr0,ip=dhcp`) |

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

### 중간 우선순위

특수 사용 사례를 위한 API:

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
