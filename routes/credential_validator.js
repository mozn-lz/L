function check_email(chk_email) {
		re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		// console.log('email: ' + re.test(chk_email));
		return (re.test(chk_email));
	}

	function check_name(chk_name) {
		// String 4 - 15 alphabetical charecters long 
		re = /^[a-zA-Z]{3,14}\w$/;
		// console.log('name: ' + re.test(chk_name));
		return (re.test(chk_name));
	}

	function check_tel(chk_tel) {
		// String 4 - 15 alphabetical charecters long 
		re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
		re2 = /^[0-9]{4}[-\s\.]?[0-9]{4}$/im;
		// console.log('name: ' + re.test(chk_name));
		if (re.test(chk_tel)) {
			return (re.test(chk_tel));
		} else {
			return(re2.test($(chk_tel)));
		}
	}

	function check_psswd(chk_psswd) {
		/**
		 * string constains min 8 charecters long; includes at least
		 * 1 symbol (! @ # $ % ^ & *)
		 * 1 uppercase (A-Z)
		 * 1 lowercase (a-z)
		 * 1 number (1-9
		 *  */ 
		re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
		// console.log('psswd: ' + re.test(chk_psswd));
		return (re.test(chk_psswd));
	}

	function pass_match(chk_pass1, chk_pass2) {
		// console.log(`${chk_pass1} === ${chk_pass2}: ` + chk_pass1 === chk_pass2);
		// (chk_pass1 === chk_pass2) ? console.log('passwords match') : console.log('passwords dontusername match');
		return (chk_pass1 === chk_pass2);
	}
module.exports = {
	check_email,
	check_name,
	check_tel,
	check_psswd,
	pass_match
}