$(document).ready(function(){

	
	var content_url = 'http://frontpage.fok.nl/';
	var content_element = '#ut_nieuws_headlines';
	var content_links = 'a';
	var counter_text = 'reacties';
	var pageloaded = false;
	var direction = 0;
	var animation_speed = 300;
	var css = new Array();

	if (navigator.standalone)
	{
		$('body').prepend('<div id="splash"></div>');
	}
	else{
		$("body").css({'height':'1000px'});
		$("#wrapper").css({'height':window.innerHeight+17});
		$("#menu_wrapper").css({'height':window.innerHeight+17});
		
		setTimeout(function(){
		// Hide the address bar!
			window.scrollTo(0, 1);
		}, 0);
	}


	function move_element(element,endpos,hide,css)
	{
		css['-webkit-transform'] = "translate3d("+endpos+"%,0%, 0)";
		
		$(element).animateWithCss(
		  css, // CSS properties to animate
		  animation_speed,                       // Duration in ms
		  "cubic-bezier",             // The timing function
		  function(){                 // Callback
			if (hide) $(element).hide();
		  }
		);
	}	
	
	function splash_screen()
	{
						
		$("#splash").animateWithCss(
		  {"-webkit-transform": "translate3d(0%,0%, 0)","background-size":"200% 200%","opacity":"0"}, // CSS properties to animate
		  1500,                       // Duration in ms
		  "cubic-bezier",             // The timing function
		  function(){                 // Callback
			$("#splash").remove();
		
		  }
		);
	
	}	
	
	
	
	function init(content_element,content_links)
	{

		/*$("#title").addClass('fadein');*/

		if (navigator.onLine) {
		
			load_offline();
			
			//resultaten ophalen van nieuwsbron
			$.get(content_url,function(response)
			{
				$("#thelist li").remove();
				if (content_element) var item = $(response.responseText).find(content_element);
					else var item = $(response.responseText) //rss feeds
				
				var count = 0;
				
				var links = ($(item).find(content_links));
				var reacties = ($(item).find('.trackerItemsReplies'));
				var times = $(item).find('.trackerTime');
				loadlist(links,reacties,times);
				$("#spinwrap").remove();
				
				splash_screen();
				
			})	
		}	
		else //offline, uit localstorage halen
		{
			load_offline();
			$("#spinwrap").remove();
		}
	}
	
	function load_offline()
	{
		if (localStorage !== null)
		{
			$("#scroller").prepend('<div id="spinwrap"></div>');
			add_spinner('spinwrap');
			var num_items = (localStorage.length);
			var links = new Array();
			var reacties = new Array();
			for (i=1;i<localStorage.length;i++)
			{
				try{
					cache_link = localStorage.getItem("link"+i).split(',');
				
					links.push(cache_link[1]);
					reacties.push(cache_link[2]);
					
					var num_reacties = cache_link[2];
					var time = cache_link[3];

					$("#thelist").append('<li title="'+cache_link[0]+'"><a href="#" url="'+cache_link[1]+'" title="'+cache_link[0].substr(0,60)+'">'+cache_link[0].substr(0,42)+'...<br>'+time+' - '+num_reacties+'</a></li>');	
					$("#scroller").css({'height':$("#scroller").css('height')+45});
				}
				catch(err)
				{
					console.log(err);
					localStorage.clear();
				}
			}
			
			$("#scroller").css({'height':$("#scroller").css('height')+45});
			setTimeout(function () {
				myScroll.refresh();		
			},0);	
		}
	}
	
	function clearlist()
	{
		$("#thelist li").remove();
	}
	
	function loadlist(links,reacties,times) //links = urls die in de list moeten
	{
		clearlist();
		
		var test = localStorage.getItem("links");
		localStorage.clear();
		for (i=0;i<links.length;i++)
		{
			
		
			var num_reacties = '<span class="numreacties">'+$(reacties[i]).text()+' '+counter_text+'</span>';
			var time = '<span class="numreacties">'+$(times[i]).text()+'</span>';
			var data = new Array($(links[i]).text().replace(',','&comma;'),$(links[i]).attr('href'),num_reacties,time);
			localStorage.setItem("link"+(i+1), data);
			
			
			$("#thelist").append('<li title="'+$(links[i]).text()+'"><a href="#" url="'+$(links[i]).attr('href')+'" title="'+$(links[i]).text().substr(0,60)+'">'+$(links[i]).text().substr(0,42)+'...<br>'+time+' - '+num_reacties+'</a></li>');	
		}
		
		$("#scroller").css({'height':$("#scroller").css('height')+45});
		
		setTimeout(function () {
			myScroll.scrollTo(0, 0, 0);
			myScroll.refresh();		
		},0);	
	
	}	
	
	
	
	function loaditem(object,textid,textwrap) //niewsartikel ophalen
	{
	
		//phone mode
		if (get_width_int('#screendetect') < 992)
		{
	
			move_element("#menu_button",-50,true,{'opacity':0});
			
		}
		
		$("#title").removeClass('fadein');
		$("#wrapper").css({'background-color':'#FFF'});
		
		$('.itemtitle').remove();
		startpointX = 0;
		startpointY = 0;

		var title = object.attr('title');
		history.pushState({ url: "#" }, "item", "#"+title);
		console.log(object);
		
		if ($("#wrapper_content").length == 0)
		{
			
			$("body").append('<div id="wrapper_content"><div id="scroller_content"><div id="spinwrap"></div><div class="content" id="content"></div></div></div>');
		
			
			myScroll2 = new iScroll('wrapper_content',{
				onScrollMove: function () {
					//manier om youtube te verbergen..werkt nog niet
					$("iframe").css({'visibility':'hidden'});
					$("object").css({'visibility':'hidden'});
				},			
				onScrollEnd: function () {
					$("iframe").css({'visibility':'visible'});
					$("object").css({'visibility':'visible'});
					
					deltaX = startpointX-this.pointX;
					deltaY = Math.abs(startpointY-this.pointY);
				
					var slide_distance = parseInt($("#content").css('width').replace('px',''))/5; //swipe afstand voor volgend artikel
					//volgend nieuwsitem
					if (deltaX >= slide_distance && deltaY <= 50){
						console.log( Math.abs(deltaY));
						if ($("#thelist .selected").next('li').length > 0)
						{
							direction = -1;
							move_element("#content",0,false,{'opacity':0});
							
							var object = $("#thelist .selected").next('li');
							loaditem(object,'.itemBody','');
							$('.selected').removeClass('selected');
							object.addClass('selected');
							
							setTimeout(function () {
								myScroll.scrollTo(0, myScroll.y-40, 100);
								myScroll.refresh();
								
							}, 0);	
							return false;
						}
					}
				
					//vorig nieuwsitem
					if (deltaX <= (-1*slide_distance) && deltaY <= 50){
					
						if ($("#thelist .selected").prev('li').length > 0)
						{
							direction = 1;
							var object = $("#thelist .selected").prev('li');
							
							loaditem(object,'.itemBody','');
							$('.selected').removeClass('selected');
							object.addClass('selected');
							
							if (myScroll.y < -60)
							{
								setTimeout(function () {
									myScroll.scrollTo(0, myScroll.y+40, 100);
									myScroll.refresh();
							
								}, 0);	
							}
							return false;
						}
					}
				},
				onScrollStart: function () {
					startpointX = this.pointX;
					startpointY = this.pointY;
					
				}
			});
			$("#wrapper").css({'background-color':'#FFF'});
			$("#wrapper_content").addClass('from_right_to_left').css({'height':window.innerHeight});
			if (!navigator.standalone) $("#wrapper_content").css({'height':window.innerHeight});
		
			
		}
		else{
			//$(".content").html('');
			if ($("#spinwrap").length == 0) $("#scroller_content").append('<div id="spinwrap"></div>');
		}
		
	
		
		
		$("#backbutton").animateWithCss(
		  {"-webkit-transform": "translate3d(25%,0%, 0)","opacity":"1"}, // CSS properties to animate
		  400,                       // Duration in ms
		  "cubic-bezier",             // The timing function
		  function(){                 // Callback
			
		
		  }
		);
					
		
		//list naar links uit beeld sliden
		$("#title").animateWithCss(
		  {"-webkit-transform": "translate3d(-50%,0%, 0)","opacity":0}, // CSS properties to animate
		  animation_speed,                       // Duration in ms
		  "cubic-bezier",             // The timing function
		  function(){                 // Callback
				if (direction == 1) var style = 'style="-webkit-transform:translate3d(-20%,0%, 0)"'; else var style = 'style="-webkit-transform:translate3d(100%,0%, 0)"';
				$("#title").css({'display':'none'});
				$("#header .itemtitle").remove();
				$("#header").append('<a class="itemtitle" '+style+' href="#">'+object.attr('title')+'</a>');
				
				$(".itemtitle").animateWithCss(
				  {"-webkit-transform": "translate3d(15%,0%, 0)","opacity":1}, // CSS properties to animate
				  50,                       // Duration in ms
				  "cubic-bezier",             // The timing function
				  function(){                 // Callback
						
					
				  }
				);		
				
		  }
		);
	
		//list naar links uit beeld sliden
		$("#wrapper").animateWithCss(
		  {"-webkit-transform": $("#screendetect").css("-webkit-transform")}, // CSS properties to animate
		  animation_speed,                       // Duration in ms
		  "cubic-bezier",             // The timing function
			function(){                 // Callback
				//nieuwsitem ophalen van fok.nl
				
				add_spinner('spinwrap');	
				
			
				$.get(object.children('a').attr('url'),function(response){

					
					var text = '';
					
					$(response.responseText).find(textid+' '+textwrap).each(function(){
						
						$(this).find('input').remove();
						$(this).find('.reactieContainer').find('span img').remove();
						$(this).find('.reactieUserIcon').wrap('<div class="img_wrap"></div>');
						var reacties = $(this).find('.reactieContainer').html()
						$(this).find('.reactieContainer').remove();
						$(this).children('div').remove();
						$(this).children('#newsicon').remove();
						$(this).children('table').remove();
						$(this).children('a:last-child').remove();
						$(this).find('.aTracker').removeAttr('style');
						$(this).find('h3:first').remove();
						$(this).find('p:last').remove();
						
					
						text += '<div id="reacties">'+$(this).html()+reacties+'</div>';
					})

					$("#wrapper_content").removeClass('to_right');
				
					$("#wrapper").css({'background-color':'#aaa'});
					$(".content").css({'opacity':0});
					$(".content").html('<img style="float: left; margin-right: 5px;" src="'+$(response.responseText).find('.itemBody').children('img').attr('src')+'">'+text);
				
					if (myScroll2 !== null)
					{
						setTimeout(function () {
							myScroll2.scrollTo(0, 0, 0);
							myScroll2.refresh();
							move_element("#content",0,false,{'opacity':1});
							$("#spinwrap").remove();
						}, 100);	
					}
				});
				
			}
		);
	
		
		
	}
	
		//listitem click
		$("#thelist li").live('click',function()
		{
		
			$('.selected').removeClass('selected');
		
			var object = $(this);
			object.addClass('selected');
		
			setTimeout(function(){
				loaditem(object,'.itemBody','');
		
			}, 50);
			
		})
		
		function add_spinner(target)
		{
			var opts = {
				lines: 12, // The number of lines to draw
				length: 7, // The length of each line
				width: 2, // The line thickness
				radius: 5, // The radius of the inner circle
				color: '#000', // #rgb or #rrggbb
				speed: 2, // Rounds per second
				trail: 60, // Afterglow percentage
				shadow: false // Whether to render a shadow
			};
			
			var target = document.getElementById(target);
			var spinner = new Spinner(opts).spin();
			target.appendChild(spinner.el);
		}
		
		$("#title,#wide_title").click(function()
		{
			myScroll.scrollTo(0, -50, 300);
		})
		
		
		$(".itemtitle").live('click',function()
		{
			myScroll2.scrollTo(0, 0, 300);
		})
		
		
		
		$("#menu_button").click(function()
		{
			show_menu();
		})
		
		$("#menu_wrapper ul li").click(function()
		{
			content_url = $(this).attr('url');
			content_element = '#'+$(this).attr('content_element');
			if ($(this).attr('content_element') == 'ut_mostread_headlines') counter_text = 'views'; else counter_text = 'reacties';
			
			$("#title").text('Fok! '+$(this).text());
			
	
			move_element("#menu_wrapper",-100,false,css);

			
			css['opacity'] = 1;
			move_element("#menu_button",20,false,css);

		

			
			$("#wrapper").animateWithCss(
			  {"-webkit-transform": "translate3d(0%,0%, 0)"}, // CSS properties to animate
			  animation_speed,                       // Duration in ms
			  "cubic-bezier",             // The timing function
			  function(){                 // Callback
					$("#thelist").html('');
					if ($("#spinwrap").length > 0) $("#spinwrap").remove();
					$("#wrapper").append('<div id="spinwrap"></div>');
					add_spinner('spinwrap');
					init(content_element,content_links);
			
			  }
			);
			
			
			
			
		})
		

	
		function show_menu()
		{
			
			$("#menu_button").animateWithCss(
			  {"-webkit-transform": "rotateY(180deg)","opacity":0}, // CSS properties to animate
			  animation_speed,                       // Duration in ms
			  "cubic-bezier",             // The timing function
			  function(){                 // Callback
				
			  }
			);

			css['opacity'] = 1;
			move_element("#menu_wrapper",0,false,css);
			

		}	

		function hide_menu()
		{
			css['opacity'] = 1;
			move_element("#menu_button",20,false,css);

			move_element("#menu_wrapper",-100,false,css);

		}
	
		///////////////////back button
		$("#backbutton").live('click',function(event)
		{
			event.preventDefault();
			goBack();
		})
		
		function goBack()
		{
			css['opacity'] = 0;
			move_element("#backbutton",100,false,css);
			history.pushState({ url: "#" }, "home", "#home");
			
			$("#menu_button").show();
			$("#menu_button").animateWithCss(
				{"-webkit-transform": "translate3d(20%,0%, 0)","opacity":1}, // CSS properties to animate
				400,                       // Duration in ms
				"cubic-bezier",             // The timing function
				function(){                 // Callback
			
				}
			);
		
	

			$(".itemtitle").animateWithCss(
			  {"-webkit-transform": "translate3d(100%,0%, 0)","opacity":0}, // CSS properties to animate
			  animation_speed,                       // Duration in ms
			  "cubic-bezier",             // The timing function
			  function(){                 // Callback
		
					$(".itemtitle").remove()
					
			  }
			);		
			
			$("#wrapper_content").animateWithCss(
			  {"-webkit-transform": "translate3d(100%,0%, 0)","opacity":0}, // CSS properties to animate
			  animation_speed,                       // Duration in ms
			  "cubic-bezier",             // The timing function
			  function(){                 // Callback
					$("#wrapper_content").remove();
					
			  }
			);
		
			$("#title").css({'display':'block',"-webkit-transform": "translate3d(-50%,0%, 0)"});
			
			$("#wrapper").animateWithCss(
			  {"-webkit-transform": "translate3d(0%,0%, 0)"}, // CSS properties to animate
			  animation_speed,                       // Duration in ms
			  "cubic-bezier",             // The timing function
			  function(){                 // Callback
			

			  }
			);
			
			
			$("#title").animateWithCss(
			  {"-webkit-transform": "translate3d(0%,0%, 0)","opacity":"1"}, // CSS properties to animate
			  animation_speed,                       // Duration in ms
			  "cubic-bezier",             // The timing function
			  function(){                 // Callback
				
			
			  }
			);
			myScroll2.destroy();
			myScroll2 = null;
			return false;
		}
		
		

  
		  // Bind an event to window.onhashchange that, when the hash changes, gets the
		  // hash and adds the class "selected" to any matching nav link.
		  $(window).hashchange( function(){
			if (!pageloaded) {
				history.pushState({ url: "#" }, "home", "#home");
				return;
			}
			var hash = location.hash;
			var hashTag =  hash.replace( /^#/, '' );
			if (hashTag == 'home') goBack();
		  })
		  $(window).hashchange();
		  pageloaded = true;
		  
		  // Since the event is only triggered when the hash changes, we need to trigger
		  // the event now, to handle the hash the page may have loaded with.
		  //$(window).hashchange();
  
		
		$("#wrapper_content a").live('click',function(event)
		{
			event.preventDefault();
			$(this).attr('url',$(this).attr('href'));
			$(this).wrap('span');
			var object = $(this).parent();
			object.attr('title',$(this).text());
			loaditem(object,'.itemBody','');
		
			
		})
		
		function get_width_int(element)
		{
			return $(element).css('width').replace('px','');	
		}
	
		

var myScroll,
	pullDownEl, pullDownOffset,
	pullUpEl, pullUpOffset,
	generatedCount = 0;

function pullDownAction () {
	
	init(content_element,content_links);
}

function pullUpAction () {

	
}

function loaded() {
	pullDownEl = document.getElementById('pullDown');
	pullDownOffset = pullDownEl.offsetHeight;
	pullUpEl = document.getElementById('pullUp');	
	pullUpOffset = pullUpEl.offsetHeight;
	var startpointX;
	var startpointY;
	var can_showmenu;
	myScroll = new iScroll('wrapper',{
		useTransition: true,
		topOffset: pullDownOffset,
		onRefresh: function () {
			if (pullDownEl.className.match('loading')) {
				
				pullDownEl.className = '';
				pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
			} else if (pullUpEl.className.match('loading')) {
				pullUpEl.className = '';
				pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Pull up to load more...';
			}
		},
		onScrollMove: function () {
		
			if (this.y > 5 && !pullDownEl.className.match('flip')) {
				pullDownEl.className = 'flip';
				pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Release to refresh...';
				this.minScrollY = 0;
			} else if (this.y < 5 && pullDownEl.className.match('flip')) {
				pullDownEl.className = '';
				pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
				this.minScrollY = -pullDownOffset;
			} else if (this.y < (this.maxScrollY - 5) && !pullUpEl.className.match('flip')) {
				pullUpEl.className = 'flip';
				pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Release to refresh...';
				this.maxScrollY = this.maxScrollY;
			} else if (this.y > (this.maxScrollY + 5) && pullUpEl.className.match('flip')) {
				pullUpEl.className = '';
				pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Pull up to load more...';
				this.maxScrollY = pullUpOffset;
			}
			
			deltaX = startpointX-this.pointX;
			deltaY = Math.abs(startpointY-this.pointY);

			if (startpointX < 100 & deltaX < -30 && deltaY < 50 && (deltaX > (-1*$("#menu_wrapper").css('width').replace('px',''))) && get_width_int('#screendetect') < 992)
			{
				
				$("#menu_wrapper").css({"-webkit-transform": "translate3d("+((-1*($("#menu_wrapper").css('width').replace('px','')))+(-1*deltaX))+"px,0%, 0)"});
			}
			
			
		},
		onScrollEnd: function () {
			if (pullDownEl.className.match('flip')) {
				pullDownEl.className = 'loading';
				pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Loading...';				
				pullDownAction();	// Execute custom function (ajax call?)
			} else if (pullUpEl.className.match('flip')) {
				pullUpEl.className = 'loading';
				pullUpEl.querySelector('.pullUpLazbel').innerHTML = 'Loading...';				
				pullUpAction();	// Execute custom function (ajax call?)
			}
			var slide_distance = parseInt($("#wrapper").css('width').replace('px',''))/10; //swipe afstand voor volgend artikel
			
			deltaX = startpointX-this.pointX;
			deltaY = Math.abs(startpointY-this.pointY);
		
			if (startpointX < 100 && deltaX <= (-1*slide_distance) && deltaY < 50 && get_width_int('#screendetect') < 992){
			
				show_menu();
				
			}
			else  hide_menu();
			
		},onScrollStart: function () {
				startpointX = this.pointX;
				startpointY = this.pointY;
				
				can_showmenu = true;
			}
	});
	
		myScroll_menu = new iScroll('menu_wrapper',{
			vScroll: false,
			onScrollEnd: function () {
				$("iframe").css({'visibility':'visible'});
				$("object").css({'visibility':'visible'});
				
				deltaX = startpointX-this.pointX;
				deltaY = Math.abs(startpointY-this.pointY);
			
				var slide_distance = parseInt($("#wrapper").css('width').replace('px',''))/5; //swipe afstand voor volgend artikel

				if (deltaX >= slide_distance && deltaY <= 50){
				
					hide_menu();
				}
				else show_menu();
			},
			onScrollStart: function () {
				startpointX = this.pointX;
				startpointY = this.pointY;
				console.log(startpointX);
			},
			onScrollMove: function () {
				deltaX = startpointX-this.pointX;
			
				if (deltaX > 0)
				{
					$("#menu_wrapper").css({"-webkit-transform": "translate3d(-"+deltaX+"px,0%, 0)"});
					//$("#wrapper").css({"-webkit-transform": "translate3d("+($("#menu_wrapper").css('width').replace('px','')-(deltaX))+"px,0%, 0)"});
				}
			}
		})
	
	add_spinner('pullDownIcon');
	add_spinner('pullUpIcon');
	init(content_element,content_links);


}




document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

/* * * * * * * *
 *
 * Use this for high compatibility (iDevice + Android)
 *
 */
document.addEventListener('DOMContentLoaded', setTimeout(function () { loaded(); }, 200), false);

})