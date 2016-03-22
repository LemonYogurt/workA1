define([
	"text!templates/ssp/settings/index.html"
	],function(indexTemplate){
	return Backbone.View.extend({
		el:"#right-body",
		initialize:function(){
			this.indexTemplate = _.template(indexTemplate);
		},
		events:{	
			
		},
		render:function(){
			app.leftNav.show("sspSettings").open();
			this.$el.html(this.indexTemplate());
			//this.$("#zonesTable").bootstrapTable(this.getTableOptions([]));
		},
		getTableOptions:function (data){
			var self = this;
			var tableOptions = {
		    	columns: [
		    		{
		    			field: 'name',
		                sortable: true,
		                class:"ellipsis120"
		    		},
		    		{
		    			field: 'website',
		                sortable: true,
		                formatter:function(value){return "￥"+app.Util.formatData(value || 0,2)}
		    		},{
		    			field:"size",
		    			sortable:true,
		    			formatter:function(value){return moment(value).format("YYYY-MM-DD");}
		    		},{
		    			field:"type",
		    			sortable:true,
		    			formatter:function(value){return moment(value).format("YYYY-MM-DD");}
		    		},{
		    			field:"pv",
	                    sortable: true,
		    			sorter:app.Util.sorter
		    		},{
		    			field:"options",
		    			formatter:function(value,row){
		    				var a = "<a class='editCampaign' title='修改' href='javascript:;' data-id="+row._id+">修改</a>";
		    				return a;
		    			}
		    		}
		    	],
		    	data:data,
		    	onClickRow: function (row) {
		    		self.renderForm(row);//修改
		        }
			};
			return tableOptions;
		}
	});
});