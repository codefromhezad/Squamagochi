SpritesRepository = {
	face: 'face.png',
	eye: 'eye-opened.png',
	eye_closed: 'eye-closed.png',
	eye_dead: 'eye-dead.png',
	mouth: 'mouth-neutral.png',
	mouth_happy: 'mouth-happy.png',
	mouth_sad: 'mouth-sad.png'
};

var STATE = {
	IDLE: 'idle',
	RECOVERING: 'recovering',
	STARVING: 'starving',
	DEHYDRATED: 'dehydrated',
	AGONIZING: 'agonizing',
	DEAD: 'dead',
}

Squamagochi = function(name) {
	this.name = name;
	this.birthdate = timestamp();
	this.state = STATE.IDLE;
	this.position = {x: 300, y: 250};
	this.size = 64;
	
	this.sprites = {
		face: SpritesRepository.face,
		left_eye: SpritesRepository.eye,
		right_eye: SpritesRepository.eye,
		mouth: SpritesRepository.mouth
	};

	this.condition = {
		HP: 10,
		hunger: 0,
		thirst: 0,
	}

	this.hunger_timer = 0;
	this.thirst_timer = 0;

	this.thought_timer = 0;
	this.is_thinking = false;

	this.hp_progressbar = progressJs(".progress-hp");
	this.thirst_progressbar = progressJs(".progress-thirst");
	this.hunger_progressbar = progressJs(".progress-hunger");

	this.hp_progressbar.setOption('theme', 'hp').start().set(100);
	this.thirst_progressbar.setOption('theme', 'thirst').start().set(100);
	this.hunger_progressbar.setOption('theme', 'hunger').start().set(100);

	this.use_item = function(item) {
		if( item.effect_target && item.effect_value ) {
			this.condition[item.effect_target] = this.condition[item.effect_target] + item.effect_value;

			if( this.condition[item.effect_target] < 0 ) {
				this.condition[item.effect_target] = 0;
			}

			if( this.condition[item.effect_target] > CONDITION_MAX_VALUE ) {
				this.condition[item.effect_target] = CONDITION_MAX_VALUE;
			}

			if( ThoughtsRepository['item_' + item.slug] && Math.random() < THOUGHTS_DENSITY ) {
				this.think('item_' + item.slug);
			}
		}
	}

	this.think = function(thought_slug) {
		
		var thought = getRandomArrayItem(ThoughtsRepository[thought_slug]);

		if( this.is_thinking || ! thought ) {
			return;
		}

		this.is_thinking = true;

		var $bubble = $('.player-current-thought');
		
		$bubble.stop().css({opacity: 0}).find('p').html(thought);
		
		if( Math.random() < 0.5 ) {
			$bubble.removeClass('right').addClass('left');
		} else {
			$bubble.removeClass('left').addClass('right');
		}

		if( $bubble.hasClass('right') ) {
			var l = this.position.x + 10;
		} else {
			var l = this.position.x - $bubble.width() - 30
		}
		$bubble.css({
			top: this.position.y - $bubble.height() - this.size - 20,
			left: l
		});

		$bubble.stop().animate({opacity: 1}, 'fast');

		$('.thoughts').prepend('<li>' + thought + '</li>');
	}

	this.update_sprites = function() {
		$('.player').css({
			top: this.position.y - this.size * 0.5,
			left: this.position.x - this.size * 0.5,
			width: this.size,
			height: this.size,
			'background-image': "url(sprites/"+this.sprites.face+")"
		});

		$('.player .eye.left').css({ 'background-image': "url(sprites/"+this.sprites.left_eye+")" });
		$('.player .eye.right').css({ 'background-image': "url(sprites/"+this.sprites.right_eye+")" });
		
		$('.player .mouth').css({ 'background-image': "url(sprites/"+this.sprites.mouth+")" });
	}

	this.render = function() {
		var squamagotchi = this;

		/* State induced sprites update */
		switch( this.state ) {
			case STATE.AGONIZING:
			case STATE.STARVING:
			case STATE.DEHYDRATED:
				this.sprites.mouth = SpritesRepository.mouth_sad;
				break;
			case STATE.RECOVERING:
				this.sprites.mouth = SpritesRepository.mouth_happy;
				break;
			case STATE.DEAD:
				this.sprites.left_eye = SpritesRepository.eye_dead;
				this.sprites.right_eye = SpritesRepository.eye_dead;

				this.sprites.mouth = SpritesRepository.mouth_sad;
				break;
			default:
				this.sprites.mouth = SpritesRepository.mouth;
				break;
		}

		/* Blinking eyes */
		if( Math.random() < BLINKING_DENSITY ) {
			this.sprites.left_eye = SpritesRepository.eye_closed;
			this.sprites.right_eye = SpritesRepository.eye_closed;

			var sq = this;
			setTimeout( function() {
				sq.sprites.left_eye = SpritesRepository.eye;
				sq.sprites.right_eye = SpritesRepository.eye;

				sq.update_sprites();
			}, 200 );
		}

		/* Progress bars update */
		this.hp_progressbar.set(this.condition.HP * CONDITION_TO_PERCENT);
		this.thirst_progressbar.set(100 - this.condition.thirst * CONDITION_TO_PERCENT);
		this.hunger_progressbar.set(100 - this.condition.hunger * CONDITION_TO_PERCENT);

		/* Player sprite */
		this.update_sprites();

		/* Player id card panel */
		$('.main-panel [data-var]').each( function() {
			var $this = $(this);
			var v = $this.attr('data-var');

			v = squamagotchi[v];

			if( $this.attr('data-filter') ) {
				v = window[$this.attr('data-filter')]( v );
			}

			$this.text(v);
		});

		/* Document Title Update */
		document.title = '['+this.state+'] ' + this.name;
	}

	this.update = function() {
		var squamagotchi = this;

		/* Conditions update */
		this.state = "idle";

		/* Hunger */
		this.hunger_timer += 1;
		if( this.hunger_timer >= HUNGER_TIMING ) {
			this.condition.hunger += 1;
			this.hunger_timer = 0;
		}

		/* Thirst */
		this.thirst_timer += 1;
		if( this.thirst_timer >= THIRST_TIMING ) {
			this.condition.thirst += 1;
			this.thirst_timer = 0;
		}

		/* Thoughts timer */
		if( this.is_thinking ) {
			this.thought_timer += 1;

			if( this.thought_timer >= DELAY_BETWEEN_THOUGHTS ) {
				this.thought_timer = 0;
				this.is_thinking = false;

				$('.player-current-thought').stop().animate({opacity: 0}, 'fast');
			}
		}

		/* Hunger impact on HP */
		if( this.condition.hunger >= CONDITION_MAX_VALUE ) {
			this.condition.hunger = CONDITION_MAX_VALUE;
			this.state = STATE.STARVING;
			this.condition.HP -= HP_LOST_WHEN_STARVING;
		}

		/* Thirst impact on HP */
		if( this.condition.thirst >= CONDITION_MAX_VALUE ) {
			this.condition.thirst = CONDITION_MAX_VALUE;
			this.state = STATE.DEHYDRATED;
			this.condition.HP -= HP_LOST_WHEN_STARVING;
		}

		/* HP regeneration if condition is OK */
		if( this.condition.thirst <= MAX_FOOD_COND_FOR_HP_REGENERATION && this.condition.hunger <= MAX_FOOD_COND_FOR_HP_REGENERATION ) {
			this.condition.HP += HP_LOST_WHEN_STARVING;
			this.state = STATE.RECOVERING;
		}

		/* Agonizing if really few HP left */
		if( this.condition.HP < MIN_HP_BEFORE_AGONIZING ) {
			this.state = STATE.AGONIZING;
		}

		/* Death if no HP left */
		if( this.condition.HP <= 0 ) {
			this.condition.HP = 0;
			this.state = STATE.DEAD;
			
			this.is_thinking = false;
			$('.player-current-thought').stop().animate({opacity: 0}, 'fast');
		}

		/* Limit HP value to its max value */
		if( this.condition.HP > CONDITION_MAX_VALUE ) {
			this.condition.HP = CONDITION_MAX_VALUE;
		}

		/* State induced thoughts */
		if( this.state == STATE.IDLE || this.state == STATE.RECOVERING ) {
			if( Math.random() < IDLE_THOUGHTS_DENSITY ) {
				this.think(this.state);
			}
		} else {
			if( Math.random() < THOUGHTS_DENSITY ) {
				this.think(this.state);
			}
		}
	}
}