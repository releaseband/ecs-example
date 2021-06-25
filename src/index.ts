import './index.css';
import { example } from './tests/example/index';
import { benchmarks } from './tests/benchmarks/index';

const tests = {
	example,
	benchmarks,
};

function run(): void {
	const url = new URLSearchParams(window.location.search);
	if (url.has('test')) {
		const name = url.get('test');
		const fn = tests[name as keyof typeof tests];
		fn();
	} else {
		const root = document.createElement('div');
		root.className = 'test-main';
		document.body.prepend(root);
		for (const test of Object.keys(tests)) {
			const div = document.createElement('div');
			div.innerHTML = `<a href='?test=${test}'>TEST: ${test}</a>`;
			div.className = 'test-line';
			root.appendChild(div);
		}
	}
}

run();
