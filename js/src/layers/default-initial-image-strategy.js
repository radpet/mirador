(function ($) {

  var DefaultInitialImageStrategy = function () {

  };


  DefaultInitialImageStrategy.prototype = {
    chooseInitialImage: function (canvas) {
      return {
        index: 0,
        url: $.Iiif.getImageUrl(canvas)
      };
    }
  };

  $.DefaultInitialImageStrategy = DefaultInitialImageStrategy;

}(Mirador));