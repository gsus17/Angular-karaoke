export class Particle {

    private x;
    private y;
    private level;
    private scale;
    private alpha;
    private speed;
    private color;
    private size;
    private spin;
    private band;
    private decayScale;
    private smoothedScale;
    private smoothedAlpha;
    private decayAlpha;
    private rotation;
    private energy;

    private NUM_BANDS = 128;

    COLORS = ['#69D2E7', '#1B676B', '#BEF202', '#EBE54D', '#00CDAC', '#1693A5', '#F9D423', '#FF4E50', '#E7204E', '#0CCABA', '#FF006F'];

    SCALE = {
        MIN: 5.0,
        MAX: 80.0
    };

    SPEED = {
        MIN: 0.2,
        MAX: 1.0
    };

    ALPHA = {
        MIN: 0.8,
        MAX: 0.9
    };

    SPIN = {
        MIN: 0.001,
        MAX: 0.005
    };

    SIZE = {
        MIN: 0.5,
        MAX: 1.25
    };

    constructor(x1 = 0, y1 = 0) {
        this.x = x1;
        this.y = y1;
        this.reset();
    }

    public reset() {

        this.level = 1 + Math.floor(Math.random() * (4 - 0 + 0) + 0);
        this.scale = Math.random() * (this.SCALE.MAX - this.SCALE.MIN + 0.1) + this.SCALE.MIN;
        this.alpha = Math.random() * (this.ALPHA.MAX - this.ALPHA.MIN + 0.1) + this.ALPHA.MIN;
        this.speed = Math.random() * (this.SPEED.MAX - this.SPEED.MIN + 0.1) + this.SPEED.MIN;
        this.color = this.COLORS[Math.floor(Math.random() * this.COLORS.length)];
        this.size = Math.random() * (this.SIZE.MAX - this.SIZE.MIN + 0.1) + this.SIZE.MIN;
        this.spin = Math.random() * (this.SPIN.MAX - this.SPIN.MIN + 0.001) + this.SPIN.MIN;

        // this.band = Math.floor(Math.random(NUM_BANDS));
        this.band = Math.floor(Math.random() * (this.NUM_BANDS - 0 + 0) + 0);
        // if (random() < 0.5) {
        if (Math.random() < 0.5) {
            this.spin = -this.spin;
        }
        this.smoothedScale = 0.0;
        this.smoothedAlpha = 0.0;
        this.decayScale = 0.0;
        this.decayAlpha = 0.0;
        // this.rotation = random(TWO_PI);
        this.rotation = Math.random();
        return this.energy = 0.0;
    }

    public move() {
        this.rotation += this.spin;
        return this.y -= this.speed * this.level;
    }

    public draw(ctx) {
        let salpha;
        let spower;
        let sscale;

        spower = Math.exp(this.energy);
        sscale = this.scale * spower;
        salpha = this.alpha * this.energy * 1.5;
        this.decayScale = Math.max(this.decayScale, sscale);
        this.decayAlpha = Math.max(this.decayAlpha, salpha);
        this.smoothedScale += (this.decayScale - this.smoothedScale) * 0.3;
        this.smoothedAlpha += (this.decayAlpha - this.smoothedAlpha) * 0.3;
        this.decayScale *= 0.985;
        this.decayAlpha *= 0.975;
        ctx.save();
        ctx.beginPath();
        ctx.translate(this.x + Math.cos(this.rotation * this.speed) * 250, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.smoothedScale * this.level, this.smoothedScale * this.level);
        ctx.moveTo(this.size * 0.5, 0);
        ctx.lineTo(this.size * -0.5, 0);
        ctx.lineWidth = 1;
        ctx.lineCap = 'round';
        ctx.globalAlpha = this.smoothedAlpha / this.level;
        ctx.strokeStyle = this.color;
        ctx.stroke();
        return ctx.restore();
    }
}
