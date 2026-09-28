# ⚡ HackoWatt Mobile

> **Next-generation cross-platform mobile application for smart energy management, dynamic tariff optimization, solar PV & battery storage simulations, and AI-driven consumption forecasting.**

[![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?logo=react&logoColor=white)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo_SDK-57-000020?logo=expo&logoColor=white)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-brightgreen)](#)
[![Code Quality](https://img.shields.io/badge/Typecheck_%26_Lint-Passing-success)](#)

---

## 📖 Spis treści / Table of Contents
- [Przegląd projektu / Overview](#-przegląd-projektu--overview)
- [Główne moduły i ekrany / Key Features](#-główne-moduły-i-ekrany--key-features)
- [Paleta barw i Design System / Color Palette](#-paleta-barw-i-design-system--color-palette)
- [Architektura projektu / Architecture](#-architektura-projektu--architecture)
- [Integracja z Backendem API / Backend API](#-integracja-z-backendem-api--backend-api)
- [Wymagania i Konfiguracja / Configuration](#-wymagania-i-konfiguracja--configuration)
- [Instalacja i Uruchomienie / Getting Started](#-instalacja-i-uruchomienie--getting-started)
- [Weryfikacja jakości kodu / Quality Assurance](#-weryfikacja-jakości-kodu--quality-assurance)
- [Licencja / License](#-licencja--license)

---

## 🌟 Przegląd projektu / Overview

**HackoWatt Mobile** to nowoczesna, responsywna aplikacja mobilna i webowa (Universal App) stworzona w oparciu o **React Native**, **Expo SDK 57** i **Expo Router**. Aplikacja łączy się bezpośrednio z serwerem analityczno-energetycznym Django przez REST API (Bearer token) i przetwarza dane w czasie rzeczywistym, eliminując jakiekolwiek sztuczne dane testowe (mock data).

Aplikacja rozwiązuje kluczowe wyzwania współczesnej transformacji energetycznej:
- **Optymalizacja kosztów przy taryfach dynamicznych**: informuje użytkownika o bieżących stawkach i przewiduje najtańsze okna cenowe.
- **Maksymalizacja autokonsumpcji ze słońca (PV)**: sugeruje harmonogram uruchamiania urządzeń AGD w godzinach najwyższej generacji fotowoltaicznej.
- **Kalkulacja magazynów energii**: symuluje zyski z dołożenia baterii do instalacji PV oraz wylicza szacunkowy zwrot z inwestycji (ROI).
- **Zaawansowane prognozowanie AI**: wizualizuje przewidywane zużycie na 24h, 72h i 7 dni w przód wraz z metrykami jakości modelu (MAE, MAPE).

---

## 📱 Główne moduły i ekrany / Key Features

Aplikacja składa się z 5 zintegrowanych ekranów dostępnych przez dolny pasek nawigacji (na urządzeniach mobilnych) oraz responsywny górny pasek zakładek (na webie / tabletach):

### 1. 🏠 Pulpit Główny (`/` — `src/app/index.tsx`)
- **Karta bieżącej stawki**: dynamiczna ocena stawki (Tania / Umiarkowana / Droga) ze wskaźnikami strefowymi i średnią ceną dnia.
- **Ostatni odczyt licznika na żywo**: pomiar mocy czynnej (kW), natężenia prądu (A), napięcia sieci (V) oraz współczynnika mocy ($\cos\varphi$).
- **Alert zbliżającego się szczytu**: wyprzedzające ostrzeżenie przed godziną o najwyższym koszcie energii.
- **Podsumowanie 24h**: skumulowane zużycie dobowe (kWh), łączny koszt (PLN/EUR) i dominująca kategoria obciążenia.
- **Szybkie kafelki nawigacyjne**: bezpośrednie przejścia do harmonogramu, urządzeń, fotowoltaiki i analityki.

### 2. 📅 Inteligentny Harmonogram (`/schedule` — `src/app/schedule.tsx`)
- **24-godzinna oś czasu**: szczegółowa lista wszystkich godzin doby z podziałem na strefy cenowe (Zielona, Żółta, Czerwona).
- **Wskaźnik "TERAZ"**: automatyczne podświetlenie bieżącej godziny z neonowym akcentem.
- **Rekomendacje generacji słonecznej**: inteligentne podpowiedzi autokonsumpcji (np. darmowy prąd ze słońca w godzinach 12:00–14:00).
- **Legenda stref taryfowych**: wyjaśnienie progów cenowych i optymalnych przedziałów czasowych.

### 3. 🔌 Urządzenia i Przesunięcie Pracy (`/devices` — `src/app/devices.tsx`)
- **Przewodnik po urządzeniach (Guidance)**: profile poboru mocy i rekomendacje dla zmywarki, pralki, suszarki, piekarnika i stacji ładowania EV.
- **Interaktywny symulator przesunięcia obciążenia (Shift Simulation)**:
  - Wybór urządzenia i liczby cykli w tygodniu (1–14).
  - Wybór godziny pierwotnej (np. szczyt 19:00) i docelowej (np. 13:00 lub tania nocna strefa 02:00).
  - Natychmiastowe przeliczenie oszczędności na cykl, w skali miesiąca oraz w ujęciu rocznym.
- **Dziennik elastycznych cykli pracy**: historia zdarzeń z filtrowaniem i statusami wykonania.

### 4. ☀️ Fotowoltaika i Magazyn Energii (`/solar` — `src/app/solar.tsx`)
- **Interaktywny selektor mocy PV**: płynna regulacja wielkości instalacji (2–10 kWp).
- **Porównanie Wariantu A vs Wariantu B**:
  - **Wariant A**: instalacja fotowoltaiczna bez magazynu.
  - **Wariant B**: instalacja PV połączona z domowym magazynem energii.
- **Kluczowe wskaźniki**: autokonsumpcja (%), eksport do sieci (%), roczne oszczędności finansowe oraz okres zwrotu z inwestycji (ROI w latach).
- **Tabela porównawcza wariantów**: pełne zestawienie mocy od 2 do 10 kWp z prognozowaną produkcją roczną.
- **Założenia techniczne**: parametry degradacji paneli, sprawności falownika i pojemności akumulatora.

### 5. 📊 Analityka i Prognozy AI (`/analytics` — `src/app/analytics.tsx`)
- **Wybór horyzontu predykcji**: przełącznik prognoz na 24 godziny, 72 godziny (3 dni) lub 168 godzin (7 dni).
- **Wykres słupkowy prognozy zużycia**: interaktywna wizualizacja profilu zapotrzebowania z kolorami strefowymi i wyróżnieniem szczytów.
- **Wyjaśnienia szczytów zapotrzebowania**: moduł interpretacji przyczyn wzrostu obciążenia (np. dogrzewanie, powrót domowników).
- **Metryki dokładności modelu ML**: rzeczywiste parametry modelu prognostycznego (MAE w kW oraz MAPE w %).
- **Rozbicie zużycia na 6 kategorii**: ogrzewanie, duże AGD, oświetlenie, elektronika, ładowanie pojazdów EV i inne.

### 6. 🌐 Wskaźnik Statusu API na Żywo (`ApiStatusIndicator`)
- Zawsze widoczna w prawym dolnym rogu pigułka informująca o stanie połączenia z backendem.
- Mierzy opóźnienie w milisekundach (latency) w czasie rzeczywistym.
- Umożliwia dynamiczną zmianę adresu serwera oraz podgląd zamaskowanego klucza autoryzacyjnego w modalnym oknie diagnostycznym.

---

## 🎨 Paleta barw i Design System / Color Palette

Interfejs użytkownika został zaprojektowany z zachowaniem zasad **ergonomii mobilnej, wysokiego kontrastu i czytelności**. Kolorystyka opiera się na 5-stopniowej harmonijnej palecie:

| Kolor | Hex | Nazwa | Zastosowanie w interfejsie |
| :--- | :--- | :--- | :--- |
| <img src="https://via.placeholder.com/20/545454/545454.png" width="20" height="20" /> | `#545454` | **Charcoal** | Neutralne tła kart w trybie ciemnym, wyraziste nagłówki, ramki strukturalne |
| <img src="https://via.placeholder.com/20/69747C/69747C.png" width="20" height="20" /> | `#69747C` | **Slate Grey** | Tekst pomocniczy, etykiety jednostek miar, nieaktywne ikony i ramki |
| <img src="https://via.placeholder.com/20/6BAA75/6BAA75.png" width="20" height="20" /> | `#6BAA75` | **Sage Green** | Wtórna zieleń ekologiczna, ikony modułów, stabilne wskaźniki oszczędności |
| <img src="https://via.placeholder.com/20/84DD63/84DD63.png" width="20" height="20" /> | `#84DD63` | **Radioactive Grass** | Główny kolor akcji, tania strefa taryfowa, zysk PV, kropka live API |
| <img src="https://via.placeholder.com/20/CBFF4D/CBFF4D.png" width="20" height="20" /> | `#CBFF4D` | **Chartreuse** | Elektryczny neon: aktywne pigułki nawigacji, plakietka `TERAZ`, akcenty ROI |

Aplikacja w pełni obsługuje **tryb jasny (Light Mode)** oraz **tryb ciemny (Dark Mode)**, automatycznie synchronizując się z ustawieniami systemowymi urządzenia.

---

## 📂 Architektura projektu / Architecture

```text
HackoWattMobileApp/
├── assets/                     # Ikony, splash screen, obrazy statyczne
├── src/
│   ├── api/
│   │   ├── client.ts           # Klient HTTP z obsługą autoryzacji Bearer token i timeoutów
│   │   └── endpoints.ts        # Ścisłe, silnie typowane wiązania dla 12 endpointów API
│   ├── app/                    # Ekrany oparte na Expo Router (File-based Routing)
│   │   ├── _layout.tsx         # Główny kontener nawigacji i konfiguracja zakładek
│   │   ├── index.tsx           # Pulpit Główny (Dashboard)
│   │   ├── schedule.tsx        # Inteligentny Harmonogram (Smart Schedule)
│   │   ├── devices.tsx         # Urządzenia i Przesunięcie Pracy (Devices & Load Shift)
│   │   ├── solar.tsx           # Fotowoltaika i Magazyn Energii (PV & Battery)
│   │   └── analytics.tsx       # Analityka i Prognozy AI (Analytics & AI Forecast)
│   ├── components/             # Reużywalne komponenty UI
│   │   ├── app-tabs.tsx        # Dolny pasek nawigacji dla platform natywnych (iOS / Android)
│   │   ├── app-tabs.web.tsx    # Responsywny górny pasek nawigacji dla przeglądarek (Web)
│   │   └── ui/
│   │       ├── ApiStatusIndicator.tsx # Diagnostyka połączenia i modal konfiguracji API
│   │       ├── Card.tsx               # Spójny kontener kart z obsługą motywów
│   │       ├── ErrorStateCard.tsx     # Komponent obsługi błędów sieciowych z przyciskiem ponowienia
│   │       ├── MetricTile.tsx         # Kafelki wskaźników liczbowych odporne na błędy renderowania
│   │       ├── SegmentedControl.tsx   # Przełączniki zakładek i horyzontów czasowych
│   │       └── StatusBadge.tsx        # Plakietki statusów i ocen taryfowych
│   ├── config/
│   │   └── env.ts              # Dynamiczny menedżer konfiguracji i adresacji (np. Android 10.0.2.2)
│   ├── constants/
│   │   └── theme.ts            # Tokeny stylistyczne, paleta barw i motywy Light/Dark
│   ├── hooks/
│   │   ├── useApi.ts           # Generyczny hook pobierania danych z obsługą cache i odświeżania
│   │   ├── use-color-scheme.ts # Detekcja motywu systemowego
│   │   └── use-theme.ts        # Dostęp do aktywnych tokenów kolorystycznych
│   └── types/
│       └── api.ts              # Kompletne definicje typów TypeScript dla wszystkich modeli danych
├── .env                        # Konfiguracja zmiennych środowiskowych
├── app.json                    # Konfiguracja Expo i Continuous Native Generation (CNG)
├── package.json                # Zależności i skrypty npm
├── tailwind.config.js          # Konfiguracja Tailwind CSS / NativeWind
└── tsconfig.json               # Konfiguracja kompilatora TypeScript
```

---

## 🔗 Integracja z Backendem API / Backend API

Aplikacja łączy się bezpośrednio z 12 endpointami REST API wystawianymi przez backend Django. Wszystkie zapytania są uwierzytelniane nagłówkiem `Authorization: Bearer <TOKEN>`.

| Lp. | Metoda | Ścieżka endpointu | Opis |
| :---: | :---: | :--- | :--- |
| **1** | `GET` | `/api/v1/dashboard/summary/` | Bieżąca stawka, ostatni odczyt, sumy 24h, dominująca kategoria, alert szczytu |
| **2** | `GET` | `/api/v1/smart-schedule/today/` | 24-godzinny harmonogram doby, podział na strefy cenowe, porady generacji PV |
| **3** | `GET` | `/api/v1/devices/guidance/` | Zestawienie urządzeń elastycznych (moc, cykl, najlepsze godziny pracy) |
| **4** | `GET` | `/api/v1/devices/shift-simulation/` | Symulacja przesunięcia pracy urządzenia (parametry: device, godziny, cykle) |
| **5** | `GET` | `/api/v1/devices/flexible-events/` | Dziennik i historia cykli pracy elastycznych urządzeń AGD |
| **6** | `GET` | `/api/v1/pv/simulate/` | Symulacja PV i magazynu energii (Wariant A vs Wariant B, autokonsumpcja, ROI) |
| **7** | `GET` | `/api/v1/pv/variants/` | Tabela mocy instalacji PV w zakresie 2–10 kWp |
| **8** | `GET` | `/api/v1/consumption/forecast/` | Prognoza poboru mocy na horyzont 24h, 72h lub 168h z wyjaśnieniem szczytów |
| **9** | `GET` | `/api/v1/consumption/history/` | Historia zużycia energii z podziałem na kategorie |
| **10** | `GET` | `/api/v1/tariffs/` | Informacje o taryfach, przedziałach doliny i szczytu |
| **11** | `GET` | `/api/v1/system/assumptions/` | Parametry techniczne budynku, urządzeń i taryf |
| **12** | `GET` | `/api/v1/system/metrics/` | Metryki dokładności modelu ML (MAE, MAPE) |

> [!NOTE]
> Klient API automatycznie tłumaczy adres `localhost` / `127.0.0.1` na `10.0.2.2`, gdy aplikacja jest uruchamiana wewnątrz oficjalnego emulatora Android Studio.

---

## ⚙️ Wymagania i Konfiguracja / Configuration

### Wymagania wstępne:
- **Node.js**: wersja `>= 18.x` (zalecana wersja LTS)
- **Menedżer pakietów**: `npm`, `yarn` lub `bun`
- **Expo CLI**: dostarczany lokalnie przez `npx expo`

### Konfiguracja środowiska (`.env`):
Utwórz lub zmodyfikuj plik `.env` w głównym katalogu projektu:

```env
# Adres bazowy serwera API (dla Web/iOS: localhost:8000, dla fizycznych urządzeń: IP komputera w LAN)
EXPO_PUBLIC_API_URL=http://localhost:8000

# Klucz dostępowy Bearer Token do autoryzacji zapytań
EXPO_PUBLIC_API_TOKEN=hackowatt-demo-mobile-key-2026
```

---

## 🚀 Instalacja i Uruchomienie / Getting Started

### 1. Klonowanie repozytorium i instalacja zależności
```bash
git clone https://github.com/allt3rr/HackoWattMobileApp.git
cd HackoWattMobileApp
npm install
```

### 2. Uruchomienie aplikacji w wybranym środowisku

- **Przeglądarka internetowa (Web)**:
  ```bash
  npm run web
  # lub: npx expo start --web
  ```

- **Serwer deweloperski ogólny (Android / iOS / Expo Go)**:
  ```bash
  npx expo start
  ```
  Zeskanuj wyświetlony kod QR za pomocą aplikacji **Expo Go** (Android) lub wbudowanego aparatu (iOS).

- **Emulator Android**:
  ```bash
  npm run android
  ```

- **Symulator iOS** (wymagany macOS):
  ```bash
  npm run ios
  ```

---

## 🛡️ Weryfikacja jakości kodu / Quality Assurance

Przed każdym wdrożeniem lub utworzeniem Pull Requestu, upewnij się, że kod spełnia wszystkie rygorystyczne standardy:

1. **Weryfikacja typów TypeScript**:
   ```bash
   npx tsc --noEmit
   ```
2. **Statyczna analiza kodu (ESLint)**:
   ```bash
   npx expo lint
   ```
3. **Kompilacja produkcyjna (Web Export)**:
   ```bash
   npx expo export --platform web
   ```
4. **Diagnostyka środowiska Expo**:
   ```bash
   npx expo-doctor
   ```

---

## 📄 Licencja / License

Projekt jest udostępniany na warunkach licencji [MIT](LICENSE). Szczegóły znajdują się w pliku licencji.
