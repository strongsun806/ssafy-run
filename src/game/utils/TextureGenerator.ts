import * as Phaser from 'phaser';
import { SkinManager } from './SkinManager';

export class TextureGenerator {
    public static generateAll(scene: Phaser.Scene) {
        this.generateAllPlayerSkins(scene);
        this.generateStageTextures(scene);
        this.generateItemTextures(scene);
        this.generateObstacleTextures(scene);
        this.generateParticleTextures(scene);
        this.generateUiTextures(scene);
        this.generateBossTextures(scene);
    }

    private static generateAllPlayerSkins(scene: Phaser.Scene) {
        SkinManager.SKINS.forEach(skin => {
            // Run 1-4
            for (let f = 1; f <= 4; f++) {
                const key = `player_${skin.id}_run_${f}`;
                if (!scene.textures.exists(key)) {
                    const canvas = scene.textures.createCanvas(key, 64, 80);
                    if (canvas) {
                        const ctx = canvas.getContext();
                        this.drawTrainee(ctx, f, skin);
                        canvas.refresh();
                    }
                }
            }

            // Jump
            const jumpKey = `player_${skin.id}_jump`;
            if (!scene.textures.exists(jumpKey)) {
                const canvas = scene.textures.createCanvas(jumpKey, 64, 80);
                if (canvas) {
                    const ctx = canvas.getContext();
                    this.drawTraineeJump(ctx, skin);
                    canvas.refresh();
                }
            }

            // Slide
            const slideKey = `player_${skin.id}_slide`;
            if (!scene.textures.exists(slideKey)) {
                const canvas = scene.textures.createCanvas(slideKey, 80, 48);
                if (canvas) {
                    const ctx = canvas.getContext();
                    this.drawTraineeSlide(ctx, skin);
                    canvas.refresh();
                }
            }
        });
    }

    private static drawTrainee(ctx: CanvasRenderingContext2D, frame: number, skin: typeof SkinManager.SKINS[0]) {
        ctx.clearRect(0, 0, 64, 80);

        const bounce = (frame === 1 || frame === 3) ? -1.5 : 0;
        const cy = 38 + bounce;

        // 1. Calm Scarf (Minimal wave, no bright white core strobe)
        const wave = (frame === 1 || frame === 3) ? 1.5 : -1.5;
        ctx.save();
        ctx.strokeStyle = skin.scarfColor || skin.color;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(26, cy - 12);
        ctx.quadraticCurveTo(14, cy - 14 + wave, 6, cy - 9 - wave);
        ctx.stroke();
        ctx.restore();

        // 2. Backpack
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(14, cy - 13, 12, 21, 4);
        ctx.fill();

        // 3. Left Arm (back)
        ctx.fillStyle = skin.hoodieColor;
        ctx.beginPath();
        if (frame === 1 || frame === 2) {
            ctx.ellipse(22, cy - 2, 6, 12, -0.4, 0, Math.PI * 2);
        } else {
            ctx.ellipse(38, cy - 2, 6, 12, 0.4, 0, Math.PI * 2);
        }
        ctx.fill();

        // 4. Legs & Sneakers
        ctx.fillStyle = skin.pantsColor;
        if (frame === 1) {
            ctx.fillRect(32, cy + 12, 8, 16);
            ctx.fillStyle = skin.sneakerColor;
            ctx.fillRect(33, cy + 27, 14, 7);

            ctx.fillStyle = skin.pantsColor;
            ctx.fillRect(20, cy + 10, 8, 14);
            ctx.fillStyle = skin.sneakerColor;
            ctx.fillRect(15, cy + 23, 13, 7);
        } else if (frame === 2) {
            ctx.fillRect(28, cy + 12, 8, 18);
            ctx.fillStyle = skin.sneakerColor;
            ctx.fillRect(28, cy + 29, 14, 7);

            ctx.fillStyle = skin.pantsColor;
            ctx.fillRect(23, cy + 10, 8, 16);
            ctx.fillStyle = skin.sneakerColor;
            ctx.fillRect(21, cy + 25, 13, 7);
        } else if (frame === 3) {
            ctx.fillRect(20, cy + 12, 8, 16);
            ctx.fillStyle = skin.sneakerColor;
            ctx.fillRect(15, cy + 27, 14, 7);

            ctx.fillStyle = skin.pantsColor;
            ctx.fillRect(32, cy + 10, 8, 14);
            ctx.fillStyle = skin.sneakerColor;
            ctx.fillRect(34, cy + 23, 13, 7);
        } else {
            ctx.fillRect(26, cy + 12, 8, 18);
            ctx.fillStyle = skin.sneakerColor;
            ctx.fillRect(26, cy + 29, 14, 7);

            ctx.fillStyle = skin.pantsColor;
            ctx.fillRect(22, cy + 10, 8, 16);
            ctx.fillStyle = skin.sneakerColor;
            ctx.fillRect(19, cy + 25, 13, 7);
        }

        // 5. Torso Jacket
        ctx.fillStyle = skin.hoodieColor;
        ctx.beginPath();
        ctx.roundRect(22, cy - 14, 22, 28, 6);
        ctx.fill();
        ctx.strokeStyle = skin.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Lanyard & Pass
        ctx.strokeStyle = skin.badgeColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(27, cy - 12);
        ctx.lineTo(34, cy + 3);
        ctx.lineTo(40, cy - 12);
        ctx.stroke();

        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(31, cy + 3, 8, 10);
        ctx.fillStyle = skin.color;
        ctx.fillRect(32, cy + 5, 6, 4);

        // 6. Head
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(34, cy - 23, 11.5, 0, Math.PI * 2);
        ctx.fill();

        // 7. Hair & Headgear
        if (skin.id === 'gold_master') {
            ctx.fillStyle = '#eab308';
            ctx.beginPath();
            ctx.moveTo(25, cy - 29);
            ctx.lineTo(28, cy - 38);
            ctx.lineTo(34, cy - 33);
            ctx.lineTo(40, cy - 38);
            ctx.lineTo(43, cy - 29);
            ctx.closePath();
            ctx.fill();
        } else if (skin.id === 'panda_pajama') {
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(25, cy - 34, 5, 0, Math.PI * 2);
            ctx.arc(43, cy - 34, 5, 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'cyber_agent') {
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(33, cy - 25, 12.5, Math.PI * 0.85, Math.PI * 2.15);
            ctx.lineTo(20, cy - 30);
            ctx.fill();

            ctx.fillStyle = '#0284c7';
            ctx.fillRect(33, cy - 27, 13, 5);
        } else {
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(33, cy - 25, 12.5, Math.PI * 0.85, Math.PI * 2.15);
            ctx.lineTo(46, cy - 25);
            ctx.lineTo(36, cy - 22);
            ctx.lineTo(19, cy - 28);
            ctx.fill();
        }

        // 8. Eye
        if (skin.id !== 'cyber_agent') {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(37, cy - 25, 3.5, 4);
        }

        // 9. Front Arm
        ctx.fillStyle = skin.hoodieColor;
        ctx.beginPath();
        if (frame === 1 || frame === 2) {
            ctx.ellipse(38, cy - 1, 6, 12, 0.45, 0, Math.PI * 2);
        } else {
            ctx.ellipse(24, cy - 1, 6, 12, -0.45, 0, Math.PI * 2);
        }
        ctx.fill();
    }

    private static drawTraineeJump(ctx: CanvasRenderingContext2D, skin: typeof SkinManager.SKINS[0]) {
        ctx.clearRect(0, 0, 64, 80);
        const cy = 34;

        ctx.save();
        ctx.strokeStyle = skin.scarfColor || skin.color;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(25, cy - 10);
        ctx.quadraticCurveTo(12, cy, 6, cy + 12);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(14, cy - 12, 12, 21, 4);
        ctx.fill();

        // Tucked Legs
        ctx.fillStyle = skin.pantsColor;
        ctx.fillRect(20, cy + 12, 16, 8);
        ctx.fillRect(28, cy + 18, 14, 8);
        ctx.fillStyle = skin.sneakerColor;
        ctx.fillRect(38, cy + 22, 13, 7);
        ctx.fillRect(20, cy + 18, 13, 7);

        // Torso
        ctx.fillStyle = skin.hoodieColor;
        ctx.beginPath();
        ctx.roundRect(22, cy - 14, 22, 28, 6);
        ctx.fill();
        ctx.strokeStyle = skin.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.strokeStyle = skin.badgeColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(27, cy - 12);
        ctx.lineTo(36, cy + 2);
        ctx.lineTo(41, cy - 12);
        ctx.stroke();

        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(34, cy + 2, 8, 10);

        // Head
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(34, cy - 23, 11.5, 0, Math.PI * 2);
        ctx.fill();

        if (skin.id === 'gold_master') {
            ctx.fillStyle = '#eab308';
            ctx.beginPath();
            ctx.moveTo(25, cy - 28);
            ctx.lineTo(28, cy - 38);
            ctx.lineTo(34, cy - 32);
            ctx.lineTo(40, cy - 38);
            ctx.lineTo(43, cy - 28);
            ctx.closePath();
            ctx.fill();
        } else if (skin.id === 'cyber_agent') {
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(33, cy - 25, 12.5, Math.PI * 0.8, Math.PI * 2.2);
            ctx.fill();
            ctx.fillStyle = '#0284c7';
            ctx.fillRect(34, cy - 27, 13, 5);
        } else {
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(33, cy - 25, 12.5, Math.PI * 0.8, Math.PI * 2.2);
            ctx.lineTo(45, cy - 28);
            ctx.fill();
        }

        if (skin.id !== 'cyber_agent') {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(37, cy - 25, 3.5, 4);
        }

        ctx.fillStyle = skin.hoodieColor;
        ctx.beginPath();
        ctx.ellipse(38, cy - 9, 6, 12, 0.8, 0, Math.PI * 2);
        ctx.fill();
    }

    private static drawTraineeSlide(ctx: CanvasRenderingContext2D, skin: typeof SkinManager.SKINS[0]) {
        ctx.clearRect(0, 0, 80, 48);

        ctx.fillStyle = skin.pantsColor;
        ctx.fillRect(12, 24, 28, 10);
        ctx.fillStyle = skin.sneakerColor;
        ctx.fillRect(6, 26, 15, 8);

        ctx.fillStyle = skin.hoodieColor;
        ctx.beginPath();
        ctx.roundRect(32, 16, 26, 18, 5);
        ctx.fill();
        ctx.strokeStyle = skin.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(62, 22, 10.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(60, 20, 11.5, Math.PI * 0.9, Math.PI * 2.1);
        ctx.lineTo(46, 15);
        ctx.fill();

        if (skin.id === 'cyber_agent') {
            ctx.fillStyle = '#0284c7';
            ctx.fillRect(60, 18, 12, 5);
        } else {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(64, 20, 3.5, 3.5);
        }

        ctx.fillStyle = skin.hoodieColor;
        ctx.fillRect(44, 28, 20, 6);
    }

    private static generateStageTextures(scene: Phaser.Scene) {
        // --- Companion AI Bit-Drone Sprite (Calm, clean design) ---
        if (!scene.textures.exists('companion_drone')) {
            const canvas = scene.textures.createCanvas('companion_drone', 36, 36);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#1e293b';
                ctx.beginPath();
                ctx.arc(18, 18, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                ctx.fillStyle = '#38bdf8';
                ctx.fillRect(19, 15, 5, 3);
                canvas.refresh();
            }
        }

        // --- EYE-COMFORT CALM BACKGROUNDS (Zero window grids, zero neon text signboards, zero flashing bars) ---
        // STAGE 1: Soft Dawn Skyline Silhouette
        if (!scene.textures.exists('bg_s1_far')) {
            const canvas = scene.textures.createCanvas('bg_s1_far', 1280, 400);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#0d1526';
                const hills = [
                    { x: 0, w: 320, h: 160 }, { x: 280, w: 360, h: 210 },
                    { x: 600, w: 340, h: 175 }, { x: 900, w: 380, h: 195 }
                ];
                hills.forEach(b => {
                    ctx.beginPath();
                    ctx.roundRect(b.x, 400 - b.h, b.w, b.h + 20, 16);
                    ctx.fill();
                });
                canvas.refresh();
            }
        }
        if (!scene.textures.exists('bg_s1_near')) {
            const canvas = scene.textures.createCanvas('bg_s1_near', 1280, 280);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#111c30';
                const silhouettes = [
                    { x: 20, w: 260, h: 130 }, { x: 340, w: 290, h: 150 },
                    { x: 690, w: 250, h: 120 }, { x: 990, w: 270, h: 140 }
                ];
                silhouettes.forEach(b => {
                    ctx.beginPath();
                    ctx.roundRect(b.x, 280 - b.h, b.w, b.h + 20, 12);
                    ctx.fill();
                });
                canvas.refresh();
            }
        }
        if (!scene.textures.exists('ground_s1')) {
            const canvas = scene.textures.createCanvas('ground_s1', 128, 75);
            if (canvas) {
                const ctx = canvas.getContext();
                const grad = ctx.createLinearGradient(0, 0, 0, 75);
                grad.addColorStop(0, '#1e293b');
                grad.addColorStop(1, '#0f172a');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, 128, 75);

                // Calm, matte green top edge
                ctx.fillStyle = '#15803d';
                ctx.fillRect(0, 0, 128, 6);
                ctx.fillStyle = '#22c55e';
                ctx.fillRect(0, 0, 128, 2.5);
                canvas.refresh();
            }
        }

        // STAGE 2: Calm Slate Interior Silhouette (No repeating vertical red/green bars)
        if (!scene.textures.exists('bg_s2_far')) {
            const canvas = scene.textures.createCanvas('bg_s2_far', 1280, 400);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#131624';
                ctx.fillRect(0, 120, 1280, 280);
                canvas.refresh();
            }
        }
        if (!scene.textures.exists('bg_s2_near')) {
            const canvas = scene.textures.createCanvas('bg_s2_near', 1280, 280);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#181c2e';
                const arches = [0, 420, 840];
                arches.forEach(x => {
                    ctx.beginPath();
                    ctx.roundRect(x + 40, 90, 320, 190, 16);
                    ctx.fill();
                });
                canvas.refresh();
            }
        }
        if (!scene.textures.exists('ground_s2')) {
            const canvas = scene.textures.createCanvas('ground_s2', 128, 75);
            if (canvas) {
                const ctx = canvas.getContext();
                const grad = ctx.createLinearGradient(0, 0, 0, 75);
                grad.addColorStop(0, '#27272a');
                grad.addColorStop(1, '#18181b');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, 128, 75);

                ctx.fillStyle = '#b45309';
                ctx.fillRect(0, 0, 128, 6);
                ctx.fillStyle = '#d97706';
                ctx.fillRect(0, 0, 128, 2.5);
                canvas.refresh();
            }
        }

        // STAGE 3: Calm Deep Navy Lounge (No blinking LEDs or grid lines)
        if (!scene.textures.exists('bg_s3_far')) {
            const canvas = scene.textures.createCanvas('bg_s3_far', 1280, 400);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#0b1528';
                ctx.fillRect(0, 100, 1280, 300);
                canvas.refresh();
            }
        }
        if (!scene.textures.exists('bg_s3_near')) {
            const canvas = scene.textures.createCanvas('bg_s3_near', 1280, 280);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#101e36';
                const panels = [0, 440, 880];
                panels.forEach(x => {
                    ctx.beginPath();
                    ctx.roundRect(x + 50, 80, 320, 200, 16);
                    ctx.fill();
                });
                canvas.refresh();
            }
        }
        if (!scene.textures.exists('ground_s3')) {
            const canvas = scene.textures.createCanvas('ground_s3', 128, 75);
            if (canvas) {
                const ctx = canvas.getContext();
                const grad = ctx.createLinearGradient(0, 0, 0, 75);
                grad.addColorStop(0, '#16243d');
                grad.addColorStop(1, '#0b1324');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, 128, 75);

                ctx.fillStyle = '#0369a1';
                ctx.fillRect(0, 0, 128, 6);
                ctx.fillStyle = '#0284c7';
                ctx.fillRect(0, 0, 128, 2.5);
                canvas.refresh();
            }
        }

        // --- Pit Cliff Caps & Calm Abyss ---
        if (!scene.textures.exists('ground_cliff_left')) {
            const canvas = scene.textures.createCanvas('ground_cliff_left', 28, 75);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(0, 0, 28, 75);
                ctx.fillStyle = '#22c55e';
                ctx.fillRect(0, 0, 28, 6);
                canvas.refresh();
            }
        }

        if (!scene.textures.exists('ground_cliff_right')) {
            const canvas = scene.textures.createCanvas('ground_cliff_right', 28, 75);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(0, 0, 28, 75);
                ctx.fillStyle = '#22c55e';
                ctx.fillRect(0, 0, 28, 6);
                canvas.refresh();
            }
        }

        // Pit Hazard (Calm dark gap without scrolling sawtooth spikes)
        if (!scene.textures.exists('pit_hazard')) {
            const canvas = scene.textures.createCanvas('pit_hazard', 160, 75);
            if (canvas) {
                const ctx = canvas.getContext();
                const grad = ctx.createLinearGradient(0, 0, 0, 75);
                grad.addColorStop(0, 'rgba(7, 11, 20, 0.4)');
                grad.addColorStop(1, '#050811');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, 160, 75);

                ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
                ctx.fillRect(0, 70, 160, 5);
                canvas.refresh();
            }
        }

        // Floating Platform Texture (160x28)
        if (!scene.textures.exists('platform_tex')) {
            const canvas = scene.textures.createCanvas('platform_tex', 160, 28);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#1e293b';
                ctx.beginPath();
                ctx.roundRect(0, 0, 160, 28, 6);
                ctx.fill();
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2;
                ctx.stroke();
                canvas.refresh();
            }
        }
    }

    private static generateItemTextures(scene: Phaser.Scene) {
        // 1. Commit Grass (36x36) - Clean matte icon without blurry outer glow
        if (!scene.textures.exists('jelly_grass')) {
            const canvas = scene.textures.createCanvas('jelly_grass', 36, 36);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#22c55e';
                ctx.beginPath();
                ctx.roundRect(5, 5, 26, 26, 7);
                ctx.fill();
                ctx.strokeStyle = '#dcfce7';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(18, 18, 4.5, 0, Math.PI * 2);
                ctx.stroke();
                canvas.refresh();
            }
        }

        // 2. Gold Coin (32x32)
        if (!scene.textures.exists('item_coin')) {
            const canvas = scene.textures.createCanvas('item_coin', 32, 32);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#eab308';
                ctx.beginPath();
                ctx.arc(16, 16, 11, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#fef08a';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                ctx.fillStyle = '#713f12';
                ctx.font = 'bold 13px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('S', 16, 21);
                canvas.refresh();
            }
        }

        // 3. Magnet Power-Up Item (36x36)
        if (!scene.textures.exists('item_magnet')) {
            const canvas = scene.textures.createCanvas('item_magnet', 36, 36);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.arc(18, 16, 12, Math.PI, 0, false);
                ctx.lineTo(30, 26);
                ctx.lineTo(23, 26);
                ctx.lineTo(23, 16);
                ctx.arc(18, 16, 5, 0, Math.PI, true);
                ctx.lineTo(13, 26);
                ctx.lineTo(6, 26);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = '#e2e8f0';
                ctx.fillRect(6, 22, 7, 5);
                ctx.fillRect(23, 22, 7, 5);
                canvas.refresh();
            }
        }

        // 4. SSAFY QR Code Phone (38x46)
        if (!scene.textures.exists('jelly_qr')) {
            const canvas = scene.textures.createCanvas('jelly_qr', 38, 46);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#1e293b';
                ctx.beginPath();
                ctx.roundRect(4, 4, 30, 38, 6);
                ctx.fill();
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.fillStyle = '#f8fafc';
                ctx.fillRect(8, 8, 22, 26);
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(10, 10, 6, 6);
                ctx.fillRect(22, 10, 6, 6);
                ctx.fillRect(10, 22, 6, 6);
                canvas.refresh();
            }
        }

        // 5. Iced Americano (36x44)
        if (!scene.textures.exists('item_coffee')) {
            const canvas = scene.textures.createCanvas('item_coffee', 36, 44);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#e2e8f0';
                ctx.beginPath();
                ctx.moveTo(6, 12); ctx.lineTo(10, 40); ctx.lineTo(26, 40); ctx.lineTo(30, 12);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = '#5c2d0c';
                ctx.beginPath();
                ctx.moveTo(8, 18); ctx.lineTo(11, 38); ctx.lineTo(25, 38); ctx.lineTo(28, 18);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(4, 9, 28, 4);
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(20, 1, 3, 14);
                canvas.refresh();
            }
        }

        // 6. Booster Drink (32x44)
        if (!scene.textures.exists('item_fever')) {
            const canvas = scene.textures.createCanvas('item_fever', 32, 44);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#eab308';
                ctx.beginPath();
                ctx.roundRect(5, 6, 22, 32, 4);
                ctx.fill();
                ctx.strokeStyle = '#fef08a';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.moveTo(17, 11); ctx.lineTo(11, 22); ctx.lineTo(16, 22);
                ctx.lineTo(14, 31); ctx.lineTo(21, 20); ctx.lineTo(16, 20);
                ctx.closePath();
                ctx.fill();
                canvas.refresh();
            }
        }

        // 7. SSAFY Rescue Drone (80x56)
        if (!scene.textures.exists('rescue_drone')) {
            const canvas = scene.textures.createCanvas('rescue_drone', 80, 56);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#475569';
                ctx.fillRect(6, 11, 22, 3);
                ctx.fillRect(52, 11, 22, 3);

                ctx.strokeStyle = '#64748b';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(16, 13); ctx.lineTo(30, 24);
                ctx.moveTo(64, 13); ctx.lineTo(50, 24);
                ctx.stroke();

                ctx.fillStyle = '#f1f5f9';
                ctx.beginPath();
                ctx.roundRect(24, 16, 32, 24, 8);
                ctx.fill();
                ctx.strokeStyle = '#0284c7';
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.fillStyle = '#0284c7';
                ctx.fillRect(26, 25, 28, 6);
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 8px sans-serif';
                ctx.fillText('SSAFY', 27, 30);
                canvas.refresh();
            }
        }
    }

    private static generateObstacleTextures(scene: Phaser.Scene) {
        // Ground 1: 500 Error Monitor
        if (!scene.textures.exists('obstacle_error')) {
            const canvas = scene.textures.createCanvas('obstacle_error', 52, 58);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#475569';
                ctx.fillRect(22, 44, 8, 10);
                ctx.fillRect(14, 52, 24, 5);

                ctx.fillStyle = '#1e293b';
                ctx.beginPath();
                ctx.roundRect(2, 4, 48, 40, 5);
                ctx.fill();
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 2.5;
                ctx.stroke();

                ctx.fillStyle = '#7f1d1d';
                ctx.fillRect(6, 8, 40, 32);
                ctx.fillStyle = '#fca5a5';
                ctx.font = 'bold 11px sans-serif';
                ctx.fillText('ERR 500', 7, 25);
                canvas.refresh();
            }
        }

        // Ground 2: Bug Robot
        if (!scene.textures.exists('obstacle_bug')) {
            const canvas = scene.textures.createCanvas('obstacle_bug', 48, 44);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.strokeStyle = '#991b1b';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(14, 24); ctx.lineTo(5, 37);
                ctx.moveTo(18, 28); ctx.lineTo(11, 41);
                ctx.moveTo(34, 24); ctx.lineTo(43, 37);
                ctx.moveTo(30, 28); ctx.lineTo(37, 41);
                ctx.stroke();

                ctx.fillStyle = '#dc2626';
                ctx.beginPath();
                ctx.roundRect(14, 12, 20, 24, 8);
                ctx.fill();
                ctx.strokeStyle = '#fca5a5';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                ctx.fillStyle = '#fef08a';
                ctx.fillRect(17, 18, 4, 4);
                ctx.fillRect(27, 18, 4, 4);
                canvas.refresh();
            }
        }

        // Air: Merge Conflict Caution Barrier (Solid calm card without optical-illusion diagonal stripes)
        if (!scene.textures.exists('obstacle_conflict')) {
            const canvas = scene.textures.createCanvas('obstacle_conflict', 70, 34);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#1e293b';
                ctx.beginPath();
                ctx.roundRect(2, 2, 66, 30, 6);
                ctx.fill();
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 2.5;
                ctx.stroke();

                ctx.fillStyle = '#78350f';
                ctx.fillRect(6, 6, 58, 22);

                ctx.fillStyle = '#fde68a';
                ctx.font = 'bold 11px monospace';
                ctx.fillText('CONFLICT', 10, 21);
                canvas.refresh();
            }
        }
    }

    private static generateParticleTextures(scene: Phaser.Scene) {
        if (!scene.textures.exists('particle_sparkle')) {
            const canvas = scene.textures.createCanvas('particle_sparkle', 12, 12);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = 'rgba(226, 232, 240, 0.7)';
                ctx.beginPath();
                ctx.arc(6, 6, 4, 0, Math.PI * 2);
                ctx.fill();
                canvas.refresh();
            }
        }

        if (!scene.textures.exists('particle_dust')) {
            const canvas = scene.textures.createCanvas('particle_dust', 10, 10);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
                ctx.beginPath();
                ctx.arc(5, 5, 3, 0, Math.PI * 2);
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
                ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
                ctx.beginPath();
                ctx.arc(45, 45, 42, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 3;
                ctx.stroke();

                ctx.fillStyle = '#38bdf8';
                ctx.beginPath();
                ctx.moveTo(45, 22); ctx.lineTo(64, 44); ctx.lineTo(52, 44);
                ctx.lineTo(52, 64); ctx.lineTo(38, 64); ctx.lineTo(38, 44);
                ctx.lineTo(26, 44);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = '#e2e8f0';
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
                ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
                ctx.beginPath();
                ctx.arc(45, 45, 42, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 3;
                ctx.stroke();

                ctx.fillStyle = '#f59e0b';
                ctx.beginPath();
                ctx.moveTo(45, 62); ctx.lineTo(64, 40); ctx.lineTo(52, 40);
                ctx.lineTo(52, 20); ctx.lineTo(38, 20); ctx.lineTo(38, 40);
                ctx.lineTo(26, 40);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = '#e2e8f0';
                ctx.font = 'bold 12px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('SLIDE', 45, 78);
                canvas.refresh();
            }
        }

        // 3. Stage Finish Gate (Clean, non-checkered arch)
        if (!scene.textures.exists('finish_gate')) {
            const canvas = scene.textures.createCanvas('finish_gate', 130, 210);
            if (canvas) {
                const ctx = canvas.getContext();

                ctx.fillStyle = '#1e293b';
                ctx.fillRect(10, 24, 20, 186);
                ctx.fillRect(100, 24, 20, 186);

                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.roundRect(0, 4, 130, 38, 8);
                ctx.fill();
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2.5;
                ctx.stroke();

                ctx.fillStyle = '#facc15';
                ctx.font = 'bold 15px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('FINISH', 65, 28);

                ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
                ctx.fillRect(30, 42, 70, 168);

                canvas.refresh();
            }
        }

        // 4. Star Gold Icon (32x32)
        if (!scene.textures.exists('icon_star_gold')) {
            const canvas = scene.textures.createCanvas('icon_star_gold', 32, 32);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#eab308';
                this.drawStar(ctx, 16, 16, 5, 14, 6);
                canvas.refresh();
            }
        }

        // 5. Star Empty Icon (32x32)
        if (!scene.textures.exists('icon_star_empty')) {
            const canvas = scene.textures.createCanvas('icon_star_empty', 32, 32);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#334155';
                this.drawStar(ctx, 16, 16, 5, 14, 6);
                canvas.refresh();
            }
        }

        // 6. Lock Icon (32x32)
        if (!scene.textures.exists('icon_lock')) {
            const canvas = scene.textures.createCanvas('icon_lock', 32, 32);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.strokeStyle = '#94a3b8';
                ctx.lineWidth = 3.5;
                ctx.beginPath();
                ctx.arc(16, 12, 6, Math.PI, 0);
                ctx.stroke();

                ctx.fillStyle = '#475569';
                ctx.beginPath();
                ctx.roundRect(8, 14, 16, 14, 4);
                ctx.fill();
                canvas.refresh();
            }
        }
    }

    private static generateBossTextures(scene: Phaser.Scene) {
        if (!scene.textures.exists('boss_iltassafy')) {
            const canvas = scene.textures.createCanvas('boss_iltassafy', 96, 96);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#1e293b';
                ctx.beginPath();
                ctx.arc(48, 48, 40, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2.5;
                ctx.stroke();

                ctx.fillStyle = '#f8fafc';
                ctx.beginPath();
                ctx.arc(48, 48, 18, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#0f172a';
                ctx.font = 'bold 22px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('8', 48, 49);
                canvas.refresh();
            }
        }

        if (!scene.textures.exists('boss_battlessafy')) {
            const canvas = scene.textures.createCanvas('boss_battlessafy', 124, 82);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#1e293b';
                ctx.beginPath();
                ctx.roundRect(16, 52, 96, 24, 10);
                ctx.fill();
                ctx.strokeStyle = '#475569';
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.fillStyle = '#334155';
                ctx.beginPath();
                ctx.roundRect(24, 28, 84, 26, 6);
                ctx.fill();
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.fillStyle = '#475569';
                ctx.fillRect(8, 18, 44, 8);
                canvas.refresh();
            }
        }

        if (!scene.textures.exists('boss_projectile_ball')) {
            const canvas = scene.textures.createCanvas('boss_projectile_ball', 36, 36);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#dc2626';
                ctx.beginPath();
                ctx.arc(18, 18, 13, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#fca5a5';
                ctx.lineWidth = 2;
                ctx.stroke();
                canvas.refresh();
            }
        }

        if (!scene.textures.exists('boss_projectile_shell')) {
            const canvas = scene.textures.createCanvas('boss_projectile_shell', 42, 24);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#e2e8f0';
                ctx.beginPath();
                ctx.roundRect(8, 5, 26, 14, 4);
                ctx.fill();
                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.moveTo(8, 5); ctx.lineTo(0, 12); ctx.lineTo(8, 19);
                ctx.closePath();
                ctx.fill();
                canvas.refresh();
            }
        }

        if (!scene.textures.exists('item_debug_patch')) {
            const canvas = scene.textures.createCanvas('item_debug_patch', 38, 38);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#7e22ce';
                ctx.beginPath();
                ctx.roundRect(7, 7, 24, 24, 6);
                ctx.fill();
                ctx.strokeStyle = '#e9d5ff';
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 12px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('</>', 19, 19);
                canvas.refresh();
            }
        }

        if (!scene.textures.exists('item_shield')) {
            const canvas = scene.textures.createCanvas('item_shield', 38, 38);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#0284c7';
                ctx.strokeStyle = '#bae6fd';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(7, 7, 24, 24, 8);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 13px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('S', 19, 19);
                canvas.refresh();
            }
        }

        // S-S-A-F-Y Bonus Alphabet Capsules (Calm matte tiles)
        const letters = ['S', 'S', 'A', 'F', 'Y'];
        const letterColors = ['#38bdf8', '#38bdf8', '#4ade80', '#eab308', '#a855f7'];
        letters.forEach((ch, idx) => {
            const key = `letter_${idx}`;
            if (!scene.textures.exists(key)) {
                const canvas = scene.textures.createCanvas(key, 36, 36);
                if (canvas) {
                    const ctx = canvas.getContext();
                    const col = letterColors[idx];
                    ctx.fillStyle = '#1e293b';
                    ctx.strokeStyle = col;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.roundRect(4, 4, 28, 28, 7);
                    ctx.fill();
                    ctx.stroke();

                    ctx.fillStyle = col;
                    ctx.font = 'bold 16px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(ch, 18, 19);
                    canvas.refresh();
                }
            }
        });
    }

    private static drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
        let rot = (Math.PI / 2) * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }
}
