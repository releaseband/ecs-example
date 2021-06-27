import tests from './cases/index';

const ctx: Worker = self as any;

const BENCHMARKS: { [key: string]: number } = {
	packed_1: 5_000,
	packed_5: 1_000,
	simple_iter: 1_000,
	frag_iter: 100,
	entity_cycle: 1_000,
	add_remove: 1_000,
};

const bench = (fn: CallableFunction) => {
	let cycle_n = 1;
	let cycle_ms = 0;
	let cycle_total_ms = 0;

	// Run multiple cycles to get an estimate
	while (cycle_total_ms < 500) {
		let elapsed = bench_iter(fn, cycle_n);
		cycle_ms = elapsed / cycle_n;
		cycle_n *= 2;
		cycle_total_ms += elapsed;
	}

	// Try to estimate the iteration count for 500ms
	let target_n = 500 / cycle_ms;
	let total_ms = bench_iter(fn, target_n);

	function bench_iter(fn: CallableFunction, count: number) {
		let start = performance.now();
		for (let i = 0; i < count; i++) {
			fn();
		}
		let end = performance.now();
		return end - start;
	}
	return {
		hz: (target_n / total_ms) * 1_000, // ops/sec
		ms: total_ms / target_n, // ms/op
	};
};

for (const test in tests) {
	const fn = tests[test as keyof typeof tests](BENCHMARKS[test]);
	const result = bench(fn);
	ctx.postMessage({ ...result, test });
}
