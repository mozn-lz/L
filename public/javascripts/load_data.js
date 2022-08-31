/* Search result proccessing START */
fn_display_results = (result) => {
	let result_arr = [];
	for (let i = 0; i < result.length; i++) {
		const user = result[i];
		result_arr.push(`
		<div class="user col-xl-2 col-lg-3 col-md-4 col-sm-6 col-xs-12">
			<a href="profile/${ user._id }">
				<div class="card shadow">
					<div class="card-header text-uppercase">
						${ user.title } &nbsp; ${ user.name } &nbsp; ${ user.alt_Surname} &nbsp; ${ user.surname }
					</div>
					<div class="card-body">
						<div class="card-title"></div>
						<p class="card-text">${ user.cell_1 } | ${ user.cell_2 }</p>
					</div>
				</div>
			</a>
		</div>`);
		// result_arr = [...result_arr, result];
	}
	console.log('Siaplsy ', result_arr);
	$('#results').html(result_arr);
}

$('#search').keyup(() => {
	console.log(' Search ');
	if ($('#search').val().length > 0) {
		$.ajax({
			url: 'http://172.105.204.217/search/',
			type: 'POST',
			data: { searchString: $('#search').val() },
			success: (result) => {
				console.log('result ', result, result.length);
				fn_display_results(result);
			},
			error: (e) => {
				console.log('Error: ', e)
			}
		});
	}
});
/* END	Search result proccessing  */


let category = '';
let scrollCounter = 0;
let retrive = false;

let fetch_data = (cat) => {
	let sort, order;

	if (cat) {
		// console.log('cat');
		category = cat;
	} else {
		// console.log('!cat');
		category= category;
	}

	$('#sort').val() ? sort = $('#sort').val(): 0; 
	$('#order').val() ? order = $('#order').val(): 0; 
	console.log('  ', {category, sort, order})
	retrive = false;
	$.ajax({
		url: 'http://172.105.204.217/filter-users/',
		type: 'GET',
		data: { category, sort, order, scrollCounter },
		success: (result) => {
			console.log('success', result, result.users.length);

			let result_arr = [];
			if (result.users.length) {
				scrollCounter == 0 ? $('#results').html(''):0;
				scrollCounter += 20;
				for (let i = 0; i < result.users.length; i++) {
					const user = result.users[i];
					result_arr.push(`
					<div class="user col-xl-2 col-lg-3 col-md-4 col-sm-6 col-xs-12">
						<a href="profile/${ user._id }">
							<div class="card shadow">
								<div class="card-header text-uppercase">
									${ user.title } &nbsp; ${ user.name } &nbsp; ${ user.alt_Surname} &nbsp; ${ user.surname }
								</div>
								<div class="card-body">
									<p class="card-text">${ user.cell_1 } | ${ user.cell_2 } &nbsp; ${ user.email }</p>
								</div>
							</div>
						</a>
					</div>`);
				}
				retrive = true;
				$('#results').append(result_arr);
			}
			// selecting categories
			if (result.users.length == 0 && scrollCounter == 0) {
				retrive = false;
				$('#results').html(`<h3 class="text-center">No results :(</h3>`);
			}
		},
		error: (e) => {
			console.log('Error: ', e);
				$('#results').html(`<h2 class="text-center">Error reaching server :,(</h2>`, e);
			retrive = false;
		}
	});
}

$('#search').keyup(() => {
	scrollCounter = 0;
($('#search').val().length == 0) ? fetch_data(''): 0;
});

let cat_hendle = (cat) => {
	scrollCounter = 0;
	fetch_data(cat);
};
$('#order, #sort').change((e) => {
	scrollCounter = 0;
	fetch_data('');
});

$(document).ready(() => {
	fetch_data('')
	($(document).height() - $(document).scrollTop() < 2000 & retrive) ? fetch_data(''):0;
});

$(document).scroll(() => {
	($(document).height() - $(document).scrollTop() < 2000 & retrive) ? fetch_data(''): 0;
	($('#results').height() < $('#main').height() && retrive) ? fetch_data(''):0;
});
