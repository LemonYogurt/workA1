define([
	"text!templates/nav/left-nav.html"
	],function(leftNavTemplate){
		return Backbone.View.extend({
			el:"#left-nav",
			initialize:function(){
				this.leftNavTemplate = _.template(leftNavTemplate);
				this.firstload = true;
			},
			events:{
				"click .icon-target":"targetLeftNav",
				"click .sub-nav-ul a":"clickItem",
				"mouseover .sub-nav-ul .sub-title i":"showMenu",
				"mouseleave .sub-nav-view":"hideMenu"
			},
			render:function(){
				var self = this;
				this.$el.html(this.leftNavTemplate());
				return this;
			},

			clickItem:function(event){
				this.$("a").removeClass("active");
				$(event.target).addClass("active");
			},
			hide:function(){
				this.$el.hide();
				$("#right-body").css({marginLeft:0});
				$("#left-nav").css({width:"20px"});
				return this;
			},
			show:function(type,navClass){
				$(".sub-nav-view").css({left:"-1000px"});
				this.flag = true;
				if(this.$el.css("width") == "20px"){
					this.close();
				}
				console.log('type: ', type, navClass);
				this.$el.show();
				this.$el.find(".sub-nav-ul").hide();
				this.$("a").removeClass("active");
				this.$el.find("ul[data-sub="+type+"]").show();
				this.$el.find("ul[data-sub="+type+"] .left-nav-"+navClass).addClass("active");
				/*if(this.firstload){
					this.firstload = false;
					this.open();
				}*/
				return this;
			},
			open:function(){
				this.$el.find(".icon-target")
					.removeClass("fa-chevron-circle-right")
					.addClass("fa-chevron-circle-left");
				this.$el.animate({width:"140px",paddingTop:"0"});
				this.$el.find(".sub-nav-third").each(function(i,ele){
					var ul = $(ele);
					var height = ul.find("li").length *22+"px";
					ul.animate({height:height});
				});
				$("#right-body").animate({marginLeft:"160px"});
				return this;
			},
			close:function(){
				this.$el.find(".icon-target")
					.removeClass("fa-chevron-circle-left")
					.addClass("fa-chevron-circle-right");
				this.$el.animate({width:"20px",paddingTop:"30px"});
				this.$el.find(".sub-nav-third").animate({height:"0"});
				$("#right-body").animate({marginLeft:"40px"});
				return this;
			},
			targetLeftNav:function(event){
				if($(event.target).hasClass("fa-chevron-circle-left")){
					this.close();
				}else{
					this.open();
				}
			},
			showMenu:function(event){
				if($("#left-nav").width() > 20){
					return false;
				}
				
				var dom = $(event.target);
				var offset = dom.offset();

				$(".sub-nav-view").html(dom.parents("li").html());
				$(".sub-nav-view").css({top:offset.top-document.body.scrollTop+"px",left:offset.left+"px"});
				$(".sub-nav-view>.sub-nav-third").css({height:"auto"});
			},
			hideMenu:function(event){
				if($(event.target).hasClass("sub-nav-view")){
					$(".sub-nav-view").css({left:"-1000px"});
				}
			}
		});
});