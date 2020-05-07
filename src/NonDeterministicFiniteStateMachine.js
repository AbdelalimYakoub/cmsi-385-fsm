import DeterministicFiniteStateMachine from './DeterministicFiniteStateMachine';

export const LAMBDA = '';

export default class NonDeterministicFiniteStateMachine extends DeterministicFiniteStateMachine {

  /**
   */
  constructor(description) {
    super(description);
  }


  /**
   *
   * @returns a string state name
   */
  transition(state, symbol) {
    if(!this.transitions[state]) return [];
    return this.transitions[state][symbol] || [];
  }

  reachableByLambda(state, reachable = {}) {
    if(reachable[state]) return; // prevent infinting looping
    reachable[state] = true;

    for (const nextState of this.transition(state, LAMBDA)) {
      this.reachableByLambda(nextState, reachable);
    }

    return Object.keys(reachable);
  }

  possibleNextStates(state, symbol) {
    const nextStates = new Set();

    for (const reachableLambdaState of this.reachableByLambda(state)) {
      for (const nextState of this.transition(reachableLambdaState, symbol)) {
        nextStates.add(nextState);
      }
    }

    for (const nextState of nextStates) {
      for (const nextStateAfterLambda of this.reachableByLambda(nextState)) {
        nextStates.add(nextStateAfterLambda);
      }
    }
    return nextStates;
  }

  // Check if string is accepted in NFA
  accepts(string, state = this.startState) {

    if(string.length === 0 && this.stateAccepted(state)) {
      return true;
    }

    for(const nextState of this.possibleNextStates(state, string.charAt(0))) {
      if(this.accepts(string.substr(1), nextState)) {
        return true;
      }
    }

    return false;
  }

  // Transform NFA to DFA
  toDFA() {

    // Dead State Flag
    let deadFlag = 0;

    // Start State
    let startState = this.reachableByLambda(this.startState).join();

    // Accept States
    const acceptStates = [];

    // Alphabet
    const alphabet = new Set([...this.alphabet()]); alphabet.delete(LAMBDA);

    // Append Start State to Unresolved States
    const unresolvedStates = [{ state: startState }];

    // Loop Until No More Unresolved States
    const transitions = {};
    while(unresolvedStates.length > 0) {
      const { state } = unresolvedStates.pop();

      transitions[state.split(',').sort().join("")] = {};

      // Check if new state is accepted
      for(const acceptState of this.getAcceptStates()) {
        if(state.includes(acceptState)) {
          acceptStates.push(state.split(',').sort().join(""));
        }
      }

      // Iterate through alpahbet
      for(const symbol of alphabet) {
        let nextState = '';
        for(const singleState of state.split(',')) {
          if(this.possibleNextStates(singleState, symbol).size != 0) {
            const partialNext = [...this.possibleNextStates(singleState, symbol)];
            if(nextState == '') {
              nextState = partialNext.sort().join(",");
            }
            else {
              if(!nextState.includes(partialNext.sort().join(","))) {
                nextState = nextState + ',' + partialNext.sort().join(",");
              }
            }
          }
        }

        // Next State is Dead
        if(nextState == '') {
          transitions[state.split(',').sort().join("")][symbol] = ['DEAD'];
          deadFlag = 1;
        }
        else {
          transitions[state.split(',').sort().join("")][symbol] = [nextState.split(',').sort().join("")];

          // Check If Nextstate is solved or not
          if(!transitions[nextState.split(',').sort().join("")]) {
            // If not solved yet, then add to unresolvedStates
            unresolvedStates.push({ state: nextState });
          }
        }
      }
    }

    // Check if Dead State Exits, if so add it
    if(deadFlag == 1) {
      transitions['DEAD'] = {};
      for(const symbol of alphabet) {
        transitions['DEAD'][symbol] = ['DEAD'];
      }
    }

    // Fix start state format before passing it in
    startState = startState.split(',').sort().join("");

    return new DeterministicFiniteStateMachine({
      acceptStates,
      startState,
      transitions
    });
  }
}
