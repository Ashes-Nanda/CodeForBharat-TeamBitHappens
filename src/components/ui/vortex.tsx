"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface VortexProps {
	className?: string;
	size?: number;
	speed?: number;
	color?: string;
}

export const Vortex = ({
	className,
	size = 400,
	speed = 1,
	color = "#ffffff",
}: VortexProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let animationFrameId: number;
		let particles: Particle[] = [];
		const particleCount = 100;
		const centerX = size / 2;
		const centerY = size / 2;

		class Particle {
			x: number;
			y: number;
			angle: number;
			radius: number;
			speed: number;
			size: number;

			constructor() {
				this.angle = Math.random() * Math.PI * 2;
				this.radius = Math.random() * size * 0.4;
				this.speed = (Math.random() * 0.5 + 0.5) * speed;
				this.size = Math.random() * 2 + 1;
				this.x = centerX + Math.cos(this.angle) * this.radius;
				this.y = centerY + Math.sin(this.angle) * this.radius;
			}

			update() {
				this.angle += this.speed * 0.01;
				this.x = centerX + Math.cos(this.angle) * this.radius;
				this.y = centerY + Math.sin(this.angle) * this.radius;
			}

			draw(ctx: CanvasRenderingContext2D) {
				ctx.beginPath();
				ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
				ctx.fillStyle = color;
				ctx.fill();
			}
		}

		const init = () => {
			particles = [];
			for (let i = 0; i < particleCount; i++) {
				particles.push(new Particle());
			}
		};

		const animate = () => {
			ctx.clearRect(0, 0, size, size);
			particles.forEach((particle) => {
				particle.update();
				particle.draw(ctx);
			});
			animationFrameId = requestAnimationFrame(animate);
		};

		init();
		animate();

		return () => {
			cancelAnimationFrame(animationFrameId);
		};
	}, [size, speed, color]);

	return (
		<canvas
			ref={canvasRef}
			width={size}
			height={size}
			className={cn("", className)}
		/>
	);
};