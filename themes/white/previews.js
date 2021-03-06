// StyleDocco JavaScript for preview iframes
// =========================================
(function () {

'use strict';

// Helper functions
// ================
var toArray = function(obj) { return Array.prototype.slice.call(obj); };

var bodyEl = document.getElementsByTagName('body')[0];

// Pseudo classes
// ==============
// Scans your stylesheet for pseudo classes and adds a class with the same name.
// Compile regular expression.
var pseudos = [ 'link', 'visited', 'hover', 'active', 'focus', 'target',
                'enabled', 'disabled', 'checked' ];
var pseudoRe = new RegExp(":((" + pseudos.join(")|(") + "))", "gi");
var applyPseudoStyles = function () {
  var processedPseudoClasses = toArray(document.styleSheets)
    .map(function(ss) {
      return toArray(ss.cssRules)
        .filter(function(rule) {
          // Keep only rules with pseudo classes.
          return rule.selectorText && rule.selectorText.match(pseudoRe);
        })
        .map(function(rule) {
          // Replace : with . and encoded :
          return rule.cssText.replace(pseudoRe, ".\\3A $1");
        })
        .join('');
    })
    .join('');
  if (processedPseudoClasses.length) {
    // Add a new style element with the processed pseudo class styles.
    var styleEl = document.createElement('style');
    styleEl.innerText = processedPseudoClasses;
    var oldStyleEl = document.getElementsByTagName('style')[0];
    oldStyleEl.parentNode.insertBefore(styleEl, oldStyleEl);
  }
};

// running processCSS immediately causes nothing to be done as document.styleSheets
// doesn't have all the CSS yet. This timeout is enough time for document.styleSheets
// to be updated and the pseudo styles to be added
setTimeout(applyPseudoStyles, 1);

// Resizing
// ========
// Get bottom-most point in document with an element.
// `offsetHeight`/`scrollHeight` will not work with absolute or fixed elements.
var getContentHeight = (function(iframeHeightGutter) {
  var bodyStyle = window.getComputedStyle(bodyEl, null);
  return function() {
    if (bodyEl.childElementCount === 0) return bodyEl.offsetHeight;
    var els = bodyEl.getElementsByTagName('*');
    var elHeights = [];
    for (var i = 0, l = els.length; i < l; i++) {
      elHeights.push(els[i].offsetTop + els[i].offsetHeight +
        parseInt(window.getComputedStyle(els[i], null).getPropertyValue('margin-bottom')) + iframeHeightGutter);
    }
    var height = Math.max.apply(Math, elHeights);
    height += parseInt(bodyStyle.getPropertyValue('padding-bottom'), 10);
    return Math.max(height, bodyEl.offsetHeight);
  };
})(40);

var callbacks = {
  getHeight: function() {
    window.parent.postMessage({ height: getContentHeight() }, '*');
  }
};
window.addEventListener('message', function (ev) {
  if (ev.data == null) return;
  if (typeof ev.data === 'string') callbacks[ev.data]();
}, false);

}());
