import { World, Query, System } from 'ecs';
import { ObjectComponent } from '../components/ObjectComponent';
import { SpineComponent } from '../components/SpineComponent';

export class SpineSystem implements System {
	query: Query;
	world: World;
	onAddCallback: CallableFunction;
	onRemoveCallback: CallableFunction;

	constructor(world: World) {
		this.world = world;

		this.onAddCallback = (entity: number) => {
			//console.log('spine added');
			const spineComponent = world.getComponent(entity, SpineComponent);
			const objectComponent = world.getComponent(entity, ObjectComponent);
			objectComponent.container.addChild(spineComponent.spine);
			spineComponent.spine.state.setAnimation(0, spineComponent.animation, true);
		};
		this.onRemoveCallback = (entity: number) => {
			const spineComponent = world.getComponent(entity, SpineComponent);
			const objectComponent = world.getComponent(entity, ObjectComponent);
			objectComponent.container.removeChild(spineComponent.spine);
		};

		this.query = world.createQuery([ObjectComponent, SpineComponent]);
		this.query.onAddSubscribe(this.onAddCallback);
		this.query.onRemoveSubscribe(this.onRemoveCallback);
	}
	exit() {
		this.query.onAddUnsubscribe(this.onAddCallback);
		this.query.onRemoveUnsubscribe(this.onRemoveCallback);
	}
}
