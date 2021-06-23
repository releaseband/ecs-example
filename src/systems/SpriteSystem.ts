import { World, Query, System } from 'ecs';
import { ObjectComponent } from '../components/ObjectComponent';
import { SpriteComponent } from '../components/SpriteComponent';

export class SpriteSystem implements System {
	sprites: Query;

	onAddCallback: CallableFunction;
	onRemoveCallback: CallableFunction;

	constructor(world: World) {
		this.onAddCallback = (entity: number) => {
			console.log('sprite added');
			const spriteComponent = world.getComponent(entity, SpriteComponent);
			const objectComponent = world.getComponent(entity, ObjectComponent);
			objectComponent.container.addChild(spriteComponent.sprite);
		};

		this.onRemoveCallback = (entity: number) => {
			console.log('sprite removed');
			const spriteComponent = world.getComponent(entity, SpriteComponent);
			const objectComponent = world.getComponent(entity, ObjectComponent);
			objectComponent.container.removeChild(spriteComponent.sprite);
		};

		this.sprites = world.createQuery([ObjectComponent, SpriteComponent]);
		this.sprites.onAddSubscribe(this.onAddCallback);
		this.sprites.onRemoveSubscribe(this.onRemoveCallback);
	}

	exit() {
		this.sprites.onAddUnsubscribe(this.onAddCallback);
		this.sprites.onRemoveUnsubscribe(this.onRemoveCallback);
	}
}
