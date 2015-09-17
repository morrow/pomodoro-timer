'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Pomodoro = (function () {
  function Pomodoro() {
    _classCallCheck(this, Pomodoro);

    this.timers = [];
    this.current_mode = 'work';
    this.next_mode = 'short_break';
    this.loadStorage();
    this.createTimer();
    this.listen();
  }

  _createClass(Pomodoro, [{
    key: 'loadStorage',
    value: function loadStorage() {
      if (window.localStorage['task']) {
        $('#task').val(window.localStorage['task']);
      }
    }
  }, {
    key: 'getCurrentTimer',
    value: function getCurrentTimer() {
      return this.timers[this.timers.length - 1];
    }
  }, {
    key: 'listen',
    value: function listen() {
      var _this = this;

      ['start', 'pause', 'reset'].map(function (action) {
        $('#' + action).on('click', function (e) {
          _this.getCurrentTimer()[e.target.id]();
        });
        $('#task').on('keyup', function (e) {
          window.localStorage['task'] = $('#' + e.target.id).val();
        });
      });
    }
  }, {
    key: 'createTimer',
    value: function createTimer() {
      var task = $('#task').val();
      var mode = this.current_mode;
      if (this.timers.length > 0) {
        this.timers[this.timers.length - 1].state = 'ended';
      }
      var timer = new Timer(mode, task);
      this.timers.push(timer);
      this.render();
      return timer;
    }
  }, {
    key: 'switchModes',
    value: function switchModes() {
      var _current_mode = this.current_mode;
      this.current_mode = this.next_mode;
      this.next_mode = _current_mode;
      var timer = this.createTimer();
      this.timers[this.timers.length - 1].start();
      if ($('#notifications')[0].checked) {
        var n = new Notification("Time's Up", {
          body: timer.time_remaining + ' of ' + this.current_mode + ' begins now.',
          icon: '/assets/images/time.jpg'
        });
        window.setTimeout(n.close.bind(n), 3000);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      $('body')[0].className = this.current_mode + ' ' + this.getCurrentTimer().state;
      $('#history').html('');
      this.timers.slice(0, -1).map(function (item) {
        $('#history').append(item.toHTML());
      });
      $('#current-timer').html(this.timers.slice(-1)[0].toHTML());
      document.title = ' ' + this.current_mode + ' ' + this.getCurrentTimer().time_remaining + ' | Pomodoro Timer';
      $('#time_remaining').html(this.getCurrentTimer().time_remaining);
    }
  }]);

  return Pomodoro;
})();