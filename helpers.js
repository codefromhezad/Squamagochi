function timestamp() {
	return Math.round(new Date().getTime() / 1000);
}

function milli_timestamp() {
	return new Date().getTime();
}

function timestamp_to_nice_date(UNIX_timestamp){
	/* Took from http://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript */
	/* Modified by Pierrick on Jul 20, 2014 */

	var a = new Date(UNIX_timestamp*1000);
	var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	var year = a.getFullYear();
	var month = months[a.getMonth()];
	var date = a.getDate();
	var hour = a.getHours();
	var min = a.getMinutes();
	var sec = a.getSeconds();
	var time = date + ', ' + month + ' ' + year;
	return time;
}

function object_keys_to_csv(obj) {
	var final_array = new Array();

	for(var k in obj) {
		if( obj[k] ) {
			final_array.push(k)
		}
	}

	return final_array.join(', ');
}

function getRandomArrayItem(items) {
	return items[Math.floor(Math.random()*items.length)];
}