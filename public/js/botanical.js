/**
 * botanical.js
 * Ambient botanical particle animation for Extremity Vault.
 * Creates a fixed, full-screen canvas behind all content and animates
 * drifting pollen grains and flower petals in the site's hyacinth palette.
 * Uses requestAnimationFrame for smooth, CPU-efficient rendering.
 *
 * @author Barzin Vazifedoost
 */

// Botanical Particles — drifting pollen & petals
(function () {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = [
        'position:fixed', 'top:0', 'left:0',
        'width:100%', 'height:100%',
        'pointer-events:none',
        'z-index:0',
    ].join(';');
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // Hyacinth-palette colours
    const palette = [
        'rgba(197, 184, 212, {a})',   // lilac
        'rgba(168, 158, 208, {a})',   // lavender
        'rgba(123, 110, 168, {a})',   // hyacinth
        'rgba(180, 196, 168, {a})',   // sage
        'rgba(212, 200, 232, {a})',   // soft violet
    ];

    function randColor(opacity) {
        const c = palette[Math.floor(Math.random() * palette.length)];
        return c.replace('{a}', opacity.toFixed(2));
    }

    function make() {
        return {
            x:        Math.random() * canvas.width,
            y:        Math.random() * canvas.height,
            w:        Math.random() * 5 + 2,
            h:        Math.random() * 9 + 3,
            speedX:   (Math.random() - 0.5) * 0.35,
            speedY:   Math.random() * 0.3 + 0.1,
            opacity:  Math.random() * 0.28 + 0.06,
            wobble:   Math.random() * Math.PI * 2,
            wobbleS:  (Math.random() - 0.5) * 0.018,
            rot:      Math.random() * Math.PI * 2,
            rotS:     (Math.random() - 0.5) * 0.015,
            isPetal:  Math.random() > 0.45,
        };
    }

    // Seed initial particles spread across the screen
    const COUNT = 22;
    const particles = Array.from({ length: COUNT }, make);

    function drawPetal(p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle   = randColor(p.opacity);

        if (p.isPetal) {
            // Elliptical petal
            ctx.beginPath();
            ctx.ellipse(0, 0, p.w * 0.55, p.h * 0.9, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Tiny dot — pollen grain
            ctx.beginPath();
            ctx.arc(0, 0, p.w * 0.45, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    function tick() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p, i) => {
            p.wobble += p.wobbleS;
            p.x      += p.speedX + Math.sin(p.wobble) * 0.28;
            p.y      += p.speedY;
            p.rot    += p.rotS;

            drawPetal(p);

            // Recycle when off-screen
            if (p.y > canvas.height + 12 || p.x < -12 || p.x > canvas.width + 12) {
                particles[i] = make();
                particles[i].y = -10;
            }
        });

        requestAnimationFrame(tick);
    }

    tick();
})();
