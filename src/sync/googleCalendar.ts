// src/sync/googleCalendar.ts
// Client-side Google Calendar OAuth using Google Identity Services (GIS).
// No backend needed — uses the implicit/PKCE flow with a Web application
// OAuth Client ID. The client ID is entered once in Settings.

import { getSetting, setSetting } from "../data/settings";
import { importGoogleEvents } from "../data/calendar";

const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

let gapiInited = false;
let tokenClient: any = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

export async function initGoogleCalendar(clientId: string): Promise<void> {
  if (!clientId) throw new Error("Google OAuth Client ID is required. Add it in Settings.");
  await loadScript("https://apis.google.com/js/api.js");
  await new Promise<void>((resolve) => {
    (window as any).gapi.load("client", () => resolve());
  });
  await (window as any).gapi.client.init({
    // discoveryDocs is async-loaded below
  });
  // Load the Calendar API discovery doc
  for (const doc of DISCOVERY_DOCS) {
    await (window as any).gapi.client.load(doc.split("/apis/")[1]);
  }
  gapiInited = true;

  // Initialize GIS token client
  tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    callback: (response: any) => {
      void (async () => {
        if (response.error) {
          console.error("Google OAuth error:", response.error);
          return;
        }
        await setSetting("googleCalendarToken", {
          access_token: response.access_token,
          expires_at: Date.now() + response.expires_in * 1000,
        });
      })();
    },
  });
}

export async function isGoogleCalendarConnected(): Promise<boolean> {
  const token = await getSetting<any>("googleCalendarToken");
  if (!token) return false;
  return token.expires_at > Date.now() - 60_000; // 1min grace
}

export async function connectGoogleCalendar(clientId: string): Promise<void> {
  if (!gapiInited || !tokenClient) {
    await initGoogleCalendar(clientId);
  }
  if (tokenClient) {
    tokenClient.requestAccessToken({ prompt: "consent" });
  }
}

export async function syncGoogleCalendarEvents(): Promise<{ imported: number; error?: string }> {
  const token = await getSetting<any>("googleCalendarToken");
  if (!token || token.expires_at < Date.now()) {
    return { imported: 0, error: "Not connected or token expired. Reconnect in Settings." };
  }

  try {
    // Load discovery doc for Calendar API
    await loadScript("https://apis.google.com/js/library.js");

    const now = new Date().toISOString();
    const oneMonthLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const response = await (window as any).gapi.client.calendar.events.list({
      calendarId: "primary",
      timeMin: now,
      timeMax: oneMonthLater,
      showDeleted: false,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.result.items || [];
    const imported = await importGoogleEvents(events);
    return { imported };
  } catch (err: any) {
    return { imported: 0, error: err.message ?? "Failed to sync Google Calendar" };
  }
}

export async function disconnectGoogleCalendar(): Promise<void> {
  await setSetting("googleCalendarToken", null);
}
