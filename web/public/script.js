(() => {
    const scriptElement = document.currentScript;
    if (!scriptElement) {
        console.error(
            "Analytics Script: Could not find the script tag. Is 'defer' being used correctly?"
        );
        return;
    }

    const websiteId = scriptElement.getAttribute("data-website-id");
    const endpoint = "http://localhost:8080/track";

    if (navigator.doNotTrack === "1" || !websiteId) {
        if (!websiteId)
            console.error("Analytics Script: 'data-website-id' is missing.");
        return;
    }

    function getOrCreateId(storage, key) {
        let id = storage.getItem(key);
        if (!id) {
            id = crypto.randomUUID();
            storage.setItem(key, id);
        }
        return id;
    }
    const visitorId = getOrCreateId(localStorage, "analytics_visitor_id");
    const sessionId = getOrCreateId(sessionStorage, "analytics_session_id");

    function sendEvent(type, eventData = {}) {
        const payload = {
            type: type,
            websiteId: websiteId,
            visitorId: visitorId,
            sessionId: sessionId,
            url: window.location.href,
            referrer: document.referrer,
            screenWidth: window.screen.width,
            language: navigator.language,
            timestamp: new Date().toISOString(),
            ...eventData,
        };

        if (navigator.sendBeacon) {
            navigator.sendBeacon(endpoint, JSON.stringify(payload));
        } else {
            fetch(endpoint, {
                method: "POST",
                body: JSON.stringify(payload),
                keepalive: true,
                headers: { "Content-Type": "application/json" },
            });
        }
    }

    let lastUrl = location.href;
    const trackPageView = () => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            sendEvent("pageview");
        }
    };

    const originalPushState = history.pushState;
    history.pushState = function (...args) {
        originalPushState.apply(this, args);
        trackPageView();
    };

    window.addEventListener("popstate", trackPageView);
    sendEvent("pageview");

    window.analytics = window.analytics || {};
    window.analytics.track = (eventName, data) => {
        if (!eventName) {
            console.error("Analytics Script: track() requires an eventName.");
            return;
        }
        sendEvent("event", { name: eventName, data: data });
    };

    const sessionStartTime = Date.now();

    const trackSessionEnd = () => {
        const durationSeconds = Math.round(
            (Date.now() - sessionStartTime) / 1000
        );
        sendEvent("session_end", { duration: durationSeconds });
    };

    window.addEventListener("pagehide", trackSessionEnd);
    window.addEventListener("beforeunload", trackSessionEnd);

    document.addEventListener(
        "click",
        (e) => {
            const link = e.target.closest("a");

            if (
                link?.href &&
                location.hostname !== new URL(link.href).hostname
            ) {
                sendEvent("outbound_link_click", { outbound_url: link.href });
            }
        },
        true
    );
})();
