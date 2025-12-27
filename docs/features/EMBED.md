# Embed Feature ("Designed by Jacob Barkin")

This project hosts a distibutable "credit" component that other sites can embed.

## Technical Implementation

### Components
1.  **Script Endpoint**: `/api/embed/credit.js` (Dynamic Route)
    -   Serves the JavaScript payload.
    -   Handles logic for "Auto Injection" vs "Manual Placement".
2.  **Web Component**: Defines a custom element `<jb-credit>`.
    -   Uses **Shadow DOM** to isolate styles from the host page.
    -   Fetches configuration from `data-*` attributes.

### Usage

**Manual Placement**:
```html
<script src="https://jacobbarkin.com/embed/credit.js"></script>
<jb-credit data-variant="chip"></jb-credit>
```

**Auto Inject**:
```html
<script src="https://jacobbarkin.com/embed/credit.js" data-auto></script>
```

## Analytics
The embed tracks usage telemetry to understand reach.
-   **Endpoint**: `/api/embed/analytics` (POST)
-   **Data Points**: Hostname, Variant, Impression timestamp.
-   **Storage**: D1 Table `embed_analytics`.

## Development
To modify the embed:
1.  Edit `src/app/api/embed/route.ts` (Script generation).
2.  Edit `src/components/embed/credit-component.ts` (Web Component logic).
3.  Test by running the dev server and visiting a test page importing the local script.
