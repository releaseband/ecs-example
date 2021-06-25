import { World, Query, System } from 'ecs';
import { EventEmitter } from '../EventEmitter';
import { ObjectComponent } from '../components/ObjectComponent';
import { TweenComponent } from '../components/TweenComponent';
import { gsap } from 'gsap';

export class TweenSystem implements System {
	tweens: Query;

	onAddCallback: CallableFunction;

	constructor(world: World) {
		const onCompleteCallback = (entity: number) => {
			const objectComponent = world.getComponent(entity, ObjectComponent);
			const message = `tween_stop_${entity}`;
			gsap.killTweensOf(objectComponent);
			world.removeComponent(entity, TweenComponent);
			EventEmitter.getInstance().emit(message);
		};

		this.onAddCallback = (entity: number) => {
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
	}

	exit() {
		this.tweens.onAddUnsubscribe(this.onAddCallback);
	}
}
