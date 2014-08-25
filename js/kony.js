var scripts = ['lib/jquery-migrate-1.0.0','lib/jquery.tmpl.min','lib/jquery-ui-1.8.16.custom.min','lib/jquery.switchbutton.min','lib/jquery.loader','lib/custom-jquery','lib/kony-sdk','lib/bootstrap.min', "config"];

$.each(scripts, function(i, view) {
	$("head").append('<script type="text/javascript" src="js/'+scripts[i]+'.js"><\/script>');
});
