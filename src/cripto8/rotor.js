const alf = 'abcdefghijklmnopqrstuvwxyz';

module.exports = class Rotor {
    constructor(key, showing) {
        this.key = key;
        this.showing = showing;
        this.pointed = ''
        this.sequence = this.build_sequence();
        this.spins_count = 0;
    }

    rotate(backwards) {
        if (backwards) this.showing = this.sequence[25];
		else this.showing = this.sequence[1];
		this.sequence = this.build_sequence()
		this.spins_count += 1;
    }

    point(backwards) {
        let new_index = null;
        if (backwards) new_index = this.sequence.indexOf(this.pointed) - this.key;
		else new_index = this.sequence.indexOf(this.pointed) + this.key;
		if (new_index > 25) new_index = new_index % 26;
		if (new_index < 0) new_index = 26 + new_index;
		return new_index;
    }

    reset_spins() {
        this.spins_count = 0;
    }

    build_sequence() {
        let sequence = new String();
		sequence += this.showing;
        let tmp_index = alf.indexOf(this.showing);
        for (let i = 1; i < 26; i++) {
            tmp_index++;
            if (tmp_index > 25) tmp_index = 0;
            sequence += alf.charAt(tmp_index);
        }
        return sequence;
    }
}