;(function () {
	const { Fragment, createElement: el } = wp.element;
	const { BlockControls, createBlock } = wp.blocks;

	wp.hooks.addFilter(
		'blocks.Autocomplete.completers',
		'extendaberg/autocompleters/swapi',
		completers => [
			...completers,
			...[ [ 'p', 'planets' ], [ 's', 'starships' ] ].map( ( [ prefix, type ] ) => ({
					name: 'swapi',
					triggerPrefix: `*${ prefix }`,
					options: abbr => new Promise( resolve => {
						const xhr = new XMLHttpRequest();

						xhr.open( 'GET', `https://swapi.co/api/${ type }?search=${ abbr }` );
						xhr.addEventListener( 'load', () => resolve( JSON.parse( xhr.responseText ).results.map( a => a.name ) ) );
						xhr.send();
					} ),
					getOptionKeywords: abbr => abbr,
					getOptionLabel: abbr => abbr,
					getOptionCompletion: abbr => el( 'strong', {}, abbr ),
				})
			) ]
	);
})
();
