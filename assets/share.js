/* SPHINX shared loader: keep AI Policy visible in primary navigation, then load share controls. */
(function () {
  'use strict';

  var style = document.createElement('style');
  style.textContent = '.nav-policy{display:list-item!important}.nav-policy>a{color:var(--gold,#C9A84C)!important;font-weight:700}';
  document.head.appendChild(style);

  var source = document.currentScript || document.querySelector('script[src*="share.js"]');
  var core = document.createElement('script');
  core.src = '/assets/share-core.js';
  core.defer = true;
  if (source && source.dataset) {
    Object.keys(source.dataset).forEach(function (key) { core.dataset[key] = source.dataset[key]; });
  }
  document.head.appendChild(core);
})();
