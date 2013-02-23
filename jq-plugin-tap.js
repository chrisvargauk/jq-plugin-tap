// v0.0.1

(function ($) {
  $.fn.addEvt = (function () {
    ///////////////////
    // Mobile events //
    ///////////////////

    var hndlTouchstart = function (evt) {
      this.Tap.evtType = 'tap';

      this.Tap.timer = setTimeout( $.proxy( function(){
        // If the mean time started dragging
        if ( this.Tap.evtType === 'drag' ) {
          this.Tap.timer = undefined;
        } else {
          this.Tap.timer = undefined;
          this.Tap.evtType = 'longTap';

          this.Tap.longTap.call(this, evt);
        }
      }, this ), 300);
    }

    var hndlTouchend = function (evt) {
      // If longtap was triggered earlier
      if ( typeof this.Tap.timer === 'undefined' ) {
        this.Tap.release.call(this, evt);
        this.Tap.evtType = undefined;
      } else {
        // If hasnt started dragging in the mean time
        if ( this.Tap.evtType !== 'drag' ) {
          this.Tap.tap.call(this, evt);
          this.Tap.release.call(this, evt);
        } else {
          this.Tap.release.call(this, evt);
        }
        // Cancel longTap that is coming
        clearTimeout(this.Tap.timer);
        this.Tap.timer = undefined;
      }

      if ( typeof this.Tap.DragDetails !== 'undefined' )
        delete this.Tap.DragDetails;
    }

    var hndlTouchmove = function (evt) {
      // Expose a standard API for accesing drag event on mobile and desktop
      if ( typeof this.Tap.DragDetails === 'undefined' ) {
        this.Tap.DragDetails = {
          x: evt.originalEvent.changedTouches[0].pageX,
          y: evt.originalEvent.changedTouches[0].pageY,
          xPrev: evt.originalEvent.changedTouches[0].pageX,
          yPrev: evt.originalEvent.changedTouches[0].pageY,
          xDiff: 0,
          yDiff: 0
        };
      } else {
        this.Tap.DragDetails.xDiff = evt.originalEvent.changedTouches[0].pageX - this.Tap.DragDetails.xPrev;
        this.Tap.DragDetails.yDiff = evt.originalEvent.changedTouches[0].pageY - this.Tap.DragDetails.yPrev;

        this.Tap.DragDetails.x = evt.originalEvent.changedTouches[0].pageX;
        this.Tap.DragDetails.y = evt.originalEvent.changedTouches[0].pageY;
        this.Tap.DragDetails.xPrev = evt.originalEvent.changedTouches[0].pageX;
        this.Tap.DragDetails.yPrev = evt.originalEvent.changedTouches[0].pageY;
      }

      this.Tap.evtType = 'drag';
      this.Tap.drag.call(this, evt);
    }


    ////////////////////
    // Desktop events //
    ////////////////////

    // I need this variable here to cancel all tap and long tap events if started dragging
    var isDragging = false;

    var hndlMousedown = function (evt) {
      this.Tap.isActive = true;
      this.Tap.evtType = 'tap';

      // if there was a mosuedown just now
      if ( typeof this.Tap.timer !== 'undefined' ) {
        this.Tap.evtType = 'longTap';
        clearTimeout(this.Tap.timer);
        this.Tap.timer = undefined;

        this.Tap.longTap.call(this, evt);
      } else {
        this.Tap.timer = setTimeout( $.proxy( function(){ // use proxy instead of bind, because Galaxy SII doesnt have it.
          clearTimeout(this.Tap.timer);
          this.Tap.timer = undefined;

          if ( isDragging )
            return true;

          this.Tap.tap.call(this, evt);
        }, this ), 300);
      }
    }

    var hndlMouseup = function (evt) {
      this.Tap.isActive = false;
      isDragging = false;

      this.Tap.release.call(this, evt);

      if ( typeof this.Tap.DragDetails !== 'undefined' )
        delete this.Tap.DragDetails;
    }

    var hndlMousemove = function (evt) {
      if ( !this.Tap.isActive )
        return true;

      isDragging = true;

      // Expose a standard API for accesing drag event on mobile and desktop
      if ( typeof this.Tap.DragDetails === 'undefined' ) {
        this.Tap.DragDetails = {
          x: evt.pageX,
          y: evt.pageY,
          xPrev: evt.pageX,
          yPrev: evt.pageY,
          xDiff: 0,
          yDiff: 0
        };
      } else {
        // Deal with a bug - tudo: decribe bug
        if (this.Tap.DragDetails.x !== evt.pageX ||
            this.Tap.DragDetails.y !== evt.pageY
        ) {
          this.Tap.DragDetails.xDiff = evt.pageX - this.Tap.DragDetails.xPrev;
          this.Tap.DragDetails.yDiff = evt.pageY - this.Tap.DragDetails.yPrev;

          this.Tap.DragDetails.x = evt.pageX;
          this.Tap.DragDetails.y = evt.pageY;
          this.Tap.DragDetails.xPrev = evt.pageX;
          this.Tap.DragDetails.yPrev = evt.pageY;

          this.Tap.drag.call(this, evt);
        }
      }
    }

    return function (inpEvtType, inpCallback) {
      var $dTarget = this; // to make it clear that is a jQuery obj

      // Attach reference (Tap obj) to every selected DOM element first time only
      $dTarget.each(function(index, dTarget) {
        if (typeof dTarget.Tap === 'undefined') {
          dTarget.Tap = {
            tap: function (evt) {
              // Monitor.addLog('tap');
            },
            longTap: function (evt) {
              // Monitor.addLog('ongTap');
            },
            drag: function (evt) {
              // Monitor.addLog('drag');
            },
            release: function (evt) {
              // Monitor.addLog('release');
            },
            isActive: false,
            timer: undefined
          };

          if ( navigator.userAgent.indexOf('Android') !== -1 ) {
            $(dTarget).on('touchstart', hndlTouchstart);
            $(dTarget).on('touchend', hndlTouchend);
            $(dTarget).on('touchmove', hndlTouchmove);
          } else {
            $(dTarget).on('mousedown', hndlMousedown);
            $(dTarget).on('mouseup', hndlMouseup);
            $(dTarget).on('mousemove', hndlMousemove);
          }
        }
      });

      // If there is no input dont change default evts and callbacks
      if ( typeof inpEvtType === 'undefined' ||
           typeof inpCallback === 'undefined'
        ) return false;

      // Replace empty function with callback
      $dTarget.each(function(index, dTarget) {
        dTarget.Tap[inpEvtType] = inpCallback;
      });

      return this;
    }
  }());

  $(function () {
    if ( navigator.userAgent.indexOf('Android') !== -1 ) {
      $('body').on('touchstart', function (evt) {
        // This make mousemove to be triggered continuously if you move your finger on the screen.
        evt.preventDefault();
      });
    }
  });
}(jQuery));