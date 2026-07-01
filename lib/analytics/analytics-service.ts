import * as amplitude from "@amplitude/analytics-browser";

// Central Amplitude wrapper, ported from the source Angular app's
// `analytics.service.ts`. It buffers track/page calls until the user has
// been identified (or identification has been explicitly skipped) so early
// events aren't lost or mis-attributed to an anonymous device ID.
//
// This marketing site has no login, so `skipIdentification()` is called
// once at bootstrap (see `instrumentation-client.ts`) to flush immediately.

const LOG_PREFIX = "[Analytics]";
const PAGE_VIEW_EVENT = "Page View";

type PendingEvent =
  | { type: "track"; eventName: string; properties: Record<string, unknown> }
  | { type: "page"; pageName: string; properties: Record<string, unknown> };

/**
 * Central Amplitude wrapper. Buffers track/page calls until `identifyUser()`
 * (or `skipIdentification()`) has run at least once, so early events aren't
 * lost or mis-attributed to an anonymous ID.
 */
class AnalyticsService {
  private isIdentified = false;
  private pendingEvents: PendingEvent[] = [];
  private defaultProperties: Record<string, unknown> = {};

  /**
   * Merges properties (e.g. `{ sourcePlatform: "marketingSite" }`) into
   * every future tracked event and page view.
   *
   * @param properties Key/value pairs to merge into the default property set.
   * @returns Nothing; failures are logged and swallowed.
   */
  public setDefaultProperties(properties: Record<string, unknown>): void {
    try {
      this.defaultProperties = { ...this.defaultProperties, ...properties };
    } catch (error) {
      console.error(`${LOG_PREFIX} setDefaultProperties failed:`, error);
    }
  }

  /**
   * Associates subsequent events with a known user (e.g. after a demo/
   * waitlist form submit that captures an email) and flushes any buffered
   * events.
   *
   * @param userId Stable identifier for the user (e.g. their email).
   * @param traits Optional user properties to set on the Amplitude identity.
   * @returns Nothing; failures are logged and swallowed.
   */
  public identifyUser(userId: string, traits: Record<string, unknown> = {}): void {
    try {
      amplitude.setUserId(userId);
      const identifyObj = new amplitude.Identify();
      Object.entries(traits).forEach(([key, value]) =>
        identifyObj.set(key, value as never),
      );
      amplitude.identify(identifyObj);

      this.isIdentified = true;
      this.flushPendingEvents();
    } catch (error) {
      console.error(`${LOG_PREFIX} identifyUser failed:`, error);
    }
  }

  /**
   * Marks the service as ready for anonymous-only apps (typical for a
   * marketing site with no auth) so events flush immediately instead of
   * buffering forever waiting for an `identifyUser()` that never happens.
   *
   * @returns Nothing; failures are logged and swallowed.
   */
  public skipIdentification(): void {
    try {
      this.isIdentified = true;
      this.flushPendingEvents();
    } catch (error) {
      console.error(`${LOG_PREFIX} skipIdentification failed:`, error);
    }
  }

  /**
   * Tracks a page view, buffering it until identification has run.
   *
   * @param pageName Human/route identifier for the page (e.g. the pathname).
   * @param properties Optional extra properties for this page view.
   * @returns Nothing; failures are logged and swallowed.
   */
  public trackPage(pageName: string, properties: Record<string, unknown> = {}): void {
    try {
      if (!this.isIdentified) {
        this.pendingEvents.push({ type: "page", pageName, properties });
        return;
      }

      amplitude.track(PAGE_VIEW_EVENT, {
        pageName,
        ...this.defaultProperties,
        ...properties,
      });
    } catch (error) {
      console.error(`${LOG_PREFIX} trackPage failed:`, error);
    }
  }

  /**
   * Tracks a named event, buffering it until identification has run.
   *
   * @param eventName Event name, ideally from `AnalyticsEvents` in events.ts.
   * @param properties Optional extra properties for this event.
   * @returns Nothing; failures are logged and swallowed.
   */
  public trackEvent(eventName: string, properties: Record<string, unknown> = {}): void {
    try {
      if (!this.isIdentified) {
        this.pendingEvents.push({ type: "track", eventName, properties });
        return;
      }

      amplitude.track(eventName, {
        ...this.defaultProperties,
        ...properties,
      });
    } catch (error) {
      console.error(`${LOG_PREFIX} trackEvent failed:`, error);
    }
  }

  /**
   * Replays every buffered event through the live track/page methods now
   * that identification has completed, then clears the buffer.
   *
   * @returns Nothing; failures are logged and swallowed.
   */
  private flushPendingEvents(): void {
    try {
      const events = [...this.pendingEvents];
      this.pendingEvents = [];

      events.forEach((event) => {
        if (event.type === "track") {
          this.trackEvent(event.eventName, event.properties);
        } else {
          this.trackPage(event.pageName, event.properties);
        }
      });
    } catch (error) {
      console.error(`${LOG_PREFIX} flushPendingEvents failed:`, error);
    }
  }
}

/** Singleton — one instance for the whole app (Angular `@Injectable('root')`). */
export const analytics = new AnalyticsService();
