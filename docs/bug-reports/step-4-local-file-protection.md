# 4단계 ③: 로컬 파일 보호 계층

`src/transfers/local-files.ts`의 `LocalTransferFiles`는 네트워크나 MCP와 독립적인 내부 모듈이다. `create()`는 운영자 설정의 `enabled === true`와 `allowElevated === true`를 **파일 접근 전에** 확인한다. 아직 환경 변수·공개 도구에 연결하지 않았다. 서비스 디렉터리나 파일을 설치 시 자동으로 만들지 않는다.

- `withSnapshot(basename, signal, consumer, expectedSha256?)`: 업로드 승인 디렉터리 바로 아래의 ASCII basename만 허용한다. 심볼릭 링크·하드 링크·디렉터리·FIFO·장치 파일을 거부하고, 열린 FD와 사전 확인한 파일의 신원을 대조한다. 열린 FD에서 private snapshot으로 스트리밍하며 크기·SHA-256을 계산하고 복사 전후 크기·mtime·ctime을 확인한다. POSIX에서 snapshot 이름을 생성 직후 unlink해 consumer에는 열린 FD의 바이트 스트림만 제공한다. consumer의 Promise가 끝날 때 FD와 잠금을 해제한다. consumer는 범위 안에서만 스트림을 사용해야 한다.
- `receive(bytes, signal, expectedSha256?)`: 고유 이름의 0600 partial 파일에 스트리밍하고, 매 chunk 쓰기 전에 개별 크기·가용 quota를 확인한다. 수신 종료·선택적 checksum 비교·fsync·close 이후 hard link로 같은 디렉터리에 `<uuid>.bin`을 게시한다. final이 이미 있거나 link를 지원하지 않으면 덮어쓸 수 있는 rename으로 대체하지 않는다. 내용은 해제하거나 실행하지 않으며 상대 이름·크기·digest·검증 수준만 반환한다. 독립적인 기대 digest가 없을 때 `received`는 원본과 일치함을 뜻하지 않는다.
- 취소할 때는 같은 AbortSignal을 HTTP source/consumer에도 전달해야 한다. 파일 계층은 chunk 사이와 publish 직전의 취소를 검사한다. 이미 수행 중인 OS 쓰기나 입력 제너레이터의 임의 대기 작업을 강제로 중단하는 것은 아니다. publish가 완료된 이후에는 산출물을 지우지 않는다.

## 경계와 운영 조건

1. POSIX Linux/macOS의 로컬 파일시스템을 전제로 한다. 서비스 UID 소유의 전용 0700 디렉터리가 필요하다. canonical 절대 경로를 지정하고 symlink 경로를 사용하지 않는다. 업로드 root와 managed root는 서로 겹치지 않아야 한다. 부모는 root 또는 서비스 사용자 소유이고, 타 사용자 쓰기를 허용하는 경우 sticky 디렉터리여야 한다. 파일시스템 ACL·공유 볼륨·동일 UID의 비신뢰 프로세스까지 격리하는 sandbox는 아니다. 필요하면 전용 사용자 또는 컨테이너로 격리한다.
2. managed root는 이 서비스 전용이며 작업 중 다른 writer나 관리자가 내용을 추가/변경하지 않아야 한다. 독립된 인스턴스도 `.transfer.lock`의 exclusive 생성으로 동시에 쓸 수 없다. 매 작업 시작 시 기존 일반 파일(이전 산출물 및 잔여 partial 포함)의 논리 바이트를 다시 합산한다. 파일 하나 기본 2 GiB, 관리 저장량 기본 4 GiB. 디렉터리에 예상치 않은 비정규 파일이나 항목 1,000개 이상이 있으면 새 작업을 거부한다. 실제 파일시스템 여유 공간을 보장하지 않으며 ENOSPC는 실패로 처리한다.
3. 정상 종료·예외·취소 시 자신이 만든 임시 파일과 lock만 정리한다. **프로세스 강제 종료 뒤 lock/partial이 남으면 자동 삭제·재시도하지 않는다.** 모든 writer가 종료된 사실을 확인한 운영자만 잔여 파일을 조사·정리한다. 완성 산출물을 자동 삭제하지 않는다. 작업 journal과 재시작 복구는 다음 단계다.

## 테스트

`pnpm exec vitest run src/transfers/local-files.test.ts`는 임시 디렉터리만 사용한다. 접근 차단, root 변경·중첩, 특수파일 거부, source 변경, snapshot 분리, hash, 파일 모드, unknown-length quota 초과, ENOSPC, 충돌 시 기존 파일 보존, 취소·실패 정리, 복수 인스턴스의 잠금과 stale lock 정책을 검증한다. 실제 PVE/PBS 전송 여부를 검증하는 테스트가 아니다.
