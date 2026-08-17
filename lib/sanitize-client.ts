"use client";

import DOMPurify from "dompurify";

export function sanitizeHtmlClient(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "s", "a", "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li", "blockquote", "code", "pre", "img", "span", "div",
      "table", "thead", "tbody", "tr", "th", "td", "hr",
    ],
    ALLOWED_ATTR: [
      "href", "src", "alt", "title", "class", "id", "style", "target", "rel",
    ],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input", "button"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur"],
  });
}