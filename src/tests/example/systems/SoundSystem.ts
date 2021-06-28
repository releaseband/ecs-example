import { World, Query, System } from '@releaseband/ecs';
import { Howler } from 'howler';
import { SoundComponent } from '../components/SoundComponent';

export class SoundSystem implements System {
	query: Query;
	world: World;
	onAddCallback: CallableFunction;

	constructor(world: World) {
		this.world = world;
		this.query = world.createQuery([SoundComponent]);
		Howler.autoSuspend = false;

		this.onAddCallback = (entity: number) => {
			console.log('sound entity added');
			const sound = world.getComponent(entity, SoundComponent);
			sound.sprite.once('end', () => {
				world.removeEntity(entity);
				console.log('sound entity removed');
			});
		};
		this.query.onAddSubscribe(this.onAddCallback);
	}

	exit() {
		this.query.onAddUnsubscribe(this.onAddCallback);
	}
}
