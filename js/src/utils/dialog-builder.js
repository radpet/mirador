(function ($) {
  $.DialogBuilder = function (container) {
    this.container = container || jQuery('.window');

    bootbox.setDefaults({
      container: this.container
    });
  };

  $.DialogBuilder.prototype = {
    confirm: function (message, callback) {
      this.dialog(bootbox.confirm(message, callback));
      this._attachEvents(this.dialog);
      return this.dialog;
    },
    dialog: function (opts) {
      this.dialog = bootbox.dialog(opts);
      this._attachEvents(this.dialog);
      return this.dialog;
    },
    _attachEvents: function (el) {
      var _this = this;
      jQuery(el).on("shown.bs.modal", function () {
        // set bigger z-index that one used in qtip
        var zIndex = 20000;

        jQuery(el).css('z-index', zIndex);
        // workaround because bootstap does not support external configuration for backdrop parent
        jQuery('.modal-backdrop').prependTo(_this.container).css('z-index', zIndex);
      });
      jQuery(el).on("hidden.bs.modal", function () {
        jQuery('.modal-backdrop').remove();
      });
    }
  };

})(Mirador);