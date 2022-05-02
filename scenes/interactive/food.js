export class Food extends Phaser.GameObjects.Zone
{
	constructor(scene, x, y, text, direction) {
		super(scene, x, y, 32, 32);

		// Add the GameObject and collider to the scene
		scene.add.existing(this).setOrigin(0, 1);
		scene.physics.world.enable(this, 1);  // 1 is for static body

		// Direction
		this.direction = direction;
		this.text = text;
		// Add the text and rectangle to the scene
		let offsetX, offsetY;
		if (direction === "up") {
			offsetX = 17;
			offsetY = -45;
		} else if (direction === "down") {
			offsetX = 17;
			offsetY = 24;
		} else if (direction === "center") {
			offsetX = 17;
			offsetY = 0;
		}
		
		this.foodText = scene.add.bitmapText(Math.round(x+offsetX), Math.round(y+offsetY), 'pixelop', text, 16, 1)
			.setOrigin(0.5, 1)
			.setDepth(101)
			.setVisible(false);
		this.foodRect = scene.add.rectangle(Math.round(x+offsetX), Math.round(y+offsetY), this.foodText.width+10, this.foodText.height, 0xffffff)
			.setStrokeStyle(1, 0x000000)
			.setOrigin(0.5, 1)
			.setDepth(100)
			.setVisible(false);
			
		// This assumes that the hitbox for the body is the same as the empty tile image (32 x 32), see door.js if not
		scene.physics.add.collider(scene.player, this, () => this.collideFood(scene.player));

		// By click or touch it activates within a given distance (clickRadius)
		this.setInteractive().on('pointerdown', this.clickFood);
		this.clickRadius = 100;
		this.showByClick = false;

		this.activated = false;
		this.pointsCollected = false;
	}

	collideFood(player) {
		if (!this.activated) {
			if (this.direction === 'center') {
				// Center hits from every direction
				this.showFoodText();
			} else if (this.direction === 'up' && player.body.touching.up) {
				this.showFoodText();
			} else if (this.direction === 'down' && player.body.touching.down) {
				this.showFoodText();
			}
		}
	}

	clickFood() {
		if (!this.activated) {
			// getCenter necessary bc signs have setOrigin(0,1)
			let distance = Phaser.Math.Distance.BetweenPoints(this.getCenter(), this.scene.player);
			if (distance < this.clickRadius) {
				if (this.scene.scene.key === 'UniversityScene') this.scene.foods.forEach((other_food) => other_food.hideFoodText());  // So there is no clutter in the classroom
				this.showFoodText();
				this.showByClick = true;
			}
		}
	}

	showFoodText() {
		this.foodRect.setVisible(true);
		this.foodText.setVisible(true);
		this.scene.showingFood = true;  // A property of the scene, see BaseScene's update
		if (!this.pointsCollected) {
			if (sessionStorage.score) {
				sessionStorage.score = Number(sessionStorage.score) + 10;
			}
			this.scene.scoreText.setText(`Score: ${sessionStorage.score}`);
		}
		if (this.text == '!!!!') {
			this.scene.scoreText.setText(`You win!! Are you ready to go to the next level with me?`);
		}
		this.activated = true;
		this.pointsCollected = true;
	}

	playerMovement(moveleft, moveright, moveup, movedown) {
		// A check for activated is done in BaseScene before calling this
		if (this.showByClick) {
			// If the player activated the food via pointerdown, then remove it only when she goes away
			if (Phaser.Math.Distance.BetweenPoints(this.getCenter(), this.scene.player) > this.clickRadius) {
				this.hideFoodText();
			}
		} else {  // Otherwise, the player activated the food via collision
			if (moveleft || moveright) {
				this.hideFoodText();
			} else if (this.direction === 'up' &&  movedown) {
				this.hideFoodText();
			} else if ((this.direction === 'down' || this.direction === 'center') && !movedown) {
				this.hideFoodText();
			}
		}
	}

	hideFoodText() {
		this.foodRect.setVisible(false);
		this.foodText.setVisible(false);
		this.showByClick = false;
		this.scene.showingFood = false;  // A property of the scene, see BaseScene's update
		this.activated = false;
	}

}
