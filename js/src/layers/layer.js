// Base component for each layer

/**
 * Contains:
 *
 *  [visible]  (Thumbnail)  Name [ more options (dropdown)]
 *  [locked]
 */

/**
 * TODO state machine for each layers operation ?
 */


(function ($) {

  $.Layer = function (options) {
    jQuery.extend(true, this, {
      element: null,
      appendTo: null,
      manifest: null,
      visible: null,
      state: null,
      position: null,
      image: null,
      eventEmitter: null
    }, options);
    this.init();
  };

  $.Layer.prototype = {
    init: function () {
      var _this = this;
      this.model = new LayerModel($.genUUID());
      this.model.setImage(this.image);
      this.model.setPosition(this.position);
      this.model.setTitle('Dummy');

      this.view = jQuery(this.render(this.model));
      this.attachViewEvents(this.view);
      this.initLayoutEffectsSliders(this.view);
      this.counter = 0;
    },
    render: function (model) {
      return this.template(model);
    },
    getView: function () {
      return this.view;
    },
    attachViewEvents: function (element) {
      element.find('.layer-config').click(this.handleLayerConfigClick.bind(this));
      element.find('.layer-visible input').click(this.handleVisibilityClick.bind(this));
      element.find('.layer-control.layer-effects input').click(this.handleLayerEffectsControl.bind(this));
      //  element.find('.layer-locked input').click(this.handleLockClick.bind(this));
    },
    initLayoutEffectsSliders: function (element) {
      element.find('.layer-effects-container .layer-control-slider').slider({});
    },
    handleLayerEffectsControl: function () {
      console.log('should find container');
      this.view.find('.layer-effects-container').toggleClass('hide').toggleClass('show');
    },
    handleVisibilityClick: function () {
      if (this.model.isVisible()) {
        // hide the layer opacity = 0 ? // better don't render
        this.model.setVisible(false);
      } else {
        // show the layer opacity = 1?
        this.model.setVisible(true);
      }
    },
    handleLockClick: function () {

    },
    handleLayerConfigClick: function () {
      console.log('LayerConfigMenuShouldOpen');
    },
    getModel: function () {
      return this.model;
    },
    template: Handlebars.compile([
      '<li class="layer" id="{{getId}}">',
      '<div class="drag-handle"> ',
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M20 9H4v2h16V9zM4 15h16v-2H4v2z"/></svg>',
      //'<div class="layer-locked"><input type="checkbox" name="" /><i class="fa fa-lock" aria-hidden="true"></i></div>',//fa-unlock
      '</div>',
      '<section class="main-section">',
        '<div class="clearfix">',
          '<div class="thumbnail-image"><img src="{{getThumbnail}}"></div>',
          '<div class="content">',
          '<div class="title"><span class="id">{{getTitle}}</span></div>',
          '<div class="horizontal-menu">',
          '<label class="layer-control layer-visible"><input type="checkbox" name="" checked /><i></i></label>',
          '<label class="layer-control layer-lock"><input type="checkbox" name="" /><i></i></label>',
          '<label class="layer-control layer-transform"><i class="fa fa-arrows-h" aria-hidden="true"></i></label>',
          '<label class="layer-control layer-effects"><input type="checkbox" name="" checked /><i></i></label>',
          '</div>',
          '<div class="reset-button"><label class="layer-control layer-reset"><i class="fa fa-refresh" aria-hidden="true"></i></label></div>',
          '</div>',
        '</div>',
        '<div class="layer-effects-container hide">',
          '<div class="layer-control-slider-container"><label><i class="fa fa-television"></i></label><div class="layer-control-slider opacity-slider"></div></div>',
          '<div class="layer-control-slider-container"><label><i class="material-icons">brightness_6</i></label><div class="layer-control-slider brightness-slider"></div></div>',
          '<div class="layer-control-slider-container"><label><i class="material-icons">wb_sunny</i></label><div class="layer-control-slider contrast-slider"></div></div>',
        '</div>',
      '</section>',
      '</li>'
    ].join(''))


  };

  var LayerModel = function (id) {
    this.visible = true;
    this.locked = false;
    this.id = id;
  };

  LayerModel.prototype = {
    setVisible: function (visible) {
      this.visible = visible;
      console.log('LayerModel:', this.id, 'visibility:', this.visible);
    },
    isVisible: function () {
      return this.visible;
    },
    lock: function () {
      this.locked = true;
    },
    unlock: function () {
      this.locked = false;
    },
    isLocked: function () {
      return this.locked;
    },
    getId: function () {
      return this.id;
    },
    getPosition: function () {
      return this.position;
    },
    setPosition: function (position) {
      this.position = position;
    },
    setImage: function (image) {
      this.image = image;
    },
    getImage: function () {
      return this.image;
    },
    setTitle: function (title) {
      this.title = title;
    },
    getTitle: function () {
      return this.title;
    },
    getThumbnail: function () {
      var version = "2";
      if (this.getImage()) {
        console.log(this.getImage());
        return $.Iiif.makeUriWithWidth(this.getImage().resource.service['@id'], 54, version);
      }
    }



    //choices model extends the layers

  };

}(Mirador));
