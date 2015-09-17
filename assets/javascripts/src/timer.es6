class Timer {

  constructor (mode, task='') {
    const DURATIONS = {
      work: 25,
      long_break: 10,
      short_break: 5
    }
    this.mode = mode
    this.task = task
    if(task === ''){
      this.task = this.mode
    }
    this.modes = ['initialized', 'started', 'paused', 'ended']
    this.state = this.modes[0]
    this.duration = DURATIONS[this.mode]
    this.pause_duration = 0
    this.created = (new Date()).getTime()
    this.started_at = false
    this.finished_at = false
    this.calculateTime()
  }

  stateChange (state=this.state){
    this.state = state
    $('body')[0].className = `${this.state}`
    $('#state').html( this.state )
    $('#mode').html( this.mode.replace(/_/g, ' ') )
  }

  start () {
    if(this.state === 'started' || this.state === 'ended'){
      return false
    }
    this.stateChange('started')
    if(this.started_at == false){
      this.started_at = (new Date).getTime()
    }
    if(window.localStorage['started_at']){
      this.starting_time = window.localStorage['started_at']
    }
    window.localStorage['started_at'] = this.started_at
    window.clearInterval(this.timer_interval)
    this.timer_interval = window.setInterval( () => { this.calculateTime() }, 1000)
    if(this.pause_started_at){
      this.pause_ended_at = (new Date()).getTime()
      this.pause_duration = this.pause_duration + this.pause_ended_at - this.pause_started_at
    }
    if(window.pomodoro){
      window.pomodoro.render()
    }
  }

  pause (){
    window.clearInterval(this.timer_interval)
    this.stateChange('paused')
    this.pause_started_at = (new Date()).getTime()
  }

  reset(){
    $('#task').val('')
    this.stateChange('reset')
    this.started_at = null
    this.pause_started_at = false
    this.pause_duration = 0
    delete window.localStorage['starting_time']
    delete window.localStorage['task']
  }

  calculateTime(){
    let time = (this.duration * 60 * 1000)
    if(!! this.started_at){
      time = (this.duration * 60 * 1000) - ((new Date).getTime() - this.started_at) + this.pause_duration
    }
    if(time <= 0) {
      window.clearInterval(this.timer_interval)
      this.finished_at = (new Date()).getTime()
      this.time_remaining = `${this.duration}:00`
      window.pomodoro.switchModes()
    }
    else {
      if(this.mode === 'work'){
        this.task = $('#task').val()
      }
      else {
        this.task = this.mode.replace(/_/, ' ')
      }
      let minutes = Math.floor(time / 1000 / 60 % 60 )
      let seconds = Math.round((time / 1000 % 60)).toString()
      if(parseInt(minutes) < 10){
        minutes = `0${minutes}`
      }
      if(parseInt(seconds) < 10){
        seconds = `0${seconds}`
      }
      if(seconds === undefined){
        seconds = '00'
      }
      this.time_remaining = `${minutes}:${seconds}`
      if(window.pomodoro){
        window.pomodoro.render()
      }
    }
  }

  formatTime (time){
    let d = (new Date(time))
    let hours = d.getHours()
    let minutes = d.getMinutes()
    let seconds = d.getSeconds()
    if(parseInt(hours) < 10){
      hours = `0${hours}`
    }
    if(parseInt(minutes) < 10){
      minutes = `0${minutes}`
    }
    if(parseInt(seconds) < 10){
      seconds = `0${seconds}`
    }
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} ${hours}:${minutes}:${seconds}`
  }

  toHTML () {
    let finished_at = ''
    if(this.finished_at){
      finished_at = this.formatTime(this.finished_at)
    }
    return `
      <div class='timer' data-state='${this.state}' data-mode='${this.mode}'>
        <div class='time-remaining'>${this.time_remaining}</div>
        <div class='task'>${this.task}</div>
        <div class='state'>${this.state}</div>
        <div class='started-at'>${this.formatTime(this.started_at)}</div>
        <div class='finsihed-at'>${finished_at}</div>
      </div>
    `
  }

}
