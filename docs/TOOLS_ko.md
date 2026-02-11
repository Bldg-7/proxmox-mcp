# Proxmox MCP 도구 레퍼런스

> Proxmox MCP 서버의 92개 통합 도구에 대한 완전한 레퍼런스

**현재 버전**: 0.6.1  
**총 도구 수**: 92  
**최종 업데이트**: 2026-02-12

---

## 목차

- [개요](#개요)
- [권한 모델](#권한-모델)
- [도구 레퍼런스](#도구-레퍼런스)
  - [노드 & 클러스터 (13개)](#노드--클러스터-13개)
  - [게스트 관리 (20개)](#게스트-관리-20개)
  - [게스트 에이전트 (7개)](#게스트-에이전트-7개)
  - [스토리지 & Ceph (9개)](#스토리지--ceph-9개)
  - [클러스터 서비스 (12개)](#클러스터-서비스-12개)
  - [SDN 네트워킹 (4개)](#sdn-네트워킹-4개)
  - [접근 제어 (6개)](#접근-제어-6개)
  - [풀 관리 (1개)](#풀-관리-1개)
  - [게스트 방화벽 (1개)](#게스트-방화벽-1개)
  - [스냅샷 & 백업 (2개)](#스냅샷--백업-2개)
  - [디스크 & 네트워크 (7개)](#디스크--네트워크-7개)
  - [LXC 실행 (1개)](#lxc-실행-1개)
  - [콘솔 접근 (3개)](#콘솔-접근-3개)
  - [Cloud-Init, 인증서 & ACME (5개)](#cloud-init-인증서--acme-5개)
  - [알림 (1개)](#알림-1개)

---

## 개요

이 문서는 Proxmox MCP 서버에서 사용 가능한 92개 통합 도구에 대한 완전한 레퍼런스를 제공합니다. 각 도구는 `action`, `type` 또는 `operation` 매개변수를 사용하여 관련 작업을 하나의 도구로 통합하여, 전체 API 커버리지를 유지하면서 도구 수를 줄였습니다.

### 도구 분포

| 카테고리 | 개수 | 권한 |
|----------|------|------|
| 노드 & 클러스터 | 13 | 혼합 |
| 게스트 관리 | 20 | 혼합 |
| 게스트 에이전트 | 7 | 관리자 |
| 스토리지 & Ceph | 9 | 혼합 |
| 클러스터 서비스 | 12 | 혼합 |
| SDN 네트워킹 | 4 | 혼합 |
| 접근 제어 | 6 | 혼합 |
| 풀 관리 | 1 | 혼합 |
| 게스트 방화벽 | 1 | 혼합 |
| 스냅샷 & 백업 | 2 | 관리자 |
| 디스크 & 네트워크 | 7 | 혼합 |
| 콘솔 접근 | 3 | 관리자 |
| Cloud-Init, 인증서 & ACME | 5 | 혼합 |
| LXC 실행 | 1 | 관리자 |
| 알림 | 1 | 혼합 |
| **합계** | **92** | |

---

## 권한 모델

도구는 두 가지 권한 수준으로 분류됩니다:

| 수준 | 기호 | 설명 | 환경 변수 |
|------|------|------|-----------|
| **기본** | - | 읽기 전용 작업, 항상 허용 | (필요 없음) |
| **관리자** | 🔒 | 생성/수정/삭제 작업 | `PROXMOX_ALLOW_ELEVATED=true` |

많은 통합 도구에는 기본 및 관리자 작업이 모두 포함되어 있습니다. 권한 수준은 사용하는 특정 `action`/`operation`에 따라 달라집니다.

---

## 도구 레퍼런스

### 노드 & 클러스터 (13개)

#### `proxmox_node`
Proxmox 노드 정보를 조회합니다. action=list: 모든 노드 목록 | action=status: 노드 상태 (관리자) | action=network: 네트워크 인터페이스 | action=dns: DNS 설정 | action=iface: 특정 인터페이스 상세 정보

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | 클러스터 노드 목록 |
| `status` | 관리자 🔒 | 노드 상세 상태 |
| `network` | 기본 | 네트워크 인터페이스 목록 |
| `dns` | 기본 | DNS 설정 조회 |
| `iface` | 기본 | 특정 인터페이스 상세 정보 |

---

#### `proxmox_cluster`
Proxmox 클러스터 정보를 조회합니다. action=status: 노드 및 리소스 사용량을 포함한 전체 클러스터 상태 | action=options: 클러스터 옵션 조회 | action=update_options: 클러스터 옵션 업데이트 (관리자 권한 필요)

| Action | 권한 | 설명 |
|--------|------|------|
| `status` | 기본 | 클러스터 상태 조회 |
| `options` | 기본 | 클러스터 옵션 조회 |
| `update_options` | 관리자 🔒 | 클러스터 옵션 업데이트 |

---

#### `proxmox_node_service`
노드 서비스를 관리합니다. action=list: 서비스 목록 | action=control: 서비스 시작/중지/재시작 (관리자)

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | 서비스 목록 |
| `control` | 관리자 🔒 | 서비스 시작/중지/재시작 |

---

#### `proxmox_node_log`
노드 로그를 읽습니다. action=syslog: syslog 읽기 | action=journal: systemd journal 읽기

| Action | 권한 | 설명 |
|--------|------|------|
| `syslog` | 기본 | syslog 읽기 |
| `journal` | 기본 | systemd journal 읽기 |

---

#### `proxmox_node_task`
노드 작업을 조회합니다. action=list: 최근 작업 목록 | action=get: UPID로 작업 상세 조회

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | 최근 작업 목록 |
| `get` | 기본 | UPID로 작업 상세 조회 |

---

#### `proxmox_node_info`
노드 정보를 조회합니다. action=aplinfo: 어플라이언스 템플릿 | action=netstat: 네트워크 통계 | action=rrddata: 성능 메트릭 | action=storage_rrddata: 스토리지 메트릭 | action=report: 진단 보고서

| Action | 권한 | 설명 |
|--------|------|------|
| `aplinfo` | 기본 | 어플라이언스 템플릿 목록 |
| `netstat` | 기본 | 네트워크 연결 통계 |
| `rrddata` | 기본 | 노드 성능 메트릭 |
| `storage_rrddata` | 기본 | 스토리지 성능 메트릭 |
| `report` | 기본 | 진단 보고서 |

---

#### `proxmox_node_config`
노드 설정을 관리합니다. action=get_time|set_time(관리자)|set_dns(관리자)|get_hosts|set_hosts(관리자)

| Action | 권한 | 설명 |
|--------|------|------|
| `get_time` | 기본 | 시간 및 시간대 조회 |
| `set_time` | 관리자 🔒 | 시간대 설정 |
| `set_dns` | 관리자 🔒 | DNS 설정 업데이트 |
| `get_hosts` | 기본 | hosts 파일 항목 조회 |
| `set_hosts` | 관리자 🔒 | hosts 파일 업데이트 |

---

#### `proxmox_node_subscription`
노드 구독을 관리합니다. action=get: 정보 조회 | action=set: 키 설정 (관리자) | action=delete: 삭제 (관리자)

| Action | 권한 | 설명 |
|--------|------|------|
| `get` | 기본 | 구독 정보 조회 |
| `set` | 관리자 🔒 | 구독 키 설정 |
| `delete` | 관리자 🔒 | 구독 삭제 |

---

#### `proxmox_apt`
APT 패키지를 관리합니다. action=update(관리자)|upgrade(관리자): 패키지 작업 | action=versions: 버전 목록

| Action | 권한 | 설명 |
|--------|------|------|
| `update` | 관리자 🔒 | 패키지 목록 업데이트 |
| `upgrade` | 관리자 🔒 | 패키지 업그레이드 |
| `versions` | 기본 | 패키지 버전 목록 |

---

#### `proxmox_node_bulk`
게스트 일괄 작업. action=start_all|stop_all|migrate_all (모두 관리자)

| Action | 권한 | 설명 |
|--------|------|------|
| `start_all` | 관리자 🔒 | 모든 게스트 시작 |
| `stop_all` | 관리자 🔒 | 모든 게스트 중지 |
| `migrate_all` | 관리자 🔒 | 모든 게스트 마이그레이션 |

---

#### `proxmox_node_power`
노드 전원 제어. action=shutdown|reboot|wakeonlan (모두 관리자)

| Action | 권한 | 설명 |
|--------|------|------|
| `shutdown` | 관리자 🔒 | 노드 종료 |
| `reboot` | 관리자 🔒 | 노드 재부팅 |
| `wakeonlan` | 관리자 🔒 | WOL로 노드 깨우기 |

---

#### `proxmox_node_replication`
노드 복제를 관리합니다. action=status|log: 조회 | action=schedule: 즉시 실행 (관리자)

| Action | 권한 | 설명 |
|--------|------|------|
| `status` | 기본 | 복제 상태 조회 |
| `log` | 기본 | 복제 로그 조회 |
| `schedule` | 관리자 🔒 | 복제 즉시 실행 |

---

#### `proxmox_node_network_iface`
노드 네트워크 인터페이스를 관리합니다. action=create|update|delete|apply (모두 관리자)

| Action | 권한 | 설명 |
|--------|------|------|
| `create` | 관리자 🔒 | 네트워크 인터페이스 생성 |
| `update` | 관리자 🔒 | 네트워크 인터페이스 업데이트 |
| `delete` | 관리자 🔒 | 네트워크 인터페이스 삭제 |
| `apply` | 관리자 🔒 | 대기 중인 네트워크 변경 적용 |

---

### 게스트 관리 (20개)

#### `proxmox_guest_list`
클러스터 전체의 모든 가상 머신과 컨테이너의 상태를 조회합니다

**권한**: 기본

---

#### `proxmox_guest_status`
VM (type=vm) 또는 LXC 컨테이너 (type=lxc)의 상세 상태를 조회합니다

| Type | 설명 |
|------|------|
| `vm` | QEMU 가상 머신 |
| `lxc` | LXC 컨테이너 |

**권한**: 기본

---

#### `proxmox_guest_config`
VM (type=vm) 또는 LXC 컨테이너 (type=lxc)의 하드웨어 설정을 조회합니다

**권한**: 기본

---

#### `proxmox_guest_pending`
VM (type=vm) 또는 LXC 컨테이너 (type=lxc)의 대기 중인 설정 변경사항을 조회합니다

**권한**: 기본

---

#### `proxmox_guest_feature`
VM (type=vm) 또는 LXC 컨테이너 (type=lxc)에서 기능 (스냅샷, 복제, 복사) 사용 가능 여부를 확인합니다

**권한**: 기본

---

#### `proxmox_guest_rrddata`
VM (type=vm) 또는 LXC 컨테이너 (type=lxc)의 성능 메트릭 (RRD 데이터)을 조회합니다

**권한**: 기본

---

#### `proxmox_guest_start` 🔒
VM (type=vm) 또는 LXC 컨테이너 (type=lxc)를 시작합니다 (관리자 권한 필요)

---

#### `proxmox_guest_stop` 🔒
VM (type=vm) 또는 LXC 컨테이너 (type=lxc)를 강제 중지합니다 (관리자 권한 필요)

---

#### `proxmox_guest_reboot` 🔒
VM (type=vm) 또는 LXC 컨테이너 (type=lxc)를 재부팅합니다 (관리자 권한 필요)

---

#### `proxmox_guest_shutdown` 🔒
VM (type=vm) 또는 LXC 컨테이너 (type=lxc)를 정상 종료합니다 (관리자 권한 필요)

---

#### `proxmox_guest_delete` 🔒
VM (type=vm) 또는 LXC 컨테이너 (type=lxc)를 삭제합니다 (관리자 권한 필요)

---

#### `proxmox_guest_pause` 🔒
QEMU 가상 머신을 일시정지합니다 -- VM 전용 (관리자 권한 필요)

---

#### `proxmox_guest_resume` 🔒
일시정지된 QEMU 가상 머신을 재개합니다 -- VM 전용 (관리자 권한 필요)

---

#### `proxmox_guest_clone` 🔒
VM (type=vm) 또는 LXC 컨테이너 (type=lxc)를 복제합니다 (관리자 권한 필요)

---

#### `proxmox_guest_resize` 🔒
VM/LXC의 CPU 또는 메모리를 조정합니다 (type=vm|lxc) (관리자 권한 필요)

---

#### `proxmox_guest_config_update` 🔒
VM/LXC 설정 키-값 쌍을 업데이트합니다 (type=vm|lxc) (관리자 권한 필요)

---

#### `proxmox_guest_migrate` 🔒
VM 또는 LXC 컨테이너를 다른 노드로 마이그레이션합니다 (type=vm|lxc) (관리자 권한 필요)

---

#### `proxmox_guest_template` 🔒
VM 또는 LXC 컨테이너를 템플릿으로 변환합니다 (type=vm|lxc) (관리자 권한 필요)

---

#### `proxmox_create_lxc` 🔒
새 LXC 컨테이너를 생성합니다 (관리자 권한 필요)

---

#### `proxmox_create_vm` 🔒
새 QEMU 가상 머신을 생성합니다 (관리자 권한 필요)

---

#### `proxmox_get_next_vmid`
사용 가능한 다음 VM/컨테이너 ID 번호를 조회합니다

**권한**: 기본

---

### 게스트 에이전트 (7개)

모든 게스트 에이전트 도구는 **관리자 권한**이 필요하며 QEMU 게스트 에이전트를 통해 작동합니다.

#### `proxmox_agent_info` 🔒
QEMU 에이전트를 통해 게스트 정보를 조회합니다. operation=ping|osinfo|fsinfo|network_interfaces|time|timezone (관리자 권한 필요)

| Operation | 설명 |
|-----------|------|
| `ping` | 게스트 에이전트 핑 |
| `osinfo` | OS 정보 조회 |
| `fsinfo` | 파일시스템 정보 조회 |
| `network_interfaces` | 네트워크 인터페이스 조회 |
| `time` | 게스트 시간 조회 |
| `timezone` | 게스트 시간대 조회 |

---

#### `proxmox_agent_hw` 🔒
QEMU 에이전트를 통해 게스트 하드웨어를 조회합니다. operation=memory_blocks|vcpus|memory_block_info|hostname|users (관리자 권한 필요)

| Operation | 설명 |
|-----------|------|
| `memory_blocks` | 메모리 블록 목록 |
| `vcpus` | 가상 CPU 목록 |
| `memory_block_info` | 메모리 블록 정보 |
| `hostname` | 호스트명 조회 |
| `users` | 로그인된 사용자 목록 |

---

#### `proxmox_agent_exec` 🔒
QEMU 에이전트를 통해 명령을 실행합니다. operation=exec: 명령 실행 | operation=status: 실행 상태 확인 (관리자 권한 필요)

| Operation | 설명 |
|-----------|------|
| `exec` | 게스트에서 명령 실행 |
| `status` | 실행 상태 확인 |

---

#### `proxmox_agent_file` 🔒
QEMU 에이전트를 통해 파일을 읽기/쓰기합니다. operation=read|write (관리자 권한 필요)

| Operation | 설명 |
|-----------|------|
| `read` | 게스트에서 파일 읽기 |
| `write` | 게스트에 파일 쓰기 |

---

#### `proxmox_agent_freeze` 🔒
QEMU 에이전트를 통해 파일시스템 동결을 관리합니다. operation=status|freeze|thaw|fstrim (관리자 권한 필요)

| Operation | 설명 |
|-----------|------|
| `status` | 동결 상태 조회 |
| `freeze` | 파일시스템 동결 |
| `thaw` | 파일시스템 해동 |
| `fstrim` | 파일시스템 트림 |

---

#### `proxmox_agent_power` 🔒
QEMU 에이전트를 통한 게스트 전원 제어. operation=shutdown|suspend_disk|suspend_ram|suspend_hybrid (관리자 권한 필요)

| Operation | 설명 |
|-----------|------|
| `shutdown` | 에이전트를 통한 종료 |
| `suspend_disk` | 디스크로 일시 중단 |
| `suspend_ram` | RAM으로 일시 중단 |
| `suspend_hybrid` | 하이브리드 일시 중단 |

---

#### `proxmox_agent_user` 🔒
QEMU 에이전트를 통해 게스트 사용자를 관리합니다. operation=set_password (관리자 권한 필요)

| Operation | 설명 |
|-----------|------|
| `set_password` | 사용자 비밀번호 설정 |

---

### 스토리지 & Ceph (9개)

#### `proxmox_storage_config`
스토리지 설정을 관리합니다 (list, get, create, update, delete, cluster_usage)

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | 스토리지 설정 목록 |
| `get` | 기본 | 이름으로 스토리지 설정 조회 |
| `create` | 관리자 🔒 | 스토리지 설정 생성 |
| `update` | 관리자 🔒 | 스토리지 설정 업데이트 |
| `delete` | 관리자 🔒 | 스토리지 설정 삭제 |
| `cluster_usage` | 기본 | 클러스터 스토리지 사용량 조회 |

---

#### `proxmox_storage_content`
스토리지 콘텐츠를 관리합니다 (list, list_templates, upload, download_url, delete, prune)

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | 스토리지 콘텐츠 목록 |
| `list_templates` | 기본 | 사용 가능한 템플릿 목록 |
| `upload` | 관리자 🔒 | 스토리지에 파일 업로드 |
| `download_url` | 관리자 🔒 | URL에서 스토리지로 다운로드 |
| `delete` | 관리자 🔒 | 스토리지 콘텐츠 삭제 |
| `prune` | 관리자 🔒 | 오래된 백업 정리 |

---

#### `proxmox_file_restore`
백업에서 파일을 복원합니다. action=list: 백업 내 파일 목록 | action=download: 백업에서 파일 다운로드

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | 백업 내 파일 목록 |
| `download` | 기본 | 백업에서 파일 다운로드 |

---

#### `proxmox_ceph`
Ceph 클러스터를 조회합니다. action=status: Ceph 클러스터 상태, FSID, 모니터, OSD, 배치 그룹 조회

| Action | 권한 | 설명 |
|--------|------|------|
| `status` | 기본 | Ceph 클러스터 상태 조회 |

---

#### `proxmox_ceph_osd`
Ceph OSD를 관리합니다 (list, create, delete)

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | OSD 목록 |
| `create` | 관리자 🔒 | OSD 생성 |
| `delete` | 관리자 🔒 | OSD 삭제 |

---

#### `proxmox_ceph_mon`
Ceph 모니터를 관리합니다 (list, create, delete)

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | 모니터 목록 |
| `create` | 관리자 🔒 | 모니터 생성 |
| `delete` | 관리자 🔒 | 모니터 삭제 |

---

#### `proxmox_ceph_mds`
Ceph MDS 데몬을 관리합니다 (list, create, delete)

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | MDS 데몬 목록 |
| `create` | 관리자 🔒 | MDS 데몬 생성 |
| `delete` | 관리자 🔒 | MDS 데몬 삭제 |

---

#### `proxmox_ceph_pool`
Ceph 풀을 관리합니다 (list, create, update, delete)

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | Ceph 풀 목록 |
| `create` | 관리자 🔒 | 풀 생성 |
| `update` | 관리자 🔒 | 풀 업데이트 |
| `delete` | 관리자 🔒 | 풀 삭제 |

---

#### `proxmox_ceph_fs`
Ceph 파일시스템을 관리합니다 (list, create)

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | Ceph 파일시스템 목록 |
| `create` | 관리자 🔒 | 파일시스템 생성 |

---

### 클러스터 서비스 (12개)

#### `proxmox_ha_resource`
HA 리소스를 관리합니다. action=list: 리소스 목록 | action=get: 리소스 상세 | action=status: HA 매니저 상태 | action=create: 리소스 생성 (관리자) | action=update: 리소스 업데이트 (관리자) | action=delete: 리소스 삭제 (관리자)

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | HA 리소스 목록 |
| `get` | 기본 | 리소스 상세 조회 |
| `status` | 기본 | HA 매니저 상태 |
| `create` | 관리자 🔒 | HA 리소스 생성 |
| `update` | 관리자 🔒 | HA 리소스 업데이트 |
| `delete` | 관리자 🔒 | HA 리소스 삭제 |

---

#### `proxmox_ha_group`
HA 그룹을 관리합니다. action=list: 그룹 목록 | action=get: 그룹 상세 | action=create: 그룹 생성 (관리자) | action=update: 그룹 업데이트 (관리자) | action=delete: 그룹 삭제 (관리자)

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | HA 그룹 목록 |
| `get` | 기본 | 그룹 상세 조회 |
| `create` | 관리자 🔒 | HA 그룹 생성 |
| `update` | 관리자 🔒 | HA 그룹 업데이트 |
| `delete` | 관리자 🔒 | HA 그룹 삭제 |

---

#### `proxmox_cluster_firewall_rule`
클러스터 방화벽 규칙을 관리합니다. action=list: 규칙 목록 | action=get: 위치로 규칙 조회 | action=create: 규칙 생성 (관리자) | action=update: 규칙 업데이트 (관리자) | action=delete: 규칙 삭제 (관리자)

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | 방화벽 규칙 목록 |
| `get` | 기본 | 위치로 규칙 조회 |
| `create` | 관리자 🔒 | 방화벽 규칙 생성 |
| `update` | 관리자 🔒 | 방화벽 규칙 업데이트 |
| `delete` | 관리자 🔒 | 방화벽 규칙 삭제 |

---

#### `proxmox_cluster_firewall_group`
클러스터 방화벽 그룹을 관리합니다. action=list: 그룹 목록 | action=get: 이름으로 그룹 조회 | action=create: 그룹 생성 (관리자) | action=update: 그룹 업데이트 (관리자) | action=delete: 그룹 삭제 (관리자)

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | 방화벽 그룹 목록 |
| `get` | 기본 | 이름으로 그룹 조회 |
| `create` | 관리자 🔒 | 방화벽 그룹 생성 |
| `update` | 관리자 🔒 | 방화벽 그룹 업데이트 |
| `delete` | 관리자 🔒 | 방화벽 그룹 삭제 |

---

#### `proxmox_cluster_firewall`
클러스터 방화벽 메타데이터를 조회/관리합니다. action=get_options: 방화벽 옵션 조회 | action=update_options: 방화벽 옵션 업데이트 (관리자) | action=list_macros: 방화벽 매크로 목록 | action=list_refs: 방화벽 참조 목록

| Action | 권한 | 설명 |
|--------|------|------|
| `get_options` | 기본 | 방화벽 옵션 조회 |
| `update_options` | 관리자 🔒 | 방화벽 옵션 업데이트 |
| `list_macros` | 기본 | 방화벽 매크로 목록 |
| `list_refs` | 기본 | 방화벽 참조 목록 |

---

#### `proxmox_cluster_firewall_alias`
클러스터 방화벽 별칭을 관리합니다. action=list: 별칭 목록 | action=get: 이름으로 별칭 조회 | action=create: 별칭 생성 (관리자) | action=update: 별칭 업데이트 (관리자) | action=delete: 별칭 삭제 (관리자)

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | 별칭 목록 |
| `get` | 기본 | 이름으로 별칭 조회 |
| `create` | 관리자 🔒 | 별칭 생성 |
| `update` | 관리자 🔒 | 별칭 업데이트 |
| `delete` | 관리자 🔒 | 별칭 삭제 |

---

#### `proxmox_cluster_firewall_ipset`
클러스터 방화벽 IP 세트를 관리합니다. action=list: IP 세트 목록 | action=create: IP 세트 생성 (관리자) | action=delete: IP 세트 삭제 (관리자)

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | IP 세트 목록 |
| `create` | 관리자 🔒 | IP 세트 생성 |
| `delete` | 관리자 🔒 | IP 세트 삭제 |

---

#### `proxmox_cluster_firewall_ipset_entry`
클러스터 방화벽 IP 세트 항목을 관리합니다. action=list: 항목 목록 | action=create: 항목 추가 (관리자) | action=update: 항목 업데이트 (관리자) | action=delete: 항목 삭제 (관리자)

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | 항목 목록 |
| `create` | 관리자 🔒 | 항목 추가 |
| `update` | 관리자 🔒 | 항목 업데이트 |
| `delete` | 관리자 🔒 | 항목 삭제 |

---

#### `proxmox_cluster_backup_job`
클러스터 백업 작업을 관리합니다. action=list: 작업 목록 | action=get: ID로 작업 조회 | action=create: 작업 생성 (관리자) | action=update: 작업 업데이트 (관리자) | action=delete: 작업 삭제 (관리자)

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | 백업 작업 목록 |
| `get` | 기본 | ID로 작업 조회 |
| `create` | 관리자 🔒 | 백업 작업 생성 |
| `update` | 관리자 🔒 | 백업 작업 업데이트 |
| `delete` | 관리자 🔒 | 백업 작업 삭제 |

---

#### `proxmox_cluster_replication_job`
클러스터 복제 작업을 관리합니다. action=list: 작업 목록 | action=get: ID로 작업 조회 | action=create: 작업 생성 (관리자) | action=update: 작업 업데이트 (관리자) | action=delete: 작업 삭제 (관리자)

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | 복제 작업 목록 |
| `get` | 기본 | ID로 작업 조회 |
| `create` | 관리자 🔒 | 복제 작업 생성 |
| `update` | 관리자 🔒 | 복제 작업 업데이트 |
| `delete` | 관리자 🔒 | 복제 작업 삭제 |

---

#### `proxmox_cluster_config`
클러스터 설정을 관리합니다. action=get: 설정 조회 | action=list_nodes: 설정 노드 목록 | action=get_node: 노드 설정 조회 | action=join: 클러스터 참여 (관리자) | action=totem: totem 설정 조회

| Action | 권한 | 설명 |
|--------|------|------|
| `get` | 기본 | 클러스터 설정 조회 |
| `list_nodes` | 기본 | 설정 노드 목록 |
| `get_node` | 기본 | 노드 설정 조회 |
| `join` | 관리자 🔒 | 클러스터 참여 |
| `totem` | 기본 | totem 설정 조회 |

---

### SDN 네트워킹 (4개)

#### `proxmox_sdn_vnet`
SDN 가상 네트워크를 관리합니다 (list, get, create, update, delete)

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | VNet 목록 |
| `get` | 기본 | VNet 상세 조회 |
| `create` | 관리자 🔒 | VNet 생성 |
| `update` | 관리자 🔒 | VNet 업데이트 |
| `delete` | 관리자 🔒 | VNet 삭제 |

---

#### `proxmox_sdn_zone`
SDN 존을 관리합니다 (list, get, create, update, delete)

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | 존 목록 |
| `get` | 기본 | 존 상세 조회 |
| `create` | 관리자 🔒 | 존 생성 |
| `update` | 관리자 🔒 | 존 업데이트 |
| `delete` | 관리자 🔒 | 존 삭제 |

---

#### `proxmox_sdn_controller`
SDN 컨트롤러를 관리합니다 (list, get, create, update, delete)

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | 컨트롤러 목록 |
| `get` | 기본 | 컨트롤러 상세 조회 |
| `create` | 관리자 🔒 | 컨트롤러 생성 |
| `update` | 관리자 🔒 | 컨트롤러 업데이트 |
| `delete` | 관리자 🔒 | 컨트롤러 삭제 |

---

#### `proxmox_sdn_subnet`
SDN 서브넷을 관리합니다 (list, get, create, update, delete)

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | 서브넷 목록 |
| `get` | 기본 | 서브넷 상세 조회 |
| `create` | 관리자 🔒 | 서브넷 생성 |
| `update` | 관리자 🔒 | 서브넷 업데이트 |
| `delete` | 관리자 🔒 | 서브넷 삭제 |

---

### 접근 제어 (6개)

#### `proxmox_user`
Proxmox 사용자를 관리합니다 (list, get, create, update, delete)

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | 사용자 목록 |
| `get` | 기본 | 사용자 상세 조회 |
| `create` | 관리자 🔒 | 사용자 생성 |
| `update` | 관리자 🔒 | 사용자 업데이트 |
| `delete` | 관리자 🔒 | 사용자 삭제 |

---

#### `proxmox_group`
Proxmox 그룹을 관리합니다 (list, create, update, delete)

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | 그룹 목록 |
| `create` | 관리자 🔒 | 그룹 생성 |
| `update` | 관리자 🔒 | 그룹 업데이트 |
| `delete` | 관리자 🔒 | 그룹 삭제 |

---

#### `proxmox_role`
Proxmox 역할을 관리합니다 (list, create, update, delete)

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | 역할 목록 |
| `create` | 관리자 🔒 | 역할 생성 |
| `update` | 관리자 🔒 | 역할 업데이트 |
| `delete` | 관리자 🔒 | 역할 삭제 |

---

#### `proxmox_acl`
ACL 항목을 관리합니다 (get, update)

| Action | 권한 | 설명 |
|--------|------|------|
| `get` | 기본 | ACL 항목 조회 |
| `update` | 관리자 🔒 | ACL 항목 업데이트 |

---

#### `proxmox_domain`
인증 도메인을 관리합니다 (list, get, create, update, delete)

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | 도메인 목록 |
| `get` | 기본 | 도메인 상세 조회 |
| `create` | 관리자 🔒 | 도메인 생성 |
| `update` | 관리자 🔒 | 도메인 업데이트 |
| `delete` | 관리자 🔒 | 도메인 삭제 |

---

#### `proxmox_user_token`
사용자 API 토큰을 관리합니다 (list, get, create, update, delete)

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | 토큰 목록 |
| `get` | 기본 | 토큰 상세 조회 |
| `create` | 관리자 🔒 | 토큰 생성 |
| `update` | 관리자 🔒 | 토큰 업데이트 |
| `delete` | 관리자 🔒 | 토큰 삭제 |

---

### 풀 관리 (1개)

#### `proxmox_pool`
리소스 풀을 관리합니다 (list, get, create, update, delete)

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | 풀 목록 |
| `get` | 기본 | 풀 상세 조회 |
| `create` | 관리자 🔒 | 풀 생성 |
| `update` | 관리자 🔒 | 풀 업데이트 |
| `delete` | 관리자 🔒 | 풀 삭제 |

---

### 게스트 방화벽 (1개)

#### `proxmox_guest_firewall_rule`
게스트별 방화벽 규칙을 관리합니다. action=list|get: 규칙 조회 | action=create|update|delete: 규칙 관리 (관리자). type=vm|lxc. 방화벽 동작에 rule_action (ACCEPT/REJECT/DROP), 방향에 rule_type (in/out/group) 사용.

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | 게스트 방화벽 규칙 목록 |
| `get` | 기본 | 위치로 규칙 조회 |
| `create` | 관리자 🔒 | 방화벽 규칙 생성 |
| `update` | 관리자 🔒 | 방화벽 규칙 업데이트 |
| `delete` | 관리자 🔒 | 방화벽 규칙 삭제 |

---

### 스냅샷 & 백업 (2개)

#### `proxmox_guest_snapshot` 🔒
VM 및 LXC 컨테이너의 게스트 스냅샷을 관리합니다 (create, list, rollback, delete) (관리자 권한 필요)

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 관리자 🔒 | 스냅샷 목록 |
| `create` | 관리자 🔒 | 스냅샷 생성 |
| `rollback` | 관리자 🔒 | 스냅샷으로 롤백 |
| `delete` | 관리자 🔒 | 스냅샷 삭제 |

---

#### `proxmox_backup` 🔒
VM 및 LXC 컨테이너의 게스트 백업을 관리합니다 (create, list, restore, delete) (관리자 권한 필요)

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 관리자 🔒 | 백업 목록 |
| `create` | 관리자 🔒 | 백업 생성 |
| `restore` | 관리자 🔒 | 백업에서 복원 |
| `delete` | 관리자 🔒 | 백업 삭제 |

---

### 디스크 & 네트워크 (7개)

#### `proxmox_vm_disk`
VM 디스크를 관리합니다. action=add: 디스크 추가 | action=remove: 디스크 제거 (모두 관리자)

| Action | 권한 | 설명 |
|--------|------|------|
| `add` | 관리자 🔒 | VM에 디스크 추가 |
| `remove` | 관리자 🔒 | VM에서 디스크 제거 |

---

#### `proxmox_lxc_mountpoint`
LXC 마운트 포인트를 관리합니다. action=add: 마운트 포인트 추가 | action=remove: 마운트 포인트 제거 (모두 관리자)

| Action | 권한 | 설명 |
|--------|------|------|
| `add` | 관리자 🔒 | 마운트 포인트 추가 |
| `remove` | 관리자 🔒 | 마운트 포인트 제거 |

---

#### `proxmox_guest_disk_resize` 🔒
VM (type=vm) 또는 LXC 컨테이너 (type=lxc)의 게스트 스토리지를 리사이즈합니다 (관리자 권한 필요)

---

#### `proxmox_guest_disk_move` 🔒
VM (type=vm) 또는 LXC 컨테이너 (type=lxc)의 게스트 스토리지를 이동합니다 (관리자 권한 필요)

---

#### `proxmox_guest_network` 🔒
게스트 네트워크 인터페이스를 관리합니다. action=add|update|remove, type=vm|lxc (관리자 권한 필요)

| Action | 권한 | 설명 |
|--------|------|------|
| `add` | 관리자 🔒 | 네트워크 인터페이스 추가 |
| `update` | 관리자 🔒 | 네트워크 인터페이스 업데이트 |
| `remove` | 관리자 🔒 | 네트워크 인터페이스 제거 |

---

#### `proxmox_node_disk`
노드 디스크 정보를 조회합니다. action=list|smart|lvm|zfs|lvmthin|directory

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | 노드 디스크 목록 |
| `smart` | 기본 | SMART 데이터 조회 |
| `lvm` | 기본 | LVM 볼륨 목록 |
| `zfs` | 기본 | ZFS 풀 목록 |
| `lvmthin` | 기본 | LVM-thin 풀 목록 |
| `directory` | 기본 | 디렉토리 스토리지 목록 |

---

#### `proxmox_node_disk_admin` 🔒
파괴적 디스크 작업. action=init_gpt: GPT 초기화 | action=wipe: 디스크 와이프 (모두 관리자)

| Action | 권한 | 설명 |
|--------|------|------|
| `init_gpt` | 관리자 🔒 | 디스크에 GPT 초기화 |
| `wipe` | 관리자 🔒 | 디스크 와이프 |

---

### LXC 실행 (1개)

#### `proxmox_lxc_exec` 🔒
SSH를 통해 Proxmox 호스트에 접속하여 `pct exec`로 LXC 컨테이너 내부에서 명령을 실행합니다. 이중 옵트인 필요: `PROXMOX_ALLOW_ELEVATED=true`와 `PROXMOX_SSH_ENABLED=true` 모두 설정해야 합니다.

**권한**: 관리자 🔒 (이중 옵트인)

| 매개변수 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `node` | string | 예 | Proxmox 노드명 (`PROXMOX_SSH_NODE`과 일치해야 함) |
| `vmid` | number | 예 | LXC 컨테이너 ID (100-999999999) |
| `command` | string | 예 | 컨테이너 내부에서 실행할 명령 |
| `timeout` | number | 아니오 | 타임아웃 초 단위 (기본: 30, 최대: 120) |

**보안**:
- SSH 키 인증만 지원 (비밀번호 불가)
- 위험 문자 차단 (`;`, `|`, `` ` ``, `$()`, `>>` 등)
- 명령은 셸 이스케이프 후 `/usr/sbin/pct exec {vmid} -- /bin/sh -c '{command}'`로 실행
- 노드명은 설정된 `PROXMOX_SSH_NODE`과 일치해야 함
- 출력 64KB 제한
- `PROXMOX_SSH_HOST_KEY_FINGERPRINT`를 통한 호스트 키 지문 검증 (선택)

**필수 환경 변수**:
```bash
PROXMOX_ALLOW_ELEVATED=true
PROXMOX_SSH_ENABLED=true
PROXMOX_SSH_KEY_PATH=/path/to/ssh/key
PROXMOX_SSH_NODE=pve1
```

---

### 콘솔 접근 (3개)

#### `proxmox_console_vnc` 🔒
VM (type=vm) 또는 LXC 컨테이너 (type=lxc)의 VNC 프록시 티켓을 가져옵니다 (관리자 권한 필요)

---

#### `proxmox_console_term` 🔒
VM (type=vm) 또는 LXC 컨테이너 (type=lxc)의 터미널 프록시 티켓을 가져옵니다 (관리자 권한 필요)

---

#### `proxmox_console_spice` 🔒
QEMU VM의 SPICE 프록시 티켓을 가져옵니다 (관리자 권한 필요)

---

### Cloud-Init, 인증서 & ACME (5개)

#### `proxmox_cloudinit`
QEMU VM의 cloud-init을 관리합니다. action=get: 설정 목록 | action=dump: 렌더링된 설정 덤프 (dump_type=user|network|meta) | action=regenerate: 드라이브 재생성 (관리자 필요)

| Action | 권한 | 설명 |
|--------|------|------|
| `get` | 기본 | cloud-init 설정 목록 |
| `dump` | 기본 | 렌더링된 설정 덤프 |
| `regenerate` | 관리자 🔒 | cloud-init 드라이브 재생성 |

---

#### `proxmox_certificate`
노드 SSL 인증서를 관리합니다. action=list: 인증서 조회 | action=upload: 사용자 정의 인증서 업로드 (관리자 필요) | action=delete: 사용자 정의 인증서 삭제 (관리자 필요)

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | 인증서 조회 |
| `upload` | 관리자 🔒 | 사용자 정의 인증서 업로드 |
| `delete` | 관리자 🔒 | 사용자 정의 인증서 삭제 |

---

#### `proxmox_acme_cert`
ACME 인증서를 관리합니다. action=order|renew|revoke: 인증서 작업 (관리자 필요) | action=config: ACME 설정 조회

| Action | 권한 | 설명 |
|--------|------|------|
| `config` | 기본 | ACME 설정 조회 |
| `order` | 관리자 🔒 | ACME 인증서 주문 |
| `renew` | 관리자 🔒 | ACME 인증서 갱신 |
| `revoke` | 관리자 🔒 | ACME 인증서 폐기 |

---

#### `proxmox_acme_account`
ACME 계정을 관리합니다. action=list|get: 계정 조회 | action=create|update|delete: 계정 관리 (관리자 필요)

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | ACME 계정 목록 |
| `get` | 기본 | 계정 상세 조회 |
| `create` | 관리자 🔒 | ACME 계정 생성 |
| `update` | 관리자 🔒 | ACME 계정 업데이트 |
| `delete` | 관리자 🔒 | ACME 계정 삭제 |

---

#### `proxmox_acme_info`
ACME 정보를 조회합니다. action=list_plugins|get_plugin|directories

| Action | 권한 | 설명 |
|--------|------|------|
| `list_plugins` | 기본 | ACME 플러그인 목록 |
| `get_plugin` | 기본 | 플러그인 상세 조회 |
| `directories` | 기본 | ACME 디렉토리 목록 |

---

### 알림 (1개)

#### `proxmox_notification`
알림 대상을 관리합니다. action=list|get: 대상 조회 | action=create|delete|test: 대상 관리 (관리자 필요)

| Action | 권한 | 설명 |
|--------|------|------|
| `list` | 기본 | 알림 대상 목록 |
| `get` | 기본 | 대상 상세 조회 |
| `create` | 관리자 🔒 | 알림 대상 생성 |
| `delete` | 관리자 🔒 | 알림 대상 삭제 |
| `test` | 관리자 🔒 | 알림 대상 테스트 |

---

**범례**: 🔒 = 관리자 권한 필요 (`PROXMOX_ALLOW_ELEVATED=true`)
