/*
 * @Description: 用于测试html5播放器
 * @Autor: ShenHao
 * @Date: 2021-04-11 17:56:57
 * @LastEditors: ShenHao
 * @LastEditTime: 2021-04-12 21:29:45
 */
$(document).ready(function($){
    console.log('right');
    let weplay={};
    weplay.connection=null;
    let local=document.getElementById("local");
    let remote=document.getElementById("remote");
    let player=document.getElementById("player");
    let peer=new Peer();
    let btnConnect=$("#connect");
    let btnPlay=$("#play");
    btnPlay.click(function(){
        console.log("开始播放");
        player.play();
    });
    btnConnect.click(function(){
        let conn=peer.connect(remote.value);
        //本地主动连接时也要注意处理
        conn.on("open",function(){//忘了给这里绑定了
            console.log('Peer A has been binded');
            conn.on("data",function(data){
                console.log('Received', data);
                if(data==="Play"){
                    player.play();
                }
                if(data=="Pause"){
                    player.pause();
                }
            });
        });
        weplay.connection=conn;
        if(weplay.connection){
            console.log('connect success');
            remote.disabled=true;
        }
    });
    peer.on("open",function(id){
        local.value=id;
    });
    peer.on("connection",function(conn){//来自另一方的连接
        weplay.connection=conn;
        console.log(weplay.connection);
        remote.value=conn.peer;
        remote.disabled=true;
        conn.on("data",function(data){
            console.log('Received', data);
            if(data==="Play"){
                player.play();
            }
            if(data=="Pause"){
                player.pause();
            }
        });
    });
    
    player.onplay=function(){
        console.log(`开始播放时触发 `);
        if(!!weplay.connection){
            weplay.connection.send('Play');
        }else{
            console.log("don't have connection");
        }
    }
    player.onpause=function(){
        console.log(`暂停时触发 `);
        if(!!weplay.connection){
            weplay.connection.send('Pause');
        }else{
            console.log("don't have connection");
        }
    }
});