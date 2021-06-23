import { World, Query, System } from 'ecs';
import { ObjectComponent } from '../components/ObjectComponent';
import { TweenComponent } from '../components/TweenComponent';
import { gsap } from 'gsap';

import { Game } from '../Game';

export class TweenSystem implements System {
	tweens: Query;

	onAddCallback: CallableFunction;
	onRemoveCallback: CallableFunction;

	constructor(world: World) {
		this.onRemoveCallback = () => {
			console.log('tween object removed');
			if (!this.tweens.entities.size) Game.isTweening = false;
		};

		const onCompleteCallback = (entity: number) => {
			const objectComponent = world.getComponent(entity, ObjectComponent);
			const message = `tween_stop_${entity}`;
			gsap.killTweensOf(objectComponent);
			world.removeComponent(entity, TweenComponent);
			console.log(message);
			Game.events.emit(message);
		};

		this.onAddCallback = (entity: number) => {
			console.log('tween object added');
			Game.isTweening = true;

			const tweenComponent = world.getComponent(entity, TweenComponent);
			const objectComponent = world.getComponent(entity, ObjectComponent);
			const count = tweenComponent.gsapVars.length - 1;
			for (const [index, tween] of tweenComponent.gsapVars.entries()) {
				const onComplete = () => onCompleteCallback(entity);
				const props = index !== count ? tween : { ...tween, onComplete };
				gsap.to(objectComponent, props);
			}
		};

		this.tweens = world.createQuery([ObjectComponent, TweenComponent]);
		this.tweens.onAddSubscribe(this.onAddCallback);
		this.tweens.onRemoveSubscribe(this.onRemoveCallback);
	}

	exit() {
		this.tweens.onAddUnsubscribe(this.onAddCallback);
		this.tweens.onRemoveUnsubscribe(this.onRemoveCallback);
	}
}
