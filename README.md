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
    
    return <div> // NOTE that this parent div should be larger than ResizableBox, if not it can't be resized
      <ResizableBox cssStyles={customStyles}>
        // A children component is *required*.
        <MyOtherComponent/> // Be sure to give your component 100% height and width for it to be resizable
      </ResizableBox>
    </div>;
  }
}
```
## Docs
__IMPORTANT:__ Before you carry on, you should take note how the resizing is done for this component: 
* Every `ResizableBox` has to be enclosed in a larger `div` for resizing to happen. 
* All `eventListeners` for resizing will be attached to the __parent__ of `ResizableBox`.

### 1. Children
A child component must be provided, if not an error would be thrown. If you have no child component, just put it a `div` with `height: 100%` and `width: 100%`. See below:
```javascript
let style = {
  width: '100%',
  height: '100%'
};

<ResizableBox cssStyles={customStyles}>
  // A children component is *required*.
  <div style={style}>
    My own stuff...
  </div>
</ResizableBox>
```
---
### 2. Props
All props that are passed into `ResizableBox` are __optional__.

#### 2.1 `height` (number)
_default: 50_

Specifies the height of the component in pixels
```javascript
<ResizableBox height={50}>
  <div>
    My own stuff...
  </div>
</ResizableBox>
```
#### 2.2 `width` (number) 
_default: 250_

Specifies the width of the component in pixels
```javascript
<ResizableBox width={250}>
  <div>
    My own stuff...
  </div>
</ResizableBox>
```
#### 2.3 `direction` ('s' || 'e' || 'se')
_default: 's'_

Specifies the direction of which the component can extend.
*`'s'` -> South / downwards
*`'e'` -> East / rightwards
*`'se'` -> South-east / downwards and rightwards
```javascript
<ResizableBox direction="se">
  <div>
    My own stuff...
  </div>
</ResizableBox>
```
#### 2.4 `onStartResize` (func)
Callback that will be invoked when resizing starts. Width and height of component will be available. See below:
```javascript
myFunc(width, height) {
  console.log('Width: ' + width);
  console.log('Height: ' + height);
}
...
<ResizableBox onStartResize={this.myFunc}>
  <div>
    My own stuff...
  </div>
</ResizableBox>
```
#### 2.5 `onDuringResize` (func)
Callback that will be invoked when the size of the component changes. Width and height of component will be available. See below:
```javascript
// Note that this will be called only when the component is undergoing resizing and will be called multiple times.
myFunc(width, height) {
  console.log('Width: ' + width);
  console.log('Height: ' + height);
}
...
<ResizableBox onDuringResize={this.myFunc}>
  <div>
    My own stuff...
  </div>
</ResizableBox>
```
