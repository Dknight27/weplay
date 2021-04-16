/*
 * @Description: weplay
 * @Autor: ShenHao
 * @Date: 2021-04-12 09:17:36
 * @LastEditors: ShenHao
 * @LastEditTime: 2021-04-16 21:24:21
 */
$(document).ready(function($){
    'use strict';
    
    const icons="__ICONS__";

    let weplay={};
    
    let id="weplay";

    /**
     * 工具函数
     */
    function get(id){
        return document.getElementById(id);
    }
    function query(selector,elem){
        elem = elem || document;
        return elem.querySelector(selector);
    }
    function create(tagName, parent, props) {
        let elem = document.createElement(tagName);
        for (let prop in props) {
          elem[prop] = props[prop];
        }
        if (parent) {
          parent.appendChild(elem);
        }
        return elem;
    }
    function getDefined(...args) {
        return args.find(val => val !== undefined);
      }
    function on(elem, type, listener, noStop) {//绑定事件
        let prefixes = ['', 'webkit', 'moz'];
        let prefix = prefixes.find(
          prefix => elem['on' + prefix + type] !== undefined
        );
        elem.addEventListener(
            prefix + type,
            function(e) {
                listener.call(elem, e);
                if (!noStop) {
                e.preventDefault();
                e.stopPropagation();
                }
                return !!noStop;
            },
            false
        );
    }
    
    function off(elem, type, listener) {
        let prefixes = ['', 'webkit', 'moz'];
        let prefix = prefixes.find(
            prefix => elem['on' + prefix + type] !== undefined
        );
        elem.removeEventListener(prefix + type, listener);
    }
    function fullscreen() {
        return !!document.fullscreenElement;
    }
    function getFullscreenElement(doc) {
        doc = doc || document;
        return getDefined(
            doc.fullscreenElement,
            doc.webkitFullscreenElement,
            doc.mozFullScreenElement
        );
    }
    //封装发送的信息
    function pack(type, data) {
        let p = {
          type: type
        };
        if (data !== undefined) {
          p.data = data;
        }
        return p;
    }
    /**
     * 适配播放器
     */
    let playerAdaptor={
        prepare(){
            this._player=get('player');
        },
        play(){
            this._player.play();
        },
        pause(){
            this._player.pause();
        },
        seek(sec){
            this._player.currentTime=sec;
            this._player.play();
        },
        isReady(){
            return true;
        },
        getTime(){
            return this._player.currentTime;
        },
        toggleFullscreen(){
            if(!fullscreen()){
                this._player.requestFullscreen();
            }else{
                document.exitFullscreen();
            }
        }
    };
    let playerBase={
        trigger(type, ...args) {
            if (typeof this['on' + type] === 'function') {
              this['on' + type](...args);
            }
        },
        init() {
            this.prepare();
            this.initFullscreen();
        },
        initFullscreen() {
            //全屏切换时处理函数，暂时用不到
            this._fullscreenChangeHandler = () => {
                let fsc = getFullscreenElement(document);//当前是否全屏
                let isFullscreen = !!fsc;
                this.trigger('fullscreenchange', isFullscreen);
            };
            //绑定全屏切换时触发的函数
            on(document, 'fullscreenchange', this._fullscreenChangeHandler);
            this.trigger('fullscreeninit');
        },
        disposeFullscreen() {
            off(document, 'fullscreenchange', this._fullscreenChangeHandler);
        },
        toggleFullscreen() {}
    };
    function initPlayer(done){
        let player=Object.assign({},playerBase,playerAdaptor);
        //player不仅包含了video节点，还包含了控制方法
        (function init(){
            player.init();
            if(player._player){
                weplay.player=player;
                if(typeof(done)==="function"){
                    done();
                }
            }else{
                //这里是异步执行的，要注意一下
                setTimeout(init,500);
            }
        })();
    }
    //初始化UI
    function initUI(){
        let local=get("local");
        on(local, 'focus', function() {
            this.select();
        });
        on(local, 'click', () => {});
        
        let remote=get("remote");
        on(remote, 'click', () => {});//暂时用不到

        let connect=get("connect");
        on(connect, 'click', function() {
            //这是封装在initUI函数里，等执行weplay.init()的时候，connect函数已经定义了
            weplay.connect(remote.value);
        });

        let disconnect=get("disconnect");
        on(disconnect, 'click', function() {
            weplay.disconnect();
        });

        let name=get("name");
        on(name,"click",()=>{});

        let play=get("play");
        on(play, 'click', function() {
            weplay.player.play();
            weplay.remote.send(pack('PLAY'));
        });
        
        let pause=get("pause");
        on(pause, 'click', function() {
            weplay.player.pause();
            weplay.remote.send(pack('PAUSE'));
        });

        let sync=get("sync");
        on(sync, 'click', function() {
            let time = weplay.player.getTime();
            weplay.player.seek(time);
            weplay.remote.send(pack('SEEK', time));
        });
        
        let restart=get("restart");
        on(restart, 'click', function() {
            //本地重新开始
            if (weplay.player.restart) {
              weplay.player.restart();
            } else {
              weplay.player.seek(0);
              weplay.player.play();
            }
            //远程重新开始
            weplay.remote.send(pack('SEEK', 0));
        });

        let fullscreen=get("fullscreen");
        on(fullscreen, 'click', function() {
            weplay.player.toggleFullscreen();
        });
        //选择视频文件
        let select=get("select");
        on(select,"change",function(){
            let file=select.files[0];
            player.src=URL.createObjectURL(file);
        });

        let sendmsg=get("sendmsg");
        on(sendmsg, 'click', function(){
            let chatbox=get("chatbox");
            let msgbox=get("msgbox");
            let username=weplay.ui.name.value||weplay.ui.local.value;
            let msg=username+": "+chatbox.value+"\n";
            weplay.remote.send(pack("MSG",msg));
            msgbox.value=msgbox.value+msg;
            chatbox.value="";
        });

        weplay.ui = {
            // main,//不需要该属性
            local,
            remote,
            connect,
            disconnect,
            name,
            // toggle,//不需要展开/合并控制栏
            play,
            pause,
            sync,
            restart,
            fullscreen,
            select
        };
        //if (location.protocol === "https:")
        if (true) {//没办法使用https传输
            let call = get("call");
            on(call, 'click', function() {
                weplay.call(weplay.ui.remote.value);
            });
            weplay.ui.call = call;
    
            let hangUp = get("hangUp");
            on(hangUp, 'click', function() {
                weplay.hangUp();
            });
            weplay.ui.hangUp = hangUp;
    
            create('style', document.body, {
            textContent: `
                        #weplay.active {
                            width: 46em !important;
                        }`
            });
        }
    }


    
    weplay.remote = {
        send(...args) {
            let c = weplay.connection;
            if (c) {
                c.send.apply(c, args);
            }
        }
    };

    function initPeer(){
        if (!window.Peer) {
            throw new Error('Cannot initialize peer.');
        }
        let peer=new Peer();
        //连接到peerjs服务器时填充本地id
        peer.on('open', function(id) {
            weplay.ui.local.value = id;
        });
        //收到远端的连接请求时用connect处理
        peer.on("connection", connect);
        peer.on("call",call);

        weplay.peer=peer;
    }

    function call(media) {
        prepareMedia(media);
        weplay.call(media);
    }

    function prepareMedia(media) {
        weplay.media = media;
        let ui = weplay.ui;
        media.on('stream', stream => {
            ui.remoteVideo.srcObject = stream;
            ui.localVideo.hidden = false;
            ui.remoteVideo.hidden = false;
            ui.call.hidden = true;
            ui.hangUp.hidden = false;
        });
        media.on('close', () => {
            ui.localVideo.hidden = true;
            ui.remoteVideo.hidden = true;
            ui.call.hidden = false;
            ui.hangUp.hidden = true;
            weplay.media = null;
            if (weplay.stream) {
                weplay.stream.getTracks().forEach(track => track.stop());
                weplay.stream = null;
            }
        });
    }

    function connect(c){//用于处理连接时间
        console.log("establishing");
        weplay.connection=c;

        let ui=weplay.ui;
        ui.remote.value = c.peer;
        ui.remote.disabled = true;
        ui.connect.hidden = true;
        ui.disconnect.hidden = false;

        let start = 0;
        let elapsed = 0;//连接持续时间
        let round = 0;
        let count = 0;//轮次
        //保持发送信息，以防连接断开
        function heartBeat() {
            start = Date.now();
            c.send(pack('REQ'));
        }
        //检测双方播放视频是否相同
        function checkPath() {
            c.send(pack('CHECK'));
        }

        function getPath() {
            return location.host + location.pathname;
        }

        c.on('data', function(p) {
            let player = weplay.player;
            switch (p.type) {
                case 'REQ'://对方在确认连接是否中断
                    c.send(pack('ACK'));//返回ACK告诉对方连接正常
                    break;
                case 'ACK'://收到对方ACK表示连接正常
                    round = Date.now() - start;//对方发送与本地接收的时间差
                    count++;
                    elapsed += round;
                    setTimeout(function() {
                    heartBeat(c);
                    }, 1000);//1s后再次确定连接情况
                    break;
                case 'CHECK'://对方请求确定是否是同一个视频
                    c.send(pack('PATH', getPath()));
                    break;
                case 'PATH'://暂时不用
                    if (p.data !== getPath()) {
                    console.error('Not on the same page.');
                    c.close();
                    }
                    break;
                case 'MSG'://可以用来聊天
                    let msgbox=get("msgbox");
                    msgbox.value=msgbox.value+p.data;
                    console.log('Remote: ' + p.data);
                    break;
                case 'SEEK'://请求跳转到sec
                    player.seek(parseInt(p.data, 10));
                    break;
                case 'PAUSE':
                    player.pause();
                    break;
                case 'PLAY':
                    player.play();
                    break;
            }
        });

        heartBeat();

        c.on('close', function() {
            ui.remote.value = '';
            ui.remote.disabled = false;
            ui.connect.hidden = false;
            ui.disconnect.hidden = true;
      
            weplay.connection = null;
        });
    }

    weplay.init=function(){
        initPlayer(function(){
            initUI();
            initPeer();
        });
    };

    weplay.connect=function(remote){
        let c=weplay.peer.connect(remote);
        c.on('open', function() {
            connect(c);
        });
    };

    weplay.disconnect = function() {
        let c = weplay.connection;
        if (c) {
          c.close();
        }
    };

    function getUserMedia(...args) {
        let method = getDefined(
            navigator.getUserMedia,
            navigator.webkitGetUserMedia,
            navigator.mozGetUserMedia
        );
        if (!method) {
          return null;
        }
    
        return method.apply(navigator, args);
    }

    function initVideoCallPlayers() {
        if (weplay.ui.localVideo) {
            return;
        }
        let remoteVideo = create('video', document.body, {
            id: 'weplay-remote-video',
            autoplay: true
        });
        let localVideo = create('video', document.body, {
            id: 'weplay-local-video',
            autoplay: true,
            muted: true
        });
        weplayDrag(remoteVideo);
        weplayDrag(localVideo);
        Object.assign(weplay.ui, { remoteVideo, localVideo });
        on(document, 'fullscreenchange', function() {
            if (remoteVideo.src) {
                remoteVideo.play();
            }
            if (localVideo.src) {
                localVideo.play();
            }
        });
    }

    weplay.call = function(remote) {
        getUserMedia(
            {
                video: true,
                audio: true
            },
            stream => {
                weplay.stream = stream;
                initVideoCallPlayers();
                weplay.ui.localVideo.srcObject = stream;
                if (typeof remote === 'string') {
                    // peer id
                    let media = weplay.peer.call(remote, stream);
                    prepareMedia(media);
                } else {
                    // MediaConnection
                    remote.answer(stream);
                }
            },
            err => console.error
        );
    };

    weplay.hangUp = function() {
        if (weplay.media) {
            weplay.media.close();
        }
    };

    window.weplay=weplay;

    weplay.init();
});