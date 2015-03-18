// Use:
var Quest = require('./lib/quest.js');

var quest = new Quest();

quest.on('connect', function() {
	var username = prompt("Please enter your name", "Harry Potter");

	var viewport = $('#viewport');

	quest.login(username, '1234', {w: viewport.width(), h: viewport.height()}, function(code, worldName, worldPlayer, playerId) {
		console.log(worldName+" say "+code);
	});
});

quest.on('unitJoin', function(unit) {
	console.log('unitJoin!');
	// New Unit at Viewport
	var unitObj = $('<div class="unit"></div>');
	unitObj.attr('id', 'unit_'+unit.id);
	unitObj.css({
		position: 'absolute',
		left: unit.pos.x,
		top: unit.pos.y
	});
	$('#viewport').append(unitObj);
});

quest.on('unitLeft', function() {
	// Unit remove at Viewport
});