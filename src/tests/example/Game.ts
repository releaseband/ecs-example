import { World } from '@releaseband/ecs';
import * as PIXI from 'pixi.js';
import { Howl } from 'howler';
import { SpineParser } from 'pixi-spine';
import { getRandomTexture } from './helpers/Util';
import { EventEmitter } from './EventEmitter';

import { SymbolComponent } from './components/SymbolComponent';
import { ObjectComponent } from './components/ObjectComponent';
import { SpriteComponent } from './components/SpriteComponent';
import { SpineComponent } from './components/SpineComponent';
import { BorderTag } from './components/BorderTag';
import { TweenComponent } from './components/TweenComponent';
import { SoundComponent } from './components/SoundComponent';

import { SpinnerSystem } from './systems/SpinnerSystem';
import { SpriteSystem } from './systems/SpriteSystem';
import { SpineSystem } from './systems/SpineSystem';
import { TweenSystem } from './systems/TweenSystem';
import { SoundSystem } from './systems/SoundSystem';
import { RenderSystem } from './systems/RenderSystem';
import { resolve } from 'path';

const spawnEntity = (world: World, components: unknown[]): number => {
	const entity = world.createEntity();
	for (const component of components) world.addComponent(entity, component);
	return entity;
};

export class Game {
	world: World;
	app: PIXI.Application;
	resources: any | null = null;
	sounds: Map<string, Howl> = new Map();

	constructor() {
		const world = new World(500);

		world.registerComponent(ObjectComponent);
		world.registerComponent(SymbolComponent);
		world.registerComponent(SpriteComponent);
		world.registerComponent(SpineComponent);
		world.registerComponent(TweenComponent);
		world.registerComponent(SoundComponent);
		world.registerComponent(BorderTag);

		const app = new PIXI.Application({
			width: 1024,
			height: 673,
			backgroundColor: 0x4ec0ca,
		});
		const appDiv = document.createElement('div');
		appDiv.className = 'app';
		appDiv.innerHTML = `<div class="ui-container"><div class="button button-spin">
				<svg class="button-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
					<path d="M66.71,287.91H0v160l47.36-43.59A255.71,255.71,0,0,0,255.9,512C386.54,512,494.19,414.15,510,287.91H445.29A192,192,0,0,1,95,360.6l79.08-72.69Zm0,0"/>
					<path d="M255.9,0C125.46,0,17.64,97.63,2,224H66.71a192,192,0,0,1,353.26-68l-68,68H512v-160l-45.78,45.78A255.89,255.89,0,0,0,255.9,0Zm0,0"/>
				</svg></div></div><div class="game-container"></div>`;
		document.body.appendChild(appDiv);

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

	//TODO: resource manager
	async preload(onLoadCallback: CallableFunction) {
		const promises: Promise<void>[] = [];

		promises.push(
			new Promise<void>((resolve, reject) => {
				const sound = new Howl({ src: ['/assets/sounds/coin2.wav'] });
				sound.on('load', () => {
					this.sounds.set('/assets/sounds/coin2.wav', sound);
					console.warn('sound 1 loaded');
					resolve();
				});
				sound.on('loaderror', () => reject());
			})
		);
		promises.push(
			new Promise<void>((resolve, reject) => {
				const sound = new Howl({ src: ['/assets/sounds/MESSAGE-B_Accept.wav'] });
				sound.on('load', () => {
					this.sounds.set('/assets/sounds/MESSAGE-B_Accept.wav', sound);
					console.warn('sound 2 loaded');
					resolve();
				});
				sound.on('loaderror', () => reject());
			})
		);

		promises.push(
			new Promise<void>((resolve, reject) => {
				this.app.loader
					.add('pixie', 'assets/pixie.json')
					.add('symbols', 'assets/symbols.json')
					.add('table', './assets/table.webp')
					.load((loader, resources) => {
						this.resources = resources;
						console.warn('sprites loaded');
						resolve();
					});
			})
		);

		await Promise.all(promises)
			.then((result) => onLoadCallback())
			.catch((err) => console.warn('error'));
	}

	run() {
		const spinnersContainer = new PIXI.Container();
		this.app.stage.addChild(spinnersContainer);

		this.world.addSystem(new TweenSystem(this.world));
		this.world.addSystem(new SpineSystem(this.world));
		this.world.addSystem(new SpriteSystem(this.world));
		this.world.addSystem(new SpinnerSystem(this.world, spinnersContainer));
		this.world.addSystem(new SoundSystem(this.world));
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

	getSound(path: string): Howl {
		if (!this.sounds.has(path)) throw new Error('Sound not found');
		return <Howl>this.sounds.get(path);
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

			EventEmitter.getInstance().on('spin-start', () => {
				spawnEntity(this.world, [new SoundComponent(this.getSound('/assets/sounds/coin2.wav'))]);
			});
			EventEmitter.getInstance().on('spin-stop', () => {
				spawnEntity(this.world, [
					new SoundComponent(this.getSound('/assets/sounds/MESSAGE-B_Accept.wav')),
				]);
			});
		}
	}
}
