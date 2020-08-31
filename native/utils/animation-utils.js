// @flow

import Animated, { Easing } from 'react-native-reanimated';
import { State as GestureState } from 'react-native-gesture-handler';

/* eslint-disable import/no-named-as-default-member */
const {
  Clock,
  Value,
  cond,
  not,
  greaterThan,
  eq,
  sub,
  set,
  startClock,
  stopClock,
  clockRunning,
  timing,
} = Animated;
/* eslint-enable import/no-named-as-default-member */

function clamp(value: Value, minValue: Value, maxValue: Value): Value {
  return cond(
    greaterThan(value, maxValue),
    maxValue,
    cond(greaterThan(minValue, value), minValue, value),
  );
}

function delta(value: Value) {
  const prevValue = new Value(0);
  const deltaValue = new Value(0);
  return [
    set(deltaValue, cond(eq(prevValue, 0), 0, sub(value, prevValue))),
    set(prevValue, value),
    deltaValue,
  ];
}

function gestureJustStarted(state: Value) {
  const prevValue = new Value(-1);
  return cond(eq(prevValue, state), 0, [
    set(prevValue, state),
    eq(state, GestureState.ACTIVE),
  ]);
}

function gestureJustEnded(state: Value) {
  const prevValue = new Value(-1);
  return cond(eq(prevValue, state), 0, [
    set(prevValue, state),
    eq(state, GestureState.END),
  ]);
}

const defaultTimingConfig = {
  duration: 250,
  easing: Easing.out(Easing.ease),
};

type TimingConfig = $Shape<typeof defaultTimingConfig>;
function runTiming(
  clock: Clock,
  initialValue: Value | number,
  finalValue: Value | number,
  startStopClock: boolean = true,
  config: TimingConfig = defaultTimingConfig,
): Value {
  const state = {
    finished: new Value(0),
    position: new Value(0),
    frameTime: new Value(0),
    time: new Value(0),
  };
  const timingConfig = {
    ...defaultTimingConfig,
    ...config,
    toValue: new Value(0),
  };
  return [
    cond(not(clockRunning(clock)), [
      set(state.finished, 0),
      set(state.frameTime, 0),
      set(state.time, 0),
      set(state.position, initialValue),
      set(timingConfig.toValue, finalValue),
      startStopClock && startClock(clock),
    ]),
    timing(clock, state, timingConfig),
    cond(state.finished, startStopClock && stopClock(clock)),
    state.position,
  ];
}

export { clamp, delta, gestureJustStarted, gestureJustEnded, runTiming };
