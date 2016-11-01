const React = require( 'react' )
import React from 'react'
import ReactDOM from 'react-dom'
import { createStore } from 'redux'
import { Provider, connect } from 'react-redux'

const ADD_QUOTE = Symbol()

const reducer = ( state = [], action ) => {
    switch ( action.type ) {
        case ADD_QUOTE:
            if ( state.includes( action.quote ) ) {
                return state
            }

            return [ ...state, action.quote ]

        default:
            return state
    }
}

const apiMiddleware = ( { dispatch, getState } ) => next => action => {

}

class QuoteList extends Component {
    fetchNewQuote = () => {
        const { addQuote } = this.props

        fetch( 'quoteURL' )
            .then( addQuote )
            .catch( console.log )
    }

    render() {
        const { quotes } = this.props

        return (
            <div>
                <h1>Quotes</h1>
                { quotes.map( quote => <p>{ quote }</p> ) }
                <button onClick={ this.fetchNewQuote }>New Quote</button>
            </div>
        )
    }
}

const mapStateToProps = state => ( {
    quotes: state,
} )

const mapDispatchToProps = dispatch => ( {
    addQuote: quote => dispatch( { type: ADD_QUOTE, quote } ),
} )

const ConnectedQuoteList = connect( mapStateToProps )( QuoteList )

const store = createStore( reducer );

ReactDOM.render(
    <Provider store={ store }>
        <ConnectedQuoteList />
    </Provider>,
    'root'
)