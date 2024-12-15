"use client";

import { useState } from "react";

interface CodeBlockProps {
	code: string;
}

export default function CodeBlock({ code }: CodeBlockProps) {
	const [copied, setCopied] = useState(false);

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy text: ", err);
		}
	};

	return (
		<div className="flex items-center w-fit gap-2 font-[family-name:var(--font-geist-mono)]  py-2 rounded-lg border-zinc-700 group relative">
			<code className="text-zinc-300">{code}</code>
			<button
				type="button"
				onClick={copyToClipboard}
				className="p-2 rounded opacity-0 group-hover:opacity-100 hover:bg-zinc-800 transition-opacity"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className={`${copied ? "text-green-400" : "text-zinc-400"}`}
					aria-labelledby="copyTitle"
				>
					<title id="copyTitle">
						{copied ? "Copied!" : "Copy code to clipboard"}
					</title>
					{copied ? (
						<path d="M20 6L9 17l-5-5" />
					) : (
						<>
							<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
							<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
						</>
					)}
				</svg>
			</button>
		</div>
	);
}
