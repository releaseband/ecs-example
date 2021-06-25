import { World, Query, System } from 'ecs';
import { ObjectComponent } from '../components/ObjectComponent';

export class RenderSystem implements System {
	query: Query;
	world: World;

	constructor(world: World) {
		this.world = world;
		this.query = world.createQuery([ObjectComponent]);

		this.query.onAddSubscribe((entity: number) => {
			const child = world.getComponent(entity, ObjectComponent);
			//console.log('object added', entity);
			if (child.parent) {
				const parent = world.getComponent(child.parent, ObjectComponent);
				if (parent) {
					parent.container.addChild(child.container);
					parent.children.add(entity);
				}
			}
		});

		this.query.onRemoveSubscribe((entity: number) => {
			const objectComponent = world.getComponent(entity, ObjectComponent);
			for (const child of objectComponent.children) {
				world.removeEntity(child);
				objectComponent.children.delete(child);
			}
			if (objectComponent.parent) {
				const parent = world.getComponent(objectComponent.parent, ObjectComponent);
				parent?.children.delete(entity);
			}
		});
	}

	public update(dt: number) {
		for (const entity of this.query.entities) {
			const component = this.world.getComponent(entity, ObjectComponent);
			const container = component.container;
			container.x = component.x;
			container.y = component.y;
			container.width = component.width;
			container.height = component.height;
			container.scale.set(component.scale);
			container.angle = component.angle;
		}
	}
}
