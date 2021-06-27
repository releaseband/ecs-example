const worker = new Worker(new URL('./worker.ts', import.meta.url));
const container = document.createElement('div');
document.body.appendChild(container);

export async function benchmarks(): Promise<void> {
	worker.onmessage = (data) => {
		const div = document.createElement('div');
		const result = data.data as { test: string; hz: number };
		div.innerText = `test: ${result.test}  ${Math.floor(result.hz).toLocaleString()} op/s`;
		container.appendChild(div);
	};
}
