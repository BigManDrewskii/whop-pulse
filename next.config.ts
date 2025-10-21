import { withWhopAppConfig } from "@whop/react/next.config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		remotePatterns: [{ hostname: "**" }],
	},
	// Fix Recharts hydration issues
	webpack: (config) => {
		config.externals = [...(config.externals || []), { canvas: "canvas" }];
		return config;
	},
};

export default withWhopAppConfig(nextConfig);
