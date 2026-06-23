import { o as __toESM } from "../_runtime.mjs";
import { i as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { et as Check, y as Share2 } from "../_libs/lucide-react.mjs";
import { i as cn } from "./AppShell-DZ395jJC.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/share-button-DU_VuhYu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ShareButton({ className }) {
	const [copied, setCopied] = (0, import_react.useState)(false);
	const handleShare = async () => {
		const url = window.location.href;
		if (navigator.share) try {
			await navigator.share({
				title: "NETHRA Traffic OS",
				text: "Check out this smart city traffic operations platform",
				url
			});
			return;
		} catch (err) {
			if (err.name !== "AbortError") console.error("Share failed:", err);
		}
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			toast.success("URL copied to clipboard", { description: "You can now share this page with others." });
			setTimeout(() => setCopied(false), 2e3);
		} catch (err) {
			const textArea = document.createElement("textarea");
			textArea.value = url;
			textArea.style.position = "fixed";
			textArea.style.left = "-9999px";
			document.body.appendChild(textArea);
			textArea.select();
			try {
				document.execCommand("copy");
				setCopied(true);
				toast.success("URL copied to clipboard", { description: "You can now share this page with others." });
				setTimeout(() => setCopied(false), 2e3);
			} catch (e) {
				toast.error("Failed to copy URL", { description: "Please manually copy the URL from your browser." });
			}
			document.body.removeChild(textArea);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		onClick: handleShare,
		className: cn("inline-flex items-center gap-2 rounded-md border border-border bg-card/40 px-3 py-2 text-sm font-medium hover:bg-accent/40 transition-colors", className),
		"aria-label": "Share this page",
		children: copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4 text-success" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Copied!" })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Share" })] })
	});
}
//#endregion
export { ShareButton as t };
