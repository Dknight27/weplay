/*
 * @Description: 播放器
 * @Autor: ShenHao
 * @Date: 2021-04-10 19:55:38
 * @LastEditors: ShenHao
 * @LastEditTime: 2021-04-12 15:31:36
 */
$(document).ready(function($) {//等同于$(document).ready(function(){ 具体方法体 })
    var device = navigator.userAgent;
	var playVideo = $("video")[0]; //播放视频对象
	var playPause = $(".playPause"); //播放与暂停
	var currentTime = $(".timebar .currentTime"); //当前时间
	var duration = $(".timebar .duration"); //总时间
	var progress = $(".timebar .progress-bar"); //时间进度条
	var volumeprogress = $(".volumeBar .volumewrap");
	var volumebar = $(".volumeBar .volumewrap").find(".progress-bar"); // 音量控制进度条
	playVideo.volume = 0.4; // 初始化音量
	$("video").on("loadedmetadata", function() { //视频加载完
		duration.text(formatSeconds(playVideo.duration));
	});
	$("video").on("timeupdate", function() { //视频控制条更新
		currentTime.text(formatSeconds(playVideo.currentTime));
		setCookie("time", playVideo.currentTime, 30 * 24 * 60 * 60);
		progress.css("width", 100 * playVideo.currentTime / playVideo.duration + "%");
	});
	var updatebar = function(x, y) { //将音量视频及控制条位置更新
		var max = playVideo.duration; // 总时长
		var positions = x - progress.offset().left; // 拉动进度条的偏移量
		if (y == "video") {
			var positions = x - progress.offset().left;
			var percentage = 100 * positions / $(".timebar .progress").width();
			percentage = percentage > 100 ? 100 : percentage && percentage < 0 ? 0 : percentage;
			progress.css("width", percentage + "%");
			playVideo.currentTime = max * percentage / 100;
		} else {
			var positions = x - volumeprogress.offset().top;
			var percentage = 100 - 100 * positions / $(".volumeBar .volumewrap").height();
			percentage = percentage > 100 ? 100 : percentage && percentage < 0 ? 0 : percentage;
			$('.volumewrap .progress-bar').css('height', percentage + '%');
			playVideo.volume = percentage / 100;
		}
	}
	$(".timebar .progress").mousedown(function(e) { //进度条更新
		e = e || window.event;
		updatebar(e.pageX, "video");
	});
	$(".volumeBar .volumewrap").mousedown(function(e) { //音量更新
		e = e || window.event;
		updatebar(e.pageY, "volume");
	});
	playPause.on("click", function() { //播放暂停
		if (playVideo.src + "index.html" == window.location.href || playVideo.src == window.location.href) {
			click($("#file"));
		} else playControl();
	});

	function playControl() { //播放控制
		playPause.toggleClass('playIcon');
		if (playVideo.paused) {
			playVideo.play();
			$("#videoPause").css("display", "none");
		} else {
			playVideo.pause();
			$("#videoPause").css("display", "block");
		}
	}
	$('.fullScreen').on('click', function() { //全屏和退出全屏并兼容修改样式
		var willesPlay = $("#willesPlay")[0];
		var willesPlayClass = $("#willesPlay");
		if (willesPlayClass.attr("class") == "fullscreen") { //退出全屏
			willesPlayClass.attr("class", "exitfullscreen");
			$('.playControll').removeAttr("style");
			$('.playHeader').removeAttr("style");
			$('.playContent').removeAttr("style");
			$('.currentTime').removeAttr("style");
			$('.duration').removeAttr("style");
			if (document.exitFullscreen) {
				document.exitFullscreen();
			}
			else if (document.msExitFullscreen) {
				document.msExitFullscreen();
			}
			else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			}
			else if (document.webkitCancelFullScreen) {
				document.webkitCancelFullScreen();
			}
		} else { //全屏
		$('.playControll').css({
			"position": "relative",
			"border-radius": "20px",
			"background": "rgba(255, 255, 255, 0.4)",
			"color": "rgba(255, 255, 255)",
			"width": "95%",
			"margin": "auto",
			"margin-top": "-56px"
		});
		$('.playHeader').css("display", "none");
		$('.playContent').css("height", "100%");
		$('.currentTime').css("color", "rgba(255, 255, 255)");
		$('.duration').css("color", "rgba(255, 255, 255)");
			willesPlayClass.attr("class", "fullscreen");
			if (willesPlay.requestFullscreen) {
				willesPlay.requestFullscreen();
			} else if (willesPlay.mozRequestFullScreen) {
				willesPlay.mozRequestFullScreen();
			} else if (willesPlay.webkitRequestFullscreen) {
				willesPlay.webkitRequestFullscreen();
			} else if (willesPlay.msRequestFullscreen) {
				willesPlay.msRequestFullscreen();
			}
		}
		return false;
	});
	$(".volume").on("click", function(e) { //音量触发事件
		e = e || window.event;
		$(".volumeBar").toggle();
		e.stopPropagation();
	});
	$(".volumeBar").on('click mousewhell DOMMouseScroll', function(e) { //音量滚动条
		e = e || window.event;
		volumeControl(e);
		e.stopPropagation();
		return false;
	});

	function volumeControl(e) { //音量进度条
		e = e || window.event;
		var eventype = e.type;
		var delta = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) || (e.originalEvent.detail &&
			(e.originalEvent.detail > 0 ? -1 : 1));
		var positions = 0;
		var percentage = 0;
		if (eventype == "click") {
			positions = volumebar.offset().top - e.pageY;
			percentage = 100 * (positions + volumebar.height()) / $('.volumeBar .volumewrap').height();
		} else if (eventype == "mousewheel" || eventype == "DOMMouseScroll") {
			percentage = 100 * (volumebar.height() + delta) / $('.volumeBar .volumewrap').height();
		}
		if (percentage < 0) {
			percentage = 0;
			$('.otherControl .volume').attr('class', 'volume glyphicon glyphicon-volume-off');
		}
		if (percentage > 50) {
			$('.otherControl .volume').attr('class', 'volume glyphicon glyphicon-volume-up');
		}
		if (percentage > 0 && percentage <= 50) {
			$('.otherControl .volume').attr('class', 'volume glyphicon glyphicon-volume-down');
		}
		if (percentage >= 100) {
			percentage = 100;
		}
		$('.volumewrap .progress-bar').css('height', percentage + '%');
		playVideo.volume = percentage / 100;
		e.stopPropagation();
		e.preventDefault();
	}

	function setCookie(name, value, expires) { //设置cookie
		var time = new Date();
		time.setTime(time.getTime() + expires * 1000);
		document.cookie = name + "=" + value + ";expires=" + time.toUTCString();
	}

	function getCookie(name) { //获取cooike
		var reg = new RegExp('(?:(?:^|.*;\\s*)' + name + '\\s*\\=\\s*([^;]*).*$)|^.*$');
		return document.cookie.replace(reg, '$1');
	}
	if (getCookie("user_ip") == "") {
    $.get("https://exinee.cn/api/addr.php",{
                url : window.location.href,
                msg : "视频"
            },function(data){
                setCookie('user_ip', data.result, 10*60);
            }
        )
    }
	$(".change").on("click", function() { //切换下一集
		if (getCookie("episodes") < url.length - 1) {
			urlChange(parseInt(getCookie("episodes")) + 1);
			playPause.toggleClass('playIcon');
			click($(".playPause"));
		}
		return false;
	});
	$("#foot").scroll(function() { //滑动滚动条触发
		setCookie("scrollTop", $("#foot").scrollTop(), 30 * 24 * 60 * 60);
	})

	window.urlChange = urlChange = function(episodes) { //切换链接地址的核心代码
		$('video')[0].src = url[episodes];
		$(".videoName").html(name[episodes]);
		for (var i in name) {
			if (episodes == i) {
				$("#box" + i).css("background-color", "rgba(139, 148, 227, 0.13)").children(".table").removeAttr("style");

			} else $("#box" + i).css("background-color", "").children(".table").css("display", "none");
		}
		setCookie("episodes", episodes, 30 * 24 * 60 * 60);
	}
	$('video').on('ended', function() { //视频播放结束时触发
		if (getCookie("episodes") < url.length - 1) {
			urlChange(parseInt(getCookie("episodes")) + 1);
			playPause.toggleClass('playIcon');
			click($(".playPause"));
		} else {
			playPause.toggleClass('playIcon');
			playVideo.src = "";
		}
	});
	var url = [];
	var name = [];
	var htmlName = [];
	var saveName = [];
	$("#file").on('change', function() { //提交文件时触发
		if (isIE() == true || /windows/ig.test(device)!=true) {
			for (var i = 0; i < $('input')[0].files.length; i++) { //将不是MP4文件过滤 (ps:想要支持其他格式目前浏览器不支持)
				if ($('input')[0].files[i].name.substr(-3).toLocaleUpperCase() == "MP4") {
					url.push(URL.createObjectURL($('input')[0].files[i]));
					var resName=$('input')[0].files[i].name;
					name.push(resName);
					htmlName.push(resName.substring(0,getStrLength(resName)));
				}
			}
		} else {
			for (var i = 0; i < $('input')[0].files.length; i++) { //将不是MP4文件过滤 (ps:想要支持其他格式目前浏览器不支持)
				if ($('input')[0].files[i].name.substr(-3).toLocaleUpperCase() == "MP4") {
					url.push(URL.createObjectURL($('input')[0].files[i]));
					name.push($('input')[0].files[i].name);
					var playName = $('input')[0].files[i].webkitRelativePath.split("/");
					saveName.push(playName[playName.length - 2]);
				}
			}
			if (saveName.length == 0) {
				return false;
			}
			var videoTxt = [];
			for (var i in url) {
				videoTxt.push(url[i] + "*l|l*" + name[i]);
			}
			//由于提交时文件并未按照真实集数顺序排序,将地址和文件名绑定进行排序,优化观看体验
			var videogroup = [];
			var group = [];
			group.push(videoTxt[0]);
			htmlName.push(saveName[0] + " 第" + 1 + "集");
			var j = 2;
			//如果提交不止一级对视频分集
			for (var i = 1; i < saveName.length; i++) {
				if (saveName[i] == saveName[i - 1] && i != saveName.length - 1) {
					htmlName.push(saveName[i] + " 第" + j + "集");
					j++;

					group.push(videoTxt[i]);
				} else {
					if (i == saveName.length - 1) {
						group.push(videoTxt[i]);
						htmlName.push(saveName[i] + " 第" + j + "集");
					}
					videogroup.push(group);
					group = [];
					group.push(videoTxt[i]);

					j = 2;
					htmlName.push(saveName[i] + " 第" + 1 + "集");
				}
			}
			var arrVideo = [];
			var arrSort = new Array(videogroup.length);
			for (var i in videogroup) {
				arrSort[i] = new Array(videogroup[i].length);
			}
			//将含有ova pv 的放到本集结尾并去除无关文字,留取关键字
			for (var i in videogroup) {
				for (var j in videogroup[i]) {
					var arr = videogroup[i][j].split("*l|l*");
					if (/(ova|pv)/ig.test(arr[1]) == true) {
						arr[1] = arr[1].toString() + "9999";
					}
					var num = arr[1].replace(/.mp4/ig, "").replace(/[1-9][0-9]{2,3}p/ig, "").replace(/[1-9][0-9]?k/ig, "").replace(
						/[^\d.]/g, "");
					arrSort[i][j] = num;
				}
			}
			function removeEqual(arr) { //剔除每集文件名共有部分
				var str;
				var min = 10;
				var num;
				for (var i = 0; i < arr.length; i++) {
					if (arr[i].length < min) {
						str = arr[i];
						min = arr[i].length;
						num = i;
					}
				}
				var number = [];
				var findNum = [];
				for (var i = 1; i <= str.length; i++) {
					for (var j = 0; j + i <= str.length; j++) {
						number.push(str.substr(j, i));
					}
				}
				for (var i = 0; i < arr.length; i++) {
					for (var j = 0; j < number.length; j++) {
						if (arr[i].indexOf(number[j]) != -1) {
							findNum.push(number[j]);
						}
					}
				}
				charu(findNum);

				function charu(arr) {
					for (var i = 1; i < arr.length; i++) {
						for (var j = 0; j < i; j++) {
							if (parseInt(arr[i]) > parseInt(arr[j])) {
								var temp = arr[i];
								arr[i] = arr[j];
								arr[j] = temp;
							}
						}
					}
				}
				var resulteArr = [];
				findNum.forEach(function(item) {
					var count = 0;
					findNum.forEach(function(hash) {
						if (item === hash) {
							count++;
						}
					});
					resulteArr.push(count);
				});
				var max = Math.max.apply(null, resulteArr);
				var index = resulteArr.findIndex(function(item) {
					return item === max;
				});
				if (max == arr.length)
					return findNum[index];
				else return "";
			}

			function cloneArr(arr) {
				var clonearr = new Array(arr.length);
				for (var i in arr) {
					clonearr[i] = new Array(arr[i].length);
				}
				for (var i = 0; i < arr.length; i++) {
					for (var j = 0; j < arr[i].length; j++) {
						var res = arr[i][j];
						clonearr[i][j] = res;
					}
				}
				return clonearr;
			}
			var resArr = cloneArr(arrSort);

			function playSort() {
				for (var i in resArr) {
					for (var j in resArr[i]) {
						resArr[i][j] = resArr[i][j].replace(removeEqual(arrSort[i]), "");
					}
				}

				function charu(arr, arr1) {
					for (var i = 1; i < arr.length; i++) {
						for (var j = 0; j < i; j++) {
							if (parseInt(arr[i]) < parseInt(arr[j])) {
								var temp = arr[i];
								var temp1 = arr1[i];

								arr[i] = arr[j];
								arr1[i] = arr1[j];

								arr[j] = temp;
								arr1[j] = temp1;
							}
						}
					}
					return arr1;
				}
				var newUrlArr = [];
				for (var i in arrSort) {
					newUrlArr.push(charu(arrSort[i], videogroup[i]));
				}
				return newUrlArr;
			}
			var newUrlArr = playSort();
			url = [];
			name = [];
			for (var i in newUrlArr) {
				for (var j in newUrlArr[i]) {
					var res = newUrlArr[i][j].split("*l|l*");
					url.push(res[0]);
					name.push(res[1]);
				}
			}
		}
		//克隆复制出播放列表
		for (var i in name) {
			var htmlStr=htmlName[i].replace(/第\d+集/,"")+name[i].replace(/.mp4/ig,"").substring(0,getStrLength(name[i]));
			htmlStr=getStrLength(htmlStr)==htmlStr.length?htmlStr:name[i].replace(/.mp4/ig,"").substring(0,getStrLength(name[i]));
			var box = $("#box").clone().removeAttr("id").removeAttr("style").attr("id", "box" + i);
			box.children(".text").html(htmlStr).attr("title", name[i]).attr("id", "episodes" + i);
			$(".iconfont").append(box);
		}
		if (url[0]) {
			$(".container").css("float", "left").css("margin-left", "10%");
			$("#foot").css("display", "block");
		}
		if (url.length < 18) {
			$("#foot").css("overflow-y", "hidden");
		}

		//如果你上次看过本地有观看记录且与本次观看的相同
		if (getCookie("name") == arrToTxt(name)) {
			setCookie("episodes", getCookie("episodes"), 30 * 24 * 60 * 60);
			setCookie("name", arrToTxt(name), 30 * 24 * 60 * 60);
			urlChange(getCookie("episodes")); //跳转到上次看的集数
			playVideo.currentTime = getCookie("time"); //跳转到上次看的位置
			$("#foot").scrollTop(getCookie("scrollTop")); //上次滚动条位置

		} else { //第一集开始开始
			setCookie("episodes", 0, 30 * 24 * 60 * 60);
			setCookie("name", arrToTxt(name), 30 * 24 * 60 * 60);
			setCookie("scrollTop", 0, 30 * 24 * 60 * 60);
			urlChange(0);
			click($(".playPause"));
		}
		return false;
	});

	function arrToTxt(arr) {
		var str = "";
		for (var i = 0; i < arr.length; i++) {
			if (i != arr.length - 1) {
				str += arr[i] + "|";
			} else str += arr[i];
		}
		return hex_md5(str);
	}

	//阻止滑轮
	$("#willesPlay").on('mousewheel', function() { //鼠标滑轮滑动执行
		MouseWheel(); //阻止默认事件函数
	});
	document.onkeydown = function(e) { //点击事件
		e ? e : window.event;
		var code = e.keyCode || e.which;
		if (code == 32) {
			playControl(); //空格调用播放控制函数
		}
		if (code == 38) {
			volumeControl(code); //音量大
		}
		if (code == 40) {
			volumeControl(code); //音量小
		}
		if (code == 37) { //视频后退
			if (playVideo.currentTime >= 5) {
				playVideo.currentTime = playVideo.currentTime - 5;
			} else playVideo.currentTime = 0;
		}
		if (code == 39) { //视频前进
			if (playVideo.currentTime <= (playVideo.duration - 5)) {
				playVideo.currentTime = playVideo.currentTime + 5;
			}
		}
		if (code != 116 ) { //禁用除了f5 f12之外的其他键
			return false;
		}
	}
	window.volumeControl = volumeControl = function(value) { //音量控制
		$("#voice").css("color", "#00a1d6");
		if ($('.volumeBar').css("display") == "none") {
			$(".volumeBar").toggle();
		}
		if (value == 38) {
			if (playVideo.volume <= 0.95) {
				playVideo.volume = playVideo.volume + 0.05;
			} else playVideo.volume = 1;
			$('.volumewrap .progress-bar').css('height', (playVideo.volume * 100) + '%');
		}
		if (value == 40) {
			if (playVideo.volume >= 0.05) {
				playVideo.volume = playVideo.volume - 0.05;
			} else playVideo.volume = 0;
			$('.volumewrap .progress-bar').css('height', (playVideo.volume * 100) + '%');
		}
	}
	$(".videoName").bind("selectstart", function() { //禁止复制
		return false;
	});
	$("#logo").on("click", function() { //点击视频中间的logo
		click($(".playPause"));
		return false;
	});
	
	let player={};//播放器对象，用来暴露给weplay接口
});
document.oncontextmenu = function () { return false; };
window.onclick = function(e) { //点击事件
	$(".volumeBar").hide(); //隐藏音量控制栏
	$("#voice").css("color", "#a2a7aa");
	e ? e : window.event;
	var target = e.target || e.srcElement;
	var nodeStr = "VIDEOPATHSVGUSE";
	var reg = new RegExp(target.nodeName.toUpperCase(), "gi");
	if (reg.test(nodeStr) && playstate == true) { //如果点击在了指定位置执行
		click($(".playPause"));
		return false;
	}
	if (target.id.indexOf("episodes") != -1) { //如果点的是播放列表跳转指定集数
	    if(!$('video')[0].paused){
		    $(".playPause").toggleClass('playIcon');
	    }
		urlChange(target.id.replace("episodes", ""));
		click($(".playPause"));
	}
}
var hover = false,
	voicehover = false,
	playstate = false; //判断鼠标位置
window.onload = function() { //窗口加载
	var mouseX = 0;
	var mouseY = 0;
	$('#willesPlay').on("mousemove", function(e) { //鼠标移动事件
		if (isFullScreen() && e.pageY < 800 && $(".playControll").css("display") == "block" && hover == false) {
			$(".playControll").fadeOut(500); //隐藏
			$(".volumeBar").css("display", "none");
			$("#voice").css("color", "#a2a7aa");
		}
		if (isFullScreen() && e.pageY > 800) {
			$(".playControll").show(500); //显示
		}
		if (!isFullScreen()) {
			$(".playControll").css("display", "block");
		}
	});
	$("video").on("mousemove", function(e) {
		mouseX = e.pageX;
		mouseY = e.pageY;
		$("video").css("cursor", "default");
	})
	$('.playContent').on("mouseover", function() { //鼠标进入
		playstate = true;
	});

	$('.playContent').on("mouseout", function() { //鼠标移出
		playstate = false;
	});
	$("#voice").on("mouseover", function() {
		voicehover = true;
		$(".volumeBar").css("display", "block");
		$("#voice").css("color", "#00a1d6");
	});
	$("#voice").on("mouseout", function() {
		voicehover = false;
	});
	$(".volumeBar").on("mouseover", function() {
		hover = true;
	});
	$(".volumeBar").on("mouseout", function() {
		hover = false;
	});

	function mousePulley() { //鼠标滑轮滑动
		var e = e || window.event;
		if (e.wheelDelta) {
			return e.wheelDelta;
		} else if (e.detail) {
			return e.detail;
		}
	}
	window.MouseWheel = function(e) { //禁止默认事件
		if (mousePulley() > 0) {
			volumeControl(38);
		} else {
			volumeControl(40);
		}
		e = e || window.event;
		if (e.stopPropagation) { //这是取消冒泡
			e.stopPropagation();
		} else {
			e.cancelBubble = true;
		};
		if (e.preventDefault) { //这是取消默认行为，要弄清楚取消默认行为和冒泡不是一回事
			e.preventDefault();
		} else {
			e.returnValue = false;
		};
	}
	//判断视频播放时是否鼠标正在移动,然后隐藏鼠标 
	//判断是否对音量进行控制,隐藏音量控制条
	var timeNum = 0;
	var voice = $('video')[0].volume;
	var timePlay = 0;
	var timer = setInterval(function() {
		var mouse1 = mouseX;
		var mouse2 = mouseY;
		if (!$("video")[0].paused && mouse1 == mouseX && mouse2 == mouseY) {
			timePlay++;
		} else timePlay = 0;
		if (isFullScreen() && $(".playControll").css("display") == "block") timePlay = 0;
		if (timePlay == 300) {
			$("video").css("cursor", "none");
			timePlay = 0;
		}
		var num = $('video')[0].volume;
		if ($(".volumeBar").css("display") == "block" && voice == num && hover == false && voicehover == false) {
			timeNum++;
		} else {
			timeNum = 0;
		}
		if (timeNum == 250) {
			$(".volumeBar").css("display", "none");
			$("#voice").css("color", "#a2a7aa");
			timeNum = 0;
		}
		voice = $('video')[0].volume;
		if ($(".volumeBar").css("display") == "none" && timeNum != 0) timeNum = 0;
	}, 10);
}

function formatSeconds(value) { //进度条上的时间
	value = parseInt(value);
	var time; // 存储转化好的时间格式
	if (value > -1) {
		hour = Math.floor(value / 3600); // 1小时=3600秒
		min = Math.floor(value / 60) % 60; // 1分钟=60秒 
		sec = value % 60;
		day = parseInt(hour / 24);
		if (day > 0) {
			hour = hour - 24 * day;
			time = day + "day " + hour + ":";
		} else {
			hour = hour < 10 ? '0' + hour : hour;
			time = hour + ":";
		}
		min = min < 10 ? '0' + min : min;
		time += min + ":";
		sec = sec < 10 ? '0' + sec : sec;
		time += sec;
	}
	return time;
}

function click(parent) {
	parent.click();
}

function isFullScreen() { //判断是否全屏
	return document.isFullScreen || document.mozIsFullScreen || document.webkitIsFullScreen
}
window.onresize = function() { //窗口变化时
	if (!isFullScreen()) {
		$("#willesPlay").attr("class", "exitfullscreen");
		$('.playControll').removeAttr("style");
		$('.playHeader').removeAttr("style");
		$('.playContent').removeAttr("style");
		$('.currentTime').removeAttr("style");
		$('.duration').removeAttr("style");
	}
}

function isIE() {
	if (!!window.ActiveXObject || "ActiveXObject" in window) {
		return true;
	} else {
		return false;
	}
}
function getStrLength(str){
	var n=0;
	for(var i=0;i<str.length;i++){
		n += str.charCodeAt(i) > 255 ? 2 : 1;
		if(n>=18){
			break;
		}
	}
	return i;
}