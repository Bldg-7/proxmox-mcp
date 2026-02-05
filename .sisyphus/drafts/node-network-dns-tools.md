# Draft: Node Network & DNS Query Tools

## API 연구 결과

### 1. GET /nodes/{node}/network
- **목적**: 노드의 네트워크 인터페이스 목록 조회
- **파라미터**: 
  - `node` (필수): 노드명
  - `type` (선택): 필터 - bridge, bond, eth, alias, vlan, OVSBridge 등
- **응답**: 인터페이스 배열 (iface, type, active, address, netmask, gateway, bridge_ports, mtu 등)

### 2. GET /nodes/{node}/dns
- **목적**: 노드의 DNS 설정 조회
- **파라미터**: `node` (필수)
- **응답**: `{ search, dns1, dns2, dns3 }`

### 관련 엔드포인트 (추가 구현 가능)
- `GET /nodes/{node}/network/{iface}` - 특정 인터페이스 상세 정보

## 코드베이스 패턴
- 스키마: `src/schemas/node.ts` (Zod)
- 핸들러: `src/tools/node.ts` (async function)
- 테스트: `src/tools/node.test.ts` (vitest + fixtures)
- 레지스트리: `src/tools/registry.ts`

## 결정 필요

### 권한 수준
- [ ] Read-only (elevated 불필요) - 권장
- [ ] Elevated 필요

### 구현 범위
- [ ] proxmox_get_node_network (인터페이스 목록)
- [ ] proxmox_get_node_dns (DNS 설정)
- [ ] proxmox_get_network_interface (특정 인터페이스 상세) - 선택

### 필터링 옵션
- [ ] network에 type 필터 포함 여부

### 테스트 전략
- 기존 인프라: vitest 사용 중
- [ ] TDD
- [ ] Tests-after
