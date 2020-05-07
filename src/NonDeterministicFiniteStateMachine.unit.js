import NonDeterministicFiniteStateMachine, { LAMBDA } from './NonDeterministicFiniteStateMachine';
import DeterministicFiniteStateMachine from './DeterministicFiniteStateMachine';

const tests = {
  divisibleBy4: {
    description: {
      transitions: {
        start: {
          [LAMBDA]: ['zero', 'startWith1'],
        },
        startWith1: {
          0: ['startWith1', 'div2'],
          1: ['startWith1'],
        },
        div2: {
          0: ['div4'],
        },
        zero: {
          0: ['zero'],
        },
      },
      startState: 'start',
      acceptStates: ['div4', 'zero'],
    },

    tests: {
      accepts: [
        '0100',
        '01000',
        '0100',
        '0',
        '',
      ],
      rejects: [
        '10',
        '11',
        '1001011',
      ],
    }
  },
  divisibleBy4InfiniteLambda: {
    description: {
      transitions: {
        start: {
          [LAMBDA]: ['zero', 'startWith1'],
        },
        startWith1: {
          0: ['startWith1', 'div2'],
          1: ['startWith1'],
        },
        div2: {
          [LAMBDA]: ['startWith1'],
          0: ['div4'],
        },
        zero: {
          [LAMBDA]: ['start'],
          0: ['zero'],
        },
      },
      startState: 'start',
      acceptStates: ['div4', 'zero'],
    },
    tests: {
      accepts: [
        '0100',
        '01000',
        '0100',
        '0',
        '',
      ],
      rejects: [
        '10',
        '11',
        '1001011'
      ],
    }
  },
};

describe('examples', () => {
  for (const [key, desc] of Object.entries(tests)) {
    describe(key, () => {
      test('transition', () => {
        const { description } = desc;

        const fsm = new NonDeterministicFiniteStateMachine(description);
        for (const [state, stateTransitions] of Object.entries(description.transitions)) {
          for (const [symbol, nextState] of Object.entries(stateTransitions)) {
            expect(fsm.transition(state, symbol)).toEqual(nextState);
          }
        }
      });
      test('accepts / rejects', () => {
        const { description, tests: { accepts, rejects } } = desc;
        const fsm = new NonDeterministicFiniteStateMachine(description);

        for (const string of accepts) {
          expect(`${string}: ${fsm.accepts(string)}`).toEqual(`${string}: true`);
        }

        for (const string of rejects) {
debugger
          expect(`${string}: ${fsm.accepts(string)}`).toEqual(`${string}: false`);
        }
      });
    });
  }
});

// NFA TO DFA TESTING
const testNFAdescription0 = {
  transitions: {
     A: {
       0: ['A', 'B'],
       1: ['A'],
     },
     B: {
       0: ['C'],
     },
     C: {
     },
   },
   startState: 'A',
   acceptStates: ['C'],
}

const testNFAdescription1 = {
  transitions: {
     A: {
       0: ['B'],
     },
     B: {
       1: ['C'],
     },
     C: {
       0: ['D'],
     },
     D: {
       0: ['D', 'E'],
       1: ['D'],
     },
     E: {
       1: ['F'],
     },
     F: {
       0: ['G'],
     },
     G: {
     },
   },
   startState: 'A',
   acceptStates: ['G'],
}

const testNFAdescription2 = {
  transitions: {
     A: {
       [LAMBDA]: ['B'],
     },
     B: {
       0: ['C'],
     },
     C: {
       1: ['D'],
     },
     D: {
       1: ['E'],
     },
     E: {
       [LAMBDA]: ['A'],
     },
   },
   startState: 'A',
   acceptStates: ['A'],
}

function testNFAtoDFA(nfaDesc) {
  const testNFA = new NonDeterministicFiniteStateMachine(nfaDesc);
  const solutionDFA = testNFA.toDFA();
  console.log("Trainsitions:");
  console.log(solutionDFA.transitions);
  console.log("Start State:");
  console.log(solutionDFA.startState);
  console.log("Accept State(s):");
  console.log(solutionDFA.acceptStates);
}

testNFAtoDFA(testNFAdescription0);
console.log("");
testNFAtoDFA(testNFAdescription1);
console.log("");
testNFAtoDFA(testNFAdescription2);
