document.addEventListener('DOMContentLoaded', function() {
	var p = $("#video").player({
		video: {
			url: {
				hq: {
					en: "http://workspot.ge/video2.mp4"
				}
			}
		}
	}, {width: 700});
},false);