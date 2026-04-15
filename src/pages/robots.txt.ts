import type { APIRoute } from "astro";

const robotsTxt = `
User-agent: *
Disallow: /

# 针对 AI 机器人的限制（保持不变）
User-agent: GPTBot
Disallow: /
User-agent: CCBot
Disallow: /
User-agent: ClaudeBot
Disallow: /
User-agent: Bytespider
Disallow: /

# Sitemap: ${new URL("sitemap-index.xml", import.meta.env.SITE).href}
# `.trim();

export const GET: APIRoute = () => {
	return new Response(robotsTxt, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
		},
	});
};
