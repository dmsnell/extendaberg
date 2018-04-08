;(function () {
	const { Fragment, createElement: el } = wp.element;
	const { BlockControls, InspectorControls, createBlock } = wp.blocks;

	wp.blocks.registerBlockType( 'extendaberg/block', {
		title: 'Extendaberg',
		icon: 'book',
		category: 'layout',
		edit( { isSelected } ) {
			return [
				isSelected && el(
					BlockControls,
					{ key: 'controls' },
					el( 'p', {}, ' ⇥ Edit it' )
				),
				isSelected && el(
					InspectorControls,
					{},
					el( 'p', {}, 'Edit it here' ),
					el( 'ul', {},
						el( 'li', {}, ' - If' ),
						el( 'li', {}, ' - you' ),
						el( 'li', {}, ' - want' ),
					)
				),
				el( 'p', { key: 'bergish' }, 'Extendablerg' )
			];
		},
		save() {
			return el( 'p', {}, 'Extendabergish will be replaced' );
		}
	} );
})
();
