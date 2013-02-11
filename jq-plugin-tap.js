(function ($) {
  $.fn.addEvt = (function () {
    var dTarget, $dTarget, evtType;

    var tapHandler = function (evt) {
      // Monitor.addLog('tapHandler() - ' + evt.type);
      // console.log(evt.target);
      // console.log(this);
      // Monitor.addLog('timer: '+ this.Tap.timer);

      // Set correct evtType
      if (evt.type === 'touchstart') {
        evtType = 'longTap';
        evt.preventDefault();
      } else {
        if (this.Tap.timer === undefined) {
          evtType = 'click';
        } else {
          evtType = 'longTap';
          clearTimeout(this.Tap.timer);
        }
      }

      // Monitor.addLog('evtType: - ' + evtType);

      // whait couple hundred milliseconds for other action.
      // Touchend is not an option because of browser bugs.
      this.Tap.timer = setTimeout( $.proxy( function(){
        this.Tap.timer = undefined;

        switch (evtType) {
          case 'tap':
            this.Tap.tap.call(this, evt);
            this.Tap.release.call(this, evt);
            break;
          case 'longTap':
            this.Tap.longTap.call(this, evt);
            this.Tap.release.call(this, evt);
            break;
          case 'drag':
            return false;
            break;
          case 'click':
            this.Tap.tap.call(this, evt);
            this.Tap.release.call(this, evt);
        }
      }, this ), 200);
    };

    var dragHandler = function (evt) {
      evtType = 'drag';
      this.Tap.drag.call(this, evt);
    }

    var releaseHandler = function (evt) {
      if (evtType === 'drag') {
        this.Tap.release.call(this, evt);
      }

      // If screen released, set evet to "tap" insted of "longTap"
      evtType = 'tap';
    };

    return function (inpEvtType, inpCallback) {
      $dTarget = this;
      // dTarget = this[0];

        $dTarget.each(function(index, dTarget) {
          // Setup event listeners first time only
          if (typeof dTarget.Tap === 'undefined') {
            dTarget.Tap = {
              tap: function (evt) {
                // Monitor.addLog('tap');
              },
              longTap: function (evt) {
                // Monitor.addLog('longTap');
              },
              drag: function (evt) {
                // Monitor.addLog('drag');
              },
              release: function (evt) {
                // Monitor.addLog('release');
              },
              timer: undefined
            };

            $(dTarget).on('touchstart', tapHandler);
            $(dTarget).on('click', tapHandler);
            $(dTarget).on('dblclick', dTarget.Tap.longTap);
            $(dTarget).on('touchmove', dragHandler);
            $(dTarget).on('touchend', releaseHandler);
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

      // Maintains chainability
      return this;
    }
  }());
}(jQuery));