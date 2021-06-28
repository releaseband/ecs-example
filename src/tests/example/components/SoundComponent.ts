import { Howl } from 'howler';

export class SoundComponent {
	sprite: Howl;
	constructor(sprite: Howl) {
		this.sprite = sprite;
		this.sprite.play();
	}
}
