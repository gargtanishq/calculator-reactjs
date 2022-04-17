import { useEffect, useReducer } from 'react';
import './App.css';
import DigitsButton from './DigitsButton';
import OperationsButton from './OperationsButton';

export const ACTIONS = {
  ADD_DIGIT: 'ADD_DIGIT',
  CHOOSE_OPERATION: 'CHOOSE_OPERATION',
  CLEAR: 'CLEAR',
  DELETE_DIGIT: 'DELETE_DIGIT',
  EVALUATE: 'EVALUATE'
}

function reducer(state, { type, payload }) {
  switch (type) {

    case ACTIONS.ADD_DIGIT:
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: payload.digit,
          overwrite: false,
        }
      }

      if (payload.digit === '0' && state.currentOperand === '0') {
        return state
      }

      if (payload.digit === '.' && state.currentOperand.includes('.')) {
        return state
      }

      return {
        ...state,
        currentOperand: `${state.currentOperand || ''}${payload.digit}`
      }

    case ACTIONS.CLEAR:
      return {}

    case ACTIONS.CHOOSE_OPERATION:
      if (state.currentOperand == null && state.previousOperand == null) {
        return state
      }

      if (state.currentOperand == null) {
        return {
          ...state,
          operation: payload.operation,
        }
      }

      if (state.previousOperand == null) {
        return {
          ...state,
          operation: payload.operation,
          previousOperand: state.currentOperand,
          currentOperand: null,
        }
      }

      return {
        ...state,
        previousOperand: evaluate(state),
        operation: payload.operation,
        currentOperand: null,
      }

    case ACTIONS.EVALUATE:
      if (state.operation == null || state.currentOperand == null || state.previousOperand == null) {
        return state
      }

      return {
        ...state,
        overwrite: true,
        previousOperand: null,
        operation: null,
        currentOperand: evaluate(state),
      }

    case ACTIONS.DELETE_DIGIT:
      if (state.overwrite) {
        return {
          ...state,
          overwrite: false,
          currentOperand: null
        }
      }

      if (state.currentOperand == null) {
        return state
      }
      if (state.currentOperand.length === 1) {
        return { ...state, currentOperand: null }
      }

      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1)
      }

    default: return state
  }

}

const INTEGER_FORMATTER = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
})

const formatOperand = (operand) => {
  if (operand == null) return
  const [integer, decimal] = operand.split('.')
  if (decimal == null) return INTEGER_FORMATTER.format(integer)
  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`
}

const evaluate = ({ currentOperand, previousOperand, operation }) => {
  const prev = parseFloat(previousOperand);
  const curr = parseFloat(currentOperand);
  if (isNaN(prev) || isNaN(curr)) {
    return ""
  }
  let computated = '';
  // eslint-disable-next-line default-case
  switch (operation) {
    case '+':
      computated = prev + curr;
      break
    case '-':
      computated = prev - curr;
      break;
    case '*':
      computated = prev * curr;
      break
    case '/':
      computated = prev / curr;
      break
  }
  return computated.toString()
}

function App() {
  const [{ currentOperand, previousOperand, operation }, dispatch] = useReducer(reducer, {})

  const keyPressFunc = (e) => {
    console.log(e.key)
    let digit = e.key;
    dispatch({ type: ACTIONS.ADD_DIGIT, payload: { digit } })
  }

  useEffect(() => {
    document.addEventListener("keypress", keyPressFunc)
    return () => {
      document.removeEventListener('keypress', keyPressFunc)
    }
  },)

  return (
    <div className='wrapper'>
      <div className="calculator-grid">
        <div className="output">
          <div className="previous-operand">{formatOperand(previousOperand)} {operation}</div>
          <div className="current-operand">{formatOperand(currentOperand)}</div>
        </div>
        <button className="span-two" onClick={() => dispatch({ type: ACTIONS.CLEAR })}>AC</button>
        <button onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}>DEC</button>
        <OperationsButton dispatch={dispatch} operation="/" />
        <DigitsButton dispatch={dispatch} digit='1' />
        <DigitsButton dispatch={dispatch} digit='2' />
        <DigitsButton dispatch={dispatch} digit='3' />
        <OperationsButton dispatch={dispatch} operation="*" />
        <DigitsButton dispatch={dispatch} digit='4' />
        <DigitsButton dispatch={dispatch} digit='5' />
        <DigitsButton dispatch={dispatch} digit='6' />
        <OperationsButton dispatch={dispatch} operation="+" />
        <DigitsButton dispatch={dispatch} digit='7' />
        <DigitsButton dispatch={dispatch} digit='8' />
        <DigitsButton dispatch={dispatch} digit='9' />
        <OperationsButton dispatch={dispatch} operation="-" />
        <DigitsButton dispatch={dispatch} digit='.' />
        <DigitsButton dispatch={dispatch} digit='0' />
        <button className="span-two" onClick={() => dispatch({ type: ACTIONS.EVALUATE })}>=</button>
      </div>
    </div>
  );
}

export default App;
