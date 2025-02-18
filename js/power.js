class PowerUp extends Fruit {
    constructor(game) {
        super(game);
        this.type = {
            name: 'powerup',
            points: 50,
            color: '255, 215, 0'
        };
        this.effect = this.getRandomEffect();
    }

    getRandomEffect() {
        const effects = [
            'double_points',
            'slow_motion',
            'extra_life'
        ];
        return effects[Math.floor(Math.random() * effects.length)];
    }

    activate() {
        switch(this.effect) {
            case 'double_points':
                this.game.activateDoublePoints();
                break;
            case 'slow_motion':
                this.game.activateSlowMotion();
                break;
            case 'extra_life':
                this.game.addLife();
                break;
        }
        this.game.playSound('bonus');
    }

    slice() {
        if (this.sliced) return;
        super.slice();
        this.activate();
    }
}
