var Player = function(l, options) {
    var self = this;
    var video,
        videoWrapper,
        big_icon,
        controlsWrapper,
        play_pause,
        sound_icon,
        fullscreen_icon,
        sound_bar,
        sound_line_wrapper,
        sound_line,
        progress_bar,
        progress_line,
        time_counter,
        time_popup,
        episodes_button,
        episodesWrapper,
        qualities_button,
        languages_button,
        qualities_list,
        languages_list;

    var episodes = null;

    var _fsElement;

    var _season=1,
        _episode=1,
        _quality,_language;

    var _qualities = {};
    var _controlListeners = {};

    var current_time = 0;

    var list;


    // prototype functions
    this.appendTo = function(el) {
        el.appendChild(videoWrapper);
        showControls();
    };

    this.setFullScreenElement = function(e) {
        _fsElement = e;
    };

    this.prop = function(name,val) {
        if(video[name] != undefined && val != undefined) {
            return video[name]=val;
        } else if(video[name] != undefined) {
            return video[name];
        } else {
            console.error("Unknown video property '"+name+"'");
            return null;
        }
    };

    this.play = function() {
        video.play();
    };

    this.pause = function() {
        video.pause();
    };

    this.addVideoListener = function(name,listener) {
        video.addEventListener(name,listener);
    };

    this.addControlListener = function(name,listener) {
        if(_controlListeners[name]) {
            _controlListeners[name].push(listener)
        } else {
            _controlListeners[name]=[listener];
        }
    };

    this.switchEpisode = function(episode,season) {
        if(season) {
            _season = season;
        }
        _episode = episode;
        episodeChanged();
    };

    this.switchLang = function(lang) {
        if(_qualities.languages[_quality].indexOf(lang)!=-1) {
            _language = lang;
            playCurrent();
            return true;
        }
        return false;
    };

    this.switchQuality = function(quality) {
        if(_qualities.list.indexOf(quality)!=-1) {
            _quality = quality;
            playCurrent();
            return true;
        }
        return false;
    };

    this.load = function(l) {
        list = l;
        init();
    };

    {
        // INITIALIZE VPLAYER


        list = l;

        // root element
        videoWrapper = document.createElement("div");
        videoWrapper.classList.add("vplayer-wrapper");

        _fsElement = videoWrapper;

        // video element
        video = document.createElement('video');
        video.setAttribute("id",'vplayer');

        videoWrapper.appendChild(video);

        // big icon
        big_icon = document.createElement('div');
        big_icon.classList.add('big-icon');

        videoWrapper.appendChild(big_icon);

        var loadingHtml = "\
        <div id='loading'>\
            <div id='gloading'>\
                <div id='gloader'></div>\
            </div>\
        </div>\
        ";

        big_icon.innerHTML = loadingHtml;

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
        progress_bar = document.createElement('div');
        progress_bar.classList.add('vplayer-control-item');
        progress_bar.classList.add('vprogressbar');

        controlsWrapper.appendChild(progress_bar);

        // progress line
        progress_line = document.createElement('div');
        progress_line.classList.add('vprogressline');

        progress_bar.appendChild(progress_line);

        // time popup
        time_popup = document.createElement('span');
        time_popup.classList.add('vplayer-popup');
        time_popup.classList.add('time-popup');
        progress_bar.appendChild(time_popup);


        // fullscreen element
        fullscreen_icon = document.createElement('span');
        fullscreen_icon.classList.add('vplayer-control-item');
        fullscreen_icon.classList.add('full-screen');

        controlsWrapper.appendChild(fullscreen_icon);


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

        // episodes button
        episodes_button = document.createElement('div');
        episodes_button.classList.add('vplayer-control-item');
        episodes_button.classList.add('episodes');
        episodes_button.innerHTML="სერიები";

        controlsWrapper.appendChild(episodes_button);

        // qualities button
        qualities_button = document.createElement('span');
        qualities_button.classList.add('vplayer-control-item');
        qualities_button.classList.add('qualities-button');

        qualities_button.innerHTML="<span class='title'></span>";

        controlsWrapper.appendChild(qualities_button);

        // qualities list
        qualities_list = document.createElement('div');
        qualities_list.classList.add('vplayer-popup');
        qualities_list.classList.add('qualities-list');

        qualities_button.appendChild(qualities_list);


        // languages button
        languages_button = document.createElement('span');
        languages_button.classList.add('vplayer-control-item');
        languages_button.classList.add('languages-button');

        languages_button.innerHTML="<span class='title'></span>";

        controlsWrapper.appendChild(languages_button);

        // languages list
        languages_list = document.createElement('div');
        languages_list.classList.add('vplayer-popup');
        languages_list.classList.add('languages-list');

        languages_button.appendChild(languages_list);


        // setting events
        videoWrapper.addEventListener('contextmenu', _contextMenu);


        self.addVideoListener('canplay', function() {
            showBigIcon();
        });

        self.addVideoListener('waiting', function() {
            showBigIcon('loading');
            var tc = function() {
                showBigIcon();
                video.removeEventListener('timeupdate',tc);
            };
            video.addEventListener('timeupdate',tc);
        });

        self.addVideoListener('play', function() {
            play_pause.classList.remove('play');
            play_pause.classList.add('pause');
            if(episodesWrapper) {
                episodesWrapper.classList.add('hidden');
            }
            showBigIcon('play',500);
        });

        self.addVideoListener('ended', function(e) {
            if(list.episodes) {
                e.eventData = {
                    episode: _episode,
                    season: _season
                };

                var go = true;

                e.preventDefault = function() {
                    go = false;
                };

                callControlerListener('episodechanged',e);

                if(go) {
                    playNextEpisode();
                    video.play();
                }
            }
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
            time_counter.innerHTML=timeFormat(e.target.currentTime)+" / "+timeFormat(e.target.duration);
        });

        self.addVideoListener('durationchange', function(e){
            time_counter.innerHTML=timeFormat(e.target.currentTime)+" / "+timeFormat(e.target.duration);
        });

        self.addVideoListener('progress',buffering);

        self.addVideoListener('volumechange',function(e) {
            sound_line.style.height = (e.target.volume*100)+"%";
        });

        self.addVideoListener('loadstart', function(e) {
            progress_line.style.width = 0;
            buffering(e);
        });

        // setting options
        if(options) {
            if(options.width) {
                videoWrapper.style.width=options.width+"px";
            }

            if(options.height) {
                videoWrapper.style.height=options.height+"px";
            }

            if(options.controls===false) {
                controlsWrapper.classList.add('hidden');
            } else {
                setControlEvents();
            }

            if(options.videoClickPlayPause!==false) {
                self.addVideoListener('click', function(e) {

                    var go = true;

                    e.preventDefault = function() {
                        go = false;
                    };

                    if(video.paused) {
                        callControlerListener('play',e);
                        if(go) {
                            video.play();
                        }
                    } else {
                        callControlerListener('pause',e);
                        if(go) {
                            video.pause();
                        }
                    }
                });

                big_icon.addEventListener('click',function(e) {

                    var go = true;

                    e.preventDefault = function() {
                        go = false;
                    };

                    if(video.paused) {
                        callControlerListener('play',e);
                        if(go) {
                            video.play();
                        }
                    } else {
                        callControlerListener('pause',e);
                        if(go) {
                            video.pause();
                        }
                    }
                });
            }

            if(options.dblClickFullscreen!==false) {
                self.addVideoListener('dblclick',toggleFullScreen);
            }

            if(options.useKeyboardControl!==false) {
                videoWrapper.setAttribute('tabindex',0);
                videoWrapper.addEventListener('click', function(){
                    this.focus();
                });
                var moveStep = options.keyTimeStep || 10;
                var volumeStep = options.volumeStep || 0.1;
                videoWrapper.addEventListener('keyup', function(e) {
                    var go = true;
                    e.preventDefault = function() {
                        go = false;
                    };
                    if(e.keyCode==37) {
                        e.eventData = {
                            currentTime: video.currentTime-moveStep,
                            beforeTime: video.currentTime
                        };
                        callControlerListener('seek',e);
                        if(go) {
                            video.currentTime = ev.currentTime;
                        }
                    } else if(e.keyCode==39) {
                        e.eventData = {
                            currentTime: video.currentTime+moveStep,
                            beforeTime: video.currentTime
                        };
                        callControlerListener('seek',e);
                        if(go) video.currentTime = ev.currentTime;
                    } else if(e.keyCode==32 || e.keyCode==13) {
                        if(video.paused) {
                            callControlerListener('play',e);
                            if(go) video.play();
                        } else {
                            callControlerListener('pause',e);
                            if(go) video.pause();
                        }
                    } else if(e.keyCode==38) {
                        var sound = video.volume+volumeStep;
                        if(sound>1) sound=1;
                        e.eventData = {
                            volume: sound,
                            muted: video.muted
                        };
                        callControlerListener('volumechange',e);
                        if(go) video.volume = sound;
                    } else if(e.keyCode==40) {
                        var sound = video.volume-volumeStep;
                        if(sound<0) sound=0;
                        ev = {
                            volume: sound,
                            muted: video.muted
                        };
                        callControlerListener('volumechange',ev);
                        if(go) video.volume = sound;
                    }
                });
            }
        } else {
            setControlEvents();

            self.addVideoListener('click', function(e){
                var go = true;
                e.preventDefault = function() {
                    go = false;
                };
                if(video.paused) {
                    callControlerListener('play',e);
                    if(go) video.play();
                } else {
                    callControlerListener('pause',e);
                    if(go) video.pause();
                }
            });

            big_icon.addEventListener('click',function(e) {

                var go = true;

                e.preventDefault = function() {
                    go = false;
                };

                if(video.paused) {
                    callControlerListener('play',e);
                    if(go) {
                        video.play();
                    }
                } else {
                    callControlerListener('pause',e);
                    if(go) {
                        video.pause();
                    }
                }
            });
        }

        init();
    }

    function init() {
        // init seasons / video
        showBigIcon('loading');
        console.log(list);
        if(list.episodes) {
            initEpisodes();
            if(episodes_button.classList.contains('hidden')) episodes_button.classList.remove('hidden');
        } else {
            if(!episodes_button.classList.contains('hidden')) episodes_button.classList.add('hidden');
            loadQualitiesAndLanguages();
            playCurrent();
        }
        callControlerListener('initialized');
    }

    // private functions

    function setControlEvents() {

        videoWrapper.addEventListener('mousemove', function() {
            if(_canhide) {
                showControls(true);
            }
        });

        var _canhide = true;

        controlsWrapper.addEventListener('mouseover', function() {
            _canhide = false;
            showControls();
        });
        controlsWrapper.addEventListener('mouseout', function() {
            _canhide = true;
            showControls(true);
        });

        play_pause.addEventListener('click', function(e) {
            var go = true;
            e.preventDefault = function() {
                go = false;
            };
            if(video.paused) {
                callControlerListener('play',e);
                if(go)video.play();
            } else {
                callControlerListener('pause',e);
                if(go)video.pause();
            }
        });

        if(episodes_button) {
            episodes_button.addEventListener('click', function () {
                episodesWrapper.classList.toggle('hidden');
            });
        }

        sound_bar.addEventListener('click',function(e) {
            e.stopPropagation();
        });

        sound_line_wrapper.addEventListener('mousedown', function(e) {
            csound(e);
            sound_line_wrapper.addEventListener('mousemove',csound);
        });

        sound_line_wrapper.addEventListener('mouseup', function() {
            sound_line_wrapper.removeEventListener('mousemove',csound);
        });

        sound_line_wrapper.addEventListener('mouseleave', function() {
            sound_line_wrapper.removeEventListener('mousemove',csound);
        });

        progress_bar.addEventListener('click', function(e) {
            var ev = {
                currentTime: (video.duration*((e.clientX - getOffsetLeft(progress_bar))/progress_bar.clientWidth)),
                beforeTime: video.currentTime
            };
            var go = true;
            e.preventDefault = function() {
                console.log("can't go");
                go = false;
            };
            e.eventData = ev;
            callControlerListener('seek',e);
            console.log(go);
            if(!go) return;
            video.currentTime = ev.currentTime;
        });

        progress_bar.addEventListener('mousemove', function(e) {
            var time_popup = progress_bar.querySelector('.vplayer-popup');
            time_popup.style.left = (e.clientX - getOffsetLeft(progress_bar) - time_popup.offsetWidth/2)+"px";
            time_popup.innerHTML = timeFormat((video.duration*((e.clientX - getOffsetLeft(progress_bar))/progress_bar.clientWidth)));
        });

        progress_bar.addEventListener('mouseover', function() {
            var time_popup = progress_bar.querySelector('.vplayer-popup');
            time_popup.classList.add('show');
        });

        progress_bar.addEventListener('mouseout', function() {
            var time_popup = progress_bar.querySelector('.vplayer-popup');
            time_popup.classList.remove('show');
        });

        sound_icon.addEventListener('click', function(e) {
            var ev = {
                volume: video.volume,
                muted: video.muted
            };
            e.eventData = ev;
            var go = true;
            e.preventDefault = function() {
                go = false;
            };
            callControlerListener('volumechange',ev);

            if(go) video.muted = !video.muted;
        });

        fullscreen_icon.addEventListener('click',toggleFullScreen);
    }

    function update_qualities_list() {
        qualities_list.innerHTML = "";
        each(_qualities.list,function(e) {
            var item = document.createElement('a');
            item.href='javascript:void(0)';
            item.classList.add('quality-list-item');
            item.innerHTML = e;
            item.dataset.quality = e;
            item.addEventListener('click', function(e) {
                if(_quality==e.currentTarget.dataset.quality) return;
                _quality = e.currentTarget.dataset.quality;
                current_time = video.currentTime;
                playCurrent();
            });
            qualities_list.appendChild(item);
        });
    }

    function update_languages_list() {
        languages_list.innerHTML = "";
        each(_qualities.languages[_quality],function(e) {
            var item = document.createElement('a');
            item.href='javascript:void(0)';
            item.classList.add('language-list-item');
            item.innerHTML = e;
            item.dataset.language = e;
            item.addEventListener('click', function(e) {
                if(_language==e.currentTarget.dataset.language) return;
                _language = e.currentTarget.dataset.language;
                current_time = video.currentTime;
                playCurrent();
            });
            languages_list.appendChild(item);
        });
    }

    var _timeout = null;
    function showControls(autohide) {
        controlsWrapper.style.opacity = 1;
        controlsWrapper.style.visibility = 'visible';
        videoWrapper.classList.remove('nocursor');
        if(_timeout) {
            clearTimeout(_timeout);
        }
        if(autohide) {
            _timeout = setTimeout(function() {
                controlsWrapper.style.opacity = 0;
                controlsWrapper.style.visibility = 'hidden';
                videoWrapper.classList.add('nocursor');
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
        var go = true;
        e.preventDefault = function() {
            go = false;
        };
        e.eventData = ev;
        callControlerListener('volumechange',e);

        if(go) video.volume = sound;
    }

    function toggleFullScreen() {
        if(document.webkitFullscreenElement || document.fullscreenElement || document.mozFullscreenElement) {
            exitFullScreen();
        } else {
            fullScreen(_fsElement);
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
        } else if(e.msRequestFullscreen) {
            e.msRequestFullscreen();
        }
    }

    function exitFullScreen() {
        if(document.exitFullscreen) {
            document.exitFullscreen();
        } else if(document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if(document.mozExitFullscreen) {
            document.mozExitFullscreen();
        } else if(document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    function buffering(e) {
        var buffered = e.target.buffered;
        var buffered_parts = progress_bar.querySelectorAll('.vprogressbuffer');
        for(var i = 0; i < buffered_parts.length; i++) {
            buffered_parts[i].parentNode.removeChild(buffered_parts[i]);
        }

        if(buffered.length) {
            for(i = 0; i < buffered.length; i++) {
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
                //noinspection JSUnfilteredForInLoop
                _controlListeners[name][f](e);
            }
        }
    }

    function timeFormat(time) {
        var seconds = ('0'+parseInt(time%60)).substr(-2);
        var minutes = ('0'+(parseInt(time/60)%60)).substr(-2);
        var hours = ('0'+(parseInt(time/3600)%24)).substr(-2);

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

    function getOffsetLeft( elem ) {
        return elem.getBoundingClientRect().left;
    }

    function loadQualitiesAndLanguages() {
        var current_url_object;
        if(list.episodes) {
            current_url_object = list.episodes[_season-1][_episode-1].url;
        } else {
            current_url_object = list.video.url;
        }
        _qualities.list = [];
        _qualities.languages = {};
        for(var quality in current_url_object) {
            _qualities.list.push(quality);

            _qualities.languages[quality] = [];


            for(var language in current_url_object[quality]) {
                _qualities.languages[quality].push(language);
            }
        }
        if(_qualities.list.indexOf(_quality) == -1 || _quality == undefined) {
            _quality = _qualities.list[0];
        }
        if(_qualities.languages[_quality].indexOf(_language) == -1 || _language == undefined) {
            _language = _qualities.languages[_qualities.list[0]][0];
        }
        update_qualities_list();
        update_languages_list();
    }


    // Episodes
    function initEpisodes() {
        // wrapper div
        if(episodesWrapper) {
            episodesWrapper.innerHTML = "";
        } else {
            episodesWrapper = document.createElement('div');
        }
        episodesWrapper.classList.add('episodes-wrapper');
        episodesWrapper.classList.add('hidden');

        // tabs (seasons)
        var tabsWrapper = document.createElement('div');
        tabsWrapper.classList.add('tabs-wrapper');
        tabsWrapper.innerHTML="<span class='title'>სეზონები: </span>";

        // seasons wrapper
        var seasonsWrapper = document.createElement('div');
        seasonsWrapper.classList.add('seasons-wrapper');


        for(var i = 0; i < list.episodes.length; i++) {
            var season = list.episodes[i];

            // add item to tabs
            var btn = document.createElement('span');
            btn.classList.add('tab-item');
            btn.innerHTML=i+1;
            btn.dataset.season=i+1;
            tabsWrapper.appendChild(btn);

            btn.addEventListener('click',function() {
                _season = this.dataset.season;
                seasonChanged();
            });


            var episodesList = document.createElement('div');
            episodesList.classList.add('episodes');
            episodesList.setAttribute("id","season_"+(i+1));

            // season
            for(var j = 0, ep; j < season.length; j++) {
                ep = season[j];

                // add episode element to episodes
                var episode = document.createElement('div');
                episode.dataset.season = i+1;
                episode.dataset.episode = j+1;
                if(ep.poster) {
                    var img = document.createElement('div');
                    img.classList.add('episode-poster');
                    img.style.backgroundImage = ep.poster;
                    episode.appendChild(img);
                }
                var title = document.createElement('div');
                title.classList.add('episode-title');
                var title_text = ep.title;
                if(ep.id) {
                    title_text = ep.id+". "+title_text;
                }
                title.innerHTML = title_text;

                episode.appendChild(title);

                episodesList.appendChild(episode);

                episode.addEventListener('click', function(e) {

                    if(this.classList.contains('active')) return;
                    var t = this;
                    e.eventData = {
                        episode: t.dataset.episode,
                        season: t.dataset.season
                    };
                    var go = true;
                    e.preventDefault = function() {
                        go = false;
                    };

                    callControlerListener('episodechanged',e);

                    if(go) {
                        _season = this.dataset.season;
                        _episode = this.dataset.episode;
                        episodeChanged();
                    }

                });

            }

            seasonsWrapper.appendChild(episodesList);
        }

        episodesWrapper.appendChild(tabsWrapper);
        episodesWrapper.appendChild(seasonsWrapper);
        episodesWrapper.classList.add('seasons-hidden');

        console.log(videoWrapper);

        videoWrapper.appendChild(episodesWrapper);
        seasonChanged();
        episodeChanged();

    }

    function seasonChanged() {
        if(list.episodes[_season-1]) {
            var tab_items = episodesWrapper.querySelectorAll('.tab-item');

            each(tab_items, function(e) {
                if(e.dataset.season==_season) {
                    e.classList.add('active');
                } else {
                    e.classList.remove('active');
                }
            });

            each(episodesWrapper.querySelectorAll('.episodes'), function(e) {
                e.classList.add('hidden');
            });
            episodesWrapper.querySelector("#season_"+_season).classList.remove('hidden');
        }
    }

    function episodeChanged() {
        if(list.episodes[_season-1] && list.episodes[_season-1][_episode-1]) {
            each(episodesWrapper.querySelectorAll(".episodes > div"), function(e){
                e.classList.remove('active');
            });
            episodesWrapper.querySelectorAll("#season_"+_season+" > div")[_episode-1].classList.add('active');
            loadQualitiesAndLanguages();
            playCurrent();
        }
    }

    function playCurrentEpisode() {
        if(list.episodes[_season-1] && list.episodes[_season-1][_episode-1]) {
            video.src=list.episodes[_season-1][_episode-1].url[getCurrentQuality()][getCurrentLanguage()];
        }
    }

    function playNextEpisode() {
        if(list.episodes) {
            if(list.episodes[_season-1] && list.episodes[_season-1][_episode]) {
                _episode++;
                episodeChanged();
            } else if(list.episodes[_season]) {
                _season++;
                _episode = 1;
                seasonChanged();
                episodeChanged();
            }
        }
    }

    function playCurrentVideo() {
        video.src = list.video.url[getCurrentQuality()][getCurrentLanguage()];
    }


    function playCurrent() {
        var mustPlay = !video.paused;
        if(list.episodes) {
            playCurrentEpisode();
        } else {
            playCurrentVideo();
        }
        qualities_button.querySelector(".title").innerHTML=getCurrentQuality();
        languages_button.querySelector(".title").innerHTML=getCurrentLanguage();
        video.oncanplay = function() {
            if(current_time!=0) {
                video.currentTime = current_time;
                current_time = 0;
            }
            video.oncanplay = null;
        };
        if(mustPlay) video.play();
    }

    function getCurrentQuality() {
        return _quality;
    }

    function getCurrentLanguage() {
        return _language;
    }

    function each(list, func) {
        for(var i = 0; i < list.length; i++) {
            func(list[i]);
        }
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
