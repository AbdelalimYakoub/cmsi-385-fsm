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
      nextState = this.transition(state, string..charAt(i));
      state = nextState;
      }

    return this._acceptStates.includes(state);
    }

    // PROFESSORS METHOD
    // isAcceptState(state) {
    //   return this._acceptStates.includes(state);
    // }

    // accepts(string, state = this._startState) {
    //   const nextState = this.transition(state, string.charAt(0));
    //
    //   return (string.length === 0) ? this.isAcceptState(state) :
    //                                  this.accepts(string.substr(1), nextState)
    // }
  }

}
