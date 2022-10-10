// Returns a random int i where min <= i < max
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

class FSA {
  constructor() {
    //tracks the current state of the FSA
    let currentState = undefined;
    //this array will contain State objects
    let states = [];
    let thisFSA = this;
      //helper function nameToState(s: string) : State
    //takes in a string s, returns a State with name s, or undefined if no State with name s exists in states
     let nameToState = s => {
      return (states.reduce((acc, e) => e.getName() === s ? e : acc, undefined));
    }
     class State {
      constructor(name) {
        this.state = name;
        //will contain transition objects  type Transition = { [key: string]: string }
        //this.transitions = []; //?
        //will contain stateTransition objects type stateTransition = { [key: string]: State }
        this.nextStatesArr = [];
      }
      getName() {
        return this.state;
      }
      setName(s) {
        this.state = s;
        return this;
      }
      //s is a state object
      addTransition(e, s) {
        let newStateTransition = {};
        //new StateTransition is now {e: s}
        lib220.setProperty(newStateTransition, e, s);
        this.nextStatesArr.push(newStateTransition);
        return this;
      }
      nextState(e) {
        //possibleTransitions will contain only the states which the state object can transition to
        let possibleTransitions = this.nextStates(e);
        //no transitions given the event e for the current state object exist, return undefined
        if (possibleTransitions.length === 0) {
          return undefined;
        }
        else {
          let randIndex = randomInt(0, possibleTransitions.length);
          //transitionName will be the name of the State object we want to transition to
          let transitionState = possibleTransitions[randIndex];
          return transitionState;
        }
      }
      nextStates(e) {
        //transitionStates will be an array of transition objects where e is the event for those objects
        let possibleTransitions = this.nextStatesArr.filter(t => lib220.getProperty(t, e).found);
        let transitionStates = [];
        //for every object in possibleTransitons, push the State of the corresponding name to transitionStates
        for (let i = 0; i < possibleTransitions.length; ++i) {
          transitionStates.push(Object.entries(possibleTransitions[i])[0][1]);
        }
        return transitionStates;
      }
    } //end of State Class

    class Memento {
      constructor() {
        let string = "";
        this.storeState = s => {
          string = s;
        }
        this.getState = () => { 
          return string;
        }
      }
    } //end of Memento Class

    this.nextState = e => {
    //if currentState is undefined, make do modifications, simply return this
    if (currentState === undefined) {
      return this;
    }
    //otherwise move currentState to the next state using the nextState method in the State class
    currentState = currentState.nextState(e);
    return this;
  }

  this.createState = (s, transitions) => {
    //if statesLength us 0, this means this is the first time State objects are being created for this FSA
    let statesLength = states.length;
    //if states contains no states with name s, don't have to replace, otherwise, replace
    let stateSameName = nameToState(s);
    let newState = new State(s);
    for (let i = 0; i < transitions.length; ++i) {
      let eventName = Object.entries(transitions[i])[0][0];
      let stateName = Object.entries(transitions[i])[0][1];
      let stateObj = nameToState(stateName);
      //if a transition in transitions goes to a State which does not exist, create that new state
      if (stateObj === undefined) {
        stateObj = new State(stateName);
        states.push(stateObj);
      }
      newState = newState.addTransition(eventName, stateObj);
    }
    //if there is a state with the same name, replace it in states by replacing reference at the correct index
    //then set currentState to newState because of the repalcement
    if (stateSameName !== undefined) {
      states[states.indexOf(stateSameName)] = newState;
      //we also need to go into the arrays of stateTransitions for each current state and overwrite transitions if need be
      for (let i = 0; i < states.length; ++i) {
        let curTransArray = states[i].nextStatesArr;
        for (let j = 0; j < curTransArray.length; ++j) {
          let curTransition = curTransArray[j]
          let eventName = Object.entries(curTransition)[0][0];
          let stateToName = Object.entries(curTransition)[0][1].getName();
          if (stateToName === s) {
            lib220.setProperty(curTransition, eventName, newState);
          }
        }
      }
      //if the current State has the same name as the newState, change currentState to that new state
      if (currentState === stateSameName) {
        currentState = newState;
      }
    }
    //otherwise this is state has a new name, so simply push to states
    else {
      states.push(newState);
    }
    //only if the currentState is undefined AND this is the first creation of a state should we switch off of undefined
    if (currentState === undefined && statesLength === 0) {
      currentState = newState;
    }
    return this;
  }

  //s is a string, t is a transition object
  this.addTransition = (s,t) => {
    //this will be 0 if no states have been made yet
    let stateLength = states.length;
    let event = Object.entries(t)[0][0];
    let stateToName = Object.entries(t)[0][1];
    let stateFrom = nameToState(s);
    let stateTo = nameToState(stateToName);
    //if stateFrom is undefined, this means that there is no State in states that has a name of s, therefore we should create a state object with name s
    if (stateFrom === undefined) {
      stateFrom = new State(s);
      states.push(stateFrom);
    }
    //if stateTo is undefined, this means that there is no State in states that has a name of stateToName, therefore create new State with that name and push to states
    if (stateTo === undefined) {
      stateTo = new State(stateToName);
      states.push(stateTo);
    }
    let newStateFrom = stateFrom.addTransition(event, stateTo);
    states[states.indexOf(stateFrom)] = newStateFrom;
    //only if this is the first time we are making states AND the currentState is undefined should the current state change
    if (currentState === undefined && stateLength === 0) {
      currentState = newStateFrom;
    }
    return this;
  }

  this.showState = () => {
    return (currentState === undefined ? undefined : currentState.getName());
  }
  
  this.renameState = (name, newName) => {
    let nameState = nameToState(name);
    if (nameState === undefined) {
      return this;
    }
    else {
      let newNameState = nameState.setName(newName);
      //replace old State object with new State object
      states[states.indexOf(nameState)] = newNameState;
      //also need to go through all transition arrays for each state and change the old state (with old name) to new state (with new name)
      for (let i = 0; i < states.length; ++i) {
        let curTransArray = states[i].nextStatesArr;
        for (let j = 0; j < curTransArray.length; ++j) {
          let eventName = Object.entries(curTransArray[j])[0][0];
          let stateToName = Object.entries(curTransArray[j])[0][1].getName();
          if (stateToName === newName) {
            lib220.setProperty(curTransArray[j], eventName, newNameState);
          }
        }
      }
      return this;
    }
  }

  this.createMemento = () => {
    if (currentState === undefined) {
      //if currentState is undefined, not possible to create a memento, therefore return;
      return;
    }
    let memento = new Memento()
    memento.storeState(currentState.getName());
    return memento; 
  }

  this.restoreMemento = m => {
    //this is useful for handling a memento object that was created when the currentState was undefined
    if (m === undefined) {
      return this;
    }
    let mementoState = undefined;
    //go through all states in FSA and see if any of them match name stored in memento. If one does, restore currentState to the state object with that name
    for(let i = 0; i < states.length; ++i) {
      if (states[i].getName() === m.getState()) {
        currentState = states[i];
        return this;
      }
    }
    //otherwise simply return unmodified FSA as a state with the name stored in memento doesn't exist
    return this;
  }
  }
}

//testing and stuff

test("test that new FSA has a state of undefined", function() {
  let testFSA = new FSA();
  assert(testFSA.showState() === undefined);
});

test("test new FSA with a state with one transition", function() {
  let testFSA = new FSA();
  testFSA= testFSA.createState("uno", [{event1: "dos"}]);
  assert(testFSA.showState() === "uno");
  testFSA = testFSA.nextState("event1");
  assert(testFSA.showState() === "dos");
});

test("test creating new state with same name", function() {
  let testFSA = new FSA();
  testFSA = testFSA.createState("uno", [{event1: "dos"}]);
  testFSA = testFSA.createState("uno", [{event1: "tres"}]);
  testFSA = testFSA.nextState("event1");  
  assert(testFSA.showState() === "tres");
});

test("test creating FSA with two states which cycle to each other", function() {
  let testFSA = new FSA();
  testFSA = testFSA.createState("uno", [{event1: "dos"}]);
  testFSA = testFSA.createState("dos", [{event1: "uno"}]);
  assert(testFSA.showState() === "uno");
  testFSA = testFSA.nextState("event1");
  assert(testFSA.showState() === "dos");
  testFSA = testFSA.nextState("event1");
  assert(testFSA.showState() === "uno");
});

test("test basic add transition and then transition using new transition", function() {
  let testFSA = new FSA();
  testFSA = testFSA.createState("uno", [{event1: "dos"}]);
  testFSA = testFSA.addTransition("uno", {event2: "tres"});
  testFSA = testFSA.nextState("event2");
  assert(testFSA.showState() === "tres");
});

test("test basic rename state", function() {
  let testFSA = new FSA();
  testFSA = testFSA.createState("uno", [{event1: "dos"}]);
  testFSA = testFSA.renameState("uno", "pog");
  assert(testFSA.showState() === "pog");
});

test("test basic rename state and transition", function() {
  let testFSA = new FSA();
  testFSA = testFSA.createState("uno", [{event1: "dos"}]);
  testFSA = testFSA.renameState("uno", "pog");
  testFSA = testFSA.nextState("event1");
  assert(testFSA.showState() === "dos");
});

test("test basic memento and restore", function() {
  let testFSA = new FSA();
  testFSA = testFSA.createState("uno", [{event1: "dos"}]);
  let mementoObj = testFSA.createMemento();
  //state should still be uno because no changes have taken place yet
  assert(testFSA.showState() === "uno");
  testFSA = testFSA.nextState("event1");
  assert(testFSA.showState() === "dos");
  testFSA = testFSA.restoreMemento(mementoObj);
  //now swtich back to uno because restoreMemento returned currentState to uno
  assert(testFSA.showState() === "uno");
});

test("test basic memento then rename then restore doesn't change state", function() {
  let testFSA = new FSA();
  testFSA = testFSA.createState("uno", [{event1: "dos"}]);
  //"uno" is the state nane stored in the memento object
  let mementoObj = testFSA.createMemento();
  //state should still be uno because no changes have taken place yet
  assert(testFSA.showState() === "uno");
  testFSA = testFSA.nextState("event1");
  assert(testFSA.showState() === "dos");
  testFSA = testFSA.renameState("uno", "pog");
  //uno has been renamed to pog so when FSA tries to restore to uno, nothing should happen as the state with name "uno" no longer exists
  testFSA = testFSA.restoreMemento(mementoObj);
  assert(testFSA.showState() === "dos");
});

test("doing some testing with the washing machine example", function() {
  let myMachine = new FSA()
  .createState("delicates, low", [{mode: "normal, low"}, {temp: "delicates, medium"}])
  .createState("normal, low", [{mode: "delicates, low"}, {temp: "normal, medium"}])
  .createState("delicates, medium", [{mode: "normal, medium"},
  {temp: "delicates, low"}])
  .createState("normal, medium", [{mode: "delicates, medium"},
  {temp: "normal, high"}])
  .createState("normal, high", [{mode: "delicates, medium"},{temp: "normal, low"}])
  assert(myMachine.showState() === "delicates, low");

  myMachine.nextState("temp") // moves the machine to delicates, medium
  .nextState("mode") // moves the machine to normal, medium
  .nextState("temp"); // moves the machine to normal, high
  let restoreTo = myMachine.createMemento();
  //console.log(restoreTo.getState()); // prints name of state in memento
  myMachine.nextState("mode") // moves the machine to delicates, medium
  .nextState("temp") // moves the machine to delicates, low
  .restoreMemento(restoreTo); // restores the machine to normal, high
  assert(myMachine.showState() === "normal, high");
});


//doing some edge case testing
test("test that a memento created when state was undefined then resotred doesn't change current state", function() {
  let testFSA = new FSA();
  let restoreTo = testFSA.createMemento();
  testFSA = testFSA.createState("uno", [{event1: "dos"}]);
  testFSA = testFSA.restoreMemento(restoreTo);
  assert(testFSA.showState() === "uno");
});

test("test that addTransition after new FSA made sets current state properly", function() {
  let testFSA = new FSA();
  testFSA = testFSA.addTransition("uno", {event1: "dos"});
  assert(testFSA.showState() === "uno");
  testFSA = testFSA.nextState("event1");
  assert(testFSA.showState() === "dos");
});

test("test that after currentState gets out of undefined and back to undefined, createState can't break it out", function() {
  let testFSA = new FSA();
  testFSA = testFSA.addTransition("uno", {event1: "dos"}).nextState("event2");
  assert(testFSA.showState() === undefined);
  let testFSA2 = testFSA.createState("tres", [{event3: "quatro"}]);
  assert(testFSA2.showState() === undefined);
});

test("test that after currentState gets out of undefined and back to undefined, addTransition can't break it out", function() {
  let testFSA = new FSA();
  testFSA = testFSA.createState("uno", [{event1: "dos"}]);
  assert(testFSA.showState() === "uno");
  testFSA = testFSA.nextState("event2");
  assert(testFSA.showState() === undefined);
  let testFSA2 = testFSA.addTransition("tres", {event3: "quatro"});
  assert(testFSA2.showState() === undefined);
});

test("test restore memento and undefined correctly doesn't alter FSA", function() {
  let testFSA = new FSA();
  let mementoObj = testFSA.createMemento();
  testFSA = testFSA.createState("uno", [{event1: "dos"}]);
  assert(testFSA.showState() === "uno");
  testFSA = testFSA.restoreMemento(mementoObj);
  assert(testFSA.showState() === "uno");
});

test("test basic random transition", function() {
  let testFSA = new FSA();
  testFSA = testFSA.addTransition("uno", {event1: "dos"}).addTransition("uno", {event1: "tres"});
  console.log(testFSA.nextState("event1").showState());
});

test("test basic transition", function() {
  let testFSA = new FSA();
  testFSA = testFSA.addTransition("uno", {event1: "dos"}).addTransition("uno", {event2: "tres"});
  assert(testFSA.nextState("event1").showState() === "dos");
});

test("test basic transition 2", function() {
  let testFSA = new FSA();
  testFSA = testFSA.addTransition("uno", {event1: "dos"}).addTransition("uno", {event2: "tres"});
  assert(testFSA.nextState("event2").showState() === "tres");
});