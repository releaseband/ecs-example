import { World } from 'ecs';

export default (count: number) => {
	const world = new World(count);

	class TestComponentA {
		value: number;
		constructor() {
			this.value = 0;
		}
	}
	class TestComponentB {
		value: number;
		constructor() {
			this.value = 1;
		}
	}
	class TestComponentC {
		value: number;
		constructor() {
			this.value = 1;
		}
	}
	class TestComponentD {
		value: number;
		constructor() {
			this.value = 1;
		}
	}
	class TestComponentE {
		value: number;
		constructor() {
			this.value = 1;
		}
	}

	world.registerComponent(TestComponentA);
	world.registerComponent(TestComponentB);
	world.registerComponent(TestComponentC);
	world.registerComponent(TestComponentD);
	world.registerComponent(TestComponentE);

	const queryA = world.createQuery([TestComponentA]);

	for (let i = 0; i < count; i++) {
		const entity = world.createEntity();
		world.addComponent(entity, new TestComponentA());
		world.addComponent(entity, new TestComponentB());
		world.addComponent(entity, new TestComponentC());
		world.addComponent(entity, new TestComponentD());
		world.addComponent(entity, new TestComponentE());
	}

	return () => {
		for (const entity of queryA.entities) {
			const component = world.getComponent(entity, TestComponentA);
			component.value *= 2;
		}
	};
};
