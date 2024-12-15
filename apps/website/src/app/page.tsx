import CodeBlock from "@/components/code-block";

export default function Home() {
	return (
		<div className="flex flex-col items-center justify-items-center font-[family-name:var(--font-geist-sans)] overflow-y-auto snap-y snap-mandatory h-screen">
			<main className="flex flex-col gap-2 row-start-2 items-center sm:items-start h-full container p-4 relative">
				<section className="flex flex-col min-h-screen w-full justify-center space-y-2 snap-start snap-always">
					<div className="w-full md:w-[300px]">
						<h1 className="text-3xl font-bold text-zinc-100 leading-normal tracking-tight">
							Linguai
						</h1>
						<p className="text-lg text-zinc-500 tracking-tight">
							your AI-powered i18n companion
						</p>
					</div>
					<CodeBlock code="npx linguai@latest init" />
				</section>
				<section className="flex flex-col justify-center gap-4 min-h-screen w-full snap-start snap-always py-4">
					<div>
						<h2 className="text-2xl font-bold text-zinc-100">configuration</h2>
					</div>
					<div className="flex flex-col gap-2">
						<p className="text-lg text-zinc-500">translate your codebase</p>
						<CodeBlock code="npx linguai@latest translate" />
					</div>

					<div className="flex flex-col gap-2">
						<p className="text-lg text-zinc-500">translate all locales</p>
						<CodeBlock code="npx linguai@latest translate" />
					</div>

					<div className="flex flex-col gap-2">
						<p className="text-lg text-zinc-500">
							or translate a specific locale
						</p>
						<CodeBlock code="npx linguai@latest translate se" />
					</div>
				</section>
				<section className="flex flex-col justify-center gap-4 min-h-screen w-full snap-start snap-always py-4">
					<div className="flex flex-col gap-2">
						<a
							href="https://github.com/ludviglundh/linguai"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors w-fit"
						>
							<span className="sr-only">View on GitHub</span>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-labelledby="github icon"
							>
								<title id="github icon">GitHub</title>
								<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
								<path d="M9 18c-4.51 2-5-2-7-2" />
							</svg>
							<span>View on GitHub</span>
						</a>
						<p className="text-zinc-500">
							© {new Date().getFullYear()} Linguai
						</p>
					</div>
				</section>
			</main>
		</div>
	);
}
