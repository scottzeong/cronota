# outgrid.net/notebook/ 배포 안내

이 폴더 전체를 outgrid 프로젝트의 `public/notebook/`에 그대로 넣으면 됩니다.
지금 cronota(GitHub Pages)에서 쓰는 화면과 같고, 아래 내용만 서비스용으로 바뀌었습니다.

## 1. 폴더 구성

```
public/notebook/
├─ index.html              앱 전체 (로고 포함)
├─ sw.js                   오프라인용 서비스 워커 (/notebook/ 안에서만 동작)
├─ manifest.webmanifest    홈 화면 앱 설정 (start_url·scope = /notebook/)
├─ icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png
└─ fonts/                  ← 직접 추가
   ├─ WantedSansVariable.woff2
   ├─ MaruBuri-Regular.woff2
   └─ MaruBuri-SemiBold.woff2
```

`fonts/`에는 outgrid가 이미 쓰는 원본 글꼴 파일을 복사해 넣으면 됩니다(빌드 후 이름이 바뀌는 `_next/static/media/...` 파일 말고 원본).
파일이 없어도 공개 CDN(jsDelivr, 네이버 한글한글 아름답게)에서 불러오므로 화면은 깨지지 않습니다.
fonts/를 넣은 뒤에는 `index.html` 위쪽의 CDN `<link>` 두 줄을 지워도 됩니다.

## 2. index.html에서 채울 값 (스크립트 맨 위)

```js
const GD_CLIENT_ID = '';          // 아래 3번에서 만든 OAuth 클라이언트 ID
const PRIVACY_URL = '/privacy';   // 설정 화면 맨 아래 "개인정보 처리방침" 링크
```

- `GD_CLIENT_ID`를 넣으면 설정에서 클라이언트 ID 입력칸과 리디렉션 URI 안내가 사라지고, 사용자는 "구글로 연결"만 누르면 됩니다.
- 비워 두면 지금처럼 각자 클라이언트 ID를 넣는 방식으로 동작합니다.

## 3. Google Cloud 쪽에서 할 일

1. **OAuth 클라이언트 (웹 애플리케이션)**
   - 승인된 JavaScript 원본: `https://outgrid.net`
   - 승인된 리디렉션 URI: `https://outgrid.net/notebook/` (끝의 `/`까지 정확히)
   - 지금 cronota에 쓰는 클라이언트(같은 Cloud 프로젝트)에 위 두 줄을 추가하는 것을 권합니다. 드라이브의 앱 전용 폴더는 Cloud 프로젝트별로 나뉘므로, 같은 프로젝트를 쓰면 기존 노트가 outgrid에서도 그대로 동기화됩니다.
2. **OAuth 동의 화면 (브랜딩)**
   - 앱 이름, 지원 이메일, 홈페이지 `https://outgrid.net`, 개인정보처리방침 `https://outgrid.net/privacy`
   - 승인된 도메인: `outgrid.net` (Search Console에서 도메인 소유 확인 필요)
   - 범위: `.../auth/drive.appdata` 하나
3. **게시 상태**: "테스트" 상태에서는 등록한 테스트 사용자만 로그인할 수 있습니다. 공개하려면 "프로덕션으로 게시"로 바꾸세요. `drive.appdata`는 민감하지 않은 범위라 별도 보안 심사는 필요 없고, 브랜딩(앱 이름·로고) 확인만 거칠 수 있습니다.

## 4. outgrid 사이트 쪽에서 확인할 것

- `https://outgrid.net/notebook/` 주소가 `index.html`을 보여 주는지 확인하세요. 프레임워크에 따라 폴더 주소에서 index.html을 자동으로 열지 않을 수 있습니다. 404가 나면 `/notebook/` → `/notebook/index.html` 리라이트를 추가해 주세요.
- `/notebook`(끝 슬래시 없음)으로 들어오면 앱이 스스로 `/notebook/`으로 옮겨 갑니다.
- 지금 outgrid는 CSP 헤더가 없어 그대로 동작합니다. 나중에 CSP를 넣는다면 이 페이지에는 인라인 스크립트·스타일, `cdn.jsdelivr.net`·`hangeul.pstatic.net`(글꼴), `www.googleapis.com`·`oauth2.googleapis.com`(드라이브), `generativelanguage.googleapis.com`(AI), `accounts.google.com`(로그인 이동)을 허용해야 합니다.

## 5. 개인정보 처리방침에 넣을 내용 (요점)

- 노트(손글씨 선, 태그, 검색어)는 사용자의 브라우저(IndexedDB/localStorage)에 저장되며 outgrid 서버로 전송되지 않습니다.
- 구글 드라이브 동기화를 켜면 사용자 본인 드라이브의 앱 전용 숨김 폴더에 `cronota-notes.json` 한 파일로 저장됩니다. 앱은 이 폴더 밖의 파일을 볼 수 없습니다. 로그인 토큰은 1시간짜리이며 브라우저에만 보관됩니다.
- AI 손글씨 인식은 사용자가 자기 Gemini API 키를 넣었을 때만 동작하고, 그때 손글씨 이미지가 Google(Gemini API)로 직접 전송됩니다. 키는 브라우저에만 저장됩니다.
- 글꼴을 CDN에서 불러오는 동안에는 jsDelivr, 네이버에 접속 기록이 남을 수 있습니다(fonts/를 넣으면 사라짐).

## 6. 이번에 바뀐 점 (cronota 대비)

- **드라이브 권한**: `drive.appdata`를 그대로 유지했습니다. `drive.file`과 같은 "민감하지 않은 범위"이면서, 앱 전용 숨김 폴더만 볼 수 있어 더 좁습니다. `drive.file`로 바꾸면 노트 파일이 사용자 드라이브에 보이게 되는 대신(직접 지우거나 옮길 수 있음), 사용자가 실수로 지우거나 옮기면 동기화가 끊길 수 있습니다.
- **동기화 충돌 처리 강화**
  - 내려받은 뒤 올리기 직전에 파일 버전을 다시 확인해서, 그 사이 다른 기기가 올린 내용이 있으면 덮어쓰지 않고 다시 합칩니다(최대 3번).
  - 두 기기가 같은 노트의 글씨를 각각 고쳤으면, 최신 것을 남기고 다른 쪽은 사본으로 바로 옆에 남깁니다. 이때 "노트 n개를 사본으로 남겼어요" 알림이 뜹니다.
  - 두 기기가 동시에 처음 연결해 노트 파일이 두 개 생기면, 하나로 합치고 나머지는 지웁니다.
- **서비스 워커**: 캐시 이름을 `outgrid-notebook-*`로 바꾸고, 자기 캐시만 지우며 `/notebook/` 안의 파일만 저장합니다. outgrid의 다른 페이지에는 영향이 없습니다.
- **매니페스트**: `id`·`start_url`·`scope`를 `/notebook/`으로 고정, 이름은 "cronota · 아웃그리드 손글씨 노트".
- **리디렉션 URI**: `/notebook/index.html`로 열어도 `https://outgrid.net/notebook/`으로 맞춰 보냅니다.
- **AI 키 안내 문구**: "각자 발급받은 키를 넣고, 이 브라우저에만 저장되며 Google에만 직접 전송되고 아웃그리드 서버로는 보내지지 않는다. 공용 PC에서는 넣지 말라"로 보강(4개 언어).
- **설정 맨 아래 개인정보 처리방침 링크** 추가.
- **제목·설명 메타 태그** 추가.

## 7. 기존 사용자 노트 옮기기

outgrid.net은 github.io와 다른 주소라 브라우저 저장소가 따로입니다. 기존 노트는 다음 중 하나로 옮기세요.
- 같은 Cloud 프로젝트의 클라이언트로 드라이브 동기화를 켜기 (권장, 자동)
- cronota에서 설정 → 백업 내보내기 → outgrid에서 백업 가져오기
