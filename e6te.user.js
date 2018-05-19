// ==UserScript==
// @name         e6ThumbEnhancer
// @version      0.99
// @description  Makes thumbnails bigger on the post index and elsewhere, using the higher-res "sample" over the "preview", and allows some animated thumbnails.
// @author       rooshoes
// @homepageURL  https://github.com/SuscipiamSingularitatem/e6ThumbEnhancer-UserJS
// @include      https://e621.net/*
// @include      https://e926.net/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// ==/UserScript==

GM_addStyle([
	"span.thumb {\n\twidth: auto;\n\theight: 180px;\n\tmargin: 0 10px 10px 0;\n}",
	"span.thumb .preview {\n\tdisplay: block;\n\theight: 150px;\n\twidth: auto;\n}",
	"#child-posts-expanded-thumbs span.thumb, #child-posts-expanded-thumbs span.thumb .preview {\n\twidth: 180px;\n\theight: auto;\n}",
	"span.thumb .post-score {\n\twidth: auto !important;\n}",
	"span.thumb .tooltip-thumb {\n\tdisplay: block;\n\tposition: relative;\n}",
	"span.thumb .gif, span.thumb .video {\n\tposition: relative;\n\tdisplay: block;\n}",
	"span.thumb .gif:not(:hover)::after, span.thumb .video:not(:hover)::after {\n\tcontent: '';\n\tdisplay: block;\n\tposition: absolute;\n\ttop: 0;\n\tbottom: 0;\n\tleft: 0;\n\tright: 0;\n}",
	"span.thumb .video:not(:hover)::after {\n\tbackground: transparent url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjA2IiBoZWlnaHQ9IjIwNiIgdmlld0JveD0iMCAwIDIwNiAyMDYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxkZWZzPjxjaXJjbGUgaWQ9ImIiIGN4PSI5MCIgY3k9IjkwIiByPSI5MCIvPjxmaWx0ZXIgeD0iLTUwJSIgeT0iLTUwJSIgd2lkdGg9IjIwMCUiIGhlaWdodD0iMjAwJSIgZmlsdGVyVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiBpZD0iYSI+PGZlT2Zmc2V0IGluPSJTb3VyY2VBbHBoYSIgcmVzdWx0PSJzaGFkb3dPZmZzZXRPdXRlcjEiLz48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSI2LjUiIGluPSJzaGFkb3dPZmZzZXRPdXRlcjEiIHJlc3VsdD0ic2hhZG93Qmx1ck91dGVyMSIvPjxmZUNvbXBvc2l0ZSBpbj0ic2hhZG93Qmx1ck91dGVyMSIgaW4yPSJTb3VyY2VBbHBoYSIgb3BlcmF0b3I9Im91dCIgcmVzdWx0PSJzaGFkb3dCbHVyT3V0ZXIxIi8+PGZlQ29sb3JNYXRyaXggdmFsdWVzPSIwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwLjI5NDE1NzYwOSAwIiBpbj0ic2hhZG93Qmx1ck91dGVyMSIvPjwvZmlsdGVyPjwvZGVmcz48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEzIDEzKSI+PHVzZSBmaWxsPSIjMDAwIiBmaWx0ZXI9InVybCgjYSkiIHhsaW5rOmhyZWY9IiNiIi8+PHVzZSBmaWxsLW9wYWNpdHk9Ii44ODEiIGZpbGw9IiNGRkYiIHhsaW5rOmhyZWY9IiNiIi8+PC9nPjxwYXRoIGZpbGwtb3BhY2l0eT0iLjQiIGZpbGw9IiMwMDAiIGQ9Ik04MS41IDE0Ny42NThWNTkuMzQybDY1IDQ0LjE1OCIvPjwvZz48L3N2Zz4=) no-repeat center/80px;\n}",
	"span.thumb .gif:not(:hover)::after {\n\tcontent: 'GIF';\n\twidth: 60px;\n\theight: 30px;\n\tmargin: auto;\n\tfont-size: 16px;\n\tfont-weight: bold;\n\tline-height: 30px;\n\tcolor: rgba(0,0,0,0.4);\n\tbackground-color: rgba(255,255,255,0.8);\n\tborder-radius: 6px;\n\tbox-shadow: 0 0 13px rgba(0,0,0,0.29);\n}",
	"span.thumb .gif:hover .preview {\n\tdisplay: none !important;\n}",
	"span.thumb .gif:hover img.preview {\n\tdisplay: block !important;\n}"
].join("\n"));

(function(){
	"use strict";

	let replaceThumb = function(e, i) {
		e.classList = i.classList;
		let s = window.getComputedStyle(i);
		e.style.border = s.getPropertyValue("border");
		e.style.borderRadius = s.getPropertyValue("border-radius");
		i.parentNode.replaceChild(e, i);
	};

	// Replace image thumbnails with higher resolution
	let doImageReplacement = function(thumb) {
		let newThumb = new Image();
		newThumb.onload = function(t) {
			t.src = this.src;
			if (isGIFRegex.test(t.src)) {
				let c = document.createElement("canvas");
				c.width = t.naturalWidth;
				c.height = t.naturalHeight;
				c.getContext("2d").drawImage(t, 0, 0, c.width, c.height);
				let p = t.parentNode;
				p.classList.add("gif");
				try {
					// if possible, retain all css aspects
					t.src = c.toDataURL("image/gif");
				} catch(e) {
					// cross-domain -- mimic original with all its tag attributes
					replaceThumb(c, t);
					t.style.display = "none";
					p.insertBefore(t, p.firstChild);
				}
			}
		}.bind(newThumb, thumb);
		newThumb.onerror = function(t) {
			this.onerror = null;
			this.src = t.src.replace("/preview/", "/").replace(".jpg", ".gif");
		}.bind(newThumb, thumb);
		newThumb.src = thumb.src.replace("/preview/", "/sample/");
	};

	// Replace video thumbnails with actual playable video (upon callback)
	let createVideoPlayerReq = function(thumb) {
		return {
			method: "GET",
			url: thumb.parentNode.href,
			headers: {Accept: "text/xml"},
			onload: function(response) {
				if (response.readyState !== response.DONE) return;
				if (!response.responseXML) return;
				let fileURLElems = response.responseXML.getElementsByTagName("file_url");
				if (fileURLElems.length < 1) return;
				let video = document.createElement("video");
				video.controls = false;
				video.loop = true;
				video.muted = true;
				video.preload = "metadata";
				video.addEventListener("loadedmetadata", function() {
						thumb.parentNode.classList.add("video");
						thumb.parentNode.addEventListener("mouseenter", video.play);
						thumb.parentNode.addEventListener("mouseleave", video.pause);
						replaceThumb(this, thumb);
					}, false);
				video.src = fileURLElems[0].childNodes[0].nodeValue;
			}
		};
	};

	let isVideoRegex = new RegExp("webm-preview\\.png");
	let isGIFRegex = new RegExp("^(?!data:).*\\.gif", "i");
	let thumbElems = document.querySelectorAll("span.thumb img");
	for (let i = 0; i < thumbElems.length; i++) setTimeout(isVideoRegex.test(thumbElems[i].src)
			? function() {GM_xmlhttpRequest(createVideoPlayerReq(thumbElems[i]));}
			: function() {doImageReplacement(thumbElems[i]);},
		i * 100);
})();
