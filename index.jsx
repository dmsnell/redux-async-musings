import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { applyMiddleware, compose, createStore } from 'redux'
import { Provider, connect } from 'react-redux'

const tic = () => performance.now()

const ADD_QUOTE = 'ADD_QUOTE'
const REQUEST_QUOTE = 'REQUEST_QUOTE'

const quoteUrl = 'https://api.icndb.com/jokes/random'

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
    if ( 'ADD_QUOTE_SUCCESS' === action.type ) {
        return next( addQuote( action.data ) )
    }

    if ( 'ADD_QUOTE_FAILED' === action.type ) {
        return next( addQuote( { value: { joke: 'Could not load quote' } } ) )
    }

    if ( REQUEST_QUOTE !== action.type ) {
        return next( action )
    }
    
    next( action )
    dispatch( 
        { type: 'HTTP_REQUEST'
        , method: 'GET'
        , errorPolicy: 'DROP'
        , url: quoteUrl
        , onSuccess: 'ADD_QUOTE_SUCCESS'
        , onError: 'ADD_QUOTE_FAILED'
        }
    )
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
        const 
            { quotes
            , thunkFetch
            , middlewareFetch 
            , requestQuote
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

const mapStateToProps = state => ( { quotes: state } )

const addQuote = quote => ( 
    { type: ADD_QUOTE 
    , quote: quote.value.joke
    } 
)

const requestQuote = ( { type: REQUEST_QUOTE } )

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

const ConnectedQuoteList = connect( 
    mapStateToProps, 
    mapDispatchToProps,
)( QuoteList )

const throttle = ( f, ms ) => {
    const throttleState =
        { lastCall: tic()
        , queue: []
        , timer: null
        }

    const flushQueue = () => {
        console.log( `flushing out ${ throttleState.queue.length } calls` )

        throttleState.lastCall = tic()
        throttleState.queue.forEach( args => f( ...args ) )
        throttleState.queue = []
        throttleState.timer = null
    }

    const addToQueue = args => {
        throttleState.queue.push( args )

        if ( ! throttleState.timer ) {
            throttleState.timer = setTimeout( flushQueue, ms )
        }
    }

    return ( ...args ) => addToQueue( args )
}

const batchRequest = throttle(
    ( dispatch, action ) => {
        fetch( action.url )
            .then( r => r.json() )
            .then( data => dispatch( { type: action.onSuccess, data } ) )
            .catch( error => dispatch( { type: action.onError, action, error } ) )
    },
    5000
)

const httpMiddleware = ( { dispatch } ) => next => action => {
    if ( 'HTTP_REQUEST' !== action.type ) {
        return next( action )
    }

    console.log( 'batching' )
    batchRequest( dispatch, action )

    return next( action )
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore( 
    reducer, 
    composeEnhancers( applyMiddleware(
        thunkMiddleware,
        apiMiddleware,
        httpMiddleware,
) ) )

ReactDOM.render(
    <Provider store={ store }>
        <ConnectedQuoteList />
    </Provider>,
    document.getElementById( 'root' ),
)