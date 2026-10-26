import * as Phaser from 'phaser';

export class TextureGenerator {
    public static generateAll(scene: Phaser.Scene) {
        this.generatePlayerTextures(scene);
        this.generateGroundTexture(scene);
        this.generateBackgroundTextures(scene);
        this.generateItemTextures(scene);
        this.generateObstacleTextures(scene);
        this.generateParticleTextures(scene);
        this.generateUiTextures(scene);
    }

    private static generatePlayerTextures(scene: Phaser.Scene) {
        // Player Run Frame 1 (Right leg forward)
        if (!scene.textures.exists('player_run_1')) {
            const canvas = scene.textures.createCanvas('player_run_1', 64, 80);
            if (canvas) {
                const ctx = canvas.getContext();
                this.drawTrainee(ctx, 1);
                canvas.refresh();
            }
        }

        // Player Run Frame 2 (Passing)
        if (!scene.textures.exists('player_run_2')) {
            const canvas = scene.textures.createCanvas('player_run_2', 64, 80);
            if (canvas) {
                const ctx = canvas.getContext();
                this.drawTrainee(ctx, 2);
                canvas.refresh();
            }
        }

        // Player Run Frame 3 (Left leg forward)
        if (!scene.textures.exists('player_run_3')) {
            const canvas = scene.textures.createCanvas('player_run_3', 64, 80);
            if (canvas) {
                const ctx = canvas.getContext();
                this.drawTrainee(ctx, 3);
                canvas.refresh();
            }
        }

        // Player Run Frame 4 (Passing 2)
        if (!scene.textures.exists('player_run_4')) {
            const canvas = scene.textures.createCanvas('player_run_4', 64, 80);
            if (canvas) {
                const ctx = canvas.getContext();
                this.drawTrainee(ctx, 4);
                canvas.refresh();
            }
        }

        // Player Jump
        if (!scene.textures.exists('player_jump')) {
            const canvas = scene.textures.createCanvas('player_jump', 64, 80);
            if (canvas) {
                const ctx = canvas.getContext();
                this.drawTraineeJump(ctx);
                canvas.refresh();
            }
        }

        // Player Slide
        if (!scene.textures.exists('player_slide')) {
            const canvas = scene.textures.createCanvas('player_slide', 80, 48);
            if (canvas) {
                const ctx = canvas.getContext();
                this.drawTraineeSlide(ctx);
                canvas.refresh();
            }
        }
    }

    private static drawTrainee(ctx: CanvasRenderingContext2D, frame: number) {
        ctx.clearRect(0, 0, 64, 80);

        // Body center offset based on bounce
        const bounce = (frame === 1 || frame === 3) ? -2 : 0;
        const cy = 38 + bounce;

        // Backpack behind
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(14, cy - 14, 12, 22, 4);
        ctx.fill();

        // Left Arm (back)
        ctx.fillStyle = '#1d4ed8';
        ctx.beginPath();
        if (frame === 1) {
            ctx.ellipse(22, cy - 2, 6, 12, -0.4, 0, Math.PI * 2);
        } else {
            ctx.ellipse(36, cy - 2, 6, 12, 0.4, 0, Math.PI * 2);
        }
        ctx.fill();

        // Legs (Running cycle)
        ctx.fillStyle = '#0f172a'; // Pants
        if (frame === 1) {
            // Right leg forward
            ctx.fillRect(32, cy + 12, 8, 16);
            ctx.fillStyle = '#ef4444'; // Red sneaker
            ctx.fillRect(34, cy + 26, 14, 7);

            // Left leg back
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(20, cy + 10, 8, 14);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(16, cy + 22, 12, 7);
        } else if (frame === 2) {
            ctx.fillRect(28, cy + 12, 8, 18);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(28, cy + 28, 13, 7);

            ctx.fillStyle = '#0f172a';
            ctx.fillRect(24, cy + 10, 8, 16);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(22, cy + 24, 12, 7);
        } else if (frame === 3) {
            // Left leg forward
            ctx.fillRect(20, cy + 12, 8, 16);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(16, cy + 26, 14, 7);

            // Right leg back
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(32, cy + 10, 8, 14);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(34, cy + 22, 12, 7);
        } else {
            ctx.fillRect(26, cy + 12, 8, 18);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(26, cy + 28, 13, 7);

            ctx.fillStyle = '#0f172a';
            ctx.fillRect(22, cy + 10, 8, 16);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(20, cy + 24, 12, 7);
        }

        // Torso - SSAFY Blue Hoodie
        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.roundRect(22, cy - 14, 22, 28, 6);
        ctx.fill();

        // SSAFY Lanyard (Orange ribbon with white badge)
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(27, cy - 12);
        ctx.lineTo(33, cy + 4);
        ctx.lineTo(39, cy - 12);
        ctx.stroke();

        // Trainee Card Badge
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(30, cy + 4, 8, 10);
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(31, cy + 6, 6, 3);

        // Head (Skin tone)
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(34, cy - 23, 11, 0, Math.PI * 2);
        ctx.fill();

        // Hair (Stylish dark anime hair)
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.arc(33, cy - 25, 12, Math.PI * 0.9, Math.PI * 2.1);
        ctx.lineTo(44, cy - 24);
        ctx.lineTo(36, cy - 22);
        ctx.fill();

        // Determined Eye
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(37, cy - 24, 3, 3);
        // Eyebrow
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(36, cy - 28, 5, 2);

        // Sweat droplet (hurrying!)
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(43, cy - 26, 2, 0, Math.PI * 2);
        ctx.fill();

        // Right Arm (front)
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        if (frame === 1) {
            ctx.ellipse(38, cy - 1, 6, 12, 0.5, 0, Math.PI * 2);
        } else {
            ctx.ellipse(24, cy - 1, 6, 12, -0.5, 0, Math.PI * 2);
        }
        ctx.fill();
    }

    private static drawTraineeJump(ctx: CanvasRenderingContext2D) {
        ctx.clearRect(0, 0, 64, 80);
        const cy = 34;

        // Backpack
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(14, cy - 12, 12, 22, 4);
        ctx.fill();

        // Tucked Legs for Jump
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(20, cy + 12, 16, 8);
        ctx.fillRect(28, cy + 18, 14, 8);
        ctx.fillStyle = '#ef4444'; // Red sneakers
        ctx.fillRect(38, cy + 20, 12, 8);
        ctx.fillRect(20, cy + 18, 12, 8);

        // Torso
        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.roundRect(22, cy - 14, 22, 28, 6);
        ctx.fill();

        // Lanyard floating
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(27, cy - 12);
        ctx.lineTo(36, cy + 2);
        ctx.lineTo(41, cy - 12);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(34, cy + 2, 8, 10);

        // Head
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(34, cy - 23, 11, 0, Math.PI * 2);
        ctx.fill();

        // Hair fluttering up
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.arc(33, cy - 25, 12, Math.PI * 0.8, Math.PI * 2.2);
        ctx.lineTo(45, cy - 28);
        ctx.fill();

        // Eyes (excited/jump)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(38, cy - 24, 3, 3);

        // Arms raised
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.ellipse(38, cy - 8, 6, 12, 0.8, 0, Math.PI * 2);
        ctx.fill();
    }

    private static drawTraineeSlide(ctx: CanvasRenderingContext2D) {
        ctx.clearRect(0, 0, 80, 48);

        // Sliding horizontally
        // Speed lines / friction sparks
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(2, 42, 20, 3);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(10, 44, 25, 2);

        // Legs stretched back
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(12, 24, 28, 10);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(8, 26, 14, 8);

        // Torso low
        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.roundRect(32, 16, 26, 18, 4);
        ctx.fill();

        // Head low forward
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(62, 22, 10, 0, Math.PI * 2);
        ctx.fill();

        // Hair back
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.arc(60, 20, 11, Math.PI * 0.9, Math.PI * 2.1);
        ctx.lineTo(48, 16);
        ctx.fill();

        // Focused eye
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(65, 21, 3, 3);

        // Arm forward
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(44, 28, 20, 6);
    }

    private static generateGroundTexture(scene: Phaser.Scene) {
        if (scene.textures.exists('ground_tex')) return;

        const canvas = scene.textures.createCanvas('ground_tex', 128, 60);
        if (!canvas) return;
        const ctx = canvas.getContext();

        // Main pavement base
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 128, 60);

        // Cyber top neon line
        const grad = ctx.createLinearGradient(0, 0, 128, 0);
        grad.addColorStop(0, '#38bdf8');
        grad.addColorStop(0.5, '#818cf8');
        grad.addColorStop(1, '#38bdf8');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 4);

        // Hazard diagonal stripes for tech runner feel
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 4, 128, 8);
        ctx.fillStyle = '#f59e0b';
        for (let i = 0; i < 128; i += 24) {
            ctx.beginPath();
            ctx.moveTo(i, 4);
            ctx.lineTo(i + 12, 12);
            ctx.lineTo(i + 6, 12);
            ctx.lineTo(i - 6, 4);
            ctx.fill();
        }

        // Subsurface cyber circuit patterns
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(10, 24);
        ctx.lineTo(60, 24);
        ctx.lineTo(75, 42);
        ctx.lineTo(120, 42);
        ctx.stroke();

        ctx.fillStyle = '#0ea5e9';
        ctx.fillRect(60, 22, 4, 4);
        ctx.fillRect(120, 40, 4, 4);

        canvas.refresh();
    }

    private static generateBackgroundTextures(scene: Phaser.Scene) {
        // Far skyline (City skyscrapers in early morning fog)
        if (!scene.textures.exists('bg_skyline_far')) {
            const canvas = scene.textures.createCanvas('bg_skyline_far', 1280, 400);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#141829';

                // Random skyline silhouettes
                const buildings = [
                    { x: 0, w: 90, h: 220 }, { x: 100, w: 120, h: 280 }, { x: 230, w: 80, h: 180 },
                    { x: 320, w: 140, h: 320 }, { x: 470, w: 100, h: 240 }, { x: 580, w: 110, h: 300 },
                    { x: 700, w: 90, h: 200 }, { x: 800, w: 130, h: 290 }, { x: 940, w: 110, h: 230 },
                    { x: 1060, w: 120, h: 330 }, { x: 1190, w: 90, h: 210 }
                ];

                buildings.forEach(b => {
                    ctx.fillRect(b.x, 400 - b.h, b.w, b.h);

                    // Distant window lights
                    ctx.fillStyle = '#ffedd5';
                    for (let wy = 400 - b.h + 20; wy < 380; wy += 28) {
                        for (let wx = b.x + 12; wx < b.x + b.w - 12; wx += 20) {
                            if (Math.sin(wx * wy) > 0.1) {
                                ctx.fillRect(wx, wy, 6, 10);
                            }
                        }
                    }
                    ctx.fillStyle = '#141829';
                });

                canvas.refresh();
            }
        }

        // Near skyline (Closer buildings & SSAFY Campus)
        if (!scene.textures.exists('bg_skyline_near')) {
            const canvas = scene.textures.createCanvas('bg_skyline_near', 1280, 280);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#1e243b';

                const blocks = [
                    { x: 20, w: 160, h: 220, label: 'SSAFY' },
                    { x: 200, w: 120, h: 160, label: '9:00 AM' },
                    { x: 340, w: 200, h: 250, label: 'MULTICAMPUS' },
                    { x: 560, w: 140, h: 190, label: 'COMMIT' },
                    { x: 720, w: 180, h: 230, label: 'SEOUL' },
                    { x: 920, w: 130, h: 170, label: 'PASS' },
                    { x: 1070, w: 190, h: 240, label: 'MULTICAMPUS' }
                ];

                blocks.forEach(b => {
                    ctx.fillRect(b.x, 280 - b.h, b.w, b.h);

                    // Neon Sign
                    ctx.fillStyle = '#38bdf8';
                    ctx.font = 'bold 16px monospace';
                    ctx.fillText(b.label, b.x + 16, 280 - b.h + 30);

                    // Neon windows
                    ctx.fillStyle = '#3b82f6';
                    for (let wy = 280 - b.h + 50; wy < 260; wy += 24) {
                        for (let wx = b.x + 16; wx < b.x + b.w - 16; wx += 22) {
                            if (Math.cos(wx + wy) > 0.05) {
                                ctx.fillRect(wx, wy, 10, 12);
                            }
                        }
                    }
                    ctx.fillStyle = '#1e243b';
                });

                canvas.refresh();
            }
        }
    }

    private static generateItemTextures(scene: Phaser.Scene) {
        // 1. Commit Grass (32x32)
        if (!scene.textures.exists('jelly_grass')) {
            const canvas = scene.textures.createCanvas('jelly_grass', 32, 32);
            if (canvas) {
                const ctx = canvas.getContext();
                // Outer glow border
                ctx.fillStyle = '#4ade80';
                ctx.beginPath();
                ctx.roundRect(1, 1, 30, 30, 8);
                ctx.fill();

                // Inner GitHub Green
                const grad = ctx.createLinearGradient(0, 0, 32, 32);
                grad.addColorStop(0, '#22c55e');
                grad.addColorStop(1, '#15803d');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.roundRect(4, 4, 24, 24, 6);
                ctx.fill();

                // Git Commit node icon
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.arc(16, 16, 5, 0, Math.PI * 2);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(8, 16);
                ctx.lineTo(11, 16);
                ctx.moveTo(21, 16);
                ctx.lineTo(24, 16);
                ctx.stroke();

                canvas.refresh();
            }
        }

        // 2. SSAFY QR Code Phone Badge (36x44)
        if (!scene.textures.exists('jelly_qr')) {
            const canvas = scene.textures.createCanvas('jelly_qr', 36, 44);
            if (canvas) {
                const ctx = canvas.getContext();
                // Phone Body
                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.roundRect(2, 2, 32, 40, 6);
                ctx.fill();

                // Cyan border
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(2, 2, 32, 40, 6);
                ctx.stroke();

                // Screen
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(6, 6, 24, 28);

                // QR pattern
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(8, 8, 7, 7);
                ctx.fillRect(21, 8, 7, 7);
                ctx.fillRect(8, 21, 7, 7);
                ctx.fillRect(17, 17, 4, 4);
                ctx.fillRect(22, 22, 5, 5);

                // Home indicator
                ctx.fillStyle = '#94a3b8';
                ctx.fillRect(13, 38, 10, 2);

                canvas.refresh();
            }
        }

        // 3. Iced Americano (36x44)
        if (!scene.textures.exists('item_coffee')) {
            const canvas = scene.textures.createCanvas('item_coffee', 36, 44);
            if (canvas) {
                const ctx = canvas.getContext();
                // Cup outline
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.beginPath();
                ctx.moveTo(6, 12);
                ctx.lineTo(10, 40);
                ctx.lineTo(26, 40);
                ctx.lineTo(30, 12);
                ctx.closePath();
                ctx.fill();

                // Coffee liquid
                ctx.fillStyle = '#3f1a04';
                ctx.beginPath();
                ctx.moveTo(8, 18);
                ctx.lineTo(11, 38);
                ctx.lineTo(25, 38);
                ctx.lineTo(28, 18);
                ctx.closePath();
                ctx.fill();

                // Ice cubes
                ctx.fillStyle = 'rgba(186, 230, 253, 0.7)';
                ctx.fillRect(12, 20, 6, 6);
                ctx.fillRect(20, 22, 6, 6);
                ctx.fillRect(15, 28, 6, 6);

                // Cup Rim / Dome lid
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.beginPath();
                ctx.roundRect(4, 9, 28, 4, 2);
                ctx.fill();

                // Red Straw
                ctx.fillStyle = '#ef4444';
                ctx.save();
                ctx.translate(22, 2);
                ctx.rotate(0.2);
                ctx.fillRect(-2, 0, 4, 22);
                ctx.restore();

                canvas.refresh();
            }
        }

        // 4. Fever / RedBull Energy Drink (30x42)
        if (!scene.textures.exists('item_fever')) {
            const canvas = scene.textures.createCanvas('item_fever', 30, 42);
            if (canvas) {
                const ctx = canvas.getContext();
                // Golden Can
                const grad = ctx.createLinearGradient(4, 0, 26, 0);
                grad.addColorStop(0, '#eab308');
                grad.addColorStop(0.5, '#fef08a');
                grad.addColorStop(1, '#ca8a04');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.roundRect(4, 6, 22, 32, 4);
                ctx.fill();

                // Lightning Bolt ⚡
                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.moveTo(17, 10);
                ctx.lineTo(10, 22);
                ctx.lineTo(15, 22);
                ctx.lineTo(13, 32);
                ctx.lineTo(20, 20);
                ctx.lineTo(15, 20);
                ctx.closePath();
                ctx.fill();

                canvas.refresh();
            }
        }
    }

    private static generateObstacleTextures(scene: Phaser.Scene) {
        // 1. Ground Obstacle: Error Terminal Monitor (52x58)
        if (!scene.textures.exists('obstacle_error')) {
            const canvas = scene.textures.createCanvas('obstacle_error', 52, 58);
            if (canvas) {
                const ctx = canvas.getContext();
                // Monitor stand
                ctx.fillStyle = '#334155';
                ctx.fillRect(22, 44, 8, 10);
                ctx.fillRect(14, 52, 24, 6);

                // Monitor frame
                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.roundRect(2, 4, 48, 40, 4);
                ctx.fill();
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Red Error Screen
                ctx.fillStyle = '#450a0a';
                ctx.fillRect(6, 8, 40, 32);

                // Error cross & text
                ctx.fillStyle = '#ef4444';
                ctx.font = 'bold 10px monospace';
                ctx.fillText('ERR 500', 8, 22);

                // Glitch line
                ctx.fillStyle = '#f87171';
                ctx.fillRect(8, 28, 36, 3);
                ctx.fillRect(12, 33, 20, 2);

                canvas.refresh();
            }
        }

        // 2. Ground Obstacle 2: Bug Robot (48x44)
        if (!scene.textures.exists('obstacle_bug')) {
            const canvas = scene.textures.createCanvas('obstacle_bug', 48, 44);
            if (canvas) {
                const ctx = canvas.getContext();
                // Legs
                ctx.strokeStyle = '#991b1b';
                ctx.lineWidth = 3;
                ctx.beginPath();
                // Left legs
                ctx.moveTo(14, 24); ctx.lineTo(4, 38);
                ctx.moveTo(18, 28); ctx.lineTo(10, 42);
                // Right legs
                ctx.moveTo(34, 24); ctx.lineTo(44, 38);
                ctx.moveTo(30, 28); ctx.lineTo(38, 42);
                ctx.stroke();

                // Body
                ctx.fillStyle = '#dc2626';
                ctx.beginPath();
                ctx.roundRect(14, 12, 20, 24, 8);
                ctx.fill();

                // Antennae
                ctx.beginPath();
                ctx.moveTo(18, 12); ctx.lineTo(10, 2);
                ctx.moveTo(30, 12); ctx.lineTo(38, 2);
                ctx.stroke();

                // Glowing yellow eyes
                ctx.fillStyle = '#facc15';
                ctx.fillRect(17, 18, 4, 4);
                ctx.fillRect(27, 18, 4, 4);

                canvas.refresh();
            }
        }

        // 3. Air Obstacle: Merge Conflict Caution Barrier (70x34)
        if (!scene.textures.exists('obstacle_conflict')) {
            const canvas = scene.textures.createCanvas('obstacle_conflict', 70, 34);
            if (canvas) {
                const ctx = canvas.getContext();
                // Barrier frame
                ctx.fillStyle = '#1e293b';
                ctx.beginPath();
                ctx.roundRect(2, 2, 66, 30, 4);
                ctx.fill();
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Yellow caution stripes
                ctx.fillStyle = '#f59e0b';
                for (let x = 6; x < 64; x += 14) {
                    ctx.beginPath();
                    ctx.moveTo(x, 4);
                    ctx.lineTo(x + 6, 4);
                    ctx.lineTo(x - 2, 28);
                    ctx.lineTo(x - 8, 28);
                    ctx.fill();
                }

                // Text
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 9px monospace';
                ctx.fillText('CONFLICT', 12, 20);

                canvas.refresh();
            }
        }
    }

    private static generateParticleTextures(scene: Phaser.Scene) {
        // Sparkle
        if (!scene.textures.exists('particle_sparkle')) {
            const canvas = scene.textures.createCanvas('particle_sparkle', 16, 16);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.moveTo(8, 0);
                ctx.lineTo(10, 6);
                ctx.lineTo(16, 8);
                ctx.lineTo(10, 10);
                ctx.lineTo(8, 16);
                ctx.lineTo(6, 10);
                ctx.lineTo(0, 8);
                ctx.lineTo(6, 6);
                ctx.closePath();
                ctx.fill();
                canvas.refresh();
            }
        }

        // Dust puff
        if (!scene.textures.exists('particle_dust')) {
            const canvas = scene.textures.createCanvas('particle_dust', 12, 12);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
                ctx.beginPath();
                ctx.arc(6, 6, 5, 0, Math.PI * 2);
                ctx.fill();
                canvas.refresh();
            }
        }
    }

    private static generateUiTextures(scene: Phaser.Scene) {
        // Touch Jump Button (90x90)
        if (!scene.textures.exists('btn_touch_jump')) {
            const canvas = scene.textures.createCanvas('btn_touch_jump', 90, 90);
            if (canvas) {
                const ctx = canvas.getContext();
                // Outer circle
                ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
                ctx.beginPath();
                ctx.arc(45, 45, 42, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 4;
                ctx.stroke();

                // Arrow Up icon
                ctx.fillStyle = '#38bdf8';
                ctx.beginPath();
                ctx.moveTo(45, 22);
                ctx.lineTo(64, 44);
                ctx.lineTo(52, 44);
                ctx.lineTo(52, 64);
                ctx.lineTo(38, 64);
                ctx.lineTo(38, 44);
                ctx.lineTo(26, 44);
                ctx.closePath();
                ctx.fill();

                // Label
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 11px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('JUMP', 45, 78);

                canvas.refresh();
            }
        }

        // Touch Slide Button (90x90)
        if (!scene.textures.exists('btn_touch_slide')) {
            const canvas = scene.textures.createCanvas('btn_touch_slide', 90, 90);
            if (canvas) {
                const ctx = canvas.getContext();
                // Outer circle
                ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
                ctx.beginPath();
                ctx.arc(45, 45, 42, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 4;
                ctx.stroke();

                // Arrow Down icon
                ctx.fillStyle = '#f59e0b';
                ctx.beginPath();
                ctx.moveTo(45, 62);
                ctx.lineTo(64, 40);
                ctx.lineTo(52, 40);
                ctx.lineTo(52, 20);
                ctx.lineTo(38, 20);
                ctx.lineTo(38, 40);
                ctx.lineTo(26, 40);
                ctx.closePath();
                ctx.fill();

                // Label
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 11px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('SLIDE', 45, 78);

                canvas.refresh();
            }
        }
    }
}
