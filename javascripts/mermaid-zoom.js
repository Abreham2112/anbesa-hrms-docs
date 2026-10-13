(function () {
    function createFullscreenButton(container, panZoomInstance) {
        if (container.querySelector(".mermaid-fullscreen-btn")) {
            return;
        }

        const btn = document.createElement("button");
        btn.className = "mermaid-fullscreen-btn";
        btn.type = "button";
        btn.innerHTML = `<span>⛶</span> Fullscreen`;
        btn.title = "Toggle Fullscreen View";

        btn.addEventListener("click", function (e) {
            e.stopPropagation();
            if (!document.fullscreenElement) {
                if (container.requestFullscreen) {
                    container.requestFullscreen();
                } else if (container.webkitRequestFullscreen) {
                    container.webkitRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            }
        });

        function handleFullscreenChange() {
            const isFs = document.fullscreenElement === container;
            btn.innerHTML = isFs ? `<span>✕</span> Exit Fullscreen` : `<span>⛶</span> Fullscreen`;

            setTimeout(function () {
                if (panZoomInstance) {
                    panZoomInstance.resize();
                    panZoomInstance.fit();
                    panZoomInstance.center();
                }
            }, 100);
        }

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

        container.appendChild(btn);
    }

    function setupZoomForSvg(svg, container) {
        if (!svg || svg.classList.contains("zoom-enabled") || typeof window.svgPanZoom !== "function") {
            return;
        }

        svg.classList.add("zoom-enabled");

        // Style container to provide spacious boundaries for pan & zoom
        container.classList.add("mermaid-container");
        container.style.width = "100%";
        container.style.height = "85vh";
        container.style.minHeight = "700px";
        container.style.maxHeight = "none";
        container.style.overflow = "hidden";
        container.style.position = "relative";
        container.style.border = "1px solid var(--md-default-fg-color--lightest, #e0e0e0)";
        container.style.borderRadius = "8px";
        container.style.backgroundColor = "var(--md-default-bg-color, #ffffff)";
        container.style.margin = "0.8rem 0 1rem";

        // Style the SVG so it expands to the container
        svg.style.width = "100%";
        svg.style.height = "100%";
        svg.style.maxWidth = "none";
        svg.style.display = "block";

        try {
            const panZoomInstance = window.svgPanZoom(svg, {
                zoomEnabled: true,
                controlIconsEnabled: true,
                fit: true,
                center: true,
                minZoom: 0.2,
                maxZoom: 10,
                zoomScaleSensitivity: 0.2
            });

            createFullscreenButton(container, panZoomInstance);

            // Adjust on window resize
            window.addEventListener("resize", function () {
                try {
                    panZoomInstance.resize();
                    panZoomInstance.fit();
                    panZoomInstance.center();
                } catch (e) {
                    // Ignore if element is unmounted
                }
            });
        } catch (err) {
            console.error("Failed to initialize svgPanZoom on Mermaid diagram:", err);
        }
    }

    function observeShadowRoot(shadowRoot, container) {
        // If SVG already exists inside the shadow root
        const existingSvg = shadowRoot.querySelector("svg");
        if (existingSvg) {
            setupZoomForSvg(existingSvg, container);
            return;
        }

        // Otherwise observe when Mermaid inserts the SVG
        const observer = new MutationObserver(function () {
            const svg = shadowRoot.querySelector("svg");
            if (svg) {
                observer.disconnect();
                setupZoomForSvg(svg, container);
            }
        });

        observer.observe(shadowRoot, { childList: true, subtree: true });
    }

    // 1. Intercept Element.prototype.attachShadow
    // Material for MkDocs wraps Mermaid diagrams inside attachShadow({ mode: "closed" })
    if (typeof Element !== "undefined" && Element.prototype && !Element.prototype._origAttachShadow) {
        Element.prototype._origAttachShadow = Element.prototype.attachShadow;

        Element.prototype.attachShadow = function (options) {
            const isMermaid = this.classList && this.classList.contains("mermaid");
            const shadowRoot = this._origAttachShadow.call(this, {
                ...options,
                mode: isMermaid ? "open" : (options && options.mode ? options.mode : "closed")
            });

            if (isMermaid) {
                observeShadowRoot(shadowRoot, this);
            }

            return shadowRoot;
        };
    }

    // 2. Fallback scanner for light DOM or pre-existing shadow roots
    function scanMermaid() {
        document.querySelectorAll(".mermaid svg").forEach(function (svg) {
            const container = svg.closest(".mermaid") || svg.parentElement;
            setupZoomForSvg(svg, container);
        });

        document.querySelectorAll(".mermaid").forEach(function (container) {
            if (container.shadowRoot) {
                const svg = container.shadowRoot.querySelector("svg");
                if (svg) {
                    setupZoomForSvg(svg, container);
                }
            }
        });
    }

    if (typeof document !== "undefined") {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", scanMermaid);
        } else {
            scanMermaid();
        }

        if (window.document$ && typeof window.document$.subscribe === "function") {
            window.document$.subscribe(function () {
                setTimeout(scanMermaid, 150);
            });
        }
    }
})();