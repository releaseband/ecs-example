import { World } from 'ecs';

export default (count: number) => {
	const world = new World(count);

	class TestComponentA {}
	class TestComponentB {}

	world.registerComponent(TestComponentA);
	world.registerComponent(TestComponentB);

	const queryA = world.createQuery([TestComponentA]);
	const queryB = world.createQuery([TestComponentB]);

	for (let i = 0; i < count; i++) {
		const entity = world.createEntity();
		world.addComponent(entity, new TestComponentA());
	}

	return () => {
		for (const entity of queryA.entities) {
			const entity0 = world.createEntity();
			world.addComponent(entity0, new TestComponentB());
			const entity1 = world.createEntity();
			world.addComponent(entity1, new TestComponentB());
		}

		for (const entity of queryB.entities) {
			world.removeEntity(entity);
		}
	};
};
