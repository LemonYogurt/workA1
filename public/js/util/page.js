define(['./util'],function(Util){
	function Page(option){
		var option = option || {};
		this.pageSize = 20;
        this.collection = option.collection || null;
        this.url = option.countUrl || "";
        this.limit = option.limit || this.pageSize;
        this.pageNo = 1;
        this.recordCount = 0;
        this.findOption = {
            skip: 0,
            limit: this.limit,
            q: ""
        }
	}

	Page.prototype.setFilter=function(q){
		this.findOption.q = q;
	}

	Page.prototype.setUrl = function(url){
		this.url = url;
	}

	Page.prototype.setCollection = function(coll){
		this.collection = coll;
	}

	Page.prototype.getPageData = function(pageNum, callback){
		var self = this;
		var pageNo = pageNum || this.pageNo;
        this.findOption.skip = (pageNo - 1) * this.findOption.limit;
        this.collection.fetch({
            data:this.findOption
            ,success:function(c,r,o){
                Util.get(self.url,{q:self.findOption.q},function(err,result){
                    var count = result && result.count || 0;
                    return callback(null,{
                        count:count,
                        datas:r
                    });
                });
            },
            error:function(c,r,o){

            }
        });
	},
	Page.prototype.setPage = function(pageNo, limit, recordCount, ele, callback) {
        var limit = limit || this.pageSize;
        var totalPages = Math.ceil(recordCount / limit);
        if (totalPages < 2) {
            $(ele).hide();
            return false;
        }else{
            $(ele).show();
        }
        var pageOptions = {
            bootstrapMajorVersion: 3,
            currentPage: pageNo,
            totalPages: totalPages,
            itemTexts: function(type, page, current) {
                switch (type) {
                    case "first":
                        return "首页";
                    case "prev":
                        return "上一页";
                    case "next":
                        return "下一页";
                    case "last":
                        return "尾页";
                    case "page":
                        return page;
                }
            },
            tooltipTitles: function(type, page, current) {
                switch (type) {
                    case "first":
                        return "";
                    case "prev":
                        return "";
                    case "next":
                        return "";
                    case "last":
                        return "";
                    case "page":
                        return "";
                }
            },
            pageUrl: function(type, page, current) {
                return "javascript:;";
            },
            onPageClicked: function(e, originalEvent, type, page) {
                $('body').animate({
                    scrollTop: 0
                }, 300);
                callback(page);
            }
        }

        $(ele).bootstrapPaginator(pageOptions);
    }
    return Page;
});
