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

quest.on('unitUpdate', function(unit) {
	// Unit Update
	$('#unit_'+unit.id).css({
		left: unit.pos.x,
		top: unit.pos.y
	});
	console.log(unit.id);
});

// Gameloop -> Call Quest API -> Call Server
var frameCount = 0;
function gameloop() {
	frameCount++;
	var myUnit = $('#unit_'+quest.playerId);
	// Send 3 times the second at Server
	if (frameCount % 10 == 0 && myUnit) {
		quest.movement({x: $(myUnit).css('left').replace("px", ""), y: $(myUnit).css('top').replace("px", "")}, 0, 0);
	}
}
setInterval(gameloop, 1000/30);

// User Movement
// Only for Debug

$("body").keypress(function(event) {
	// Break if no own Unit
	if (!quest.playerId)
		return;

	if (event.keyCode == 119) {
		// Up
		$('#unit_'+quest.playerId).css({top: "-=2"});
	} else if (event.keyCode == 115) {
		// Down
		$('#unit_'+quest.playerId).css({top: "+=2"});
	}

	if (event.keyCode == 97) {
		// Left
		$('#unit_'+quest.playerId).css({left: "-=2"});
	} else if (event.keyCode == 100) {
		// Right
		$('#unit_'+quest.playerId).css({left: "+=2"});
	}
	// keycodes:
	// 119 = w
	// 115 = s
	// 97 = a
	// 100 = d
});