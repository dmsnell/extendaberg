;(function () {
	const { Fragment, createElement: el } = wp.element;
	const { BlockControls, createBlock } = wp.blocks;

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

})
();
