;(function () {
	const { Fragment, createElement: el } = wp.element;
	const { BlockControls, createBlock } = wp.blocks;

	wp.hooks.addFilter( 'blocks.BlockEdit', 'extendaberg-red-highlight', Block => props => {
		const hasWarning = (
			props.attributes &&
			props.attributes.content &&
			'function' === typeof props.attributes.content.some &&
			props.attributes.content.some( a => 'string' === typeof a && -1 !== a.indexOf( 'Wordpress' ) )
		);

		if ( !hasWarning ) {
			return el( Block, props );
		}

		const content = [ ...props.attributes.content.map( a =>
			'string' === typeof a
				? a.split( /(Wordpress)/ ).map( part => 'Wordpress' === part ? el( 'mark', {}, 'Wordpress' ) : part )
				: a
		) ];

		return el(
			'div',
			{ style: { border: '4px solid red', padding: '1em', position: 'relative' } },
			el( 'span', {
				style: {
					position: 'absolute',
					top: -20,
					left: 25,
					background: 'white',
					padding: '4px',
				}
			}, 'capital_P_dangit!' ),
			el( Block, { ...props, attributes: { ...props.attributes, content } } )
		);
	} );

})
();
