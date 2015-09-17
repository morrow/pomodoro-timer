'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Timer = (function () {
  function Timer(mode) {
    var task = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

    _classCallCheck(this, Timer);

    var DURATIONS = {
      work: 25,
      long_break: 10,
      short_break: 5
    };
    this.mode = mode;
    this.task = task;
    if (task === '') {
      this.task = this.mode;
    }
    this.modes = ['initialized', 'started', 'paused', 'ended'];
    this.state = this.modes[0];
    this.duration = this.DURATIONS[this.mode];
    this.pause_duration = 0;
    this.created = new Date().getTime();
    this.started_at = false;
    this.finished_at = false;
    this.calculateTime();
  }

  _createClass(Timer, [{
    key: 'stateChange',
    value: function stateChange() {
      var state = arguments.length <= 0 || arguments[0] === undefined ? this.state : arguments[0];

      this.state = state;
      $('body')[0].className = '' + this.state;
      $('#state').html(this.state);
      $('#mode').html(this.mode.replace(/_/g, ' '));
    }
  }, {
    key: 'start',
    value: function start() {
      if (this.state === 'started' || this.state === 'ended') {
        return false;
      }
      this.stateChange('started');
      if (this.started_at === undefined) {
        this.started_at = new Date().getTime();
      }
      if (window.localStorage['started_at']) {
        this.starting_time = window.localStorage['started_at'];
      }
      window.localStorage['started_at'] = this.started_at;
      window.clearInterval(this.timer_interval);
      this.timer_interval = window.setInterval(this.calculateTime(), 1000);
      if (this.pause_started_at) {
        this.pause_ended_at = new Date().getTime();
        this.pause_duration = this.pause_duration + this.pause_ended_at - this.pause_started_at;
      }
      if (window.pomodoro) {
        window.pomodoro.render();
      }
    }
  }, {
    key: 'pause',
    value: function pause() {
      window.clearInterval(this.timer_interval);
      this.stateChange('paused');
      this.pause_started_at = new Date().getTime();
    }
  }, {
    key: 'reset',
    value: function reset() {
      $('#task').val('');
      this.stateChange('reset');
      this.started_at = null;
      this.pause_started_at = false;
      this.pause_duration = 0;
      delete window.localStorage['starting_time'];
      delete window.localStorage['task'];
    }
  }, {
    key: 'calculateTime',
    value: function calculateTime() {
      if (!!this.started_at) {
        time = this.duration * 60 * 1000 - (new Date().getTime() - this.started_at) + this.pause_duration;
      } else {
        time = this.duration * 60 * 1000;
      }
      if (time <= 0) {
        window.clearInterval(this.timer_interval);
        this.finished_at = new Date().getTime();
        this.time_remaining = '' + this.duration;
        window.pomodoro.switchModes();
      } else {
        if (this.mode === 'work') {
          this.task = $('#task').val();
        } else {
          this.task = this.mode.replace(/_/, ' ');
        }
        minutes = Math.floor(time / 1000 / 60 % 60);
        seconds = Math.round(time / 1000 % 60).toString();
        if (parseInt(minutes) < 10) {
          minutes = '0' + minutes;
        }
        if (parseInt(seconds) < 10) {
          seconds = '0' + seconds;
        }
        if (seconds === undefined) {
          seconds = '00';
        }
        this.time_remaining = minutes + ':' + seconds;
        if (window.pomodoro) {
          window.pomodoro.render();
        }
      }
    }
  }, {
    key: 'formatTime',
    value: function formatTime(time) {
      d = new Date(time);
      hours = d.getHours();
      minutes = d.getMinutes();
      seconds = d.getSeconds();
      if (parseInt(hours) < 10) {
        hours = '0' + hours;
      }
      if (parseInt(minutes) < 10) {
        minutes = '0' + minutes;
      }
      if (parseInt(seconds) < 10) {
        seconds = '0' + seconds;
      }
      return d.getMonth() + 1 + '/' + d.getDate() + '/' + d.getFullYear() + ' ' + hours + ':' + minutes + ':' + seconds;
    }
  }, {
    key: 'toHTML',
    value: function toHTML() {
      var finished_at = '';
      if (this.finished_at) {
        finished_at = this.formatTime(this.finished_at);
      }
      return '\n      <div class=\'timer\' data-state=\'' + this.state + '\' data-mode=\'' + this.mode + '\'>\n        <div class=\'time-remaining\'>' + this.time_remaining + '</div>\n        <div class=\'task\'>' + this.task + '</div>\n        <div class=\'state\'>' + this.state + '</div>\n        <div class=\'started-at\'>' + this.formatTime(this.started_at) + '</div>\n        <div class=\'finsihed-at\'>' + finished_at + '</div>\n      </div>\n    ';
    }
  }]);

  return Timer;
})();