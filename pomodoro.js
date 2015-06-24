// Generated by CoffeeScript 1.9.1
var Pomodoro, Timer;

Timer = (function() {
  Timer.prototype.DURATIONS = {
    work: 0.2,
    long_break: 0.1,
    short_break: 0.1
  };

  function Timer(mode, task) {
    if (task == null) {
      task = '';
    }
    this.mode = mode;
    this.task = task;
    if (task === '') {
      this.task = this.mode;
    }
    this.modes = ['initialized', 'started', 'paused', 'ended'];
    this.state = this.modes[0];
    this.duration = this.DURATIONS[this.mode];
    this.pause_duration = 0;
    this.created = (new Date()).getTime();
    this.started_at = false;
    this.finished_at = false;
    this.calculateTime();
  }

  Timer.prototype.stateChange = function(state) {
    if (state == null) {
      state = this.state;
    }
    this.state = state;
    $('body')[0].className = "" + this.state;
    $('#state').html(this.state);
    return $('#mode').html(this.mode.replace(/_/g, ' '));
  };

  Timer.prototype.start = function() {
    this.stateChange('started');
    if (!this.started_at) {
      this.started_at = (new Date).getTime();
    }
    if (window.localStorage['started_at']) {
      this.starting_time = window.localStorage['started_at'];
    }
    window.localStorage['started_at'] = this.started_at;
    window.clearInterval(this.timer_interval);
    this.timer_interval = window.setInterval(((function(_this) {
      return function() {
        return _this.calculateTime();
      };
    })(this)), 1000);
    if (this.pause_started_at) {
      this.pause_ended_at = (new Date()).getTime();
      this.pause_duration = this.pause_duration + this.pause_ended_at - this.pause_started_at;
    }
    if (window.pomodoro) {
      return window.pomodoro.render();
    }
  };

  Timer.prototype.pause = function() {
    window.clearInterval(this.timer_interval);
    this.stateChange('paused');
    return this.pause_started_at = (new Date()).getTime();
  };

  Timer.prototype.reset = function() {
    this.stateChange('reset');
    this.started_at = null;
    this.pause_started_at = false;
    this.pause_duration = 0;
    return delete window.localStorage['starting_time'];
  };

  Timer.prototype.calculateTime = function() {
    var minutes, seconds, time;
    if (!!this.started_at) {
      time = (this.duration * 60 * 1000) - ((new Date).getTime() - this.started_at) + this.pause_duration;
    } else {
      time = this.duration * 60 * 1000;
    }
    if (time <= 0) {
      window.clearInterval(this.timer_interval);
      this.finished_at = (new Date()).getTime();
      this.time_remaining = this.duration + ":";
      return window.pomodoro.switchModes();
    } else {
      if (this.mode === 'work') {
        this.task = $('#task').val();
      } else {
        this.task = this.mode.replace(/_/, ' ');
      }
      minutes = Math.floor(time / 1000 / 60 % 60);
      seconds = Math.round(time / 1000 % 60).toString();
      if (parseInt(minutes) < 10) {
        minutes = "0" + minutes;
      }
      if (parseInt(seconds) < 10) {
        seconds = "0" + seconds;
      }
      this.time_remaining = minutes + ":" + seconds;
      if (window.pomodoro) {
        return window.pomodoro.render();
      }
    }
  };

  Timer.prototype.formatTime = function(time) {
    var d, hours, minutes, seconds;
    d = new Date(time);
    hours = d.getHours();
    minutes = d.getMinutes();
    seconds = d.getSeconds();
    if (parseInt(hours) < 10) {
      hours = "0" + hours;
    }
    if (parseInt(minutes) < 10) {
      minutes = "0" + minutes;
    }
    if (parseInt(seconds) < 10) {
      seconds = "0" + seconds;
    }
    return (d.getMonth() + 1) + "/" + (d.getDate()) + "/" + (d.getFullYear()) + " " + hours + ":" + minutes + ":" + seconds;
  };

  Timer.prototype.toHTML = function() {
    return "<div class='timer' data-state='" + this.state + "' data-mode='" + this.mode + "'>\n  <div class='time-remaining'>" + this.time_remaining + "</div>\n  <div class='task'>" + this.task + "</div>\n  <div class='state'>" + this.state + "</div>\n  <div class='started-at'>" + (this.formatTime(this.started_at)) + "</div>\n  <div class='finsihed-at'>" + (this.finished_at ? this.formatTime(this.finished_at) : '') + "</div>\n</div>";
  };

  return Timer;

})();

Pomodoro = (function() {
  function Pomodoro() {
    this.timers = [];
    this.current_mode = 'work';
    this.next_mode = 'short_break';
    this.loadStorage();
    this.createTimer();
    this.listen();
  }

  Pomodoro.prototype.loadStorage = function() {
    if (window.localStorage['task']) {
      return $("#task").val(window.localStorage['task']);
    }
  };

  Pomodoro.prototype.getCurrentTimer = function() {
    return this.timers[this.timers.length - 1];
  };

  Pomodoro.prototype.listen = function() {
    var action, i, len, ref;
    ref = ['start', 'pause', 'reset'];
    for (i = 0, len = ref.length; i < len; i++) {
      action = ref[i];
      $("#" + action).click((function(_this) {
        return function(e) {
          return _this.getCurrentTimer()[e.target.id]();
        };
      })(this));
    }
    return $('#task').on('keyup', function(e) {
      return window.localStorage['task'] = $(this).val();
    });
  };

  Pomodoro.prototype.createTimer = function() {
    var mode, task, timer;
    task = $('#task').val();
    mode = this.current_mode;
    if (this.timers.length > 0) {
      this.timers[this.timers.length - 1].state = 'ended';
    }
    timer = new Timer(mode, task);
    this.timers.push(timer);
    this.render();
    return timer;
  };

  Pomodoro.prototype.switchModes = function() {
    var _current_mode, n, timer;
    _current_mode = this.current_mode;
    this.current_mode = this.next_mode;
    this.next_mode = _current_mode;
    timer = this.createTimer();
    this.timers[this.timers.length - 1].start();
    Notification.requestPermission();
    if ($('#notifications')[0].checked) {
      n = new Notification("Time's Up", {
        body: timer.time_remaining + " of " + this.current_mode + " begins now.",
        icon: "/time.jpg"
      });
      return window.setTimeout(n.close.bind(n), 3000);
    }
  };

  Pomodoro.prototype.render = function() {
    var ele, i, item, len, ref;
    $('body')[0].className = this.current_mode + " " + (this.getCurrentTimer().state);
    $('#history').html('');
    ref = this.timers.slice(0, -1);
    for (i = 0, len = ref.length; i < len; i++) {
      item = ref[i];
      ele = item.toHTML();
      $('#history').append(ele);
    }
    $('#current-timer').html(this.timers.slice(-1)[0].toHTML());
    document.title = " " + this.current_mode + " " + (this.getCurrentTimer().time_remaining) + " | Pomodoro Timer";
    return $('#time_remaining').html(this.getCurrentTimer().time_remaining);
  };

  return Pomodoro;

})();