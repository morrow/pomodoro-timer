class Timer

  DURATIONS:
    work: 25
    long_break: 10
    short_break: 5

  constructor: (mode, task='')->
    @mode = mode
    @task = task
    @task = @mode if task is ''
    @modes = ['initialized', 'started', 'paused', 'ended']
    @state = @modes[0]
    @duration = @DURATIONS[@mode]
    @pause_duration = 0
    @created = (new Date()).getTime()
    @started_at = false
    @finished_at = false
    @calculateTime()

  stateChange: (state=@state)->
    @state = state
    $('body')[0].className = "#{@state}"
    $('#state').html( @state )
    $('#mode').html( @mode.replace(/_/g, ' ') )

  start: ->
    @stateChange('started')
    @started_at = (new Date).getTime() unless @started_at
    if window.localStorage['started_at']
      @starting_time = window.localStorage['started_at']
    window.localStorage['started_at'] = @started_at
    window.clearInterval(@timer_interval)
    @timer_interval = window.setInterval( (=> @calculateTime()), 1000)
    if @pause_started_at
      @pause_ended_at = (new Date()).getTime()
      @pause_duration = @pause_duration + @pause_ended_at - @pause_started_at
    window.pomodoro.render() if window.pomodoro

  pause: ->
    window.clearInterval(@timer_interval)
    @stateChange 'paused'
    @pause_started_at = (new Date()).getTime()

  reset: ->
    $('#task').val ''
    @stateChange 'reset'
    @started_at = null
    @pause_started_at = false
    @pause_duration = 0
    delete window.localStorage['starting_time']
    delete window.localStorage['task']

  calculateTime: ->
    if !! @started_at
      time = (@duration * 60 * 1000) - ((new Date).getTime() - @started_at) + @pause_duration
    else
      time = (@duration * 60 * 1000)
    if time <= 0
      window.clearInterval(@timer_interval)
      @finished_at = (new Date()).getTime()
      @time_remaining = "#{@duration}:#{}"
      window.pomodoro.switchModes()
    else
      if @mode is 'work'
        @task = $('#task').val()
      else
        @task = @mode.replace(/_/, ' ')
      minutes = Math.floor(time / 1000 / 60 % 60 )
      seconds = Math.round((time / 1000 % 60)).toString()
      minutes = "0#{minutes}" if parseInt(minutes) < 10
      seconds = "0#{seconds}" if parseInt(seconds) < 10
      seconds = "00" unless seconds
      @time_remaining = "#{minutes}:#{seconds}"
      window.pomodoro.render() if window.pomodoro

  formatTime: (time)->
    d = (new Date(time))
    hours = d.getHours()
    minutes = d.getMinutes()
    seconds = d.getSeconds()
    hours = "0#{hours}" if parseInt(hours) < 10
    minutes = "0#{minutes}" if parseInt(minutes) < 10
    seconds = "0#{seconds}" if parseInt(seconds) < 10
    "#{d.getMonth() + 1}/#{d.getDate()}/#{d.getFullYear()} #{hours}:#{minutes}:#{seconds}"

  toHTML: ->
    return """
      <div class='timer' data-state='#{@state}' data-mode='#{@mode}'>
        <div class='time-remaining'>#{@time_remaining}</div>
        <div class='task'>#{@task}</div>
        <div class='state'>#{@state}</div>
        <div class='started-at'>#{@formatTime(@started_at)}</div>
        <div class='finsihed-at'>#{if @finished_at then @formatTime(@finished_at) else '' }</div>
      </div>
    """


class Pomodoro

  constructor:->
    @timers = []
    @current_mode = 'work'
    @next_mode = 'short_break'
    @loadStorage()
    @createTimer()
    @listen()

  loadStorage: ->
    $("#task").val( window.localStorage['task'] ) if window.localStorage['task']

  getCurrentTimer: ->
    @timers[@timers.length - 1]

  listen: ->
    for action in ['start', 'pause', 'reset']
      $("##{action}").click( (e)=>
        @getCurrentTimer()[e.target.id]() )
    $('#task').on 'keyup', (e)->
      window.localStorage['task'] = $(@).val()

  createTimer: ->
    task = $('#task').val()
    mode = @current_mode
    if @timers.length > 0
      @timers[@timers.length - 1].state = 'ended'
    timer = (new Timer(mode, task))
    @timers.push timer
    @render()
    return timer

  switchModes: ->
    _current_mode = @current_mode
    @current_mode = @next_mode
    @next_mode = _current_mode
    timer = @createTimer()
    @timers[@timers.length - 1].start()
    Notification.requestPermission()
    if $('#notifications')[0].checked
      n = new Notification "Time's Up",
        body: "#{timer.time_remaining} of #{@current_mode} begins now."
        icon: "/time.jpg"
      window.setTimeout(n.close.bind(n), 3000)

  render: ->
    $('body')[0].className = "#{@current_mode} #{@getCurrentTimer().state}"
    $('#history').html ''
    for item in @timers.slice(0,-1)
      ele = item.toHTML()
      $('#history').append( ele )
    $('#current-timer').html @timers.slice(-1)[0].toHTML()
    document.title = " #{@current_mode} #{@getCurrentTimer().time_remaining} | Pomodoro Timer"
    $('#time_remaining').html @getCurrentTimer().time_remaining
