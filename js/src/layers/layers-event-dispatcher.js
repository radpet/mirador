(function ($) {

  var LayersEventDispatcher = function (config) {
    this.windowId= config.windowId;
    this.eventEmitter = config.eventEmitter;
  };


  LayersEventDispatcher.prototype = {
    emit: function (event, data) {
      console.log('LayersDispatcher is emiting',this.windowId + ':' + event);
      this.eventEmitter.publish(this.windowId + ':' + event, [data]);
    }
  };

  $.LayersEventDispatcher = LayersEventDispatcher;

}(Mirador));