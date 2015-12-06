# react-resizable-component

DEMO: To be available soon...

A simple React resizable component that comes with features that you might need.
You can make any other react components resizable by wrapping it into this component or you can just use this component as a resizable `div`. 
The main features of this component are as follows:
* Selectable resizable direction
  * East, South and South-east
* Resize in steps/intervals
  * Say resize in intervals of 50 pixels
* Callbacks for important actions
  * `onStartResize`
  * `onDuringResize`
  * `onStopResize`
  * `onEachStep`
* Ghost resizing
 * Resizes a transparent absolutely positioned `div` instead of the original component.
 * To be used in conjunction with `onStopResize` to achieve something like __Microsoft Office Excel's drag down function__.

## Installation
This module does not need any other dependencies except `React` and `ReactDOM`. No `jQuery` needed.

Simply run:
```javascript
npm install react-resizable-component --save
```
## Usage
```javascript
// Simple example shown using ES6
import ResizableBox from 'react-resizable-component';

export default class MyApp extends React.Component {
  render() {
  
    // Custom CSS for ResizableBox
    let customStyles = {
      marginTop: this.state.marginBetBoxes + 'px',
      backgroundColor: 'transparent'
    };
  }
}
```
