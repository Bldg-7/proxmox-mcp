# 3단계: SSH 검증 및 진단 정보 보호

1~2단계 변경은 `a3eea7d` (`fix: align core tools with Proxmox API contracts`)로 커밋했다. 사용자의 기존 `.sisyphus/boulder.json`과 원본 실클러스터 리포트는 커밋에서 제외했다.

## 구현

### SSH 신뢰 정책

- ssh2가 전달하는 원시 공개키 Buffer의 SHA-256 digest를 계산해 fingerprint와 비교한다.
- 지원 형식: 패딩 없는 OpenSSH `SHA256:<base64>` 또는 64자리 SHA-256 hex(대소문자 허용).
- 비교는 `timingSafeEqual` 사용. 형식 오류·불일치 거부.
- SSH 활성화 시 fingerprint 필수. 검증 생략은 `PROXMOX_SSH_ALLOW_INSECURE=true`라는 명시적인 opt-in만 허용하며 경고 로그를 남긴다.
- fingerprint가 지정되어 있으면 insecure 설정이 있어도 검증한다.
- 환경 설정 로딩과 SshClient 생성 시 정책을 검사한다.
- singleton client가 다른 호스트/지문/신뢰 정책으로 조용히 재사용되지 않도록 구성 변경 시 거부한다. 명시적으로 기존 client를 종료한 뒤 새 설정으로 생성해야 한다.
- 연결 실패 시 idle timer 정리.

### 진단 report·오류·로그

- 노드 report는 이제 elevated 권한 필요. 미허용 시 API 호출 전에 거부한다.
- report를 마스킹한 뒤 최대 16,000자로 제한하며 닫는 코드 블록과 잘림 표시를 유지한다.
- API 오류는 로그에 기록하거나 예외로 전달하기 전에 마스킹한다. 설정된 API 토큰 값은 이름표 없는 문자열에 나타나도 제거한다.
- 일반 tool 오류 formatter와 MCP dispatch의 검증 오류·예외·isError 응답에도 마스킹 및 4,096자 제한을 적용한다.
- JSON 파싱 오류에 upstream 본문 일부가 실리지 않도록 일반적인 오류 메시지를 사용한다.
- pino hook에서 중첩 credential 필드, Error 메시지/stack, 일반 문자열 및 보간된 로그 메시지를 마스킹한다.
- 패턴: token/password/secret/API key/authorization/cookie/credential, CLI 인자·환경 할당·URL query·JSON 필드, Basic/Bearer/PVE API 토큰, URL userinfo, PEM private key.
- 마스킹은 출력 자르기 전에 수행한다. 의도적인 토큰 생성 등 성공 응답은 전역 마스킹하지 않는다.

## 호환성 변경

- 기존 SSH 사용자는 검증된 fingerprint를 추가해야 한다. 검증되지 않은 네트워크의 ssh-keyscan 결과를 그대로 신뢰하지 말고, 신뢰할 수 있는 노드 콘솔에서 fingerprint를 확인해야 한다.
- 기존 basic 권한의 `proxmox_node_info action=report` 호출은 거부된다.
- 긴 report/오류는 일부만 출력된다. raw 우회 옵션은 추가하지 않았다.
- README와 도구 문서(영문/한글)에 변경과 한계를 안내했다.

## 검증 결과

- 추가 테스트 34개: SSH 11, 진단/로그/MCP 22, 환경 설정 1.
- SSH connect와 HTTP fetch는 mock하며 실 네트워크 연결 없음.
- fingerprint 일치/불일치/잘못된 형식/미설정/명시적 insecure/cache 정책 검증.
- report 권한 거부·마스킹·길이 제한, 실제 pino 출력 및 보간된 메시지, 실제 API client 오류의 로그 인자와 MCP 출력, dispatch 검증 오류의 configured-token 제거 검증.
- `pnpm typecheck`, `pnpm build`: 통과.
- `pnpm test`: 47파일 / 1,201테스트 통과.
- 신규 보안 파일과 변경한 client/config/logger/server/formatter/LXC handler 대상 ESLint 통과.
- 전체 lint: 기존 274오류 유지, 경고 0.
- 주요 변경 파일 LSP diagnostics 및 `git diff --check`: 오류 없음.

## 한계 / 남은 범위

- 마스킹은 best-effort다. 임의의 이름표 없는 비밀, 알려지지 않은 형식, 변형·인코딩된 비밀을 완벽히 제거한다고 보장하지 않는다. elevated report에도 민감 데이터가 남을 수 있다.
- 출력 길이 제한은 LLM/로그로 전달되는 진단 텍스트에 적용한다. HTTP 응답 다운로드 자체의 메모리 제한이나 streaming 구현은 이번 범위가 아니다.
- 단일 문자열 로그 필드는 길이 제한되지만 전체 구조화 로그 이벤트의 총 크기 제한을 보장하지 않는다.
- 실제 SSH handshake/PVE smoke test는 수행하지 않았다.
- 파일 업로드/복원·전송 분리와 전반적 리팩터링은 후속 단계다.
