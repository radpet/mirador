(function ($) {

  var ImageResourceTransformCanvas = function (options) {
    jQuery.extend(true, this, {
      osd: null,
      eventEmitter: null,
      windowId: null,
      state: null
    }, options);

    this.init();
  };


  ImageResourceTransformCanvas.prototype = {
    init: function () {

      this.enabled = false;
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'layer_transform_canvas_' + this.windowId;
      this.canvas.style.border = '1px solid yellow';
    },
    enable: function (imageResource) {
      if (this.enabled) {
        console.error("Already enabled");
        return;
      }
      this.enabled = true;
      this.currentImageResource = imageResource;


      var homeBounds = this.osd.viewport.getHomeBounds();
      this.osd.viewport.fitBounds(homeBounds, true);
      this.osd.setMouseNavEnabled(false);
      this.osd.addOverlay({
        element: this.canvas,
        location: homeBounds
      });
      this.paperScope = new paper.PaperScope();
      this.paperScope.setup(this.canvas);
      this.paperScope.activate();

      //too hacked create a parser
      var version = $.Iiif.getVersionFromContext(imageResource.imageInIIIF.resource.service['@context']);
      var url = $.Iiif.getThumbnailForImage(imageResource.imageInIIIF, 1024);

      var _this = this;
      var raster = new this.paperScope.Raster({
        source: url,
        position: {
          x: 0,
          y: 0
        }
      });

      this.resize(imageResource.tiledImage);
      _this.raster = raster;
      var imageBounds = imageResource.tiledImage.getBoundsNoRotate(true);
      var imageBoundsCenter = imageBounds.getCenter();
      var imageToOSDViewportRatio;

      console.log(imageBounds,imageBounds.getCenter());
      console.log(imageResource.tiledImage.source);
      imageToOSDViewportRatio = (imageResource.tiledImage.source.width / (imageBounds.width));

      console.log('image to osd ratio',imageToOSDViewportRatio);


      var annotationUtils = new $.AnnotationUtils();
      raster.onLoad = function () {
       // imageResource.hide();

        raster.position = new _this.paperScope.Point(imageBoundsCenter.x * imageToOSDViewportRatio , imageBoundsCenter.y * imageToOSDViewportRatio);
        raster.width = imageResource.tiledImage.source.width;
        raster.height = imageResource.tiledImage.source.height;
        raster.fullySelected = true;

        imageResource.setRotation(imageResource.getRotation());

        raster.rotate(imageResource.getRotation());

        if (raster.data.rotationIcon) {
          raster.data.rotation = imageResource.getRotation();
          raster.data.rotationIcon.addData('pivot', raster.bounds.getCenter());
          raster.data.rotationIcon.addData('type', 'rotationIcon');
          raster.data.rotationIcon.addData('self', raster.data.rotationIcon);
          raster.data.rotationIcon.addData('parent', raster);

          raster.data.rotationIcon.setPosition(raster.data.rotationIcon.getData('pivot').add(new _this.paperScope.Point(0, 21 / _this.paperScope.view.zoom).rotate(raster.data.rotation)));
        }

      };

      if (!raster.data.rotationIcon) {
        raster.data.rotationIcon = new annotationUtils.RotationIcon(_this.paperScope, {
          name: raster.name + 'rotation',
          fillColor: raster.selectedColor
        });
      }

      if (!raster.data.group) {
        raster.data.group = new annotationUtils.Group(this.paperScope, [raster, raster.data.rotationIcon.getItem(), raster.data.rotationIcon.getMask().getItem()]);
      }

      raster.data.rotationIcon.getMask().getItem().onMouseDrag = function (event) {
        var rotation = Math.atan2(event.point.y - raster.position.y + event.delta.y, event.point.x - raster.position.x + event.delta.x) - Math.atan2(event.point.y - raster.position.y, event.point.x - raster.position.x);
        rotation = rotation * (180 / Math.PI);
        raster.data.group.rotate(rotation, raster.position);
        raster.data.rotationIcon.rotate(-rotation);
        imageResource.rotate(rotation, true);
      };

      raster.onMouseDrag = function (event) {
        raster.data.group.translateByXY(event.delta.x, event.delta.y);
        // The osd method setPosition rotates the point that is why we should pass the bounds without the rotation
        var clone = raster.clone();
        clone.rotate(-imageResource.getRotation());
        clone.visible = false;
        console.log('clone bounds',clone.bounds);
        var newOsdPos = new OpenSeadragon.Point(clone.bounds.x / imageToOSDViewportRatio, clone.bounds.y / imageToOSDViewportRatio);
        imageResource.tiledImage.setPosition(newOsdPos);
        clone.remove();
      };

      this.resize(imageResource.tiledImage);

      var shape = new this.paperScope.Path({
        //segments: segments,
        fullySelected: true,
        name: "_dummy"
      });

      shape.fillColor = "red";

      this.paperScope.view.draw();

    },
    disable: function () {
      if (this.enabled) {
        this._clearCanvas();
        this.enabled = false;
        this.osd.setMouseNavEnabled(true);
      }
    },
    _saveOrDiscard: function () {

    },
    _clearCanvas: function () {
      this.currentImageResource.show();
      this.currentImageResource = null;
      this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.osd.removeOverlay(this.canvas);
    },

    resize: function (tiledImage) {
      var viewportBounds = this.osd.viewport.getBounds(true);
      /* in viewport coordinates */
      this.canvas.width = this.osd.viewport.containerSize.x;
      this.canvas.height = this.osd.viewport.containerSize.y;
      var transform = 'translate(0px,0px)';
      this.canvas.style.WebkitTransform = transform;
      this.canvas.style.msTransform = transform;
      this.canvas.style.transform = transform;
      this.canvas.style.marginLeft = '0px';
      this.canvas.style.marginTop = '0px';
      if (this.paperScope && this.paperScope.view) {
        this.paperScope.view.viewSize = new this.paperScope.Size(this.canvas.width, this.canvas.height);
        this.paperScope.view.zoom = tiledImage.viewportToImageZoom(this.osd.viewport.getZoom(true));
        console.log('zoom',this.paperScope.view.zoom,1/this.paperScope.view.zoom);
        console.log('viewport center',viewportBounds.getCenter());
        this.paperScope.view.center = new this.paperScope.Size(
            //(tiledImage.source.dimensions.x /2 * viewportBounds.x + this.paperScope.view.bounds.width / 2),
         // tiledImage.source.dimensions.y /2 * viewportBounds.y + this.paperScope.view.bounds.height / 2
            viewportBounds.getCenter().x * tiledImage.source.dimensions.x* (1/tiledImage.getBounds(true).width ),
            viewportBounds.getCenter().y * tiledImage.source.dimensions.x*( 1/tiledImage.getBounds(true).width )
        );
        if(this.center) this.center.remove();
        this.center = new this.paperScope.Path.Circle(new this.paperScope.Point(tiledImage.source.dimensions.x * viewportBounds.x + this.paperScope.view.bounds.width / 2, tiledImage.source.dimensions.y * viewportBounds.y + this.paperScope.view.bounds.height / 2), 50);
        this.center.fillColor = 'red';
        this.paperScope.view.update(true);
      }
    }

  };


  $.ImageResourceTransformCanvas = ImageResourceTransformCanvas;

}(Mirador));


/**

 Known issues:
 Layer translate does not work properly with multiple slots on the left/right (the space left for the viewer is too narrow)
 Layer rotation and translate near canvas does not work properly;

 */