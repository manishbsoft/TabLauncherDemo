# External Application Launcher Demo

A React + Vite proof of concept for configuring and launching external applications from a workspace sidebar. It uses JavaScript and JSX, TanStack Query for the demo configuration, Zustand for preferences and launch activity, and Lucide React for icons.

## Run locally

Requirements: Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Create a production build with `npm run build`; run Oxlint with `npm run lint`.

## How it works

- The four sample app configurations are loaded asynchronously via `useApplications` and TanStack Query.
- The sidebar merges configuration defaults with per-app preferences from local storage.
- Startup launches are considered after configuration loads. A session storage guard (`workspace-startup-launch-attempted`) records the current page-load ID **before** processing apps. It prevents duplicate attempts during the same page load (including React Strict Mode replays) and allows startup processing again after a reload. Every startup-enabled app is attempted once per load using its selected target; disabled apps are omitted. Each app has its own stable target name so the browser can reuse that app's tab/window after reload.
- Startup popup requests may be blocked because they do not have a fresh user gesture. The activity panel records blocked results; the manual launch icon is the reliable fallback.
- Preferences (application ID, editable URL, startup toggle, and launch target) persist in local storage. Activity and launch status are runtime-only Zustand state.
- The launcher service keeps `Window` references in memory. It requests focus for a still-open tracked reference, removes closed references, and requests a new context as needed. Both new-tab and new-window launches use the same stable, app-specific target name; new-window launches additionally request popup dimensions. After refresh, the startup launch uses that name again and requests focus on the returned reference, so the browser can reuse/land on the named context where permitted. Browser policy, popup blocking, and browsing-context rules still determine whether it reuses or focuses it.
- Demo links use `example.com` and are placeholders, not actual CRM, claims, analytics, or payment services.

## Browser limitations

- `window.open()` is a request. Popup blockers, browser settings, user-gesture requirements, and browser behavior decide whether a tab/window opens and how it is presented.
- Focus requests are best effort; the browser is not required to switch focus.
- An in-memory `Window` reference disappears when the page is refreshed or closed. References cannot be saved in local storage or session storage.
- A named window may be reused when the browser considers it the same browsing context. Reuse depends on browser behavior and browsing-context rules.
- Reusing a named browsing context may navigate it to the requested URL; the launcher cannot guarantee that an existing page is only focused without navigation.
- The app cannot reliably discover unrelated tabs or windows opened elsewhere.
- Cross-origin pages cannot be inspected freely. This demo only checks whether its own tracked reference is closed and does not inspect the external page.
- Browser restarts do not preserve JavaScript window references. A new tab session gets a new session storage context and can consider startup apps again.
- If browser storage is disabled or unavailable, preferences cannot persist. The hook's in-memory guard still prevents duplicate attempts during the current component instance, but only session storage can deduplicate separate mounts in the same page load. Enabled apps are intentionally considered again after a reload.

## Manual test checklist

1. Load the app and confirm that all four applications appear in the right sidebar. The two startup-enabled apps will be attempted once after configuration loads; your browser may block them.
2. Click a card's edit icon, change its URL, and save. Launch it manually and confirm it opens the edited URL. Refresh and confirm the URL is retained.
3. Click a card's launch icon. Confirm the result appears in Launch activity; when popups are blocked, verify the blocked message and allow popups or retry manually.
4. Change an app's startup toggle and launch target. Refresh and confirm both settings persist.
5. Enable startup for multiple apps and refresh. Confirm each enabled app gets one startup attempt and each disabled app is omitted. Refresh again and confirm each app is requested with its own stable named tab/window, allowing the browser to reuse that app's existing context rather than create a duplicate where supported.
6. Launch an app twice while its opened page is still available. The tracked reference should be focused instead of opening another context where the browser permits it. Close it and launch again to request a new context.
7. Select **Open in new window** and repeat a launch. Both target modes use the app's stable name; the browser may reuse the same tab/window depending on browser behavior. Repeat after reloading the workspace and observe whether the named context is reused, focused, or navigated.
8. Use **Reset Session Guard** and confirm it does not launch anything immediately. Refresh to apply it on the next eligible startup.
9. Use **Reset Preferences** and confirm the prompt, then verify the sample URLs and defaults are restored. Use **Clear Activity** and verify the activity list empties.
10. Resize to a narrow viewport and verify the application list becomes a full-width panel below the workspace content.
