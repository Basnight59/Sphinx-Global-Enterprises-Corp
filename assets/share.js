/*
 * Share button — floating "Share" control for the site.
 *
 * One click opens the phone's/computer's own share sheet where supported
 * (iPhone, Android, Safari, Edge). Elsewhere it opens a small panel with:
 * Copy link, Email, Facebook, X, LinkedIn, WhatsApp.
 *
 * No third-party scripts or trackers: social options are plain share links.
 *
 * Usage (before </body>):
 *   <script src="/assets/share.js" defer
 *     data-accent="#C9A84C" data-bg="#0D1117" data-fg="#EDE5D8"></script>
 *
 * Shared URL = the page's <link rel="canonical"> (falls back to the current
 * address without ?query or #hash). Title = og:title, then <title>.
 */
(function () {
  'use strict';
  if (window.__sphinxShare) return;
  window.__sphinxShare = true;

  var script = document.currentScript || document.querySelector('script[src*="share.js"]');
  var cfg = (script && script.dataset) || {};
  var accent = cfg.accent || '#C9A84C';
  var bg = cfg.bg || '#0D1117';
  var fg = cfg.fg || '#EDE5D8';

  function meta(prop) {
    var el = document.querySelector('meta[property="' + prop + '"]');
    return el ? el.getAttribute('content') : '';
  }
  function shareUrl() {
    var c = document.querySelector('link[rel="canonical"]');
    if (c && c.href) return c.href;
    return location.origin + location.pathname;
  }
  function shareTitle() { return meta('og:title') || document.title; }
  function shareText() { return meta('og:description') || ''; }

  var css =
    '.sx-share{position:fixed;right:20px;bottom:20px;z-index:900;font-family:inherit}' +
    '.sx-share-btn{display:flex;align-items:center;gap:8px;padding:12px 18px;border-radius:999px;' +
      'border:1px solid ' + accent + ';background:' + bg + ';color:' + fg + ';cursor:pointer;' +
      'font-family:inherit;font-weight:600;font-size:14px;line-height:1;letter-spacing:.08em;text-transform:uppercase;' +
      'box-shadow:0 6px 24px rgba(0,0,0,.35);transition:transform .15s ease,background .15s ease}' +
    '.sx-share-btn:hover{transform:translateY(-2px)}' +
    '.sx-share-btn:focus-visible,.sx-share-panel a:focus-visible,.sx-share-panel button:focus-visible{outline:2px solid ' + accent + ';outline-offset:2px}' +
    '.sx-share-btn svg{width:18px;height:18px;stroke:' + accent + '}' +
    '.sx-share-panel{position:absolute;right:0;bottom:calc(100% + 10px);min-width:220px;padding:8px;' +
      'border-radius:12px;border:1px solid ' + accent + ';background:' + bg + ';color:' + fg + ';' +
      'box-shadow:0 12px 40px rgba(0,0,0,.4);display:none}' +
    '.sx-share.open .sx-share-panel{display:block}' +
    '.sx-share-panel a,.sx-share-panel button{display:flex;align-items:center;gap:10px;width:100%;' +
      'padding:10px 12px;border:0;border-radius:8px;background:none;color:inherit;text-decoration:none;' +
      'font-family:inherit;font-weight:500;font-size:15px;line-height:1.2;text-align:left;cursor:pointer}' +
    '.sx-share-panel a:hover,.sx-share-panel button:hover{background:rgba(127,127,127,.15)}' +
    '.sx-share-panel svg{width:18px;height:18px;flex:none;fill:' + accent + '}' +
    '.sx-share-head{padding:6px 12px 8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.7}' +
    '.sx-share-toast{position:absolute;right:0;bottom:calc(100% + 10px);padding:8px 14px;border-radius:8px;' +
      'background:' + accent + ';color:' + bg + ';font-family:inherit;font-weight:600;font-size:13px;line-height:1;white-space:nowrap;' +
      'opacity:0;transform:translateY(4px);transition:opacity .2s,transform .2s;pointer-events:none}' +
    '.sx-share-toast.show{opacity:1;transform:none}' +
    '@media (max-width:600px){.sx-share{right:14px;bottom:14px}.sx-share-btn{padding:12px 14px}.sx-share-label{display:none}}' +
    '@media (prefers-reduced-motion:reduce){.sx-share-btn,.sx-share-toast{transition:none}}' +
    '@media print{.sx-share{display:none}}';

  var ICON = {
    share: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>',
    link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.6 13.4a1 1 0 0 1 0-1.4l3.5-3.5a3 3 0 0 1 4.2 4.2l-2 2a1 1 0 1 1-1.4-1.4l2-2a1 1 0 0 0-1.4-1.4L12 13.4a1 1 0 0 1-1.4 0zM13.4 10.6a1 1 0 0 1 0 1.4l-3.5 3.5a3 3 0 0 1-4.2-4.2l2-2a1 1 0 1 1 1.4 1.4l-2 2a1 1 0 0 0 1.4 1.4L12 10.6a1 1 0 0 1 1.4 0z"/></svg>',
    email: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 2.4V17h16V7.4l-8 5.3-8-5.3zM5.6 7l6.4 4.3L18.4 7H5.6z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8V6.5c0-.8.2-1.3 1.4-1.3H17V2.2C16.7 2.1 15.7 2 14.6 2 12.2 2 10.6 3.4 10.6 6.1V8H8v3.3h2.6V22H14V11.3h2.7L17 8h-3z"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.2-8.3L2 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM3 8.5h3V21H3V8.5zm5 0h2.9v1.7h.1c.4-.8 1.4-1.9 3.1-1.9 3.3 0 3.9 2.2 3.9 5V21h-3v-6.1c0-1.5 0-3.3-2-3.3s-2.3 1.6-2.3 3.2V21H8V8.5z"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1 2.7.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.6-.3z"/></svg>'
  };

  function build() {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var url = shareUrl(), title = shareTitle(), text = shareText();
    var u = encodeURIComponent(url), t = encodeURIComponent(title);

    var links = [
      ['email', 'Email', 'mailto:?subject=' + t + '&body=' + encodeURIComponent((text ? text + '\n\n' : '') + url)],
      ['facebook', 'Facebook', 'https://www.facebook.com/sharer/sharer.php?u=' + u],
      ['x', 'X (Twitter)', 'https://twitter.com/intent/tweet?url=' + u + '&text=' + t],
      ['linkedin', 'LinkedIn', 'https://www.linkedin.com/sharing/share-offsite/?url=' + u],
      ['whatsapp', 'WhatsApp', 'https://wa.me/?text=' + encodeURIComponent(title + ' ' + url)]
    ];

    var wrap = document.createElement('div');
    wrap.className = 'sx-share';
    var panelHtml = '<div class="sx-share-head">Share this page</div>' +
      '<button type="button" data-copy>' + ICON.link + '<span>Copy link</span></button>' +
      links.map(function (l) {
        var ext = l[0] === 'email' ? '' : ' target="_blank" rel="noopener noreferrer"';
        return '<a href="' + l[2] + '"' + ext + '>' + ICON[l[0]] + '<span>' + l[1] + '</span></a>';
      }).join('');

    wrap.innerHTML =
      '<div class="sx-share-panel" id="sx-share-panel" role="menu">' + panelHtml + '</div>' +
      '<div class="sx-share-toast" role="status" aria-live="polite"></div>' +
      '<button type="button" class="sx-share-btn" aria-haspopup="true" aria-expanded="false" aria-controls="sx-share-panel" aria-label="Share this page">' +
        ICON.share + '<span class="sx-share-label">Share</span></button>';
    document.body.appendChild(wrap);

    var btn = wrap.querySelector('.sx-share-btn');
    var toast = wrap.querySelector('.sx-share-toast');
    var toastTimer;

    function showToast(msg) {
      toast.textContent = msg;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
    }
    function setOpen(open) {
      wrap.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    function copy() {
      setOpen(false);
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url).then(function () { showToast('Link copied ✓'); },
          function () { window.prompt('Copy this link:', url); });
      } else {
        window.prompt('Copy this link:', url);
      }
    }

    btn.addEventListener('click', function () {
      // Prefer the device's own share sheet (mobile, Safari, Edge).
      if (navigator.share) {
        navigator.share({ title: title, text: text, url: url }).catch(function (err) {
          if (err && err.name !== 'AbortError') setOpen(true);
        });
        return;
      }
      setOpen(!wrap.classList.contains('open'));
    });
    wrap.querySelector('[data-copy]').addEventListener('click', copy);
    wrap.querySelectorAll('.sx-share-panel a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('click', function (e) { if (!wrap.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && wrap.classList.contains('open')) { setOpen(false); btn.focus(); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
