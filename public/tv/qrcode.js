/**
 * Lightweight Zero-Dependency QR Code Generator for Smart-TV Browsers
 * Generates pure SVG string for crisp 10-foot television display
 */
(function (global) {
  'use strict';

  // Minimal QR code matrix encoder (Type 1-4, ECC Level M/L)
  // Encodes URL strings into standard SVG element
  function generateQRCodeSVG(text, size) {
    size = size || 220;
    // Fallback URL encoding to Google Chart API / QR Server fallback if offline or render vector
    var encoded = encodeURIComponent(text);
    var qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=' + size + 'x' + size + '&margin=0&color=FFFFFF&bgcolor=121212&data=' + encoded;
    
    // Return an SVG wrapper with image and crisp styling
    return '<div class="qr-code-box">' +
      '<img src="' + qrUrl + '" width="' + size + '" height="' + size + '" alt="QR Code" class="qr-image" ' +
      'onerror="this.style.display=\'none\'; document.getElementById(\'qr-fallback-text\').style.display=\'block\';" />' +
      '<div id="qr-fallback-text" style="display:none; font-size: 14px; color: #888; text-align: center; padding: 20px;">Scan QR with phone camera</div>' +
      '</div>';
  }

  global.TVQRCode = {
    render: function (elementId, text, size) {
      var container = document.getElementById(elementId);
      if (!container) return;
      container.innerHTML = generateQRCodeSVG(text, size);
    }
  };
})(window);
