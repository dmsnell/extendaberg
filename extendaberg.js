;(function () {
	const { Fragment, createElement: el } = wp.element;
	const { BlockControls, InspectorControls, createBlock } = wp.blocks;

	wp.blocks.registerBlockType( 'extendaberg/block', {
		title: 'Extendaberg',
		icon: 'book',
		category: 'layout',
		attributes: {
			label: { type: 'string' }
		},
		edit( { attributes, isSelected, setAttributes } ) {
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
				el( 'div', { contentEditable: isSelected, style: { border: '1px solid red' } },
					attributes.label,
					el( 'select', {}, ...[ 'Austria', 'Bulgaria', 'Canada' ].map( country => el( 'option', {}, country ) ) )
				)
			];
		},
		save() {
			return el( 'p', {}, attributes.label );
		}
	} );

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

	const clippyStore = wp.data.registerStore(
		'extendaberg',
		{
			reducer( state = { step: 0, name: '', subject: '' }, action ) {
				switch ( action.type ) {
					case 'PROGRESS':
						return { ...state, step: state.step + 1 };

					case 'RESET':
						return { step: 0, name: '', subject: '' };

					case 'SET_NAME':
						return { ...state, name: action.name };

					case 'SET_SUBJECT':
						return { ...state, subject: action.subject };

					default:
						return state;
				}
			},

			actions: {
				progress: () => ({ type: 'PROGRESS' }),
				reset: () => ({ type: 'RESET' }),
				setAddressant: name => ({ type: 'SET_NAME', name }),
				setSubject: subject => ({ type: 'SET_SUBJECT', subject }),
			},

			selectors: {
				getAddressant: state => state.name,
				getStep: state => state.step,
				getSubject: state => state.subject,
			}
		}
	);

	const clippyState = {
		steps: args => {
			const dispatch = wp.data.dispatch( 'extendaberg' );

			return [
				el( 'div', { style: { paddingLeft: '1em' } },
					el( 'p', {}, 'It looks like you are trying to write a letter.' ),
					el( 'div',
						{ style: { paddingLeft: '1em' } },
						el( 'p',
							{ onClick: () => dispatch.progress() },
							el( 'label', {}, 'Yes' ),
							el( 'input', { type: 'radio', name: 'yesno', value: 'Yes' } )
						),
						el( 'p',
							{ onClick: () => wp.data.dispatch( 'core/edit-post' ).closeGeneralSidebar() },
							el( 'label', {}, 'No' ),
							el( 'input', { type: 'radio', name: 'yesno', value: 'No' } )
						),
					),
				),
				el( 'div', {},
					el( 'p', {}, 'To whom are you writing it?' ),
					el( 'p', {},
						el( 'label', {}, 'To: ' ),
						el( 'input', {
							type: 'text',
							onChange: event => dispatch.setAddressant( event.target.value ),
							value: args.name
						} ),
						el( 'input', {
							type: 'submit',
							onClick: event => dispatch.progress()
						} )
					)
				),
				el( 'div', {},
					el( 'p', {}, 'Why are you writing it?' ),
					el( 'p', {},
						el( 'label', {}, 'Subject: ' ),
						el( 'input', {
							type: 'text',
							onChange: event => dispatch.setSubject( event.target.value ),
							value: args.subject
						} ),
						el( 'input', {
							type: 'submit', onClick: () => {
								wp.data.dispatch( 'core/editor' ).insertBlock(
									createBlock(
										'core/paragraph',
										{
											content: [
												el( 'strong', {}, 'To' ), ': ', el( 'em', {}, args.name ),
												el( 'br', {} ),
												el( 'strong', {}, 'From' ), ': ', el( 'em', {}, args.subject ),
												el( 'br', {} ),
												el( 'strong', {}, 'Message' ), ': '
											]
										},
										[]
									)
								);
								dispatch.reset();
							}
						} )
					)
				),
				el( 'div', {},
					el( 'p', {}, 'Very good! Continue 😊' )
				)
			];
		}
	};

	wp.plugins.registerPlugin( 'extendaberg-clippy', {
		render: wp.data.withSelect( select => ({
			name: select( 'extendaberg' ).getAddressant(),
			step: select( 'extendaberg' ).getStep(),
			subject: select( 'extendaberg' ).getSubject(),
		}) )( args => {
			const { step } = args;
			const { PluginMoreMenuItem, PluginSidebar } = wp.editPost.__experimental;

			return (
				el( Fragment, {},
					el( PluginMoreMenuItem, {
						name: 'menu-item-clippy',
						type: 'sidebar',
						target: 'sidebar-clippy'
					}, 'Clippy' ),
					el( PluginSidebar, {
							name: 'sidebar-clippy',
							title: 'Clippy'
						},
						clippyState.steps( args )[ step ]
					)
				)
			);
		} )
	} );

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
