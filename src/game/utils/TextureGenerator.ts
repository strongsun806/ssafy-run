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

        const bounce = (frame === 1 || frame === 3) ? -2 : 0;
        const cy = 38 + bounce;

        // 1. Dynamic Flowing Cyber Scarf / Energy Tail (Behind character)
        const wave = Math.sin(frame * 1.6) * 4;
        ctx.save();
        ctx.strokeStyle = skin.scarfColor || skin.color;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(26, cy - 12);
        ctx.quadraticCurveTo(12, cy - 16 + wave, 3, cy - 8 - wave);
        ctx.stroke();

        // Scarf inner neon highlight
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(26, cy - 12);
        ctx.quadraticCurveTo(12, cy - 16 + wave, 5, cy - 8 - wave);
        ctx.stroke();
        ctx.restore();

        // 2. Techwear Jetpack / Cyber Backpack
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(13, cy - 13, 13, 22, 4);
        ctx.fill();
        ctx.strokeStyle = skin.color;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Thruster core glow on backpack
        ctx.fillStyle = skin.scarfColor || '#38bdf8';
        ctx.beginPath();
        ctx.arc(16, cy - 2, 3, 0, Math.PI * 2);
        ctx.fill();

        // 3. Left Arm (back)
        ctx.fillStyle = skin.hoodieColor;
        ctx.beginPath();
        if (frame === 1 || frame === 2) {
            ctx.ellipse(22, cy - 2, 6, 12, -0.45, 0, Math.PI * 2);
        } else {
            ctx.ellipse(38, cy - 2, 6, 12, 0.45, 0, Math.PI * 2);
        }
        ctx.fill();

        // 4. Legs & Hover-Sole Sneakers
        ctx.fillStyle = skin.pantsColor;
        if (frame === 1) {
            ctx.fillRect(32, cy + 12, 8, 16);
            ctx.fillStyle = skin.sneakerColor;
            ctx.fillRect(33, cy + 27, 15, 8);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(33, cy + 33, 15, 2.5); // Glowing Hover Sole

            ctx.fillStyle = skin.pantsColor;
            ctx.fillRect(20, cy + 10, 8, 14);
            ctx.fillStyle = skin.sneakerColor;
            ctx.fillRect(15, cy + 23, 13, 8);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(15, cy + 29, 13, 2.5);
        } else if (frame === 2) {
            ctx.fillRect(28, cy + 12, 8, 18);
            ctx.fillStyle = skin.sneakerColor;
            ctx.fillRect(28, cy + 29, 14, 8);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(28, cy + 35, 14, 2.5);

            ctx.fillStyle = skin.pantsColor;
            ctx.fillRect(23, cy + 10, 8, 16);
            ctx.fillStyle = skin.sneakerColor;
            ctx.fillRect(21, cy + 25, 13, 8);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(21, cy + 31, 13, 2.5);
        } else if (frame === 3) {
            ctx.fillRect(20, cy + 12, 8, 16);
            ctx.fillStyle = skin.sneakerColor;
            ctx.fillRect(15, cy + 27, 15, 8);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(15, cy + 33, 15, 2.5);

            ctx.fillStyle = skin.pantsColor;
            ctx.fillRect(32, cy + 10, 8, 14);
            ctx.fillStyle = skin.sneakerColor;
            ctx.fillRect(34, cy + 23, 13, 8);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(34, cy + 29, 13, 2.5);
        } else {
            ctx.fillRect(26, cy + 12, 8, 18);
            ctx.fillStyle = skin.sneakerColor;
            ctx.fillRect(26, cy + 29, 14, 8);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(26, cy + 35, 14, 2.5);

            ctx.fillStyle = skin.pantsColor;
            ctx.fillRect(22, cy + 10, 8, 16);
            ctx.fillStyle = skin.sneakerColor;
            ctx.fillRect(19, cy + 25, 13, 8);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(19, cy + 31, 13, 2.5);
        }

        // 5. Techwear Torso Jacket
        ctx.fillStyle = skin.hoodieColor;
        ctx.beginPath();
        ctx.roundRect(22, cy - 14, 22, 28, 6);
        ctx.fill();
        ctx.strokeStyle = skin.color;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Holographic Lanyard & SSAFY Pass
        ctx.strokeStyle = skin.badgeColor;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(27, cy - 12);
        ctx.lineTo(34, cy + 3);
        ctx.lineTo(40, cy - 12);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(31, cy + 3, 8, 10);
        ctx.fillStyle = skin.color;
        ctx.fillRect(32, cy + 5, 6, 4);

        // 6. Expressive Anime Head
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(34, cy - 23, 11.5, 0, Math.PI * 2);
        ctx.fill();

        // Subtle anime cheek blush
        ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
        ctx.beginPath();
        ctx.arc(40, cy - 20, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // 7. Hair & Signature Headgear
        if (skin.id === 'gold_master') {
            // Radiant Floating Halo + Crown
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(34, cy - 41, 11, 3, 0, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.moveTo(25, cy - 29);
            ctx.lineTo(28, cy - 39);
            ctx.lineTo(34, cy - 33);
            ctx.lineTo(40, cy - 39);
            ctx.lineTo(43, cy - 29);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(33, cy - 32, 3, 3);
        } else if (skin.id === 'panda_pajama') {
            // 3D Panda Ears & Hood
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(25, cy - 34, 5.5, 0, Math.PI * 2);
            ctx.arc(43, cy - 34, 5.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(25, cy - 34, 2.5, 0, Math.PI * 2);
            ctx.arc(43, cy - 34, 2.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'cyber_agent') {
            // Spiky Hair + Glowing Tactical Visor
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(33, cy - 25, 12.5, Math.PI * 0.85, Math.PI * 2.15);
            ctx.lineTo(20, cy - 30);
            ctx.fill();

            ctx.fillStyle = '#06b6d4';
            ctx.fillRect(33, cy - 27, 14, 6);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(36, cy - 26, 8, 2);
        } else {
            // Dynamic Windswept Anime Hair + Cyber Headset
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(33, cy - 25, 12.5, Math.PI * 0.85, Math.PI * 2.15);
            ctx.lineTo(46, cy - 25);
            ctx.lineTo(36, cy - 22);
            ctx.lineTo(19, cy - 28);
            ctx.fill();

            // Cyber Headset Earpiece
            ctx.fillStyle = skin.color;
            ctx.beginPath();
            ctx.arc(29, cy - 23, 3.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // 8. Anime Eye with Specular Catchlight
        if (skin.id !== 'cyber_agent') {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(37, cy - 25, 4, 4.5);
            ctx.fillStyle = skin.color;
            ctx.fillRect(38, cy - 24, 2.5, 3);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(37.5, cy - 25, 1.5, 1.5); // Eye sparkle
        }

        // 9. Front Arm
        ctx.fillStyle = skin.hoodieColor;
        ctx.beginPath();
        if (frame === 1 || frame === 2) {
            ctx.ellipse(38, cy - 1, 6, 12, 0.5, 0, Math.PI * 2);
        } else {
            ctx.ellipse(24, cy - 1, 6, 12, -0.5, 0, Math.PI * 2);
        }
        ctx.fill();
    }

    private static drawTraineeJump(ctx: CanvasRenderingContext2D, skin: typeof SkinManager.SKINS[0]) {
        ctx.clearRect(0, 0, 64, 80);
        const cy = 34;

        // Flowing Scarf Trailing Downward on Jump
        ctx.save();
        ctx.strokeStyle = skin.scarfColor || skin.color;
        ctx.lineWidth = 6.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(25, cy - 10);
        ctx.quadraticCurveTo(10, cy + 2, 4, cy + 16);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // Jetpack with booster flame
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(13, cy - 12, 13, 22, 4);
        ctx.fill();

        // Booster Jet Flame
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(15, cy + 10);
        ctx.lineTo(19, cy + 24);
        ctx.lineTo(23, cy + 10);
        ctx.fill();

        // Tucked Legs
        ctx.fillStyle = skin.pantsColor;
        ctx.fillRect(20, cy + 12, 16, 8);
        ctx.fillRect(28, cy + 18, 14, 8);
        ctx.fillStyle = skin.sneakerColor;
        ctx.fillRect(38, cy + 22, 13, 8);
        ctx.fillRect(20, cy + 18, 13, 8);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(38, cy + 28, 13, 2.5);

        // Torso
        ctx.fillStyle = skin.hoodieColor;
        ctx.beginPath();
        ctx.roundRect(22, cy - 14, 22, 28, 6);
        ctx.fill();
        ctx.strokeStyle = skin.color;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        ctx.strokeStyle = skin.badgeColor;
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
        ctx.arc(34, cy - 23, 11.5, 0, Math.PI * 2);
        ctx.fill();

        if (skin.id === 'gold_master') {
            ctx.fillStyle = '#facc15';
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
            ctx.fillStyle = '#06b6d4';
            ctx.fillRect(34, cy - 27, 14, 6);
        } else {
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(33, cy - 25, 12.5, Math.PI * 0.8, Math.PI * 2.2);
            ctx.lineTo(45, cy - 28);
            ctx.fill();
        }

        if (skin.id !== 'cyber_agent') {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(37, cy - 25, 4, 4.5);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(37.5, cy - 25, 1.5, 1.5);
        }

        // Heroic Raised Arm
        ctx.fillStyle = skin.hoodieColor;
        ctx.beginPath();
        ctx.ellipse(38, cy - 9, 6, 12, 0.8, 0, Math.PI * 2);
        ctx.fill();
    }

    private static drawTraineeSlide(ctx: CanvasRenderingContext2D, skin: typeof SkinManager.SKINS[0]) {
        ctx.clearRect(0, 0, 80, 48);

        // Friction Sparks & Neon Trail
        ctx.fillStyle = skin.scarfColor || '#38bdf8';
        ctx.fillRect(2, 18, 28, 5);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(2, 42, 24, 3);
        ctx.fillStyle = skin.sneakerColor;
        ctx.fillRect(10, 44, 28, 2);

        ctx.fillStyle = skin.pantsColor;
        ctx.fillRect(12, 24, 28, 10);
        ctx.fillStyle = skin.sneakerColor;
        ctx.fillRect(6, 26, 15, 8);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(6, 32, 15, 2);

        ctx.fillStyle = skin.hoodieColor;
        ctx.beginPath();
        ctx.roundRect(32, 16, 26, 18, 5);
        ctx.fill();
        ctx.strokeStyle = skin.color;
        ctx.lineWidth = 1.8;
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
            ctx.fillStyle = '#06b6d4';
            ctx.fillRect(60, 18, 12, 5);
        } else {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(64, 20, 3.5, 3.5);
        }

        ctx.fillStyle = skin.hoodieColor;
        ctx.fillRect(44, 28, 20, 6);
    }

    private static generateStageTextures(scene: Phaser.Scene) {
        // --- Companion AI Bit-Drone Sprite ---
        if (!scene.textures.exists('companion_drone')) {
            const canvas = scene.textures.createCanvas('companion_drone', 40, 40);
            if (canvas) {
                const ctx = canvas.getContext();
                // Outer hovering ring
                ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(20, 22, 16, 6, -0.2, 0, Math.PI * 2);
                ctx.stroke();

                // Core spherical drone body
                const grad = ctx.createRadialGradient(18, 16, 2, 20, 20, 12);
                grad.addColorStop(0, '#38bdf8');
                grad.addColorStop(0.5, '#0284c7');
                grad.addColorStop(1, '#0f172a');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(20, 18, 11, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#bae6fd';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Cute glowing visor eye
                ctx.fillStyle = '#fef08a';
                ctx.fillRect(21, 15, 6, 4);

                // Antenna
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(20, 7);
                ctx.lineTo(20, 2);
                ctx.stroke();
                ctx.fillStyle = '#4ade80';
                ctx.beginPath();
                ctx.arc(20, 2, 2, 0, Math.PI * 2);
                ctx.fill();

                canvas.refresh();
            }
        }

        // --- STAGE 1: 네오 테헤란로 출근길 (Neo-Seoul Cyber Dawn) ---
        if (!scene.textures.exists('bg_s1_far')) {
            const canvas = scene.textures.createCanvas('bg_s1_far', 1280, 400);
            if (canvas) {
                const ctx = canvas.getContext();

                // Giant Synthwave Cyber Moon in background
                const moonGrad = ctx.createLinearGradient(920, 30, 920, 190);
                moonGrad.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
                moonGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.22)');
                moonGrad.addColorStop(1, 'rgba(236, 72, 153, 0.05)');
                ctx.fillStyle = moonGrad;
                ctx.beginPath();
                ctx.arc(920, 110, 75, 0, Math.PI * 2);
                ctx.fill();

                const buildings = [
                    { x: 0, w: 120, h: 220 }, { x: 130, w: 140, h: 290 },
                    { x: 290, w: 95, h: 190 }, { x: 400, w: 165, h: 325 },
                    { x: 580, w: 130, h: 250 }, { x: 730, w: 115, h: 280 },
                    { x: 860, w: 140, h: 225 }, { x: 1020, w: 155, h: 310 },
                    { x: 1190, w: 90, h: 210 }
                ];
                buildings.forEach((b, idx) => {
                    ctx.fillStyle = '#0f172a';
                    ctx.fillRect(b.x, 400 - b.h, b.w, b.h);
                    // Neon roof trim
                    ctx.fillStyle = idx % 2 === 0 ? 'rgba(56, 189, 248, 0.45)' : 'rgba(168, 85, 247, 0.45)';
                    ctx.fillRect(b.x, 400 - b.h, b.w, 3);

                    // Illuminated skyscraper windows
                    ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
                    for (let wy = 400 - b.h + 18; wy < 380; wy += 22) {
                        for (let wx = b.x + 14; wx < b.x + b.w - 18; wx += 20) {
                            if ((wx + wy) % 3 !== 0) {
                                ctx.fillRect(wx, wy, 8, 10);
                            }
                        }
                    }
                });
                canvas.refresh();
            }
        }
        if (!scene.textures.exists('bg_s1_near')) {
            const canvas = scene.textures.createCanvas('bg_s1_near', 1280, 280);
            if (canvas) {
                const ctx = canvas.getContext();
                const blocks = [
                    { x: 40, w: 190, h: 230, label: 'SSAFY CAMPUS', color: '#38bdf8' },
                    { x: 260, w: 150, h: 180, label: '08:59 AM', color: '#facc15' },
                    { x: 440, w: 230, h: 250, label: 'CYBER SPRINT', color: '#a855f7' },
                    { x: 700, w: 160, h: 200, label: '200 OK', color: '#4ade80' },
                    { x: 890, w: 210, h: 230, label: '1 DAY 1 COMMIT', color: '#38bdf8' },
                    { x: 1120, w: 150, h: 210, label: 'DEV LAB', color: '#f43f5e' }
                ];
                blocks.forEach(b => {
                    ctx.fillStyle = '#172033';
                    ctx.fillRect(b.x, 280 - b.h, b.w, b.h);
                    ctx.strokeStyle = b.color;
                    ctx.lineWidth = 1.5;
                    ctx.strokeRect(b.x, 280 - b.h, b.w, 38);

                    // Glowing holographic signboard
                    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
                    ctx.fillRect(b.x + 8, 280 - b.h + 6, b.w - 16, 26);
                    ctx.fillStyle = b.color;
                    ctx.font = 'bold 14px sans-serif';
                    ctx.fillText(b.label, b.x + 18, 280 - b.h + 24);
                });
                canvas.refresh();
            }
        }
        if (!scene.textures.exists('ground_s1')) {
            const canvas = scene.textures.createCanvas('ground_s1', 128, 75);
            if (canvas) {
                const ctx = canvas.getContext();
                // 1. Smooth gradient foundation (Calm, non-dizzying)
                const grad = ctx.createLinearGradient(0, 0, 0, 75);
                grad.addColorStop(0, '#1e293b');
                grad.addColorStop(0.3, '#172033');
                grad.addColorStop(1, '#0a0f1d');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, 128, 75);

                // 2. Soft horizontal panel seam (Very subtle, low contrast)
                ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
                ctx.fillRect(0, 32, 128, 1);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
                ctx.fillRect(0, 33, 128, 1);

                // 3. Crisp vibrant lawn border on top
                ctx.fillStyle = '#16a34a';
                ctx.fillRect(0, 0, 128, 8);
                ctx.fillStyle = '#22c55e';
                ctx.fillRect(0, 0, 128, 4);
                ctx.fillStyle = '#86efac';
                ctx.fillRect(0, 0, 128, 1.5);

                canvas.refresh();
            }
        }

        // --- STAGE 2: 만원 엘리베이터 & 비상계단 지옥 (Emergency Stairs) ---
        if (!scene.textures.exists('bg_s2_far')) {
            const canvas = scene.textures.createCanvas('bg_s2_far', 1280, 400);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#18121e';
                ctx.fillRect(0, 0, 1280, 400);
                // Shaft structures & caution stripes
                ctx.strokeStyle = '#450a0a';
                ctx.lineWidth = 4;
                for (let x = 60; x < 1280; x += 180) {
                    ctx.strokeRect(x, 40, 120, 360);
                }
                canvas.refresh();
            }
        }
        if (!scene.textures.exists('bg_s2_near')) {
            const canvas = scene.textures.createCanvas('bg_s2_near', 1280, 280);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#271724';
                // Elevator doors & emergency exit green signs
                for (let x = 80; x < 1280; x += 220) {
                    ctx.fillRect(x, 40, 140, 240);
                    // Green Exit Sign
                    ctx.fillStyle = '#16a34a';
                    ctx.fillRect(x + 35, 55, 70, 26);
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 12px sans-serif';
                    ctx.fillText('EXIT 비상구', x + 40, 72);
                    ctx.fillStyle = '#271724';
                }
                canvas.refresh();
            }
        }
        if (!scene.textures.exists('ground_s2')) {
            const canvas = scene.textures.createCanvas('ground_s2', 128, 75);
            if (canvas) {
                const ctx = canvas.getContext();
                // 1. Smooth dark slate-concrete gradient
                const grad = ctx.createLinearGradient(0, 0, 0, 75);
                grad.addColorStop(0, '#262626');
                grad.addColorStop(0.35, '#1c1917');
                grad.addColorStop(1, '#0c0a09');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, 128, 75);

                // 2. Subtle horizontal metal expansion strip
                ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.fillRect(0, 34, 128, 1);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(0, 35, 128, 1);

                // 3. Clean solid amber caution edge on top (Calm, non-strobing)
                ctx.fillStyle = '#b45309';
                ctx.fillRect(0, 0, 128, 8);
                ctx.fillStyle = '#f59e0b';
                ctx.fillRect(0, 0, 128, 4);
                ctx.fillStyle = '#fef08a';
                ctx.fillRect(0, 0, 128, 1.5);

                canvas.refresh();
            }
        }

        // --- STAGE 3: 11층 미래 코딩 랩 (Cyber Server Room) ---
        if (!scene.textures.exists('bg_s3_far')) {
            const canvas = scene.textures.createCanvas('bg_s3_far', 1280, 400);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#061325';
                ctx.fillRect(0, 0, 1280, 400);
                // Glowing cyber circuit grid
                ctx.strokeStyle = '#0284c7';
                ctx.lineWidth = 1.5;
                for (let y = 100; y < 400; y += 45) {
                    ctx.beginPath();
                    ctx.moveTo(0, y); ctx.lineTo(1280, y);
                    ctx.stroke();
                }
                canvas.refresh();
            }
        }
        if (!scene.textures.exists('bg_s3_near')) {
            const canvas = scene.textures.createCanvas('bg_s3_near', 1280, 280);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#0c2240';
                // Server racks with blinking LED lights
                for (let x = 60; x < 1280; x += 190) {
                    ctx.fillRect(x, 20, 130, 260);
                    ctx.fillStyle = '#38bdf8';
                    ctx.font = 'bold 13px monospace';
                    ctx.fillText('SERVER #11F', x + 18, 50);
                    // Blinking LEDs
                    for (let ly = 75; ly < 250; ly += 24) {
                        ctx.fillStyle = (ly % 48 === 0) ? '#22c55e' : '#38bdf8';
                        ctx.fillRect(x + 20, ly, 6, 6);
                        ctx.fillRect(x + 35, ly, 6, 6);
                        ctx.fillRect(x + 50, ly, 6, 6);
                    }
                    ctx.fillStyle = '#0c2240';
                }
                canvas.refresh();
            }
        }
        if (!scene.textures.exists('ground_s3')) {
            const canvas = scene.textures.createCanvas('ground_s3', 128, 75);
            if (canvas) {
                const ctx = canvas.getContext();
                // 1. Futuristic cyber dark blue gradient
                const grad = ctx.createLinearGradient(0, 0, 0, 75);
                grad.addColorStop(0, '#0c1e36');
                grad.addColorStop(0.4, '#061324');
                grad.addColorStop(1, '#020610');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, 128, 75);

                // 2. Soft horizontal laser line
                ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
                ctx.fillRect(0, 36, 128, 1.5);

                // 3. Glowing cyan neon rail on top
                ctx.fillStyle = '#0284c7';
                ctx.fillRect(0, 0, 128, 8);
                ctx.fillStyle = '#06b6d4';
                ctx.fillRect(0, 0, 128, 4);
                ctx.fillStyle = '#67e8f9';
                ctx.fillRect(0, 0, 128, 1.5);

                canvas.refresh();
            }
        }

        // --- Pit Cliff Caps & Abyss Visuals ---
        if (!scene.textures.exists('ground_cliff_left')) {
            const canvas = scene.textures.createCanvas('ground_cliff_left', 28, 75);
            if (canvas) {
                const ctx = canvas.getContext();
                // Rounded corner on top right
                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(20, 0);
                ctx.arcTo(28, 0, 28, 8, 8);
                ctx.lineTo(28, 75);
                ctx.lineTo(0, 75);
                ctx.closePath();
                ctx.fill();

                // Drop edge vertical shadow on right face
                ctx.fillStyle = '#020617';
                ctx.fillRect(20, 0, 8, 75);

                // Grass cap on top
                ctx.fillStyle = '#22c55e';
                ctx.beginPath();
                ctx.moveTo(0, 0); ctx.lineTo(20, 0); ctx.arcTo(28, 0, 28, 8, 8); ctx.lineTo(28, 8); ctx.lineTo(0, 8);
                ctx.fill();
                ctx.fillStyle = '#86efac';
                ctx.fillRect(0, 0, 22, 2);
                canvas.refresh();
            }
        }

        if (!scene.textures.exists('ground_cliff_right')) {
            const canvas = scene.textures.createCanvas('ground_cliff_right', 28, 75);
            if (canvas) {
                const ctx = canvas.getContext();
                // Rounded corner on top left
                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.moveTo(28, 0);
                ctx.lineTo(8, 0);
                ctx.arcTo(0, 0, 0, 8, 8);
                ctx.lineTo(0, 75);
                ctx.lineTo(28, 75);
                ctx.closePath();
                ctx.fill();

                // Vertical face highlight on left face
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(0, 0, 8, 75);

                // Grass cap on top
                ctx.fillStyle = '#22c55e';
                ctx.beginPath();
                ctx.moveTo(28, 0); ctx.lineTo(8, 0); ctx.arcTo(0, 0, 0, 8, 8); ctx.lineTo(0, 8); ctx.lineTo(28, 8);
                ctx.fill();
                ctx.fillStyle = '#86efac';
                ctx.fillRect(6, 0, 22, 2);
                canvas.refresh();
            }
        }

        // Pit Void / Danger Hazard Backdrop (160x75)
        if (!scene.textures.exists('pit_hazard')) {
            const canvas = scene.textures.createCanvas('pit_hazard', 160, 75);
            if (canvas) {
                const ctx = canvas.getContext();
                // Deep black abyss gradient
                const grad = ctx.createLinearGradient(0, 0, 0, 75);
                grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
                grad.addColorStop(0.4, 'rgba(15, 23, 42, 0.9)');
                grad.addColorStop(1, '#000000');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, 160, 75);

                // Glowing crimson danger spikes / laser floor at bottom
                ctx.fillStyle = '#ef4444';
                for (let x = 8; x < 160; x += 16) {
                    ctx.beginPath();
                    ctx.moveTo(x, 75); ctx.lineTo(x + 8, 52); ctx.lineTo(x + 16, 75);
                    ctx.fill();
                }
                ctx.fillStyle = '#fca5a5';
                for (let x = 8; x < 160; x += 16) {
                    ctx.beginPath();
                    ctx.moveTo(x + 4, 75); ctx.lineTo(x + 8, 58); ctx.lineTo(x + 12, 75);
                    ctx.fill();
                }

                // Laser warning line
                ctx.fillStyle = '#f87171';
                ctx.fillRect(0, 50, 160, 2);
                canvas.refresh();
            }
        }

        // Floating Platform Texture (공중 발판 - 160x28)
        if (!scene.textures.exists('platform_tex')) {
            const canvas = scene.textures.createCanvas('platform_tex', 160, 28);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#1e293b';
                ctx.beginPath();
                ctx.roundRect(0, 0, 160, 28, 6);
                ctx.fill();
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2.5;
                ctx.stroke();
                // Glowing top rail
                ctx.fillStyle = '#38bdf8';
                ctx.fillRect(4, 2, 152, 4);
                canvas.refresh();
            }
        }
    }

    private static generateItemTextures(scene: Phaser.Scene) {
        // 1. Commit Grass (36x36)
        if (!scene.textures.exists('jelly_grass')) {
            const canvas = scene.textures.createCanvas('jelly_grass', 36, 36);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = 'rgba(74, 222, 128, 0.4)';
                ctx.beginPath();
                ctx.roundRect(0, 0, 36, 36, 10);
                ctx.fill();

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

        // 2. Gold Coin 🪙 (32x32)
        if (!scene.textures.exists('item_coin')) {
            const canvas = scene.textures.createCanvas('item_coin', 32, 32);
            if (canvas) {
                const ctx = canvas.getContext();
                // Gold outer glow
                ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
                ctx.beginPath();
                ctx.arc(16, 16, 15, 0, Math.PI * 2);
                ctx.fill();

                // Shiny Gold Coin
                const grad = ctx.createLinearGradient(0, 0, 32, 32);
                grad.addColorStop(0, '#fde047');
                grad.addColorStop(1, '#ca8a04');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(16, 16, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Center S (SSAFY Coin)
                ctx.fillStyle = '#854d0e';
                ctx.font = 'bold 14px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('S', 16, 21);
                canvas.refresh();
            }
        }

        // 3. Magnet Power-Up Item 🧲 (36x36)
        if (!scene.textures.exists('item_magnet')) {
            const canvas = scene.textures.createCanvas('item_magnet', 36, 36);
            if (canvas) {
                const ctx = canvas.getContext();
                // Cyan Glow
                ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
                ctx.beginPath();
                ctx.arc(18, 18, 17, 0, Math.PI * 2);
                ctx.fill();

                // Horseshoe Magnet Shape
                ctx.fillStyle = '#ef4444'; // Red body
                ctx.beginPath();
                ctx.arc(18, 16, 13, Math.PI, 0, false);
                ctx.lineTo(31, 26);
                ctx.lineTo(24, 26);
                ctx.lineTo(24, 16);
                ctx.arc(18, 16, 6, 0, Math.PI, true);
                ctx.lineTo(12, 26);
                ctx.lineTo(5, 26);
                ctx.closePath();
                ctx.fill();

                // Silver tips
                ctx.fillStyle = '#e2e8f0';
                ctx.fillRect(5, 22, 7, 6);
                ctx.fillRect(24, 22, 7, 6);
                canvas.refresh();
            }
        }

        // 4. SSAFY QR Code Phone (38x46)
        if (!scene.textures.exists('jelly_qr')) {
            const canvas = scene.textures.createCanvas('jelly_qr', 38, 46);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
                ctx.beginPath();
                ctx.roundRect(0, 0, 38, 46, 8);
                ctx.fill();

                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.roundRect(3, 3, 32, 40, 6);
                ctx.fill();
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(7, 7, 24, 28);
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(9, 9, 7, 7);
                ctx.fillRect(22, 9, 7, 7);
                ctx.fillRect(9, 22, 7, 7);
                ctx.fillRect(18, 18, 4, 4);
                canvas.refresh();
            }
        }

        // 5. Iced Americano (36x44)
        if (!scene.textures.exists('item_coffee')) {
            const canvas = scene.textures.createCanvas('item_coffee', 36, 44);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
                ctx.beginPath();
                ctx.roundRect(2, 6, 32, 38, 6);
                ctx.fill();

                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.beginPath();
                ctx.moveTo(6, 12); ctx.lineTo(10, 40); ctx.lineTo(26, 40); ctx.lineTo(30, 12);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = '#451a03';
                ctx.beginPath();
                ctx.moveTo(8, 18); ctx.lineTo(11, 38); ctx.lineTo(25, 38); ctx.lineTo(28, 18);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = '#bae6fd';
                ctx.fillRect(12, 20, 6, 6);
                ctx.fillRect(20, 22, 6, 6);

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(4, 9, 28, 4);
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(20, 0, 4, 18);
                canvas.refresh();
            }
        }

        // 6. Booster Drink (32x44)
        if (!scene.textures.exists('item_fever')) {
            const canvas = scene.textures.createCanvas('item_fever', 32, 44);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
                ctx.beginPath();
                ctx.roundRect(1, 3, 30, 38, 6);
                ctx.fill();

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

                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.moveTo(17, 10); ctx.lineTo(10, 22); ctx.lineTo(15, 22);
                ctx.lineTo(13, 32); ctx.lineTo(21, 20); ctx.lineTo(16, 20);
                ctx.closePath();
                ctx.fill();
                canvas.refresh();
            }
        }

        // 7. SSAFY Rescue Drone 🚁 (80x56)
        if (!scene.textures.exists('rescue_drone')) {
            const canvas = scene.textures.createCanvas('rescue_drone', 80, 56);
            if (canvas) {
                const ctx = canvas.getContext();

                // 1. Dual Propeller Motion Rotors (Left & Right)
                ctx.fillStyle = 'rgba(56, 189, 248, 0.35)'; // Cyan blur rotor disk
                ctx.beginPath();
                ctx.ellipse(16, 12, 18, 6, 0, 0, Math.PI * 2);
                ctx.ellipse(64, 12, 18, 6, 0, 0, Math.PI * 2);
                ctx.fill();

                // Carbon rotor blades
                ctx.fillStyle = '#0284c7';
                ctx.fillRect(4, 11, 24, 3);
                ctx.fillRect(52, 11, 24, 3);

                // Rotor pylons connecting to fuselage
                ctx.strokeStyle = '#475569';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(16, 13); ctx.lineTo(30, 24);
                ctx.moveTo(64, 13); ctx.lineTo(50, 24);
                ctx.stroke();

                // 2. Aerodynamic Drone Hull (Glossy White & SSAFY Blue)
                const hullGrad = ctx.createLinearGradient(24, 16, 56, 44);
                hullGrad.addColorStop(0, '#ffffff');
                hullGrad.addColorStop(0.5, '#f1f5f9');
                hullGrad.addColorStop(1, '#cbd5e1');
                ctx.fillStyle = hullGrad;
                ctx.beginPath();
                ctx.roundRect(24, 16, 32, 26, 10);
                ctx.fill();
                ctx.strokeStyle = '#0284c7';
                ctx.lineWidth = 2.5;
                ctx.stroke();

                // SSAFY Blue racing stripe
                ctx.fillStyle = '#0284c7';
                ctx.fillRect(26, 26, 28, 5);

                // SSAFY Text
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 8px sans-serif';
                ctx.fillText('SSAFY', 27, 31);

                // 3. Dual Emergency Strobe Beacons (Red & Cyan)
                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.arc(34, 15, 3.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#38bdf8';
                ctx.beginPath();
                ctx.arc(46, 15, 3.5, 0, Math.PI * 2);
                ctx.fill();

                // 4. Digital Visor Screen with Friendly LED Eyes [ ^ _ ^ ]
                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.roundRect(28, 33, 24, 8, 3);
                ctx.fill();
                // Cyan glowing eyes
                ctx.fillStyle = '#38bdf8';
                ctx.fillRect(32, 35, 4, 3);
                ctx.fillRect(44, 35, 4, 3);

                // 5. Underside Magnetic Rescue Tractor Beam Emitter
                ctx.fillStyle = '#f59e0b';
                ctx.fillRect(35, 42, 10, 4);
                ctx.fillStyle = '#38bdf8';
                ctx.beginPath();
                ctx.arc(40, 47, 4.5, 0, Math.PI * 2);
                ctx.fill();

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
                ctx.fillStyle = '#334155';
                ctx.fillRect(22, 44, 8, 10);
                ctx.fillRect(14, 52, 24, 6);

                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.roundRect(2, 4, 48, 40, 4);
                ctx.fill();
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 3;
                ctx.stroke();

                ctx.fillStyle = '#7f1d1d';
                ctx.fillRect(6, 8, 40, 32);
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 11px sans-serif';
                ctx.fillText('ERR 500', 7, 24);
                ctx.fillStyle = '#fca5a5';
                ctx.fillRect(8, 28, 36, 4);
                canvas.refresh();
            }
        }

        // Ground 2: Bug Robot
        if (!scene.textures.exists('obstacle_bug')) {
            const canvas = scene.textures.createCanvas('obstacle_bug', 48, 44);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.strokeStyle = '#b91c1c';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(14, 24); ctx.lineTo(4, 38);
                ctx.moveTo(18, 28); ctx.lineTo(10, 42);
                ctx.moveTo(34, 24); ctx.lineTo(44, 38);
                ctx.moveTo(30, 28); ctx.lineTo(38, 42);
                ctx.stroke();

                ctx.fillStyle = '#dc2626';
                ctx.beginPath();
                ctx.roundRect(14, 12, 20, 24, 8);
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(18, 12); ctx.lineTo(10, 2);
                ctx.moveTo(30, 12); ctx.lineTo(38, 2);
                ctx.stroke();

                ctx.fillStyle = '#facc15';
                ctx.fillRect(17, 18, 4, 4);
                ctx.fillRect(27, 18, 4, 4);
                canvas.refresh();
            }
        }

        // Air: Merge Conflict Caution Barrier
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

        // 3. Stage Finish Gate 🏁 (130x210)
        if (!scene.textures.exists('finish_gate')) {
            const canvas = scene.textures.createCanvas('finish_gate', 130, 210);
            if (canvas) {
                const ctx = canvas.getContext();

                // Left Pillar
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(8, 20, 24, 190);
                ctx.fillStyle = '#38bdf8';
                ctx.fillRect(16, 20, 8, 190);

                // Right Pillar
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(98, 20, 24, 190);
                ctx.fillStyle = '#38bdf8';
                ctx.fillRect(106, 20, 8, 190);

                // Top Crossbar Arch
                ctx.fillStyle = '#1e293b';
                ctx.beginPath();
                ctx.roundRect(0, 4, 130, 44, 8);
                ctx.fill();
                ctx.strokeStyle = '#facc15';
                ctx.lineWidth = 3;
                ctx.stroke();

                // Checkered Banner Pattern
                for (let x = 6; x < 124; x += 14) {
                    ctx.fillStyle = (x % 28 === 6) ? '#000000' : '#ffffff';
                    ctx.fillRect(x, 8, 14, 14);
                }

                // LED Gate Title
                ctx.fillStyle = '#facc15';
                ctx.font = 'bold 15px "Black Han Sans", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('FINISH! 골인', 65, 40);

                // Laser Sensor Curtain between pillars
                ctx.fillStyle = 'rgba(74, 222, 128, 0.2)';
                ctx.fillRect(32, 48, 66, 162);
                ctx.strokeStyle = 'rgba(74, 222, 128, 0.6)';
                ctx.lineWidth = 1.5;
                for (let y = 60; y < 200; y += 22) {
                    ctx.beginPath();
                    ctx.moveTo(32, y); ctx.lineTo(98, y);
                    ctx.stroke();
                }

                canvas.refresh();
            }
        }

        // 4. Star Gold Icon ⭐ (32x32)
        if (!scene.textures.exists('icon_star_gold')) {
            const canvas = scene.textures.createCanvas('icon_star_gold', 32, 32);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#facc15';
                this.drawStar(ctx, 16, 16, 5, 14, 6);
                ctx.strokeStyle = '#d97706';
                ctx.lineWidth = 2;
                ctx.stroke();
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
                ctx.strokeStyle = '#475569';
                ctx.lineWidth = 2;
                ctx.stroke();
                canvas.refresh();
            }
        }

        // 6. Lock Icon 🔒 (32x32)
        if (!scene.textures.exists('icon_lock')) {
            const canvas = scene.textures.createCanvas('icon_lock', 32, 32);
            if (canvas) {
                const ctx = canvas.getContext();
                // Shackle
                ctx.strokeStyle = '#94a3b8';
                ctx.lineWidth = 3.5;
                ctx.beginPath();
                ctx.arc(16, 12, 6, Math.PI, 0);
                ctx.stroke();

                // Body
                ctx.fillStyle = '#475569';
                ctx.beginPath();
                ctx.roundRect(8, 14, 16, 14, 4);
                ctx.fill();
                ctx.strokeStyle = '#64748b';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Keyhole
                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.arc(16, 20, 2, 0, Math.PI * 2);
                ctx.fill();
                canvas.refresh();
            }
        }
    }

    private static generateBossTextures(scene: Phaser.Scene) {
        // 1. [일타싸피] Billiards AI Boss (96x96)
        if (!scene.textures.exists('boss_iltassafy')) {
            const canvas = scene.textures.createCanvas('boss_iltassafy', 96, 96);
            if (canvas) {
                const ctx = canvas.getContext();

                // Thruster glows (bottom)
                ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
                ctx.beginPath();
                ctx.arc(32, 86, 12, 0, Math.PI * 2);
                ctx.arc(64, 86, 12, 0, Math.PI * 2);
                ctx.fill();

                // Thruster nozzles
                ctx.fillStyle = '#334155';
                ctx.fillRect(26, 76, 12, 10);
                ctx.fillRect(58, 76, 12, 10);

                // Main 8-Ball Body Sphere (3D glossy sphere)
                const ballGrad = ctx.createRadialGradient(38, 38, 8, 48, 48, 44);
                ballGrad.addColorStop(0, '#475569');
                ballGrad.addColorStop(0.35, '#1e293b');
                ballGrad.addColorStop(0.85, '#0f172a');
                ballGrad.addColorStop(1, '#020617');
                ctx.fillStyle = ballGrad;
                ctx.beginPath();
                ctx.arc(48, 48, 42, 0, Math.PI * 2);
                ctx.fill();

                // Outer Cyber Armor Ring
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 3;
                ctx.stroke();

                // Center White Circle for Number 8
                ctx.fillStyle = '#f8fafc';
                ctx.beginPath();
                ctx.arc(48, 48, 20, 0, Math.PI * 2);
                ctx.fill();

                // Number 8 in Center
                ctx.fillStyle = '#0f172a';
                ctx.font = 'bold 24px "Black Han Sans", sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('8', 48, 49);

                // Menacing Robotic Eye / Red Scanner Lens on top
                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.arc(48, 22, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fecaca';
                ctx.beginPath();
                ctx.arc(48, 22, 2.5, 0, Math.PI * 2);
                ctx.fill();

                // Mechanical Billiard Cue Arms (left & right)
                ctx.fillStyle = '#d97706';
                ctx.fillRect(4, 44, 14, 6);
                ctx.fillRect(78, 44, 14, 6);
                ctx.fillStyle = '#fef08a';
                ctx.fillRect(14, 44, 4, 6);
                ctx.fillRect(78, 44, 4, 6);

                canvas.refresh();
            }
        }

        // 2. [배틀싸피] Cyber Battle Tank Boss (124x82)
        if (!scene.textures.exists('boss_battlessafy')) {
            const canvas = scene.textures.createCanvas('boss_battlessafy', 124, 82);
            if (canvas) {
                const ctx = canvas.getContext();

                // 1. Treads / Tracks at bottom
                ctx.fillStyle = '#1e293b';
                ctx.beginPath();
                ctx.roundRect(16, 52, 96, 26, 12);
                ctx.fill();
                ctx.strokeStyle = '#0284c7';
                ctx.lineWidth = 2.5;
                ctx.stroke();

                // Tread wheels
                for (let wx = 28; wx <= 100; wx += 18) {
                    ctx.fillStyle = '#0f172a';
                    ctx.beginPath();
                    ctx.arc(wx, 65, 8, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#38bdf8';
                    ctx.beginPath();
                    ctx.arc(wx, 65, 3.5, 0, Math.PI * 2);
                    ctx.fill();
                }

                // 2. Armored Chassis (Navy & Gunmetal)
                const hullGrad = ctx.createLinearGradient(20, 26, 104, 52);
                hullGrad.addColorStop(0, '#334155');
                hullGrad.addColorStop(1, '#0f172a');
                ctx.fillStyle = hullGrad;
                ctx.beginPath();
                ctx.roundRect(24, 28, 86, 26, 6);
                ctx.fill();
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 2;
                ctx.stroke();

                // SSAFY Military Emblem
                ctx.fillStyle = '#f59e0b';
                ctx.font = 'bold 10px monospace';
                ctx.fillText('BATTLE-AI', 38, 44);

                // 3. Heavy Turret Dome on top
                ctx.fillStyle = '#1e293b';
                ctx.beginPath();
                ctx.arc(70, 24, 18, Math.PI, 0, false);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Dual Plasma Cannons (facing leftwards toward player)
                ctx.fillStyle = '#475569';
                ctx.fillRect(8, 14, 48, 7);
                ctx.fillRect(8, 24, 48, 7);
                // Glowing muzzle tips
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(4, 13, 6, 9);
                ctx.fillRect(4, 23, 6, 9);

                // Radar Dish on rear
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(92, 12, 10, -Math.PI / 4, (Math.PI * 3) / 4);
                ctx.stroke();
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(90, 4, 3, 3);

                canvas.refresh();
            }
        }

        // 3. Projectile: Bouncing Billiard Ball 🎱 (36x36)
        if (!scene.textures.exists('boss_projectile_ball')) {
            const canvas = scene.textures.createCanvas('boss_projectile_ball', 36, 36);
            if (canvas) {
                const ctx = canvas.getContext();
                // Red fireball aura
                ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
                ctx.beginPath();
                ctx.arc(18, 18, 17, 0, Math.PI * 2);
                ctx.fill();

                // Solid glowing billiard ball
                const grad = ctx.createRadialGradient(14, 14, 3, 18, 18, 14);
                grad.addColorStop(0, '#fef08a');
                grad.addColorStop(0.3, '#f59e0b');
                grad.addColorStop(1, '#dc2626');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(18, 18, 14, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();

                canvas.refresh();
            }
        }

        // 4. Projectile: Heavy Cyber Missile / Rocket 🚀 (42x24)
        if (!scene.textures.exists('boss_projectile_shell')) {
            const canvas = scene.textures.createCanvas('boss_projectile_shell', 42, 24);
            if (canvas) {
                const ctx = canvas.getContext();
                // Flame plume behind
                ctx.fillStyle = '#f59e0b';
                ctx.beginPath();
                ctx.moveTo(34, 12); ctx.lineTo(42, 6); ctx.lineTo(40, 12); ctx.lineTo(42, 18);
                ctx.closePath();
                ctx.fill();

                // Rocket body
                ctx.fillStyle = '#e2e8f0';
                ctx.beginPath();
                ctx.roundRect(8, 5, 26, 14, 4);
                ctx.fill();

                // Warhead tip
                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.moveTo(8, 5); ctx.lineTo(0, 12); ctx.lineTo(8, 19);
                ctx.closePath();
                ctx.fill();

                canvas.refresh();
            }
        }

        // 5. Item: 🧩 Algorithm Debug Patch (38x38)
        if (!scene.textures.exists('item_debug_patch')) {
            const canvas = scene.textures.createCanvas('item_debug_patch', 38, 38);
            if (canvas) {
                const ctx = canvas.getContext();

                // Glowing outer shield
                ctx.fillStyle = 'rgba(168, 85, 247, 0.35)';
                ctx.beginPath();
                ctx.arc(19, 19, 18, 0, Math.PI * 2);
                ctx.fill();

                // Puzzle Piece Body
                const grad = ctx.createLinearGradient(6, 6, 32, 32);
                grad.addColorStop(0, '#c084fc');
                grad.addColorStop(0.5, '#a855f7');
                grad.addColorStop(1, '#7e22ce');
                ctx.fillStyle = grad;

                ctx.beginPath();
                ctx.roundRect(7, 7, 24, 24, 6);
                ctx.fill();
                ctx.strokeStyle = '#f8fafc';
                ctx.lineWidth = 2.5;
                ctx.stroke();

                // Code icon </>
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 13px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('</>', 19, 19);

                canvas.refresh();
            }
        }

        // 6. Item: 🛡️ Plasma Energy Shield Capsule (38x38)
        if (!scene.textures.exists('item_shield')) {
            const canvas = scene.textures.createCanvas('item_shield', 38, 38);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = 'rgba(34, 211, 238, 0.35)';
                ctx.beginPath();
                ctx.arc(19, 19, 18, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#0891b2';
                ctx.strokeStyle = '#67e8f9';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(19, 5);
                ctx.lineTo(31, 10);
                ctx.lineTo(29, 24);
                ctx.lineTo(19, 33);
                ctx.lineTo(9, 24);
                ctx.lineTo(7, 10);
                ctx.closePath();
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

        // 7. S-S-A-F-Y Bonus Alphabet Capsules (letter_0 .. letter_4)
        const letters = ['S', 'S', 'A', 'F', 'Y'];
        const letterColors = ['#38bdf8', '#22d3ee', '#4ade80', '#facc15', '#f472b6'];
        letters.forEach((ch, idx) => {
            const key = `letter_${idx}`;
            if (!scene.textures.exists(key)) {
                const canvas = scene.textures.createCanvas(key, 38, 38);
                if (canvas) {
                    const ctx = canvas.getContext();
                    const col = letterColors[idx];
                    ctx.fillStyle = 'rgba(250, 204, 21, 0.28)';
                    ctx.beginPath();
                    ctx.arc(19, 19, 18, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = '#0f172a';
                    ctx.strokeStyle = col;
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.roundRect(5, 5, 28, 28, 8);
                    ctx.fill();
                    ctx.stroke();

                    ctx.fillStyle = col;
                    ctx.font = '900 18px "Arial Black", sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(ch, 19, 20);
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
