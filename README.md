# Eko-dziki Mobile

 Mobilna aplikacja do monitorowania i optymalizacji zużycia energii, analizy taryf, zarządzania elastycznymi urządzeniami oraz symulacji instalacji fotowoltaicznej i magazynu energii.

**Eko-dziki Mobile** jest frontendem mobilnym projektu Eko-dziki. Aplikacja komunikuje się z backendem Django poprzez REST API i prezentuje użytkownikowi dane dotyczące zużycia energii, kosztów, prognoz, urządzeń oraz instalacji PV.

Aplikacja jest przygotowana jako **Universal App** i może działać na:

*  Android
*  Web

Projekt wykorzystuje **React Native + Expo + TypeScript**.

---

## Najważniejsze funkcje

### Dashboard

Główny ekran prezentuje najważniejsze informacje o aktualnej sytuacji energetycznej domu:

* bieżącą stawkę energii,
* aktualną moc,
* napięcie,
* natężenie prądu,
* współczynnik mocy,
* zużycie z ostatnich 24 godzin,
* szacowany koszt energii,
* dominującą kategorię zużycia,
* ostrzeżenie przed godziną szczytową.

Dostępne są również szybkie przejścia do pozostałych modułów aplikacji.

---

### Inteligentny harmonogram

Ekran harmonogramu pokazuje pełne **24 godziny doby** wraz z informacjami o:

* strefach cenowych,
* aktualnej godzinie,
* najtańszych okresach,
* najdroższych okresach,
* potencjalnie korzystnych godzinach wykorzystania energii z PV.

Dzięki temu użytkownik może łatwiej zdecydować, kiedy uruchomić energochłonne urządzenia.

---

### Urządzenia i przesuwanie zużycia

Moduł urządzeń pozwala analizować pracę energochłonnych urządzeń domowych.

Obsługiwane są m.in.:

* zmywarka,
* pralka,
* suszarka,
* piekarnik,
* ładowanie samochodu elektrycznego.

Dostępny jest również **symulator przesunięcia obciążenia**.

Użytkownik może wybrać:

1. urządzenie,
2. liczbę cykli tygodniowo,
3. aktualną godzinę pracy,
4. docelową godzinę pracy.

Aplikacja oblicza następnie potencjalną oszczędność:

* na pojedynczym cyklu,
* miesięcznie,
* rocznie.

Dostępny jest również dziennik elastycznych zdarzeń urządzeń.

---

### Fotowoltaika i magazyn energii

Moduł PV pozwala sprawdzić, jak zmiana wielkości instalacji fotowoltaicznej wpływa na bilans energetyczny domu.

Obsługiwany zakres mocy instalacji:

```text
2–10 kWp
```

Aplikacja prezentuje m.in.:

* produkcję energii,
* autokonsumpcję,
* eksport energii do sieci,
* roczne oszczędności,
* przewidywany okres zwrotu inwestycji,
* porównanie wariantów instalacji.

Możliwe jest porównanie:

**Wariant A**

```text
PV
 ↓
Dom
 ↓
Sieć
```

z

**Wariantem B**

```text
PV
 ↓
Magazyn energii
 ↓
Dom
 ↓
Sieć
```

---

### Analityka i prognozy

Moduł analityczny prezentuje prognozowane zużycie energii.

Dostępne są trzy horyzonty:

| Horyzont | Okres   |
| -------: | ------- |
|    `24h` | 1 dzień |
|    `72h` | 3 dni   |
|   `168h` | 7 dni   |

Aplikacja prezentuje:

* wykres prognozowanego zużycia,
* przewidywane szczyty zapotrzebowania,
* możliwe przyczyny wzrostu zużycia,
* MAE,
* MAPE,
* podział zużycia na kategorie.

Kategorie obejmują m.in.:

* ogrzewanie,
* duże AGD,
* oświetlenie,
* elektronikę,
* ładowanie EV,
* pozostałe zużycie.

---

### Status połączenia z API

W aplikacji znajduje się stały wskaźnik połączenia z backendem.

Pokazuje on:

* czy API jest dostępne,
* aktualne opóźnienie odpowiedzi,
* konfigurację adresu serwera,
* zamaskowany token autoryzacyjny.

Ułatwia to diagnozowanie problemów z połączeniem podczas pracy developerskiej.

---

# Stack technologiczny

| Technologia                 | Wersja / zastosowanie     |
| --------------------------- | ------------------------- |
| **React Native**            | `0.86.3`                  |
| **Expo**                    | `57.0.x`                  |
| **React**                   | `19.2.3`                  |
| **TypeScript**              | `6.0.x`                   |
| **Expo Router**             | routing aplikacji         |
| **NativeWind**              | stylowanie / Tailwind CSS |
| **Tailwind CSS**            | `3.4.x`                   |
| **React Native Reanimated** | animacje                  |
| **React Native Web**        | wersja webowa             |
| **ESLint**                  | analiza kodu              |

Wersje wynikają bezpośrednio z aktualnego `package.json`.

---

# Struktura projektu
?????
```text
HackoWattMobileApp/
│
├── assets/
│   └── images/
│       ├── icon.png
│       ├── splash-icon.png
│       ├── favicon.png
│       └── ...
│
├── src/
│   │
│   ├── api/
│   │   ├── client.ts
│   │   └── endpoints.ts
│   │
│   ├── app/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── schedule.tsx
│   │   ├── devices.tsx
│   │   ├── solar.tsx
│   │   └── analytics.tsx
│   │
│   ├── components/
│   │   ├── app-tabs.tsx
│   │   ├── app-tabs.web.tsx
│   │   └── ui/
│   │       ├── ApiStatusIndicator.tsx
│   │       ├── Card.tsx
│   │       ├── ErrorStateCard.tsx
│   │       ├── MetricTile.tsx
│   │       ├── SegmentedControl.tsx
│   │       └── StatusBadge.tsx
│   │
│   ├── config/
│   │   └── env.ts
│   │
│   ├── constants/
│   │   └── theme.ts
│   │
│   ├── hooks/
│   │   ├── useApi.ts
│   │   ├── use-color-scheme.ts
│   │   └── use-theme.ts
│   │
│   └── types/
│       └── api.ts
│
├── app.json
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

Projekt korzysta z **file-based routing** Expo Routera — pliki znajdujące się w `src/app/` odpowiadają poszczególnym ekranom aplikacji.

---

# Integracja z backendem

Aplikacja komunikuje się z backendem **HackoWatt Django API** poprzez REST API.

Autoryzacja odbywa się za pomocą:

```http
Authorization: Bearer <TOKEN>
```

## Endpointy

| Endpoint                                | Zastosowanie                      |
| --------------------------------------- | --------------------------------- |
| `GET /api/v1/dashboard/summary/`        | dane głównego dashboardu          |
| `GET /api/v1/smart-schedule/today/`     | harmonogram i taryfy              |
| `GET /api/v1/devices/guidance/`         | informacje o urządzeniach         |
| `GET /api/v1/devices/shift-simulation/` | symulacja przesunięcia obciążenia |
| `GET /api/v1/devices/flexible-events/`  | historia cykli urządzeń           |
| `GET /api/v1/pv/simulate/`              | symulacja PV i magazynu           |
| `GET /api/v1/pv/variants/`              | warianty instalacji PV            |
| `GET /api/v1/consumption/forecast/`     | prognoza zużycia                  |
| `GET /api/v1/consumption/history/`      | historia zużycia                  |
| `GET /api/v1/tariffs/`                  | informacje o taryfach             |
| `GET /api/v1/system/assumptions/`       | założenia modelu                  |
| `GET /api/v1/system/metrics/`           | metryki modelu ML                 |

Klient API i typy odpowiedzi są zorganizowane w:

```text
src/api/
src/types/
```

---

# Konfiguracja

## Wymagania

Przed rozpoczęciem pracy z projektem należy mieć zainstalowane:

* **Node.js 18+**
* **npm / Yarn / Bun**
* **Expo CLI** uruchamiane przez `npx`

Repozytorium używa również Yarn 1.22.22 jako deklarowanego package managera.

---

## Zmienne środowiskowe

Utwórz w katalogu głównym plik:

```text
.env
```

Przykładowa konfiguracja:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_API_TOKEN=your-api-token
```

### `EXPO_PUBLIC_API_URL`

Adres backendu HackoWatt.

Przykłady:

**Web / iOS Simulator:**

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
```

**Urządzenie w tej samej sieci Wi-Fi:**

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000
```

**Android Emulator:**

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000
```

Aplikacja posiada mechanizm automatycznej zamiany `localhost` / `127.0.0.1` na `10.0.2.2` w środowisku Android Emulator.

### `EXPO_PUBLIC_API_TOKEN`

Token wymagany przez backend:

```env
EXPO_PUBLIC_API_TOKEN=your-api-token
```

> Nie commituj prawdziwych tokenów ani sekretów do repozytorium.

Plik `.env` jest już uwzględniony w `.gitignore`.

---

# Uruchomienie

## 1. Sklonuj repozytorium

```bash
git clone https://github.com/allt3rr/HackoWattMobileApp.git
cd HackoWattMobileApp
```

---

## 2. Zainstaluj zależności

```bash
npm install
```

lub:

```bash
yarn install
```

---

## 3. Skonfiguruj `.env`

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_API_TOKEN=your-api-token
```

---

## 4. Uruchom Expo

```bash
npm start
```

lub:

```bash
npx expo start
```

---

# Uruchomienie na Androidzie

Jeżeli masz uruchomiony emulator Android:

```bash
npm run android
```

lub:

```bash
npx expo start --android
```

Backend powinien być dostępny dla emulatora.

Jeżeli backend działa na komputerze pod:

```text
http://localhost:8000
```

Android Emulator powinien korzystać z:

```text
http://10.0.2.2:8000
```

---

# Uruchomienie na iOS

Na macOS z zainstalowanym Xcode:

```bash
npm run ios
```

lub:

```bash
npx expo start --ios
```

---

# Uruchomienie wersji webowej

```bash
npm run web
```

lub:

```bash
npx expo start --web
```

Wersja webowa jest skonfigurowana jako statyczny output Expo.

---

# Expo Go

W trybie developerskim można uruchomić projekt poprzez:

```bash
npx expo start
```

i następnie otworzyć aplikację:

* przez kod QR na Androidzie,
* przez aparat / Expo Go na iOS,
* poprzez emulator Android,
* poprzez iOS Simulator.

---

# Nawigacja

Aplikacja wykorzystuje **Expo Router**.

Główne trasy:

```text
/
├── /schedule
├── /devices
├── /solar
└── /analytics
```

Na urządzeniach mobilnych nawigacja jest prezentowana jako dolny pasek, natomiast na większych ekranach i w wersji webowej wykorzystuje responsywny pasek zakładek.

---

# Komponenty UI

Wspólne elementy interfejsu znajdują się w:

```text
src/components/ui/
```

### `Card`

Podstawowy kontener treści.

### `MetricTile`

Kafelek prezentujący wartość liczbową.

### `StatusBadge`

Wizualne oznaczenie statusu lub strefy taryfowej.

### `SegmentedControl`

Przełącznik pomiędzy wariantami / horyzontami czasowymi.

### `ErrorStateCard`

Jednolity sposób prezentowania błędów API wraz z możliwością ponowienia zapytania.

### `ApiStatusIndicator`

Wskaźnik stanu połączenia z backendem oraz narzędzie diagnostyczne.

---

# Pobieranie danych

Za komunikację z backendem odpowiada:

```text
src/api/client.ts
```

Natomiast endpointy są zdefiniowane w:

```text
src/api/endpoints.ts
```

Warstwa hooków udostępnia:

```text
src/hooks/useApi.ts
```

Dzięki temu ekrany nie muszą bezpośrednio implementować logiki komunikacji HTTP.

Typy odpowiedzi API znajdują się w:

```text
src/types/api.ts
```

Repozytorium korzysta z TypeScript w trybie **strict**.

---

# Kontrola jakości

Przed utworzeniem Pull Requesta zaleca się uruchomienie wszystkich kontroli.

## TypeScript

```bash
npx tsc --noEmit
```

## ESLint

```bash
npm run lint
```

lub:

```bash
npx expo lint
```

## Diagnostyka Expo

```bash
npx expo-doctor
```

## Sprawdzenie buildu webowego

```bash
npx expo export --platform web
```

Te kroki pozwalają wykryć błędy typów, problemy z lintingiem oraz problemy konfiguracyjne Expo.

---

# Przydatne komendy

| Komenda                          | Działanie               |
| -------------------------------- | ----------------------- |
| `npm start`                      | uruchamia Expo          |
| `npm run android`                | uruchamia Android       |
| `npm run ios`                    | uruchamia iOS           |
| `npm run web`                    | uruchamia wersję webową |
| `npm run lint`                   | uruchamia ESLint        |
| `npx tsc --noEmit`               | sprawdza typy           |
| `npx expo-doctor`                | diagnostyka Expo        |
| `npx expo export --platform web` | buduje wersję web       |

Skrypty są zdefiniowane w `package.json`.

---

# Bezpieczeństwo

Nie przechowuj w repozytorium:

```text
.env
API keys
Bearer tokens
certificates
private keys
```

Projekt ma już konfigurację `.gitignore`, która ignoruje m.in.:

```text
.env
.env*.local
*.jks
*.p8
*.p12
*.key
*.pem
```

---

# Architektura????

Uproszczony przepływ danych:

```text
┌──────────────────────────┐
│      HackoWatt Mobile    │
│     React Native / Expo  │
└────────────┬─────────────┘
             │
             │ REST / JSON
             │ Bearer Token
             ▼
┌──────────────────────────┐
│       Django API         │
│       HackoWatt          │
└────────────┬─────────────┘
             │
             ├── Zużycie energii
             ├── Prognozy ML
             ├── Taryfy
             ├── Urządzenia
             ├── PV
             └── Magazyn energii
```

Aplikacja mobilna jest więc przede wszystkim **warstwą prezentacji i interakcji użytkownika**, natomiast obliczenia i dane pochodzą z backendu HackoWatt.

---

# Powiązany projekt

Backend:

**HackoWatt/Eko-dziki Django API**

```text
https://github.com/kleszczuch/HackoWatt
```

Mobile:

```text
https://github.com/allt3rr/HackoWattMobileApp
```

Oba repozytoria stanowią części jednego projektu.

---

# Aktualny zakres aplikacji?????

HackoWatt Mobile koncentruje się na czterech głównych obszarach:

```text
       ⚡ HACKOWATT
            │
    ┌───────┼────────┐
    │       │        │
    ▼       ▼        ▼
  📊      💰       ☀️
Analityka Koszty    PV
    │       │        │
    └───────┼────────┘
            ▼
       🔌 Urządzenia
            │
            ▼
      Optymalizacja
       zużycia energii
```

Celem aplikacji jest umożliwienie użytkownikowi podejmowania decyzji dotyczących zużycia energii na podstawie aktualnych danych, prognoz oraz symulacji różnych scenariuszy.

---

# Licencja

Projekt jest udostępniany na licencji **MIT**.

Szczegóły znajdują się w pliku:

```text
LICENSE
```

---

## Projekt

**Eko-dziki Mobile**
Mobile & Web Energy Management Application

Autorzy:

**Adam Nowak,?**

Built with ❤️ using: ???

**React Native · Expo · TypeScript · NativeWind**
