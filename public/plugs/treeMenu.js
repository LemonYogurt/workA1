/**
 * bootstrap树形菜单
 */
(function($){
	$.fn.extend({
		treeMenu:function(options){
			var maxWidth = [230,200,150];
			var el = this;
			var _elId = el.attr("id");
			if(!_elId){
				_elId = "treeMenu_"+(Math.random()+"").slice(2);
				el.attr("id",_elId);
			}
			var sumLayer = options.sumLayer || 3;
			var icon_open_class = options.icon_open_class || "glyphicon glyphicon-minus";//"glyphicon glyphicon-folder-open";
			var icon_close_class = options.icon_close_class || "glyphicon glyphicon-plus";//  "glyphicon glyphicon-folder-close";
			var icon_final_class = options.icon_final_class || "glyphicon glyphicon-chevron-right";//  "glyphicon glyphicon-file";
			var iconClick = options.iconClick || function(){};
			var titleClick = options.titleClick || function(){};
			var noDataEvent = options.noDataEvent;
			var noDataText = options.noDataText || '<div style="padding-top:10px;">没有数据</div>';
			var hasFinal = false;
			
			function setData(pid,datas){
				var parentUl = pid?el.find("ul[data-id='"+pid+"']"):el;
				var pUl = parentUl
				for(var k = 0;k<sumLayer;k++){
					if(pUl.attr("id") == _elId){
						break;
					}else{
						pUl = pUl.parents("ul");
					}
				}
				if(k == sumLayer-1){
					hasFinal = true;
				}else{
					hasFinal = false;
				}

				parentUl.html("");
				if(!datas.length){
					var astr = noDataText;
					if(noDataEvent){
						astr = '<a href="javascript:;">'+astr+'</a>';
					}
					parentUl.html(astr);
					parentUl.find("a").click(function(){
						noDataEvent();
					});
					return false;
				}
				for(var i = 0;i <datas.length;i++){
					parentUl.append(getLi(datas[i],k));
				}

				parentUl.find("li>span>a").click(function(event){
					event.stopPropagation();
					var id = $(this).parents("li").attr("data-id");
					//var level = $(this).parents("li").attr("data-level");
					titleClick(id,k+1);
				});

				
				parentUl.find("li>span").click(function(){
					var parent_span = $(this);
					var icon = $(this).find("i");
					var ul = parent_span.next();
					var id = ul.attr("data-id");
					var result = {id:id};
					if(icon.hasClass(icon_open_class)){
						icon.removeClass(icon_open_class);
						icon.addClass(icon_close_class);
						result.open = false;
					}else{
						icon.removeClass(icon_close_class);
						icon.addClass(icon_open_class);
						result.open = true;
					}
					ul.slideToggle(200);
					if(hasFinal){
						titleClick(id,k+1);
					}else{
						iconClick(result);
					}
				});
			}

			function getLi(data,k){
				var iconClass = hasFinal?icon_final_class:icon_close_class;
				var li = $("<li data-level = '"+(k+1)+"'data-id='"+data._id+"'>");
				var span = $('<span class="parent_span"><i class="'+iconClass+'  pull-left"></i><a class="ellipsis100 pull-left" style="max-width:'+maxWidth[k]+'px" href="javascript:;">'+data.name+'</a><div class="clearfix"></div></span>');
				var childUl = $('<ul style="display: none;" data-id = "'+data._id+'">');
				li.append(span).append(childUl);
				return li
			}

			return {
				setData:setData
			}
		}
	});
})(jQuery);