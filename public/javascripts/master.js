/* Search result proccessing START */
let loadUsers = (users) => {
	let display_Arr = [];
	users.forEach(user => {
		display_Arr.push(
		);
	});
	console.log(display_Arr.length);
	return (display_Arr);
}

$('#search').keyup(() => {
	console.log(' Search ');
	if ($('#search').val().length > 1) {
		$.ajax({
			url: 'http://localhost:3000/search/',
			type: 'POST',
			data: { searchString: $('#search').val() },
			success: (result) => {
				console.log('result ', result);
				let result_arr = [];
				if (result.users.length) {
					result_arr = result_arr.concat(loadUsers(result.users));
					console.log('users ', result_arr);
				}
				console.log('Siaplsy ', result_arr);
				$('#results').html(result_arr);
			},
			error: (e) => {
				console.log('Error: ', e)
			}
		});
	}
});
/* END	Search result proccessing  */

let categoryFilter = (cat) => {
	console.log(cat);
}
