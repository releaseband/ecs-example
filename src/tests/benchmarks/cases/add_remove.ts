import { World } from '@releaseband/ecs';

export default (count: number) => {
	const world = new World(count);

	class TestComponentA {}
	class TestComponentB {}

	world.registerComponent(TestComponentA);
	world.registerComponent(TestComponentB);

	const queryA = world.createQuery([TestComponentA]);
	const queryB = world.createQuery([TestComponentA, TestComponentB]);

	for (let i = 0; i < count; i++) {
		const entity = world.createEntity();
		world.addComponent(entity, new TestComponentA());
	}

	return () => {
		for (const entity of queryA.entities) {
			world.addComponent(entity, new TestComponentB());
		}

		for (const entity of queryB.entities) {
			world.removeComponent(entity, TestComponentB);
		}
	};
};
