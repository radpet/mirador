// Main Component rendered in the layers tab


(function ($) {

  $.Layers = function (options) {
    jQuery.extend(true, this, {
      manifest: null,
      canvasID: null,
      state: null,
      eventEmitter: null,
      windowId: null,
    }, options);

    this.init();
  };

  $.Layers.prototype = {
    init: function () {
      var _this = this;
      _this.slotWindowElement = _this.state.getWindowElement(this.windowId);
      this.idToLayer = {};
      this.layers = [];

      this.canvas = this.getCanvasFromManifest();

      var tmplOpts = {
        layers: this.layers
      };

      this.events = [];
      console.log('subscribing', this.windowId + ':image-resource-tile-source-opened');
      this.events.push(this.eventEmitter.subscribe(this.windowId + ':image-resource-tile-source-opened', function (event, data) {
        var imageResource = data.detail;
        console.log('imageResourceLoaded', imageResource);

        var layer = new $.Layer({
          windowId: _this.windowId,
          eventEmitter: _this.eventEmitter,
          imageResource: imageResource
        });
        _this.addLayer(layer);
      }));

      this.events.push(this.eventEmitter.subscribe(this.windowId + ':layers-resource-removed', function (event, resource) {
        console.log('Should remove find and remove the layer + maybe adjust zIndex');
        var indexToRemove;
        _this.layers.forEach(function (layer, index) {
          if (layer.model.getId() === resource.getId()) {
            layer.destroy();
            delete _this.idToLayer[resource.getId()];
            indexToRemove = index;
          }
        });

        _this.layers.splice(indexToRemove, 1);
        _this.refresh();
      }));

      this.render(tmplOpts);
      this.bindAddLayerButtonEvent();
    },

    bindAddLayerButtonEvent: function () {
      var _this = this;
      this.element.find('.add-layers').on('click', function () {
        var dialogBuilder = new $.DialogBuilder(_this.slotWindowElement);
        var availableImages = $.Iiif.getAllImagesFromManifest(_this.manifest.jsonLd);

        var imageThumbnailsUrl = Object.keys(availableImages).map(function (imageId) {
          return {id: imageId, thumbnailUrl: $.Iiif.getThumbnailForImage(availableImages[imageId], 128)};
        });
        var dialog = dialogBuilder.dialog({
          title: 'Choose image to add',
          message: jQuery(_this.addImageAsLayerTemplate({
            imageThumbnailsUrl: imageThumbnailsUrl
          })),
          closeButton: false,
          buttons: {
            confirm: {
              label: 'Choose',//i18n
              className: 'btn-success',
              callback: function () {
                var selectedValue = jQuery('.add-image-as-layer').data("picker").selected_values()[0];
                _this.eventEmitter.publish(_this.windowId + ':layers-add-resource', [availableImages[selectedValue]]);
                jQuery('.add-image-as-layer').data('picker').destroy();
              }
            },
            cancel: {
              label: 'Cancel',
              className: 'btn-danger',
              callback: function () {
                jQuery('.add-image-as-layer').data('picker').destroy();
                dialog.modal('hide');
                console.log(dialog);
              }
            }
          }
        });
        dialog.init(function () {
          jQuery('.add-image-as-layer').imagepicker();
          var picker = jQuery('.thumbnails.image_picker_selector');

          //hope to not leak;
          picker.imagesLoaded(function () {
            picker.masonry({
              itemSelector: '.thumbnail'
            });
          });

        });
      });
    },
    addImageAsLayerTemplate: Handlebars.compile([
      '<select class="image-picker masonry add-image-as-layer">',
      ' {{#each imageThumbnailsUrl}}',
      '<option data-img-src="{{this.thumbnailUrl}}" value="{{this.id}}" > Image1  </option>',
      '{{/each}}',
      '</select>'
    ].join('')),

    getCanvasFromManifest: function () { //should call canvas-manifest-persistence?
      return this.manifest.getCanvases()[$.getImageIndexById(this.manifest.getCanvases(), this.canvasID)];
    },
    render: function (tmplOpts) {
      console.log('Rendering layers tab component');
      var _this = this;
      this.element = jQuery(this.template(tmplOpts));
      this.view = this.element.find('ul');

    },
    addLayer: function (layer) {
      console.log('adding layer');
      this.layers.push(layer);
      this.idToLayer[layer.imageResource.id] = layer;
      this.addLayerView(layer);
    },
    addLayerView: function (layer) {
      this.view.prepend(layer.getView());
      this.makeSortable();
    },
    removeLayer: function () {

    },
    refresh: function () {
      this.makeSortable();
    },
    makeSortable: function () {
      var _this = this;
      if (this.view.sortable('instance')) {
        this.view.sortable('destroy');
      }
      this.view.sortable({
        items: "> li",
        handle: '.drag-handle',
        update: function () {
          _this.onSortableListUpdated(this);
        }
      });
    },
    onSortableListUpdated: function (el) {
      console.log("List is being reordered");
      var updatedList = jQuery(el).sortable('toArray');
      updatedList.reverse();
      this.updateLayersPosition(updatedList);
      console.log('Model after reorder', this.layers);
      this.eventEmitter.publish(this.windowId + ':layers-zIndex-updated');
    },
    //somebody else should handle this, but for now lets put it here
    updateLayersPosition: function (layers) {
      var _this = this;

      console.log(layers, layers.length, this.layers.length);

      var currentIds = this.layers.map(function (layer) {
        return layer.model.getId();
      });

      //this.layers = must be properly arranged
      //getDiff with current arrangement
      var firstDiff = -1;
      var i;
      for (i = 0; i < this.layers.length; i++) {
        console.log(currentIds[i], 'vs', layers[i]);
        if (currentIds[i] !== layers[i]) {
          firstDiff = i;
          break;
        }
      }

      for (i = firstDiff; i < this.layers.length; i++) {
        this.layers[i] = this.idToLayer[layers[i]];
        console.log(layers[i]);
        // reverse them
        this.layers[i].imageResource.zIndex = i;

      }
    },
    getView: function () {
      return this.element;
    },
    destroy: function () {
      this.getView().remove();

      var _this = this;
      this.events.forEach(function (event) {
        _this.eventEmitter.unsubscribe(event.name, event.handler);
      });
    },
    template: Handlebars.compile([
      '<div class="layers">',
      '<div class="add-layers layer">',
      '<div class="plus">+</div>',
      '<h4>Add layer</h4>',//i18n
      '</div>',
      '<ul>',
      '</ul>',
      '</div>',
    ].join(''))
  };

}(Mirador));
