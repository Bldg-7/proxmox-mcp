# 4단계 ④: 전송 작업 관리 (내부 API)

①~③ 기준 커밋: `73cba42`. 이번 변경은 `src/transfers/job-service.ts`의 `TransferJobs`를 추가한다. 공개 MCP 도구나 환경 변수에 연결하지 않았으며 서버 시작 시 DB를 열거나 파일을 전송하지 않는다.

## 사용 계약

- `open(policy, transport)`는 기존 활성화·elevated 정책을 먼저 확인하고 전용 `journalRoot`(별도 0700 디렉터리)에서 이전 작업을 복구한다. 서비스 인스턴스당 하나의 로컬 파일 전송만 실행한다. operator는 MCP 인스턴스/클러스터/인증 주체별로 디렉터리를 분리해야 한다.
- `start(input)`은 정규화된 입력 digest 및 준비 상태를 커밋하고 즉시 로컬 UUID를 반환한다. 같은 client request UUID + 같은 입력은 기존 상태를 반환한다. 다른 입력이면 충돌 오류. 실행 중 새 요청은 대기열에 넣지 않고 거부한다. 시작 직후 원래 MCP 요청이 끝나는 것과 무관한 작업 전용 AbortController를 사용한다.
- `status(localId)`는 상태와 확인된 결과만 반환한다. 업로드의 `submitted` 및 UPID는 PVE 작업 **접수**이지 원격 성공이 아니다. 원격 상태는 별도 node task 조회가 필요하다. 다운로드는 `received`인 경우에만 상대 파일명·크기·수신 digest·검증 수준을 반환한다.
- `cancel(localId)`는 진행 중인 로컬 작업과 stream을 중단하고 정리 후 상태를 반환한다. 원격 worker 중단을 약속하지 않는다. 종결된 작업은 변하지 않는다. `close()`는 신규 요청을 막고 진행 작업에 중단을 알린 뒤 정리·저널 종료를 기다린다. 전송 전체 deadline 기본값은 30분이다. 공급하는 transport는 AbortSignal을 준수해야 한다.
- 실패 사유는 짧은 코드로만 기록한다. 파일 바이트, token, raw exception, 임의 입력 객체는 저널에 저장하지 않는다. 원격 파일명·UPID·digest 등 메타데이터 자체도 민감할 수 있어 전용 private 디렉터리가 필요하다.

## 저널과 재시작

Node 24 내장 `node:sqlite`로 `jobs.sqlite`를 사용한다(실행 환경에 따라 experimental 경고가 날 수 있음). 별도 패키지는 추가하지 않았다. exclusive locking mode와 committed transaction을 결합해 중간 상태를 영속화하면서 다른 프로세스가 살아 있는 작업을 복구 대상으로 오인하지 않게 한다. journal은 원래 managed 디렉터리의 디바이스/inode에 묶인다. journalRoot는 payload quota와 분리되며 1,000개 기록을 넘으면 자동 eviction 없이 신규 작업을 거부한다. 운영 중 DB 삭제·편집·이동, 네트워크 파일시스템, 비신뢰 동일 UID writer는 지원하지 않는다.

| 마지막 체크포인트 | 재시작 후 상태 |
|---|---|
| 네트워크 호출 전 `preparing` | `interrupted` |
| 업로드 `transferring`, 저장된 UPID 없음 | `remote_outcome_unknown` — 실제 전송 직전 기록하기 때문에 보수적 판정 |
| 업로드 UPID 저장됨 | `submitted` |
| 다운로드 쓰기 중 | `interrupted` |
| 다운로드 게시 직전 intent 저장됨 | 기존 final의 ID·파일 신원(dev/inode)·크기·SHA-256이 일치할 때만 `received`, 아니면 `interrupted` |

재시작 시 자동 재전송이나 재개는 없다. 작업 UUID가 정확히 기록된 `.transfer.lock`에 대해서만 그 작업의 partial/snapshot과 잠금을 정리한다. 다른 작업의 잠금, owner 기록 전에 죽어 남은 빈 잠금 등은 건드리지 않는다. 관련 없는 파일·완성 파일은 자동 삭제하지 않는다. 이 경로는 로컬 **프로세스 종료**에 대한 복구이며, 전원 장애·손상된 디스크에서 데이터 보존을 보장하지 않는다. 저널이 쓰기 불가능해진 작업에서는 이후 사용을 차단하고 재개방 시 마지막 영속 체크포인트부터 판정한다.

## 검증 및 다음 경계

- `src/transfers/job-service.test.ts`: 전송 모의 객체 + 실제 디렉터리/SQLite. 중복·충돌, 실행 중 busy, 상태/취소/timeout/종료, 결과 영속성, 크래시 체크포인트, 파일 보존, 저널 용량 제한 등을 검사한다.
- 별도 Node 프로세스에서 모의 업로드 중 `SIGKILL` → 다른 프로세스의 동시 open 거부, 종료 후 lease 해제, 동일 요청 replay 방지, `remote_outcome_unknown` 및 소유 잠금 정리를 검증했다. 실제 PVE/PBS에는 연결하지 않았다.
- 전체 테스트 50파일 / 1,251건 통과. typecheck, build, `src/transfers` ESLint, diff 검사 통과.
- 다음 ⑤에서 서버별 서비스 생성 및 close 연결, operator 설정, MCP action별 권한, start/status/cancel 도구와 문서, 원격 이름 충돌 사전 확인을 연결해야 한다. 그 전까지 공개 업로드·다운로드는 비활성이다.
