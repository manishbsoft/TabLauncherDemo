# Spike: External Application Launcher

## 1. Purpose

Record the original demo requirements, the investigation findings from the implemented application, feasible browser-based solutions, and a practical implementation plan. This spike focuses especially on whether an application tab opened during startup can be focused/reused after the workspace page is refreshed.

## 2. Original requirement

Build a runnable React JavaScript demo that manages configured external applications in a right-hand workspace sidebar and can launch them manually or according to startup preferences. The demo should show the limits of browser popup, focus, cross-origin, and tab/window reuse behavior. It is a proof of concept, not a production launcher.

### Original functional scope

- Provide a dashboard with an **Application Workspace** welcome area, launch activity, browser capability guidance, and a fixed-width, scrollable right sidebar headed **My Applications**.
- Provide at least four sample applications: John Smith — CRM Portal; Priya Sharma — Claims Management; Alex Morgan — Analytics Dashboard; Sarah Wilson — Payment Workspace. Each has an ID, URL, owner/name, description, avatar/initials fallback, startup preference, and launch target.
- Let a user manually launch each application with an accessible launch control. Report blocked popups and other outcomes in launch activity.
- Let the user enable/disable **Launch at startup** and choose one launch target per app: **Open in new tab** or **Open in new window**. Persist application preferences in local storage and apply changes at a subsequent eligible startup, not by immediately opening an app.
- Load application configuration through TanStack Query, merge it with saved preferences, and only then consider startup launches. Use session storage to prevent duplicate attempts during the same page load, set the guard before processing apps, skip disabled apps, and prevent React Strict Mode/repeated-effect duplicates.
- Provide a reusable launcher service that validates URLs, tracks `Window` references in memory, focuses a still-open tracked reference, removes closed references, and opens a new context when needed. Use a stable app-specific name for new-window launches. Return explicit outcomes such as `opened`, `focused`, `blocked`, and `invalid-url`.
- Use Zustand for preferences, startup toggles, launch targets, activity, and serializable launch status. Keep `Window` objects out of browser storage. Save only serializable app preferences in local storage and use session storage for the per-load guard.
- Provide working demo controls to reload the page, reset the startup guard without launching immediately, restore preferences after confirmation, and clear launch activity.
- Use React, Vite, JavaScript/JSX only, TanStack Query, Zustand, Lucide React, and responsive CSS. Document setup, browser limitations, and a manual test checklist.

### Original acceptance criteria

1. Multiple application cards show avatars, names, launch controls, startup toggles, and target radio options.
2. Startup and launch-target preferences persist across reloads.
3. Manual launch works where permitted; blocked popups are reported.
4. Startup-enabled apps are considered after configuration loads; disabled apps are skipped.
5. A refresh does not duplicate startup attempts within the same page load, including React Strict Mode effect replay.
6. Tracked, valid windows are reused where possible; closed ones can be relaunched.
7. Activity records attempts and outcomes; all demo controls work.
8. The app builds and runs as JavaScript without TypeScript.
9. Browser limitations and manual verification steps are documented.

## 3. Investigation area: focus/reuse after workspace refresh

### User story

> Once a tab has opened on the first page load, after refreshing the workspace page the enabled application should use/focus that already-open tab instead of opening another tab.

### Refined startup behavior

For each application with **Launch at Startup** enabled, attempt its configured URL once per page load using that application's stable target name. On a subsequent workspace reload, request the same URL and target name again so the browser can reuse that application's tab/window. Apps with startup disabled are omitted. Each enabled app has its own named context; the launcher does not collapse several applications into a single tab.

### Current implementation findings

- `src/services/applicationLauncher.js` keeps `Window` references in a runtime `Map`. It can focus a tracked reference while it remains valid, but the map and its references are lost when the workspace page reloads.
- New-tab launches previously called `window.open(url, "_blank")`. `_blank` requests an unnamed browsing context and does not identify the application’s previously opened tab.
- New-window launches use a stable app-specific target name (`workspace-application-{id}`), which gives the browser a chance to reuse that named context. This spike implementation now uses that same stable name for new-tab launches.
- The startup hook uses a page-load-specific session guard. This intentionally allows enabled applications to be considered again after a reload while preventing duplicate attempts within one page load.
- Application URL, startup preference, and target are persisted, but browser context references cannot be stored in local storage or session storage.
- The app cannot reliably enumerate unrelated tabs, inspect a cross-origin destination page, or force the browser to bring a tab/window to the foreground.

### Feasibility assessment

**Conditional reuse is feasible; guaranteed discovery and focus are not.**

Use the same stable, application-specific named target for new-tab launches as for new-window launches. When the browser resolves a `window.open(url, stableName)` request to an existing named browsing context in the applicable browsing-context group, it can reuse that context rather than create another one. Keep the existing in-memory reference behavior for repeated launches during one page load.

This is the best fit for a browser-only proof of concept, but it does not amount to finding an arbitrary tab and focusing it. The browser controls named-context resolution and focus. A startup request can still be blocked because it has no current user gesture. Depending on browser behavior, targeting an existing context may navigate/reload that context to the requested URL rather than merely foregrounding it. Do not promise that an existing page will remain untouched or that focus will change.

Do not persist a `Window` reference: browser storage only supports serializable data and cannot restore a `WindowProxy` after refresh. Do not attempt to bypass popup restrictions, scan browser tabs, or infer context state by reading cross-origin page contents.

### Candidate approaches

| Approach | Feasibility | Findings |
|---|---|---|
| Continue using `_blank` for new tabs | Does not meet reuse intent | Each call requests an unnamed new context; the old tab cannot be identified after refresh. |
| Use a stable per-application name for tabs and windows | Recommended; browser-dependent | Gives the browser a target name it may resolve to an existing context, avoiding `_blank` behavior. Browser and browsing-context rules still determine reuse and focus. |
| Persist `Window` references in local/session storage | Not feasible | Window references are non-serializable runtime objects and do not survive page reload. |
| Search all browser tabs or inspect arbitrary external pages | Not feasible from normal page JavaScript | There is no general browser-tab enumeration API for a regular web page, and cross-origin access is restricted. |
| Guarantee that a startup popup is opened/focused | Not feasible | Popup blockers, user-gesture policy, browser settings, and focus policy are outside application control. |

## 4. Feasible solution

1. Generate one sanitized, stable browsing-context name from each application ID and use it for **both** target modes. Keep the existing `popup,width=1200,height=800` feature string only for the selected window mode; use the stable target name without popup features for the tab mode.
2. Continue checking/focusing the in-memory reference first. If it is closed, remove it before making a new browser request.
3. When no in-memory reference exists (for example after refresh), call `window.open` with the app’s URL and stable target name. Save the returned reference in the runtime map when non-null, then call `focus()` on it as a best-effort request to land on the named context.
4. Treat a null return as a blocked request, record it in activity, and leave the manual launch control available.
5. Keep the per-load startup guard. It prevents duplicate effects within this page load, while allowing enabled applications to be considered on the next reload.
6. Update UI copy and documentation to say that stable naming **requests reuse**, not that focus/reuse is guaranteed. Preserve explicit blocked/error outcomes.

This approach may cause the browser to navigate an existing named context to the configured URL as it processes the request. If the requirement means “foreground the existing tab without navigating or reloading it,” that behavior cannot be guaranteed after a refresh with the current browser-only design. Confirm whether navigation of the existing named context is acceptable before treating the spike as a strict guarantee.

## 5. Acceptance criteria for the reuse enhancement

### Functional acceptance

1. New-tab and new-window launches use distinct, stable names per application; repeated launches for one app do not target another app’s context.
2. If a valid in-memory reference exists, launching that app attempts `focus()` and does not call `window.open()` again.
3. If a tracked reference is closed, it is removed and a subsequent launch requests a new context.
4. After a workspace reload, a startup-enabled app is considered once for that page load using its saved URL and target. Startup-disabled apps are not requested.
5. New-tab startup/manual requests use the stable target name, not `_blank`; window requests use the same stable name with the configured window features.
6. A null result from `window.open()` is recorded as blocked; invalid URLs and thrown browser errors are not reported as successful.
7. React Strict Mode/repeated effect execution does not produce duplicate attempts within one page load.
8. Browser copy and documentation explain that named-context reuse and foreground focus are best effort and that startup popup requests may be blocked.
9. If multiple apps have startup enabled, each enabled app receives exactly one automatic launch request per page load using its own stable target name. Disabled apps receive no startup launch request.

### Browser-dependent acceptance

1. In a supported browser/configuration that honors named browsing-context targeting, launching the same app again after workspace reload should request reuse of its named tab/window rather than an unnamed context.
2. The launcher calls `focus()` on the returned reference. Verify whether the browser reuses, focuses, or navigates/reloads the target URL; record the observed result per browser. Treat actual focus and avoiding an extra context as best effort, not a cross-browser guarantee.
3. When the browser blocks automatic launch, verify the blocked result is visible and manual launch remains available.

## 6. Findings for the implementation plan

### Scope and constraints

- The core demo, preference persistence, per-load startup guard, URL editor, launch activity, and manual controls are already implemented.
- The focused code change for this spike is in `src/services/applicationLauncher.js`: both target modes now use the same stable app-specific name, and newly returned references receive a best-effort focus request.
- The launcher is the correct boundary for target naming and reuse. Keep app configuration, preference storage, and component presentation unchanged except for status copy/coverage as needed.
- The per-load guard should not be changed back to a persistent “already attempted in this tab session” guard: enabled apps are expected to be considered again after refresh.
- Startup selection is per application: attempt every enabled app once; each app has its own stable target name. Manual launch remains available for all cards.
- Treat user-gesture restrictions and focus policy as platform limitations, not bugs that application code can bypass.

### Proposed implementation tasks

1. **Unify stable target naming** — implemented: use the existing sanitized app-specific name for both target modes and keep mode-specific window features.
2. **Preserve lifecycle behavior** — retain tracked-reference focus and closed-reference cleanup, and request focus on newly returned references. Confirm a null/open exception still generates a truthful blocked/error result.
3. **Clarify outcomes and UI** — launch results say a named target and focus change were requested, not that focus or presentation is guaranteed. Keep blocked outcomes visible in activity.
4. **Update documentation** — explain stable named-target reuse, possible navigation of an existing context, loss of in-memory references on reload, and the lack of guaranteed focus.
5. **Validate** — run `npm run build` and `npm run lint`; exercise first launch, repeat launch before reload, repeat after reload, both target modes, a closed context, blocked popup, multiple enabled apps (each starts once under its own name), disabled startup, and Strict Mode. Repeat browser-dependent tests in the target browsers and note differences.

### Risks and open product decision

- Reusing a named browsing context after reload may load the app URL into the existing context. If preserving the currently displayed page without navigation is mandatory, the browser-only approach is insufficient to guarantee that.
- Automatic startup requests can be blocked even with stable names. A reliable no-gesture-free automatic launch cannot be promised by a regular web application.
- Browser behavior can differ by browser/version, privacy mode, opener relationships, and browsing-context group. The spike should report tested environments rather than claiming universal compatibility.

**Implementation update:** Stable per-app target names are used for both tab and window modes. New-window mode still supplies `popup,width=1200,height=800`; new-tab mode supplies the stable target without popup features. After opening or resolving the named target, the launcher calls `focus()` as a best-effort request. The two modes differ in presentation request, not target identity.

**Validation status:** `npm run build` and `npm run lint` passed. A focused launcher-service check passed for distinct stable app names, the same naming behavior across target modes, mode-specific popup features, focus of a tracked reference without another `window.open`, relaunch after a tracked reference is closed, and invalid-URL rejection.

The integrated browser smoke check recorded a blocked automatic startup popup for Analytics and an accepted browser request for CRM. The browser test harness did not expose the external browsing context as a page that could be inspected, so reuse, navigation, and foreground focus after reload could not be confirmed empirically in this environment. Validate those behaviors manually in the intended browsers and record the browser/version and popup settings. Accept “reuse where browser permits” as the supported outcome; describe focus and non-navigation as best effort, not guaranteed acceptance criteria.

The startup-selection behavior was subsequently updated to attempt every enabled app, each under its own stable target name. Browser verification should confirm one recorded attempt per enabled app, no attempts for disabled apps, and repeated named targets after reload. The browser harness still cannot guarantee whether external browsing contexts are reused or foregrounded.
