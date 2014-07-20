Item = function(slug, name, effect_target, effect_value) {
	this.slug = slug;
	this.name = name;
	this.effect_target = effect_target;
	this.effect_value = effect_value;
}

var ItemsRepository = {
	water: new Item('water', 'Bottle of water', 'thirst', -4),
	potato: new Item('potato', 'Potato', 'hunger', -2),
}