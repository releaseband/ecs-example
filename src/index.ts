import { World } from 'ecs';
import * as PIXI from 'pixi.js';
import { getRandomValue } from './helpers/Util';
import { SpineParser } from 'pixi-spine';

import { Game } from './Game';

import { SpinnerSystem } from './systems/SpinnerSystem';
import { SpriteSystem } from './systems/SpriteSystem';
import { SpineSystem } from './systems/SpineSystem';
import { TweenSystem } from './systems/TweenSystem';
import { RenderSystem } from './systems/RenderSystem';

import { SymbolComponent } from './components/SymbolComponent';
import { ObjectComponent } from './components/ObjectComponent';
import { SpriteComponent } from './components/SpriteComponent';
import { SpineComponent } from './components/SpineComponent';
import { BorderTag } from './components/BorderTag';
import { TweenComponent } from './components/TweenComponent';

const world = new World(500);

world.registerComponent(ObjectComponent);
world.registerComponent(SymbolComponent);
world.registerComponent(SpriteComponent);
world.registerComponent(SpineComponent);
world.registerComponent(TweenComponent);
world.registerComponent(BorderTag);

const app = new PIXI.Application({
	width: 1024,
	height: 673,
	backgroundColor: 0x4ec0ca,
});

const gameContainer = document.querySelector('.game-container') as HTMLElement;
gameContainer.appendChild(app.renderer.view);
const spinButton = document.querySelector('.button-spin') as HTMLElement;
spinButton.onpointerdown = () => (spinButton.style.opacity = '1');

spinButton.onpointerup = () => {
	spinButton.style.opacity = '0.5';
	Game.events.emit('spin', 15);
};

SpineParser.registerLoaderPlugin();

app.loader
	.add('pixie', 'assets/pixie.json')
	.add('symbols', 'assets/symbols.json')
	.load((loader, resources) => {
		Game.app = app;
		Game.resources = resources;

		app.stage.addChild(Game.backgroundContainer);
		app.stage.addChild(Game.spinnersContainer);
		app.stage.addChild(Game.uiContainer);

		const background = PIXI.Sprite.from('./assets/table.webp');
		background.scale.set(0.6);
		background.x = 25;
		Game.backgroundContainer.addChild(background);

		const symbols = Object.keys(resources.symbols.textures);
		const getRandomTexture = (): PIXI.Texture => {
			const index = Math.floor(getRandomValue(0, symbols.length));
			const texture = resources.symbols.textures[symbols[index]];
			return texture;
		};

		for (let i = 0; i < 5 * 5; i++) {
			const symbol = world.createEntity();
			world.addComponent(symbol, new ObjectComponent({ width: 128, height: 128 }));
			world.addComponent(symbol, new SymbolComponent());
			if (i % 2) {
				const sprite = world.createEntity();
				world.addComponent(
					sprite,
					new ObjectComponent({ width: 128, height: 128, parent: symbol })
				);
				world.addComponent(sprite, new SpriteComponent(getRandomTexture()));
			} else {
				const animation = i % 4 ? 'running' : 'jump';
				const spine = world.createEntity();
				world.addComponent(
					spine,
					new ObjectComponent({ width: 128, height: 128, scale: 0.1, parent: symbol })
				);
				world.addComponent(spine, new SpineComponent(resources.pixie.spineData, animation));
			}
		}

		const query = world.createQuery([ObjectComponent, SymbolComponent]);
		const borders = world.createQuery([BorderTag]);

		Game.events.on('spinner_stop', () => {
			for (const entity of query.entities) {
				if (world.getComponent(entity, ObjectComponent).y === 256) {
					const border = world.createEntity();
					world.addComponent(
						border,
						new ObjectComponent({ width: 128, height: 128, parent: entity })
					);
					world.addComponent(border, new SpriteComponent(PIXI.Texture.from('./assets/ramka.webp')));
					world.addComponent(border, new BorderTag());
				}
			}
			for (const entity of query.entities) {
				const tween = new TweenComponent([{ x: 310, y: 250, duration: 3, yoyo: true, repeat: 1 }]);
				world.addComponent(entity, tween);
			}
		});

		Game.events.on('spinner_run', () => {
			for (const entity of borders.entities) {
				world.removeEntity(entity);
			}
		});

		world.addSystem(new TweenSystem(world));
		world.addSystem(new SpineSystem(world));
		world.addSystem(new SpriteSystem(world));
		world.addSystem(new SpinnerSystem(world, Game.spinnersContainer));
		world.addSystem(new RenderSystem(world));

		let lastTimestamp = 16;
		const run = (timestamp = 0) => {
			const dt = timestamp - lastTimestamp;
			lastTimestamp = timestamp;
			world.update(dt);
			app.renderer.render(app.stage);
			requestAnimationFrame(run);
		};
		run();
	});
