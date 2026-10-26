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

        // Backpack
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(14, cy - 14, 12, 22, 4);
        ctx.fill();

        // Left Arm (back)
        ctx.fillStyle = skin.hoodieColor;
        ctx.beginPath();
        if (frame === 1) {
            ctx.ellipse(22, cy - 2, 6, 12, -0.4, 0, Math.PI * 2);
        } else {
            ctx.ellipse(36, cy - 2, 6, 12, 0.4, 0, Math.PI * 2);
        }
        ctx.fill();

        // Legs & Shoes
        ctx.fillStyle = skin.pantsColor;
        if (frame === 1) {
            ctx.fillRect(32, cy + 12, 8, 16);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(32, cy + 24, 8, 4);
            ctx.fillStyle = skin.sneakerColor;
            ctx.fillRect(34, cy + 28, 14, 8);

            ctx.fillStyle = skin.pantsColor;
            ctx.fillRect(20, cy + 10, 8, 14);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(20, cy + 20, 8, 4);
            ctx.fillStyle = skin.sneakerColor;
            ctx.fillRect(16, cy + 24, 12, 8);
        } else if (frame === 2) {
            ctx.fillRect(28, cy + 12, 8, 18);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(28, cy + 26, 8, 4);
            ctx.fillStyle = skin.sneakerColor;
            ctx.fillRect(28, cy + 30, 13, 8);

            ctx.fillStyle = skin.pantsColor;
            ctx.fillRect(24, cy + 10, 8, 16);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(24, cy + 22, 8, 4);
            ctx.fillStyle = skin.sneakerColor;
            ctx.fillRect(22, cy + 26, 12, 8);
        } else if (frame === 3) {
            ctx.fillRect(20, cy + 12, 8, 16);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(20, cy + 24, 8, 4);
            ctx.fillStyle = skin.sneakerColor;
            ctx.fillRect(16, cy + 28, 14, 8);

            ctx.fillStyle = skin.pantsColor;
            ctx.fillRect(32, cy + 10, 8, 14);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(32, cy + 20, 8, 4);
            ctx.fillStyle = skin.sneakerColor;
            ctx.fillRect(34, cy + 24, 12, 8);
        } else {
            ctx.fillRect(26, cy + 12, 8, 18);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(26, cy + 26, 8, 4);
            ctx.fillStyle = skin.sneakerColor;
            ctx.fillRect(26, cy + 30, 13, 8);

            ctx.fillStyle = skin.pantsColor;
            ctx.fillRect(22, cy + 10, 8, 16);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(22, cy + 22, 8, 4);
            ctx.fillStyle = skin.sneakerColor;
            ctx.fillRect(20, cy + 26, 12, 8);
        }

        // Torso Hoodie
        ctx.fillStyle = skin.hoodieColor;
        ctx.beginPath();
        ctx.roundRect(22, cy - 14, 22, 28, 6);
        ctx.fill();
        ctx.strokeStyle = skin.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Ribbon & ID Card
        ctx.strokeStyle = skin.badgeColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(27, cy - 12);
        ctx.lineTo(33, cy + 4);
        ctx.lineTo(39, cy - 12);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(30, cy + 4, 8, 10);
        ctx.fillStyle = skin.hoodieColor;
        ctx.fillRect(31, cy + 6, 6, 3);

        // Head
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(34, cy - 23, 11, 0, Math.PI * 2);
        ctx.fill();

        // Hair / Special Headgear
        if (skin.id === 'gold_master') {
            // Golden Crown
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.moveTo(26, cy - 28);
            ctx.lineTo(29, cy - 38);
            ctx.lineTo(34, cy - 32);
            ctx.lineTo(39, cy - 38);
            ctx.lineTo(42, cy - 28);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(33, cy - 30, 3, 3);
        } else if (skin.id === 'panda_pajama') {
            // Panda Hood Ears
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(26, cy - 34, 5, 0, Math.PI * 2);
            ctx.arc(42, cy - 34, 5, 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'cyber_agent') {
            // Cyber Visor
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(33, cy - 25, 12, Math.PI * 0.9, Math.PI * 2.1);
            ctx.fill();
            ctx.fillStyle = '#06b6d4';
            ctx.fillRect(35, cy - 26, 12, 6);
        } else {
            // Classic Dark Hair
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(33, cy - 25, 12, Math.PI * 0.9, Math.PI * 2.1);
            ctx.lineTo(44, cy - 24);
            ctx.lineTo(36, cy - 22);
            ctx.fill();
        }

        // Eye
        if (skin.id !== 'cyber_agent') {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(37, cy - 24, 3, 3);
            ctx.fillStyle = skin.color;
            ctx.fillRect(38, cy - 23, 2, 2);
        }

        // Sweat drop
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(43, cy - 26, 2, 0, Math.PI * 2);
        ctx.fill();

        // Front Arm
        ctx.fillStyle = skin.hoodieColor;
        ctx.beginPath();
        if (frame === 1) {
            ctx.ellipse(38, cy - 1, 6, 12, 0.5, 0, Math.PI * 2);
        } else {
            ctx.ellipse(24, cy - 1, 6, 12, -0.5, 0, Math.PI * 2);
        }
        ctx.fill();
    }

    private static drawTraineeJump(ctx: CanvasRenderingContext2D, skin: typeof SkinManager.SKINS[0]) {
        ctx.clearRect(0, 0, 64, 80);
        const cy = 34;

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(14, cy - 12, 12, 22, 4);
        ctx.fill();

        // Tucked Legs
        ctx.fillStyle = skin.pantsColor;
        ctx.fillRect(20, cy + 12, 16, 8);
        ctx.fillRect(28, cy + 18, 14, 8);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(36, cy + 18, 8, 4);
        ctx.fillStyle = skin.sneakerColor;
        ctx.fillRect(38, cy + 22, 12, 8);
        ctx.fillRect(20, cy + 18, 12, 8);

        // Torso
        ctx.fillStyle = skin.hoodieColor;
        ctx.beginPath();
        ctx.roundRect(22, cy - 14, 22, 28, 6);
        ctx.fill();
        ctx.strokeStyle = skin.color;
        ctx.lineWidth = 1.5;
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
        ctx.arc(34, cy - 23, 11, 0, Math.PI * 2);
        ctx.fill();

        if (skin.id === 'gold_master') {
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.moveTo(26, cy - 28);
            ctx.lineTo(29, cy - 38);
            ctx.lineTo(34, cy - 32);
            ctx.lineTo(39, cy - 38);
            ctx.lineTo(42, cy - 28);
            ctx.closePath();
            ctx.fill();
        } else if (skin.id === 'cyber_agent') {
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(33, cy - 25, 12, Math.PI * 0.8, Math.PI * 2.2);
            ctx.fill();
            ctx.fillStyle = '#06b6d4';
            ctx.fillRect(36, cy - 26, 12, 6);
        } else {
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(33, cy - 25, 12, Math.PI * 0.8, Math.PI * 2.2);
            ctx.lineTo(45, cy - 28);
            ctx.fill();
        }

        // Arm raised
        ctx.fillStyle = skin.hoodieColor;
        ctx.beginPath();
        ctx.ellipse(38, cy - 8, 6, 12, 0.8, 0, Math.PI * 2);
        ctx.fill();
    }

    private static drawTraineeSlide(ctx: CanvasRenderingContext2D, skin: typeof SkinManager.SKINS[0]) {
        ctx.clearRect(0, 0, 80, 48);

        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(2, 42, 20, 3);
        ctx.fillStyle = skin.sneakerColor;
        ctx.fillRect(10, 44, 25, 2);

        ctx.fillStyle = skin.pantsColor;
        ctx.fillRect(12, 24, 28, 10);
        ctx.fillStyle = skin.sneakerColor;
        ctx.fillRect(8, 26, 14, 8);

        ctx.fillStyle = skin.hoodieColor;
        ctx.beginPath();
        ctx.roundRect(32, 16, 26, 18, 4);
        ctx.fill();
        ctx.strokeStyle = skin.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(62, 22, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(60, 20, 11, Math.PI * 0.9, Math.PI * 2.1);
        ctx.lineTo(48, 16);
        ctx.fill();

        ctx.fillStyle = skin.hoodieColor;
        ctx.fillRect(44, 28, 20, 6);
    }

    private static generateStageTextures(scene: Phaser.Scene) {
        // --- STAGE 1: 테헤란로 출근길 (Seoul Dawn City) ---
        if (!scene.textures.exists('bg_s1_far')) {
            const canvas = scene.textures.createCanvas('bg_s1_far', 1280, 400);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#111827';
                const buildings = [{ x: 0, w: 120, h: 220 }, { x: 130, w: 140, h: 280 }, { x: 290, w: 90, h: 180 }, { x: 400, w: 160, h: 310 }, { x: 580, w: 130, h: 240 }, { x: 730, w: 110, h: 270 }, { x: 860, w: 140, h: 220 }, { x: 1020, w: 150, h: 300 }, { x: 1190, w: 90, h: 200 }];
                buildings.forEach(b => {
                    ctx.fillRect(b.x, 400 - b.h, b.w, b.h);
                    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
                    ctx.fillRect(b.x, 400 - b.h, b.w, 4);
                    ctx.fillStyle = '#111827';
                });
                canvas.refresh();
            }
        }
        if (!scene.textures.exists('bg_s1_near')) {
            const canvas = scene.textures.createCanvas('bg_s1_near', 1280, 280);
            if (canvas) {
                const ctx = canvas.getContext();
                ctx.fillStyle = '#1e293b';
                const blocks = [{ x: 40, w: 190, h: 230, label: 'SSAFY' }, { x: 260, w: 150, h: 180, label: '9:00 AM' }, { x: 440, w: 230, h: 250, label: 'MULTICAMPUS' }, { x: 700, w: 160, h: 200, label: 'SEOUL' }, { x: 890, w: 210, h: 230, label: 'COMMIT' }, { x: 1120, w: 160, h: 210, label: 'MULTICAMPUS' }];
                blocks.forEach(b => {
                    ctx.fillRect(b.x, 280 - b.h, b.w, b.h);
                    ctx.fillStyle = '#38bdf8';
                    ctx.font = 'bold 15px sans-serif';
                    ctx.fillText(b.label, b.x + 20, 280 - b.h + 28);
                    ctx.fillStyle = '#1e293b';
                });
                canvas.refresh();
            }
        }
        if (!scene.textures.exists('ground_s1')) {
            const canvas = scene.textures.createCanvas('ground_s1', 128, 75);
            if (canvas) {
                const ctx = canvas.getContext();
                // 1. Deep foundation stone
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(0, 0, 128, 75);

                // 2. Urban sidewalk paving stones
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(0, 12, 128, 63);
                ctx.fillStyle = '#334155';
                for (let x = 0; x < 128; x += 32) {
                    ctx.fillRect(x, 14, 30, 24);
                    ctx.fillRect(x + 16, 40, 30, 30);
                }
                ctx.strokeStyle = '#0f172a';
                ctx.lineWidth = 2;
                ctx.strokeRect(0, 12, 128, 63);

                // 3. Lush green lawn trim on top
                ctx.fillStyle = '#15803d';
                ctx.fillRect(0, 0, 128, 12);
                ctx.fillStyle = '#22c55e';
                ctx.fillRect(0, 0, 128, 6);
                // Grass blade tufts
                ctx.fillStyle = '#86efac';
                for (let x = 4; x < 128; x += 12) {
                    ctx.beginPath();
                    ctx.moveTo(x, 6); ctx.lineTo(x + 3, 0); ctx.lineTo(x + 6, 6);
                    ctx.fill();
                }
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
                ctx.fillStyle = '#1c1917'; // Concrete stairs base
                ctx.fillRect(0, 0, 128, 75);
                // Metal treads
                ctx.fillStyle = '#292524';
                ctx.fillRect(0, 14, 128, 61);
                // Yellow & Black hazard stripes on top rim
                ctx.fillStyle = '#eab308';
                ctx.fillRect(0, 0, 128, 14);
                ctx.fillStyle = '#1c1917';
                for (let i = 0; i < 128; i += 24) {
                    ctx.beginPath();
                    ctx.moveTo(i, 0); ctx.lineTo(i + 14, 14); ctx.lineTo(i + 7, 14); ctx.lineTo(i - 7, 0);
                    ctx.fill();
                }
                // White caution line
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 13, 128, 2);
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
                ctx.fillStyle = '#03172e';
                ctx.fillRect(0, 0, 128, 75);
                // Glowing cyan laser rim
                ctx.fillStyle = '#06b6d4';
                ctx.fillRect(0, 0, 128, 6);
                ctx.fillStyle = '#38bdf8';
                ctx.fillRect(0, 0, 128, 2);
                // Hexagonal grid server floor
                ctx.strokeStyle = '#0284c7';
                ctx.lineWidth = 2;
                ctx.strokeRect(4, 12, 56, 58);
                ctx.strokeRect(68, 12, 56, 58);
                ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
                ctx.fillRect(8, 16, 48, 50);
                ctx.fillRect(72, 16, 48, 50);
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
    }
}
