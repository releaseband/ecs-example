import { World, Query, System } from 'ecs';
import * as PIXI from 'pixi.js';
import { EventEmitter } from '../EventEmitter';
import { createMaskedContainer } from '../helpers/PixiHelper';

import { ObjectComponent } from '../components/ObjectComponent';
import { SymbolComponent } from '../components/SymbolComponent';
import { SpriteComponent } from '../components/SpriteComponent';
import { TweenComponent } from '../components/TweenComponent';
import { BorderTag } from '../components/BorderTag';

import { lerp, easeInOutBack } from '../helpers/Util';

type Spinner = {
	components: ObjectComponent[];
	delay: number;
	time: number;
	target: number;
	position: number;
};

const SPIN_TIME_MAX = 500;
const SPIN_DELAY = 20;
const COUNT = 5;
const PADDING = 20;
const SPINNER_WIDTH = 134;
const SYMBOL_HEIGHT = 128;

export class SpinnerSystem implements System {
	world: World;
	symbols: Query;
	borders: Query;
	tweens: Query;
	container: PIXI.Container;
	spinners: Spinner[] = [];

	isSpinning = false;

	constructor(world: World, parentContainer: PIXI.Container) {
		this.world = world;
		const width = (PADDING + SPINNER_WIDTH) * COUNT;
		this.container = createMaskedContainer(130, 110 - 128, width, 360, 128);
		parentContainer.addChild(this.container);

		for (let i = 0; i < COUNT; i++) {
			this.spinners.push({
				delay: 20,
				time: 0,
				target: 0,
				position: 0,
				components: [],
			});
		}

		const onAddCallback = (entity: number) => {
			const objectComponent = world.getComponent(entity, ObjectComponent);
			for (const [i, spinner] of this.spinners.entries()) {
				const childrenCount = spinner.components.length;
				if (childrenCount < 5) {
					objectComponent.y = childrenCount * objectComponent.height;
					objectComponent.x = i * (SPINNER_WIDTH + PADDING);
					this.container.addChild(objectComponent.container);
					spinner.components.push(objectComponent);
					return;
				}
			}
		};

		this.borders = world.createQuery([BorderTag]);
		this.symbols = world.createQuery([ObjectComponent, SymbolComponent]);
		this.tweens = world.createQuery([TweenComponent]);
		this.symbols.onAddSubscribe(onAddCallback);

		EventEmitter.getInstance().on('spin', (symbols: number) => {
			if (!this.isSpinning && !this.tweens.entities.size) {
				this.removeBorders();
				this.isSpinning = true;
				for (const [i, spinner] of this.spinners.entries()) {
					if (spinner.components.length) {
						spinner.delay = i * SPIN_DELAY;
						spinner.time = 0;
						spinner.target = symbols * SYMBOL_HEIGHT;
						spinner.position = spinner.components[0].y;
					}
				}
			}
		});
	}

	private removeBorders() {
		for (const entity of this.borders.entities) {
			this.world.removeEntity(entity);
		}
	}

	private setBorders() {
		for (const entity of this.symbols.entities) {
			if (this.world.getComponent(entity, ObjectComponent).y === 256) {
				const border = this.world.createEntity();
				this.world.addComponent(
					border,
					new ObjectComponent({ width: 128, height: 128, parent: entity })
				);
				this.world.addComponent(
					border,
					new SpriteComponent(PIXI.Texture.from('./assets/ramka.webp'))
				);
				this.world.addComponent(border, new BorderTag());
			}
		}
		for (const entity of this.symbols.entities) {
			const tween = new TweenComponent([{ x: 310, y: 250, duration: 3, yoyo: true, repeat: 1 }]);
			this.world.addComponent(entity, tween);
		}
	}

	public update(dt: number) {
		if (this.isSpinning) {
			this.isSpinning = false;
			for (const spinner of this.spinners) {
				if (spinner.delay <= 0 && spinner.time < SPIN_TIME_MAX) {
					this.isSpinning = true;
					const ease = easeInOutBack(spinner.time / SPIN_TIME_MAX);
					const t = lerp(0, spinner.target, ease);
					const count = spinner.components.length;
					for (const [i, component] of spinner.components.entries()) {
						const y = (spinner.position + i * SYMBOL_HEIGHT + t) % (count * SYMBOL_HEIGHT);
						component.y = Math.floor(y);
					}
					spinner.time += dt * 0.2;
				}
				spinner.delay -= dt;
			}
			if (!this.isSpinning) this.setBorders();
		}
	}
}
