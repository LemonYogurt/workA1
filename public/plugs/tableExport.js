/**
 * js导出csv
 */
(function($){
	$.fn.extend({
		tableExport:function(options){
			var defaults = {
				fileName:'export',
			};
			var options = $.extend(defaults, options);
			var el = this; 

			// Header
			var tdData ="";
			$(el).find('thead').find('tr').each(function() {
				tdData += "\n";					
				$(this).filter(':visible').find('th').each(function(index,data) {
					if ($(this).css('display') != 'none'){
						tdData+= '"'+$(this).text()+'",'
					}
					
				});
				tdData = $.trim(tdData);
				tdData = $.trim(tdData).substring(0, tdData.length -1);
			});
			$(el).find('tbody').find('tr').each(function() {
				tdData += "\n";
				$(this).filter(':visible').find('td').each(function(index,data) {
					if ($(this).css('display') != 'none'){
						tdData+= '"'+$(this).text()+'",'
					}
				});
				tdData = $.trim(tdData).substring(0, tdData.length -1);
			});

			var blob = new Blob(["\ufeff"+tdData], { type: 'text/csv,charset=UTF-8'});
	        var csvUrl = URL.createObjectURL(blob);  
	        var downloadLink = document.createElement("a");
	        downloadLink.href = csvUrl;   
	        downloadLink.download = options.fileName+".csv";   
	        downloadLink.click(); 
		}
	});
})(jQuery);