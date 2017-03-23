//Can be static and stateless

(function ($) {

  $.CanvasManifestPersistence = function (options) {
    jQuery.extend(true, this, {
      manifest: null,
      canvasID: null
    }, options);

    this.init();
  };

  $.CanvasManifestPersistence.prototype = {
    init: function () {
    },
    persistCanvas: function () {
    }
  };

}(Mirador));
