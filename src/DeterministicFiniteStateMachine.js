export default class DeterministicFiniteStateMachine {

  /**
   */
  constructor({ transitions, startState, acceptStates }) {
    this._transitions = transitions;
    this._startState  = startState;
    this._acceptStates = acceptStates;
  }

  /**
   *
   * @returns a string state name
   */
  transition(state, symbol) {
    return this._transitions[state][symbol];
  }

  accepts(string, state = this._startState) {
    var i;
    for (i = 0; i < string.length; i++) {
      nextState = transition(state, string..charAt(i));
      state = nextState;
      }

    if(this._acceptStates.includes(state)) {
      return "Accepted";
      }
      else {
        return "Rejected";
      }
    }
  }

}
