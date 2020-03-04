export default class DeterministicFiniteStateMachine {

  /**
   */
  constructor({ transitions, startState, acceptStates }) {
    this.transitions = transitions;
    this.startState = startState;
    this.acceptStates = acceptStates;
  }

  alphabet() {
    const alphabet = new Set();
    
    for(const [state, desc] of Object.entries(this.transitions)) {
      for(const symbol of Object.keys(desc)) {
        alphabet.add(symbol);
      }
    }

    return alphabet.values();
  }

  states() {
    return new Set(Object.keys(this.transitions));
  }

  getAcceptStates(){
    return new Set(this.acceptStates);
  }

  stateAccepted(state) {
    return this.acceptStates.includes(state);
  }

  /**
   *
   * @returns a string state name
   */
  transition(state, symbol) {
    if(!this.transitions[state]) return;
    return this.transitions[state][symbol];
  }
  
  accepts(string, state = this.startState) {
    const nextState = this.transition(state, string.charAt(0));
    return (string.length === 0) ? this.stateAccepted(state) :
                                   this.accepts(string.substr(1), nextState);
  }

}

/**
 *
 */
export function cross(dfa1, dfa2, accepts = (dfa1State, dfa2State) => true) {
  const acceptStates = [];
  const transitions = {};
  const alphabet = new Set([...dfa1.alphabet(), ...dfa2.alphabet()]);

  // A function which returns a state name for a state in machine 1 and a state in machine 2 
  const stateName = (state1, state2) => `m1:${state1}xm2:${state2}`;

  const startState = stateName(dfa1.startState, dfa2.startState);
  const unresolvedStates = [{ state: startState, state1: dfa1.startState, state2: dfa2.startState }];

  while(unresolvedStates.length > 0) {
    const { state1, state2, state } = unresolvedStates.pop();

    transitions[state] = {};
    if(accepts(state1, state2)) acceptStates.push(state);

    for(const symbol of alphabet) {
      const nextState1 = dfa1.transition(state1, symbol);
      const nextState2 = dfa2.transition(state2, symbol);

      const nextState = stateName(nextState1, nextState2);
      transitions[state][symbol] = nextState;

      if(!transitions[nextState]) {
        // recording that we need to process this state
        unresolvedStates.push({ state: nextState, state1: nextState1, state2: nextState2 });
      }
    }
  } 

  return new DeterministicFiniteStateMachine({
    acceptStates,
    startState,
    transitions
  });
}

export function union(dfa1, dfa2) {
  return cross(dfa1, dfa2, 
    (state1, state2) => dfa1.stateAccepted(state1) || dfa2.stateAccepted(state2));
}

export function intersection(dfa1, dfa2) {
  return cross(dfa1, dfa2, 
    (state1, state2) => dfa1.stateAccepted(state1) && dfa2.stateAccepted(state2));
}

export function minus(dfa1, dfa2) {
  return cross(dfa1, dfa2, 
    (state1, state2) => dfa1.stateAccepted(state1) && !dfa2.stateAccepted(state2));
}

function getStateSetMap(states, sets) {
  var index = 0;
  var stateSetMap = {};

  for (const set of Object.values(sets)) {
    for (const state of set) {
      stateSetMap[state] = index;
    }
    index++;
  }
  return stateSetMap;
}

function getStateInputSetMap(dfa, minimizedSets) {
  const stateInputSetMap = {}
  for (const key of Object.keys(dfa.transitions)) {
    stateInputSetMap[key] = {...dfa.transitions[key]};
  }
  const stateSetMap = getStateSetMap([,,,dfa.states()], minimizedSets);

  for (const key0 of  Object.keys(stateInputSetMap)) {
    for (const key1 in Object.keys(stateInputSetMap[key0])) {
      stateInputSetMap[key0][key1] = stateSetMap[stateInputSetMap[key0][key1]];
    }
  }
  return stateInputSetMap;
}

export function minimize(dfa) {
  const acceptStatesSet = dfa.getAcceptStates();
  
  const nonAcceptStatesSet = dfa.states();
  for (const acceptState of acceptStatesSet) {
    nonAcceptStatesSet.delete(acceptState);
  }

  var flag = 0;
  var minimizedSets = {};
  if(acceptStatesSet.size > 0) {
    minimizedSets[0] = [...acceptStatesSet];
    flag = 1;
  }
  if(nonAcceptStatesSet.size > 0) {
    if(flag == 0) {
      minimizedSets[0] = [...nonAcceptStatesSet];
    }
    else {
      minimizedSets[1] = [...nonAcceptStatesSet];
    }
  }

  var previous_size = 0;
  var current_size = Object.keys(minimizedSets).length;
 
  while(current_size != previous_size) {
    // Update previous size
    previous_size = current_size;
    const stateInputSetMap = getStateInputSetMap(dfa, minimizedSets);
    var stateNum = Object.keys(stateInputSetMap).length;
    var mapKeys = [...new Set(Object.keys(stateInputSetMap))];
    var mapValues = [...new Set(Object.values(stateInputSetMap))];
    var setIndex = 0;
 
    for(var i = 0; i < stateNum; i++) {
      if(JSON.stringify(mapValues[i]) !== undefined) {   
        minimizedSets[setIndex] = [mapKeys[i]];
        for (var q = i+1; q < stateNum; q++) {
          if(JSON.stringify(mapValues[q]) !== undefined) {
            if(JSON.stringify(mapValues[i]) === JSON.stringify(mapValues[q])) {
              minimizedSets[setIndex].push(mapKeys[q]);
              delete mapValues[q];
            }         
          }
        }
        delete mapValues[i];
        setIndex++;
      }
    }
    current_size = Object.keys(minimizedSets).length;
  }

  // Constructing new dfa
  const startState = dfa.startState;
  const transitions = {};
  const acceptStates = [];
  const alphabet = new Set([...dfa.alphabet()]);
  
  const stateName = []; 
  for (const list of Object.values(minimizedSets)) {
    stateName.push(list[0]);
    for(const acceptState of acceptStatesSet) {
      if(list.includes(acceptState)) {
        acceptStates.push(list[0]);
        break;
      }
    }
  }

  const stateSetMap = getStateSetMap(dfa.states(), minimizedSets);

  for(const state of stateName) {
    transitions[state] = {};
    for(const symbol of alphabet) {
      transitions[state][symbol] = stateName[stateSetMap[dfa.transition(state, symbol)]];
    }
  }

  return new DeterministicFiniteStateMachine({
    acceptStates,
    startState,
    transitions
  });
}
