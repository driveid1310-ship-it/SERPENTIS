const React = require('react');
const View = ({ children, ...props }) => React.createElement('AnimatedView', props, children);
module.exports = {
  __esModule: true,
  default: {
    View,
    Text: ({ children, ...props }) => React.createElement('AnimatedText', props, children),
    createAnimatedComponent: (c) => c,
  },
  useSharedValue: (v) => ({ value: v }),
  useAnimatedStyle: (fn) => fn(),
  withTiming: (v) => v,
  withSpring: (v) => v,
};
