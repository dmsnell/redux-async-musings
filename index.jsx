import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { applyMiddleware, compose, createStore } from 'redux'
import { Provider, connect } from 'react-redux'

const ADD_QUOTE = 'ADD_QUOTE'
const REQUEST_QUOTE = 'REQUEST_QUOTE'

const quoteUrl = 'http://api.icndb.com/jokes/random'

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

const apiState = {
    isFetching: false,
}

const apiMiddleware = ( { dispatch, getState } ) => next => action => {
    if ( REQUEST_QUOTE !== action.type ) {
        return next( action )
    }

    if ( apiState.isFetching ) {
        return next( action )
    }

    apiState.isFetching = true
    fetch( quoteUrl )
        .then( r => r.json() )
        .then( quote => {
            apiState.isFetching = false
            dispatch( addQuote( quote ) )
        } )
        .catch( console.log )
    
    return next( action )
}

const thunkMiddleware = ( { dispatch } ) => next => action =>
    'function' === typeof action
        ? action( dispatch )
        : next( action )

class QuoteList extends Component {
    fetchNewQuote = () => {
        const { addQuote } = this.props

        fetch( quoteUrl )
            .then( r => r.json() )
            .then( addQuote )
            .catch( console.log )
    }

    render() {
        const { 
            quotes,
            thunkFetch,
            middlewareFetch, 
            requestQuote,
        } = this.props

        return (
            <div>
                <h1>Quotes</h1>
                <p><button onClick={ this.fetchNewQuote }>New Quote (Component Fetch)</button></p>
                <p><button onClick={ thunkFetch }>New Quote (Thunk Fetch)</button></p>
                <p><button onClick={ requestQuote }>New Quote (Middleware Fetch)</button></p>
                <div>
                    { quotes.map( quote => <p key={ quote }>{ quote }</p> ) }
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => ( {
    quotes: state,
} )

const addQuote = quote => ( { 
    type: ADD_QUOTE, 
    quote: quote.value.joke,
} )

const requestQuote = ( {
    type: REQUEST_QUOTE,
} )

const thunkFetch = dispatch => (
    fetch( quoteUrl )
        .then( r => r.json() )
        .then( quote => dispatch( addQuote( quote ) ) )
        .catch( console.log )
)

const mapDispatchToProps = dispatch => ( {
    addQuote: quote => dispatch( addQuote( quote ) ),
    requestQuote: () => dispatch( requestQuote ),
    thunkFetch: () => dispatch( thunkFetch ),
} )

const ConnectedQuoteList = connect( mapStateToProps, mapDispatchToProps )( QuoteList )

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore( 
    reducer, 
    composeEnhancers( applyMiddleware(
        thunkMiddleware,
        apiMiddleware,
) ) )

ReactDOM.render(
    <Provider store={ store }>
        <ConnectedQuoteList />
    </Provider>,
    document.getElementById( 'root' ),
)