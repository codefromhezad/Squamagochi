function timestamp() {
	return Math.round(new Date().getTime() / 1000);
}

function milli_timestamp() {
	return new Date().getTime();
}

function getRandomArrayItem(items) {
	return items[Math.floor(Math.random()*items.length)];
}