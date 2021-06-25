import { World } from '@releaseband/ecs';
import * as PIXI from 'pixi.js';
import { SpineParser } from 'pixi-spine';
import { getRandomTexture } from './helpers/Util';
import { EventEmitter } from './EventEmitter';

import { SymbolComponent } from './components/SymbolComponent';
import { ObjectComponent } from './components/ObjectComponent';
import { SpriteComponent } from './components/SpriteComponent';
import { SpineComponent } from './components/SpineComponent';
import { BorderTag } from './components/BorderTag';
import { TweenComponent } from './components/TweenComponent';

import { SpinnerSystem } from './systems/SpinnerSystem';
import { SpriteSystem } from './systems/SpriteSystem';
import { SpineSystem } from './systems/SpineSystem';
import { TweenSystem } from './systems/TweenSystem';
import { RenderSystem } from './systems/RenderSystem';

const spawnEntity = (world: World, components: unknown[]): number => {
	const entity = world.createEntity();
	for (const component of components) world.addComponent(entity, component);
	return entity;
};

export class Game {
	world: World;
	app: PIXI.Application;
	resources: any | null = null;

	constructor() {
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
			EventEmitter.getInstance().emit('spin', 15);
		};
		SpineParser.registerLoaderPlugin();

		this.app = app;
		this.world = world;
	}

	preload(onLoadCallback: CallableFunction) {
		this.app.loader
			.add('pixie', 'assets/pixie.json')
			.add('symbols', 'assets/symbols.json')
			.add('table', './assets/table.webp')
			.load((loader, resources) => {
				this.resources = resources;
				onLoadCallback();
			});
	}

	run() {
		const spinnersContainer = new PIXI.Container();
		this.app.stage.addChild(spinnersContainer);

		this.world.addSystem(new TweenSystem(this.world));
		this.world.addSystem(new SpineSystem(this.world));
		this.world.addSystem(new SpriteSystem(this.world));
		this.world.addSystem(new SpinnerSystem(this.world, spinnersContainer));
		this.world.addSystem(new RenderSystem(this.world));

		let lastTimestamp = 16;
		const run = (timestamp = 0) => {
			const dt = timestamp - lastTimestamp;
			lastTimestamp = timestamp;
			this.world.update(dt);
			this.app.renderer.render(this.app.stage);
			requestAnimationFrame(run);
		};
		run();
	}

	populate() {
		if (this.resources) {
			const backgroundContainer = new PIXI.Container();
			const background = PIXI.Sprite.from(this.resources.table.data);
			background.scale.set(0.6);
			background.x = 25;
			backgroundContainer.addChild(background);
			this.app.stage.addChild(backgroundContainer);

			for (let i = 0; i < 5 * 5; i++) {
				const symbol = spawnEntity(this.world, [
					new ObjectComponent({ width: 128, height: 128 }),
					new SymbolComponent(),
				]);
				if (i % 2) {
					spawnEntity(this.world, [
						new ObjectComponent({ width: 128, height: 128, parent: symbol }),
						new SpriteComponent(getRandomTexture(this.resources.symbols.textures)),
					]);
				} else {
					spawnEntity(this.world, [
						new ObjectComponent({ width: 128, height: 128, scale: 0.1, parent: symbol }),
						new SpineComponent(this.resources.pixie.spineData, i % 4 ? 'running' : 'jump'),
					]);
				}
			}
		}
	}
}
