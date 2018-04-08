;(function () {
	const { Fragment, createElement: el } = wp.element;
	const { BlockControls, createBlock } = wp.blocks;

	wp.hooks.addFilter(
		'blocks.Autocomplete.completers',
		'extendaberg/autocompleters/mojimoji',
		completers => [ ...completers, {
			name: 'mojimoji',
			triggerPrefix: ':',
			options: [
				[ 'smile', '😊' ],
				[ 'professor', '🤓' ],
				[ 'nuke', '🤯' ],
				[ 'em-space', ' ' ],
				[ 'quad-space', ' ' ]
			],
			getOptionKeywords: ( [ name, moji ] ) => `${ moji } :${ name }:`,
			getOptionLabel: ( [ name, moji ] ) => `${ moji } :${ name }:`,
			getOptionCompletion: abbr => abbr[ 1 ],
		} ]
	);
})
();
