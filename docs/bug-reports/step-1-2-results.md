# 1~2단계 구현 결과

대상: `2026-11-15-architecture-audit.md`의 기능 복구 범위. 감사 문서와 evidence의 결함 재현은 수정 전 `b9536fe` 기준의 기록이며, 현재 동작 검증에는 아래 정식 회귀 테스트를 사용한다.

## 구현 내용

- Task: API 토큰 UPID의 `!` 허용, URL path 인코딩, `/status` 조회. list 기본 `source=all`; source/limit/vmid/typefilter 노출.
- Agent exec: executable와 args를 argv 배열로 변환. 빈 stdin을 보존하고 PVE에 지원하지 않는 옵션을 전송하지 않음.
- APT: PVE의 대문자 필드 처리, package는 로컬 대소문자 무시 부분 문자열 필터. 실행 커널/manager 버전 출력.
- Pending: VM/LXC에서 실제 pending 또는 delete=1/2만 집계. 현재/대기 값과 삭제 상태 출력. 0/false/빈 문자열 pending 보존.
- Storage: cluster_usage의 node를 선택 입력으로 변경. 노드별 동일 이름 저장소 보존. 공유 스토리지도 노드별 결과이며 물리 용량 합산 아님.
- Metrics: CPU는 cpu 필드 사용. CPU/메모리/IO/uptime/스토리지 사용량의 0값 표시.
- Ping: 빈 성공 응답은 pong, 비어 있지 않은 부가 객체는 JSON으로 출력.
- 영문/한글 도구 문서와 공개 도구 설명 갱신.

## Exec 호환성 정책

- command는 실행 파일 이름/경로이며 자동 shell 분리 없음.
- args는 개별 인자 배열. PID 반환 후 operation=status로 결과 조회.
- capture-output=true: deprecated 호환 입력으로 허용. PVE에는 보내지 않음.
- capture-output=false 또는 timeout 지정: 실행 전에 명확한 미지원 오류 반환. 자동 폴링은 이번 범위에서 구현하지 않음.

## 검증

- 신규 `src/tools/__tests__/live-cluster-regressions.test.ts`: 24건.
- `src/validators/index.test.ts`: 토큰 UPID 1건 추가.
- 기존 테스트의 잘못된 APT 응답·task 경로·pending fixture·스토리지 중복 제거 기대값을 실제 계약에 맞게 수정.
- exec와 task status는 실제 ProxmoxApiClient를 사용하되 fetch를 mock하여 HTTP URL/메서드/form body/인증 헤더를 확인.
- `pnpm typecheck`: 통과.
- `pnpm build`: 통과.
- `pnpm test`: 44파일 / 1,167테스트 통과 (기존 1,142 대비 25건 증가).
- `pnpm lint`: 기존 274오류 유지, 경고 0. 전체 lint 부채 정리는 수행하지 않음.
- 신규 회귀 테스트 및 이번 변경의 schema/validator/vm-query 파일 대상 ESLint: 통과.
- 변경한 주요 handler에 LSP 오류 없음.
- `git diff --check`: 통과.

실제 PVE·SSH 접속 및 인프라 변경은 없었다. HTTP mock 테스트 통과가 PVE 8/9 실제 서버와의 최종 호환성 검증을 대신하지 않는다.

## 범위 밖

SSH fingerprint/미설정 정책, 민감정보 마스킹, 업로드/복원 전송, 중앙 권한 정책, 스키마 평탄화, 클러스터 부분 장애 처리, 전반적인 리팩터링 및 CI/lint 정리는 후속 단계로 남겨 둔다. 사용자의 기존 `.sisyphus/boulder.json` 변경은 보존했다.
