var Player = function(url, options) {
    var self = this;
    var video,videoWrapper,big_icon,controlsWrapper,play_pause,sound_icon,fullscreen_icon,sound_bar,sound_line_wrapper,sound_line,progress_bar,progress_line,progress_dot,time_counter,video_time,time_popup;

    var _listeners = {};
    var _controlListeners = {};

    // prototype functions
    this.appendTo = function(el) {
        el.appendChild(videoWrapper);
        showControls();
    }

    this.prop = function(name,val) {
        if(video[name] != undefined && val != undefined) {
            return video[name]=val;
        } else if(video[name] != undefined) {
            return video[name];
        } else {
            console.error("Unknown video property '"+name+"'");
            return null;
        }
    }

    this.addVideoListener = function(name,listener) {
        if(_listeners[name]) {
            _listeners[name].push(listener);
        } else {
            _listeners[name]=[listener];
            video.addEventListener(name,function(e) {
                for(var f in _listeners[name]) {
                    _listeners[name][f](e);
                }
            });
        }
    }

    this.addControlListener = function(name,listener) {
        if(_controlListeners[name]) {
            _controlListeners[name].push(listener)
        } else {
            _controlListeners[name]=[listener];
        }
    }

    {
        // INITIALIZE VPLAYER

        // root element
        videoWrapper = document.createElement("div");
        videoWrapper.classList.add("vplayer-wrapper");

        // video element
        video = document.createElement('video');
        video.src=url;
        video.setAttribute("id",'vplayer');

        videoWrapper.appendChild(video);

        // big icon
        big_icon = document.createElement('div');
        big_icon.classList.add('big-icon');

        videoWrapper.appendChild(big_icon);

        // controls wrapper element
        controlsWrapper = document.createElement("div");
        controlsWrapper.classList.add("vplayer-controls-wrapper");

        videoWrapper.appendChild(controlsWrapper);

        // play-pause element
        play_pause = document.createElement('span');
        play_pause.classList.add('vplayer-control-item');
        play_pause.classList.add('play');

        controlsWrapper.appendChild(play_pause);

        // time counter
        time_counter = document.createElement('span');
        time_counter.classList.add('vplayer-control-item');
        time_counter.classList.add('time_counter');

        time_counter.innerHTML='00:00';

        controlsWrapper.appendChild(time_counter);

        // progress bar
        var progress_bar = document.createElement('div');
        progress_bar.classList.add('vplayer-control-item')
        progress_bar.classList.add('vprogressbar');

        controlsWrapper.appendChild(progress_bar);

        // progress line
        var progress_line = document.createElement('div');
        progress_line.classList.add('vprogressline');

        progress_bar.appendChild(progress_line);

        // time popup
        time_popup = document.createElement('span');
        time_popup.classList.add('vplayer-popup');
        progress_bar.appendChild(time_popup);

        // video time
        video_time = document.createElement('span');
        video_time.classList.add('vplayer-control-item');
        video_time.classList.add('vtime');

        controlsWrapper.appendChild(video_time);

        // sound element
        sound_icon = document.createElement('span');
        sound_icon.classList.add('vplayer-control-item');
        sound_icon.classList.add('sound');

        controlsWrapper.appendChild(sound_icon);

        // sound bar
        sound_bar = document.createElement('div');
        sound_bar.classList.add('vplayer-popup');
        sound_bar.classList.add('volume');

        sound_icon.appendChild(sound_bar);

        // sound line wrapper
        sound_line_wrapper = document.createElement('div');
        sound_line_wrapper.classList.add('sound-line-wrapper');

        sound_bar.appendChild(sound_line_wrapper);

        // sound line
        sound_line = document.createElement('div');
        sound_line.classList.add('sound-line');

        sound_line_wrapper.appendChild(sound_line);


        // fullscreen element
        fullscreen_icon = document.createElement('span');
        fullscreen_icon.classList.add('vplayer-control-item');
        fullscreen_icon.classList.add('full-screen');

        controlsWrapper.appendChild(fullscreen_icon);

        // setting options
        if(options) {
            if(options.width) {
                videoWrapper.style.width=options.width+"px";
            }

            if(options.height) {
                videoWrapper.style.height=options.height+"px";
            }

            if(options.controls===false) {
                videoWrapper.style.opacity="0";
                videoWrapper.style.visibility="hidden";
            }
        }

        // setting events
        self.addVideoListener('contextmenu',_contextMenu);

        self.addVideoListener('click', function(){
            if(video.paused) {
                video.play();
            } else {
                video.pause();
            }
        });


        self.addVideoListener('canplay', function(){
            showBigIcon();
        });


        self.addVideoListener('waiting', function(){
            showBigIcon('loading');
        });

        self.addVideoListener('play', function(){
            play_pause.classList.remove('play');
            play_pause.classList.add('pause');
            showBigIcon('play',500);
        });

        self.addVideoListener('pause', function(){
            play_pause.classList.remove('pause');
            play_pause.classList.add('play');
            showBigIcon('pause',500);
        });

        self.addVideoListener('volumechange', function(){
            if(video.muted) {
                sound_icon.classList.add('muted');
            } else {
                sound_icon.classList.remove('muted');
            }
        });

        self.addVideoListener('timeupdate', function(e){
            progress_line.style.width = ((e.target.currentTime/e.target.duration)*100)+"%";
            time_counter.innerHTML=timeFormat(e.target.currentTime);
        });

        self.addVideoListener('durationchange', function(e){
            video_time.innerHTML=timeFormat(e.target.duration);
        });

        self.addVideoListener('dblclick',toggleFullScreen);

        self.addVideoListener('progress',buffering);

        self.addVideoListener('volumechange',function(e) {
            sound_line.style.height = (e.target.volume*100)+"%";
        });

        big_icon.onclick=function() {
            if(video.paused) {
                video.play();
            } else {
                video.pause();
            }
        }

        play_pause.onclick = function(e) {
            if(video.paused) {
                callControlerListener('play',e);
                video.play();
            } else {
                callControlerListener('pause',e);
                video.pause();
            }
        }

        sound_icon.onmouseover = function(e) {
            sound_bar.classList.add('show');
        }
        sound_icon.onmouseout = function(e) {
            sound_bar.classList.remove('show');
        }

        sound_bar.onclick=function(e) {
            e.stopPropagation();
        }

        sound_line_wrapper.onmousedown=function(e) {
            csound(e);
            sound_line_wrapper.onmousemove=csound;
        }
        sound_line_wrapper.onmouseup=function() {
            sound_line_wrapper.onmousemove=null;
        }
        sound_line_wrapper.onmouseleave=function() {
            sound_line_wrapper.onmousemove=null;
        }

        progress_bar.onclick = function(e) {
            var ev = {
                currentTime: (video.duration*((e.clientX - getOffsetLeft(progress_bar))/progress_bar.clientWidth)),
                beforeTime: video.currentTime
            }
            video.currentTime = ev.currentTime;
            callControlerListener('seek',ev);
        }

        progress_bar.onmousemove = function(e) {
            var time_popup = progress_bar.querySelector('.vplayer-popup');
            time_popup.style.left = (e.clientX - getOffsetLeft(progress_bar) - time_popup.offsetWidth/2)+"px";
            time_popup.innerHTML = timeFormat((video.duration*((e.clientX - getOffsetLeft(progress_bar))/progress_bar.clientWidth)));
        }

        progress_bar.onmouseover = function() {
            var time_popup = progress_bar.querySelector('.vplayer-popup');
            time_popup.classList.add('show');
        }

        progress_bar.onmouseout = function() {
            var time_popup = progress_bar.querySelector('.vplayer-popup');
            time_popup.classList.remove('show');
        }

        sound_icon.onclick = function() {
            if(video.muted) {
                video.muted = false;
            } else {
                video.muted = true;
            }
            var ev = {
                volume: video.volume,
                muted: video.muted
            };
            callControlerListener('volumechange',ev);
        }

        var _canhide = true;

        controlsWrapper.onmouseover = function(e) {
            _canhide = false;
            showControls();
        }
        controlsWrapper.onmouseout = function() {
            _canhide = true;
            showControls(true);
        }

        videoWrapper.onmousemove = function() {
            if(_canhide) {
                showControls(true);
            }
        }

        fullscreen_icon.onclick=toggleFullScreen;

    }

    // private functions

    var _timeout = null;
    function showControls(autohide) {
        controlsWrapper.style.opacity = 1;
        controlsWrapper.style.visibility = 'visible';
        if(_timeout) {
            clearTimeout(_timeout);
        }
        if(autohide) {
            _timeout = setTimeout(function() {
                controlsWrapper.style.opacity = 0;
                controlsWrapper.style.visibility = 'hidden';
            },2000);
        }
    }

    function csound(e) {
        var sound = ((sound_line_wrapper.getBoundingClientRect().bottom-e.clientY) / sound_line_wrapper.clientHeight);
        if(sound>1) sound=1;
        if(sound<0) sound=0;

        var ev = {
            volume: sound,
            muted: video.muted
        };
        callControlerListener('volumechange',ev);
        video.volume = sound;
    }

    function toggleFullScreen() {
        if(document.webkitFullscreenElement || document.fullscreenElement || document.mozFullscreenElement) {
            exitFullScreen();
        } else {
            fullScreen(videoWrapper);
        }
    }

    function fullScreen(e) {
        document.fullscreenEnabled = document.fullscreenEnabled || document.mozFullScreenEnabled || document.documentElement.webkitRequestFullScreen || document.documentElement.msRequestFullScreen;
        if(!document.fullscreenEnabled) {
            alert("Your browser doesn't support fullscreen mode");
            return;
        }
        if(e.requestFullScreen) {
            e.requestFullScreen();
        } else if(e.mozRequestFullScreen) {
            e.mozRequestFullScreen();
        } else if(e.webkitRequestFullScreen) {
            e.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    }

    function exitFullScreen() {
        if(document.exitFullscreen) {
            document.exitFullscreen();
        } else if(document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if(document.mozExitFullscreen) {
            document.mozExitFullscreen();
        }
    }

    function buffering(e) {
        var buffered = e.target.buffered;
        var duration = e.target.duration;
        var buffered_parts = progress_bar.querySelectorAll('.vprogressbuffer');
        for(var i = 0; i < buffered_parts.length; i++) {
            buffered_parts[i].parentNode.removeChild(buffered_parts[i]);
        }

        if(buffered.length) {
            for(var i = 0; i < buffered.length; i++) {
                var bdiv = document.createElement('div');
                bdiv.classList.add('vplayer-control-item');
                bdiv.classList.add('vprogressbuffer');
                bdiv.style.left = secondToPixels(buffered.start(i))+"%";
                bdiv.style.width = secondToPixels(buffered.end(i)-buffered.start(buffered.length-1))+"%";
                progress_bar.appendChild(bdiv);
            }
        }

    }

    function secondToPixels(second) {
        return (second/video.duration)*100;
    }

    function callControlerListener(name,e) {
        if(_controlListeners[name]) {
            for(var f in _controlListeners[name]) {
                _controlListeners[name][f](e);
            }
        }
    }

    function timeFormat(time) {
        var seconds = ('0'+parseInt(time%60)).substr(-2);
        var minutes = ('0'+parseInt(time/60)).substr(-2);
        var hours = ('0'+parseInt(time/3600)).substr(-2);

        var str = minutes+':'+seconds;
        if(hours!='00') str = hours+':'+str;

        return str;
    }

    function _contextMenu(e) {
        e.preventDefault();
    }

    function showBigIcon(type,time) {
        if(!type) {
            big_icon.className='big-icon';
            return;
        }
        big_icon.className='big-icon';
        big_icon.classList.add(type);
        if(time) {
            setTimeout(function() {
                big_icon.classList.remove(type);
            },time);
        }
    }

    function getOffsetLeft( elem )
    {

        return elem.getBoundingClientRect().left;
        // var offsetLeft = 0;
        // do {
        //     console.log(elem);
        //   if ( !isNaN( elem.offsetLeft ) )
        //   {
        //       offsetLeft += elem.offsetLeft;
        //   }
        // } while( elem = elem.offsetParent );
        // return offsetLeft;
    }

    this.root = videoWrapper;

};
if(typeof jQuery != 'undefined') {
    jQuery.fn.player = function(url, options) {
        if(this.length<1) throw new Error('Please use valid container for player');
        var p = new Player(url,options);
        p.appendTo(this[0]);
        return p;
    }
}