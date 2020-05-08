const punctuation = '!"#$%&' + `'` + '()*+,-./:;<=>?@[\\]^_`{|}~';
const special = punctuation + ' ' + '0123456789';

function create_data_block(ent, r1, r2, r3) {
    let out = new String();
	let pattern = new Array();
	for (i in ent) {
        let char = ent[i];
        let flag_r1 = false;
		let flag_r2 = false;
		let flag_r3 = false;
		if (special.indexOf(char) != -1) {
            out += char;
			continue;
        }	
		r1.pointed = char;
		r2.pointed = r2.sequence[r1.point(false)];
		r3.pointed = r3.sequence[r2.point(false)];
        out += r3.sequence[r3.point(false)];
        if (out.length != ent.length) {
            r1.rotate(false);
			flag_r1 = true;
        }
		if (r1.spins_count == 26) {
            r2.rotate(false);
			flag_r2 = true;
			r1.reset_spins();
			if (r2.spins_count == 26) {
                r3.rotate(false)
				flag_r3 = true;
				r2.reset_spins();
				if (r3.spins_count == 26) r3.reset_spins();		
            }		
        }	
		tmp = new Array();
		tmp.push(flag_r1);
		tmp.push(flag_r2);
		tmp.push(flag_r3);
		pattern.push(tmp);
    }
	return [r1.showing, r2.showing, r3.showing, pattern];
}

function reverseString(str) { 
	return str.split('').reverse().join('');
}

function filter_ent(ent) {
	ent = reverseString(ent);
	let store = new String();
	let new_ent = new String();
	for (let i = 0; i < ent.length; i++) {
		if (special.indexOf(ent[i]) != -1) store += ent[i]
		else {
			for (let j = i; j < ent.length; j++) new_ent += ent[j];	
			break;
		}		
	}
	return [reverseString(new_ent), store];
}
	
function encode(ent, r1, r2, r3) {
    out = new String();
	ent = ent.toLowerCase();
	for (i in ent) {
        let char = ent[i];
        if (special.indexOf(char) != -1) {
            out += char;
			continue;
        }
		r1.pointed = char;
		r2.pointed = r2.sequence[r1.point(false)];
		r3.pointed = r3.sequence[r2.point(false)];
		out += r3.sequence[r3.point(false)];
		if (out.length != ent.length) r1.rotate(false);
		if (r1.spins_count == 26) {
            r2.rotate(false);
			r1.reset_spins();
			if (r2.spins_count == 26) {
                r3.rotate(false);
				r2.reset_spins();
				if (r3.spins_count == 26) r3.reset_spins();
            }	
        }	
    }
	return out;
}

function decode(ent, r1, r2, r3) {
	let complete = false;
	let filter_data = filter_ent(ent);
	let stored = new String();
	ent = filter_data[0];
	if (filter_data[1] != '') {
		complete = true;
		stored = filter_data[1];
	}
	let data_block = create_data_block(ent, r1, r2, r3);
	r1.showing = data_block[0];
	r2.showing = data_block[1];
	r3.showing = data_block[2];
	r1.build_sequence();
	r2.build_sequence();
	r3.build_sequence();
	let pattern = data_block[3];
	let counter = pattern.length-1;
	ent = reverseString(ent);
	pattern.reverse();
	let plain = new String();
	let index = null;
	for (i in ent) {
		let char = ent[i];
		if (special.indexOf(char) != -1) {
			plain += char;
			continue;
		}
		index = r3.sequence.indexOf(char)-r3.key;
		if (index < 0) index = 26+index;
		r3.pointed = r3.sequence[index];
		index = r3.sequence.indexOf(r3.pointed)-r2.key;
		if (index < 0) index = 26+index;
		r2.pointed = r2.sequence[index];
		index = r2.sequence.indexOf(r2.pointed)-r1.key;
		if (index < 0) index = 26+index;
		r1.pointed = r1.sequence[index];
		plain += r1.pointed;
		if (pattern[counter][0] == 1) r1.rotate(true);		
		if (pattern[counter][1] == 2) r2.rotate(true);		
		if (pattern[counter][2] == 3) r3.rotate(true);
		counter--;
	}
	if (complete) return reverseString(plain)+reverseString(stored);
	return reverseString(plain);
}

module.exports = {encode, decode}