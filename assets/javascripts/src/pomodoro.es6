class Pomodoro {

  constructor() {
    this.timers = []
    this.current_mode = 'work'
    this.next_mode = 'short_break'
    this.loadStorage()
    this.createTimer()
    this.listen()
  }

  loadStorage() {
    if(window.localStorage['task']){
      $('#task').val( window.localStorage['task'] )
    }
  }

  getCurrentTimer() {
    return this.timers[this.timers.length - 1]
  }

  listen() {
    ['start', 'pause', 'reset'].map( (action) => {
      $(`#${action}`).on('click', (e) => {
        this.getCurrentTimer()[e.target.id]()
      })
      $('#task').on('keyup', (e) => {
        window.localStorage['task'] = $(`#${e.target.id}`).val()
      })
    });
  }

  createTimer() {
    let task = $('#task').val()
    let mode = this.current_mode
    if(this.timers.length > 0){
      this.timers[this.timers.length - 1].state = 'ended'
    }
    let timer = (new Timer(mode, task))
    this.timers.push(timer)
    this.render()
    return timer
  }

  switchModes() {
    let _current_mode = this.current_mode
    this.current_mode = this.next_mode
    this.next_mode = _current_mode
    let timer = this.createTimer()
    this.timers[this.timers.length - 1].start()
    if($('#notifications')[0].checked){
      var n = new Notification("Time's Up", {
        body: `${timer.time_remaining} of ${this.current_mode} begins now.`,
        icon: '/assets/images/time.jpg'
      });
      window.setTimeout(n.close.bind(n), 3000)
    }
  }

  render() {
    $('body')[0].className = `${this.current_mode} ${this.getCurrentTimer().state}`
    $('#history').html('')
    this.timers.slice(0,-1).map( function(item){
      $('#history').append( item.toHTML() )
    });
    $('#current-timer').html(this.timers.slice(-1)[0].toHTML())
    document.title = ` ${this.current_mode} ${this.getCurrentTimer().time_remaining} | Pomodoro Timer`
    $('#time_remaining').html(this.getCurrentTimer().time_remaining)
  }

}
