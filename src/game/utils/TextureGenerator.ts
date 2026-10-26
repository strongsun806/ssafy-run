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
        // Player Run 1-4 with crisp bright colors & white outline for maximum contrast
        for (let f = 1; f <= 4; f++) {
            const key = `player_run_${f}`;
            if (!scene.textures.exists(key)) {
                const canvas = scene.textures.createCanvas(key, 64, 80);
                if (canvas) {
                    const ctx = canvas.getContext();
                    this.drawTrainee(ctx, f);
                    canvas.refresh();
                }
            }
        }

        // Jump
        if (!scene.textures.exists('player_jump')) {
            const canvas = scene.textures.createCanvas('player_jump', 64, 80);
            if (canvas) {
                const ctx = canvas.getContext();
                this.drawTraineeJump(ctx);
                canvas.refresh();
            }
        }

        // Slide
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

        const bounce = (frame === 1 || frame === 3) ? -2 : 0;
        const cy = 38 + bounce;

        // Dark navy backpack
        ctx.fillStyle = '#0f172a';
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

        // Running Legs with bright white socks & red sneakers
        ctx.fillStyle = '#1e293b'; // Pants
        if (frame === 1) {
            ctx.fillRect(32, cy + 12, 8, 16);
            ctx.fillStyle = '#ffffff'; // Sock
            ctx.fillRect(32, cy + 24, 8, 4);
            ctx.fillStyle = '#ef4444'; // Red sneaker
            ctx.fillRect(34, cy + 28, 14, 8);

            ctx.fillStyle = '#1e293b';
            ctx.fillRect(20, cy + 10, 8, 14);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(20, cy + 20, 8, 4);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(16, cy + 24, 12, 8);
        } else if (frame === 2) {
            ctx.fillRect(28, cy + 12, 8, 18);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(28, cy + 26, 8, 4);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(28, cy + 30, 13, 8);

            ctx.fillStyle = '#1e293b';
            ctx.fillRect(24, cy + 10, 8, 16);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(24, cy + 22, 8, 4);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(22, cy + 26, 12, 8);
        } else if (frame === 3) {
            ctx.fillRect(20, cy + 12, 8, 16);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(20, cy + 24, 8, 4);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(16, cy + 28, 14, 8);

            ctx.fillStyle = '#1e293b';
            ctx.fillRect(32, cy + 10, 8, 14);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(32, cy + 20, 8, 4);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(34, cy + 24, 12, 8);
        } else {
            ctx.fillRect(26, cy + 12, 8, 18);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(26, cy + 26, 8, 4);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(26, cy + 30, 13, 8);

            ctx.fillStyle = '#1e293b';
            ctx.fillRect(22, cy + 10, 8, 16);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(22, cy + 22, 8, 4);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(20, cy + 26, 12, 8);
        }

        // Torso - Vibrant SSAFY Blue Hoodie with crisp white trim
        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.roundRect(22, cy - 14, 22, 28, 6);
        ctx.fill();
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Lanyard (Orange ribbon with white badge)
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(27, cy - 12);
        ctx.lineTo(33, cy + 4);
        ctx.lineTo(39, cy - 12);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(30, cy + 4, 8, 10);
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(31, cy + 6, 6, 3);

        // Head (Skin tone)
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(34, cy - 23, 11, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(33, cy - 25, 12, Math.PI * 0.9, Math.PI * 2.1);
        ctx.lineTo(44, cy - 24);
        ctx.lineTo(36, cy - 22);
        ctx.fill();

        // Determined Eye
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(37, cy - 24, 3, 3);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(38, cy - 23, 2, 2);

        // Sweat drop (hurrying!)
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(43, cy - 26, 2, 0, Math.PI * 2);
        ctx.fill();

        // Front Arm
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
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(14, cy - 12, 12, 22, 4);
        ctx.fill();

        // Tucked Legs
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(20, cy + 12, 16, 8);
        ctx.fillRect(28, cy + 18, 14, 8);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(36, cy + 18, 8, 4);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(38, cy + 22, 12, 8);
        ctx.fillRect(20, cy + 18, 12, 8);

        // Torso
        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.roundRect(22, cy - 14, 22, 28, 6);
        ctx.fill();
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 1.5;
        ctx.stroke();

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

        // Fluttering hair
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(33, cy - 25, 12, Math.PI * 0.8, Math.PI * 2.2);
        ctx.lineTo(45, cy - 28);
        ctx.fill();

        // Eye
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

        // Sparks
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(2, 42, 20, 3);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(10, 44, 25, 2);

        // Legs back
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(12, 24, 28, 10);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(8, 26, 14, 8);

        // Torso
        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.roundRect(32, 16, 26, 18, 4);
        ctx.fill();
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Head
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(62, 22, 10, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(60, 20, 11, Math.PI * 0.9, Math.PI * 2.1);
        ctx.lineTo(48, 16);
        ctx.fill();

        // Eye
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

        // Deep calm navy pavement (no eye fatigue)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 128, 60);

        // Clean glowing cyan top guide line
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(0, 0, 128, 4);

        // Gentle tech road markings
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 4, 128, 12);
        ctx.fillStyle = '#334155';
        ctx.fillRect(10, 8, 40, 4);
        ctx.fillRect(74, 8, 40, 4);

        // Subtle road lines
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 30);
        ctx.lineTo(128, 30);
        ctx.stroke();

        canvas.refresh();
    }

    private static generateBackgroundTextures(scene: Phaser.Scene) {
        // Far skyline: Soft, low-contrast calm silhouettes (no flickering grids to prevent dizziness!)
        if (!scene.textures.exists('bg_skyline_far')) {
            const canvas = scene.textures.createCanvas('bg_skyline_far', 1280, 400);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#111827';

                const buildings = [
                    { x: 0, w: 100, h: 220 }, { x: 110, w: 130, h: 270 }, { x: 250, w: 90, h: 180 },
                    { x: 350, w: 150, h: 300 }, { x: 510, w: 110, h: 230 }, { x: 630, w: 120, h: 280 },
                    { x: 760, w: 100, h: 190 }, { x: 870, w: 140, h: 270 }, { x: 1020, w: 120, h: 220 },
                    { x: 1150, w: 130, h: 310 }
                ];

                buildings.forEach(b => {
                    ctx.fillRect(b.x, 400 - b.h, b.w, b.h);
                    // Soft warm glow at roof
                    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
                    ctx.fillRect(b.x, 400 - b.h, b.w, 4);
                    ctx.fillStyle = '#111827';
                });

                canvas.refresh();
            }
        }

        // Near skyline: SSAFY campus landmarks with warm clean glow
        if (!scene.textures.exists('bg_skyline_near')) {
            const canvas = scene.textures.createCanvas('bg_skyline_near', 1280, 280);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#1e293b';

                const blocks = [
                    { x: 30, w: 180, h: 220, label: 'SSAFY' },
                    { x: 240, w: 140, h: 170, label: '9:00 AM' },
                    { x: 410, w: 220, h: 240, label: 'MULTICAMPUS' },
                    { x: 660, w: 150, h: 190, label: 'SEOUL' },
                    { x: 840, w: 200, h: 230, label: 'COMMIT' },
                    { x: 1070, w: 180, h: 220, label: 'MULTICAMPUS' }
                ];

                blocks.forEach(b => {
                    ctx.fillRect(b.x, 280 - b.h, b.w, b.h);

                    // Clean neon signs
                    ctx.fillStyle = '#38bdf8';
                    ctx.font = 'bold 15px sans-serif';
                    ctx.fillText(b.label, b.x + 20, 280 - b.h + 28);

                    // Soft warm window accents
                    ctx.fillStyle = 'rgba(254, 240, 138, 0.3)';
                    for (let wy = 280 - b.h + 50; wy < 260; wy += 35) {
                        for (let wx = b.x + 20; wx < b.x + b.w - 20; wx += 30) {
                            ctx.fillRect(wx, wy, 12, 14);
                        }
                    }
                    ctx.fillStyle = '#1e293b';
                });

                canvas.refresh();
            }
        }
    }

    private static generateItemTextures(scene: Phaser.Scene) {
        // 1. Commit Grass: Bright emerald green git commit square with glowing pulse border (36x36)
        if (!scene.textures.exists('jelly_grass')) {
            const canvas = scene.textures.createCanvas('jelly_grass', 36, 36);
            if (canvas) {
                const ctx = canvas.getContext();

                // Outer bright glow
                ctx.fillStyle = 'rgba(74, 222, 128, 0.4)';
                ctx.beginPath();
                ctx.roundRect(0, 0, 36, 36, 10);
                ctx.fill();

                // Bright Green Body
                const grad = ctx.createLinearGradient(0, 0, 36, 36);
                grad.addColorStop(0, '#4ade80');
                grad.addColorStop(1, '#16a34a');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.roundRect(3, 3, 30, 30, 8);
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Commit node icon
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.arc(18, 18, 5, 0, Math.PI * 2);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(9, 18); ctx.lineTo(13, 18);
                ctx.moveTo(23, 18); ctx.lineTo(27, 18);
                ctx.stroke();

                canvas.refresh();
            }
        }

        // 2. SSAFY QR Code Phone Badge (38x46)
        if (!scene.textures.exists('jelly_qr')) {
            const canvas = scene.textures.createCanvas('jelly_qr', 38, 46);
            if (canvas) {
                const ctx = canvas.getContext();

                // Glow
                ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
                ctx.beginPath();
                ctx.roundRect(0, 0, 38, 46, 8);
                ctx.fill();

                // Phone Body
                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.roundRect(3, 3, 32, 40, 6);
                ctx.fill();
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Screen
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(7, 7, 24, 28);

                // QR matrix
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(9, 9, 7, 7);
                ctx.fillRect(22, 9, 7, 7);
                ctx.fillRect(9, 22, 7, 7);
                ctx.fillRect(18, 18, 4, 4);
                ctx.fillRect(23, 23, 5, 5);

                canvas.refresh();
            }
        }

        // 3. Iced Americano (36x44)
        if (!scene.textures.exists('item_coffee')) {
            const canvas = scene.textures.createCanvas('item_coffee', 36, 44);
            if (canvas) {
                const ctx = canvas.getContext();

                // Glow
                ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
                ctx.beginPath();
                ctx.roundRect(2, 6, 32, 38, 6);
                ctx.fill();

                // Cup Body
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.beginPath();
                ctx.moveTo(6, 12); ctx.lineTo(10, 40); ctx.lineTo(26, 40); ctx.lineTo(30, 12);
                ctx.closePath();
                ctx.fill();

                // Coffee liquid
                ctx.fillStyle = '#451a03';
                ctx.beginPath();
                ctx.moveTo(8, 18); ctx.lineTo(11, 38); ctx.lineTo(25, 38); ctx.lineTo(28, 18);
                ctx.closePath();
                ctx.fill();

                // Ice cubes
                ctx.fillStyle = '#bae6fd';
                ctx.fillRect(12, 20, 6, 6);
                ctx.fillRect(20, 22, 6, 6);

                // Lid & Red Straw
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(4, 9, 28, 4);
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(20, 0, 4, 18);

                canvas.refresh();
            }
        }

        // 4. Booster Drink (32x44)
        if (!scene.textures.exists('item_fever')) {
            const canvas = scene.textures.createCanvas('item_fever', 32, 44);
            if (canvas) {
                const ctx = canvas.getContext();

                // Golden Glow
                ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
                ctx.beginPath();
                ctx.roundRect(1, 3, 30, 38, 6);
                ctx.fill();

                // Golden Can
                const grad = ctx.createLinearGradient(4, 0, 28, 0);
                grad.addColorStop(0, '#facc15');
                grad.addColorStop(0.5, '#fef08a');
                grad.addColorStop(1, '#ca8a04');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.roundRect(5, 6, 22, 32, 4);
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Lightning ⚡
                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.moveTo(17, 10); ctx.lineTo(10, 22); ctx.lineTo(15, 22);
                ctx.lineTo(13, 32); ctx.lineTo(21, 20); ctx.lineTo(16, 20);
                ctx.closePath();
                ctx.fill();

                canvas.refresh();
            }
        }
    }

    private static generateObstacleTextures(scene: Phaser.Scene) {
        // 1. Ground: 500 Error Monitor (52x58)
        if (!scene.textures.exists('obstacle_error')) {
            const canvas = scene.textures.createCanvas('obstacle_error', 52, 58);
            if (canvas) {
                const ctx = canvas.getContext();

                // Stand
                ctx.fillStyle = '#334155';
                ctx.fillRect(22, 44, 8, 10);
                ctx.fillRect(14, 52, 24, 6);

                // Frame with bright red border
                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.roundRect(2, 4, 48, 40, 4);
                ctx.fill();
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 3;
                ctx.stroke();

                // Red Screen
                ctx.fillStyle = '#7f1d1d';
                ctx.fillRect(6, 8, 40, 32);

                // Error text
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 11px sans-serif';
                ctx.fillText('ERR 500', 7, 24);

                ctx.fillStyle = '#fca5a5';
                ctx.fillRect(8, 28, 36, 4);

                canvas.refresh();
            }
        }

        // 2. Ground: Bug Robot (48x44)
        if (!scene.textures.exists('obstacle_bug')) {
            const canvas = scene.textures.createCanvas('obstacle_bug', 48, 44);
            if (canvas) {
                const ctx = canvas.getContext();

                // Legs
                ctx.strokeStyle = '#b91c1c';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(14, 24); ctx.lineTo(4, 38);
                ctx.moveTo(18, 28); ctx.lineTo(10, 42);
                ctx.moveTo(34, 24); ctx.lineTo(44, 38);
                ctx.moveTo(30, 28); ctx.lineTo(38, 42);
                ctx.stroke();

                // Body
                ctx.fillStyle = '#dc2626';
                ctx.beginPath();
                ctx.roundRect(14, 12, 20, 24, 8);
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Antennae
                ctx.beginPath();
                ctx.moveTo(18, 12); ctx.lineTo(10, 2);
                ctx.moveTo(30, 12); ctx.lineTo(38, 2);
                ctx.stroke();

                // Eyes
                ctx.fillStyle = '#facc15';
                ctx.fillRect(17, 18, 4, 4);
                ctx.fillRect(27, 18, 4, 4);

                canvas.refresh();
            }
        }

        // 3. Air: Merge Conflict Caution Barrier (70x34)
        if (!scene.textures.exists('obstacle_conflict')) {
            const canvas = scene.textures.createCanvas('obstacle_conflict', 70, 34);
            if (canvas) {
                const ctx = canvas.getContext();

                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.roundRect(2, 2, 66, 30, 4);
                ctx.fill();
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 3;
                ctx.stroke();

                // Diagonal caution stripes
                ctx.fillStyle = '#f59e0b';
                for (let x = 6; x < 64; x += 14) {
                    ctx.beginPath();
                    ctx.moveTo(x, 4); ctx.lineTo(x + 6, 4);
                    ctx.lineTo(x - 2, 28); ctx.lineTo(x - 8, 28);
                    ctx.fill();
                }

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 10px monospace';
                ctx.fillText('CONFLICT', 11, 20);

                canvas.refresh();
            }
        }
    }

    private static generateParticleTextures(scene: Phaser.Scene) {
        if (!scene.textures.exists('particle_sparkle')) {
            const canvas = scene.textures.createCanvas('particle_sparkle', 16, 16);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.moveTo(8, 0); ctx.lineTo(10, 6); ctx.lineTo(16, 8);
                ctx.lineTo(10, 10); ctx.lineTo(8, 16); ctx.lineTo(6, 10);
                ctx.lineTo(0, 8); ctx.lineTo(6, 6);
                ctx.closePath();
                ctx.fill();
                canvas.refresh();
            }
        }

        if (!scene.textures.exists('particle_dust')) {
            const canvas = scene.textures.createCanvas('particle_dust', 12, 12);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
                ctx.beginPath();
                ctx.arc(6, 6, 5, 0, Math.PI * 2);
                ctx.fill();
                canvas.refresh();
            }
        }
    }

    private static generateUiTextures(scene: Phaser.Scene) {
        if (!scene.textures.exists('btn_touch_jump')) {
            const canvas = scene.textures.createCanvas('btn_touch_jump', 90, 90);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
                ctx.beginPath();
                ctx.arc(45, 45, 42, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 4;
                ctx.stroke();

                ctx.fillStyle = '#38bdf8';
                ctx.beginPath();
                ctx.moveTo(45, 22); ctx.lineTo(64, 44); ctx.lineTo(52, 44);
                ctx.lineTo(52, 64); ctx.lineTo(38, 64); ctx.lineTo(38, 44);
                ctx.lineTo(26, 44);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 12px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('JUMP', 45, 78);
                canvas.refresh();
            }
        }

        if (!scene.textures.exists('btn_touch_slide')) {
            const canvas = scene.textures.createCanvas('btn_touch_slide', 90, 90);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
                ctx.beginPath();
                ctx.arc(45, 45, 42, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 4;
                ctx.stroke();

                ctx.fillStyle = '#f59e0b';
                ctx.beginPath();
                ctx.moveTo(45, 62); ctx.lineTo(64, 40); ctx.lineTo(52, 40);
                ctx.lineTo(52, 20); ctx.lineTo(38, 20); ctx.lineTo(38, 40);
                ctx.lineTo(26, 40);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 12px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('SLIDE', 45, 78);
                canvas.refresh();
            }
        }
    }
}
