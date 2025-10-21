"use client";

import { useState, useRef, useEffect } from "react";

interface TooltipProps {
	content: string;
	children: React.ReactNode;
	position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({
	content,
	children,
	position = "top",
}: TooltipProps) {
	const [isVisible, setIsVisible] = useState(false);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const handleMouseEnter = () => {
		timeoutRef.current = setTimeout(() => {
			setIsVisible(true);
		}, 200);
	};

	const handleMouseLeave = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		setIsVisible(false);
	};

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	const positionClasses = {
		top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
		bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
		left: "right-full top-1/2 -translate-y-1/2 mr-2",
		right: "left-full top-1/2 -translate-y-1/2 ml-2",
	};

	const arrowPositionClasses = {
		top: "top-full left-1/2 -translate-x-1/2 -mt-1",
		bottom: "bottom-full left-1/2 -translate-x-1/2 -mb-1 rotate-180",
		left: "left-full top-1/2 -translate-y-1/2 -ml-1 rotate-90",
		right: "right-full top-1/2 -translate-y-1/2 -mr-1 -rotate-90",
	};

	return (
		<div
			className="relative inline-flex"
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			{children}

			{isVisible && (
				<div
					className={`absolute ${positionClasses[position]} z-50 animate-fade-in`}
				>
					{/* Tooltip Content */}
					<div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg max-w-xs whitespace-nowrap">
						{content}
					</div>

					{/* Arrow */}
					<div className={`absolute ${arrowPositionClasses[position]}`}>
						<div className="w-2 h-2 bg-gray-900 transform rotate-45" />
					</div>
				</div>
			)}
		</div>
	);
}
