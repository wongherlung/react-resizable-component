var React = require('react');
var ReactDOM = require('react-dom');
var PropTypes = require('prop-types');

var ResizableComponent = React.createClass({
	getInitialState: function() {
		return {
			// Mouse events
			mouseHeldDown: false,
			originalY: 0,
			originalX: 0,

			// Dimensions of box
			direction: this.props.direction,
			initialBoxHeight: this.props.height,
			initialBoxWidth: this.props.width,
			boxHeight: this.props.height,
			boxWidth: this.props.width,
			minHeight: this.props.options.minHeight || this.props.height,
			minWidth: this.props.options.minWidth || this.props.width,
			maxHeight: this.props.options.maxHeight || Infinity,
			maxWidth: this.props.options.maxWidth || Infinity,
			lockAspectRatio: this.props.options.lockAspectRatio || false,
			fullWidth: this.props.options.fullWidth || false,

			// Stepping of resizing
			step: this.props.options.step || 1,
			currStepY: 0,
			currStepX: 0,
			steppingMargin: this.props.steppingMargin,
			originalBoxWidth: this.props.width,
			originalBoxHeight: this.props.height,

			// Width of resizable handle
			cursorMargin: this.props.options.cursorMargin || this.props.cursorMargin,

			// Ghost Resizing
			allowGhostResize: this.props.options.allowGhostResize || false
		};
	},

	propTypes: {
		children: PropTypes.element.isRequired,
		direction: PropTypes.oneOf(['s', 'e', 'se']),

		// Dimensions
		width: PropTypes.number,
		height: PropTypes.number,

		// Styling
		className: PropTypes.string,
		style: PropTypes.object,
		ghostCssStyles: PropTypes.object,

		// Callbacks
		onStartResize: PropTypes.func,
		onStopResize: PropTypes.func,
		onEachStep: PropTypes.func,
		onDuringResize: PropTypes.func,

		// Other options
		options: PropTypes.object
	},

	getDefaultProps: function() {
		return {
			options: {},
			direction: 's',

			height: 50,
			width: 250,

			steppingMargin: 20,
			cursorMargin: 10
		};
	},

	componentDidMount: function() {
	    var _this = this;
	    var parentAttrName = ReactDOM.findDOMNode(this).parentNode.attributes[0].name;
	    var parentAttrValue = ReactDOM.findDOMNode(this).parentNode.attributes[0].value;

	    if (ReactDOM.findDOMNode(this).parentNode.attributes.length > 1) {
			parentAttrName = ReactDOM.findDOMNode(this).parentNode.attributes[1].name;
			parentAttrValue = ReactDOM.findDOMNode(this).parentNode.attributes[1].value;
		}

	    // Attaches event listeners to parent div
	    document.querySelector('[' + parentAttrName + '="' + parentAttrValue + '"]').addEventListener('mousemove', (e) => {
	      _this._resizeDiv(e);
	    });
	    document.querySelector('[' + parentAttrName + '="' + parentAttrValue + '"]').addEventListener('mouseup', (e) => {
	      _this._stopDrag(e);
	    });
	    document.querySelector('[' + parentAttrName + '="' + parentAttrValue + '"]').addEventListener('mouseleave', (e) => {
	      _this._stopDrag(e);
	    });
	},

	_startDrag: function(e) {
		this.makeParentHighlightable(false);
		this.setState({
			mouseHeldDown: true,
			originalY: e.clientY,
			originalX: e.clientX
		}, function() {
			if (this.props.onStartResize) this.props.onStartResize(
				(this.state.boxWidth - this.state.originalBoxWidth) / this.state.step,
				(this.state.boxHeight - this.state.originalBoxHeight) / this.state.step
			);
		});
	},

	_stopDrag: function(e) {
    	this.makeParentHighlightable(true);
		// Only invoke onStopResize if this component has started resizing
		if (this.state.mouseHeldDown && this.props.onStopResize) {
			this.props.onStopResize(
				(this.state.boxWidth - this.state.originalBoxWidth) / this.state.step,
				(this.state.boxHeight - this.state.originalBoxHeight) / this.state.step
			);
		}
		if (!this.state.allowGhostResize) {
			this.setState({
				mouseHeldDown: false,
				initialBoxHeight: this.state.boxHeight,
				initialBoxWidth: this.state.boxWidth
			});
		} else {
			// Ghost resizing
			// Change the dimensions back to the original
			this.setState({
				mouseHeldDown: false,
				boxHeight: this.state.originalBoxHeight,
				boxWidth: this.state.originalBoxWidth
			});
		}

	},

	_resizeDiv: function(e) {
		if (this.state.mouseHeldDown) {
			var distanceY = e.clientY - this.state.originalY;
			var distanceX = e.clientX - this.state.originalX;

			var newHeight = this.state.initialBoxHeight + distanceY;
			var newWidth = this.state.initialBoxWidth + distanceX;

			var steppingRemainderY = distanceY % this.state.step;
			var steppingRemainderX = distanceX % this.state.step;

			// NOTE: For checking whether the new dimensions violates the minimum constraints,
			// The steeping margin is given as allowance so that the box can be re-sized to the smallest
			// dimension smoothly.
			var heightCanChange = newHeight >= (this.state.minHeight - this.state.steppingMargin)
				&& newHeight <= (this.state.maxHeight + this.state.steppingMargin) // newHeight is below maxHeight
				&& steppingRemainderY <= this.state.steppingMargin // A little allowance is given for stepping
				&& this.state.direction.indexOf('s') > -1;

			var widthCanChange = newWidth >= (this.state.minWidth - this.state.steppingMargin)
				&& newWidth <= (this.state.maxWidth + this.state.steppingMargin)
				&& steppingRemainderX <= this.state.steppingMargin
				&& this.state.direction.indexOf('e') > -1;

			// If new dimensions are indeed lesser than the minimum constraint or greater than the maximum constraint,
			// set the dimension to the minimum/maximum respectively
			newHeight = newHeight - steppingRemainderY;
			newWidth = newWidth - steppingRemainderX;
			if (newHeight < this.state.minHeight) newHeight = this.state.minHeight;
			if (newWidth < this.state.minWidth) newWidth = this.state.minWidth;
			if (newHeight > this.state.maxHeight) newHeight = this.state.maxHeight;
			if (newWidth > this.state.maxWidth) newWidth = this.state.maxWidth;

			// If lockAspectRatio is true, we programatically calculate the width
			if (this.state.direction === 'se' && this.state.lockAspectRatio) {
				var aspectRatio = this.state.originalBoxHeight / this.state.originalBoxWidth;
				newWidth = newHeight / aspectRatio;
			}

			this.setState({
				boxHeight: heightCanChange ? newHeight : this.state.boxHeight,
				boxWidth: widthCanChange ? newWidth : this.state.boxWidth
			}, function() {

				// Callback for onDuringResize
				// Not called when step is active
				if (this.props.onDuringResize && this.state.step === 1) {
					this.props.onDuringResize(this.state.boxWidth,
					this.state.boxHeight);
				}

				// Callback for onEachStep
				// Only when step size has changed, then we invoke to callback
				if ((this.state.boxHeight !== this.state.currStepY || this.state.boxWidth !== this.state.currStepX)
					&& this.props.onEachStep && this.state.step > 1) {
					this.props.onEachStep(
						(this.state.boxWidth - this.state.originalBoxWidth) / this.state.step,
						(this.state.boxHeight - this.state.originalBoxHeight) / this.state.step
					);
					this.setState({
						currStepY: this.state.boxHeight,
						currStepX: this.state.boxWidth
					});
				}

			});

    	}
	},

	// Styles the resize handler according to the direction given
	getResizeHandlerStyle: function() {
		var resizeHandlerStyle = {};

		if (this.state.direction === 's') {
			resizeHandlerStyle = {
				width: this.state.boxWidth + 'px',
				height: this.state.cursorMargin + 'px',
				cursor: 's-resize',
				position: 'absolute',
				bottom: '0px',
				left: '0px'
			};
		}

		if (this.state.direction === 'e') {
			resizeHandlerStyle = {
				width: this.state.cursorMargin + 'px',
				height: this.state.boxHeight + 'px',
				cursor: 'e-resize',
				position: 'absolute',
				bottom: '0px',
				right: '0px'
			};
		}

		if (this.state.direction === 'se') {
			resizeHandlerStyle = {
				width: this.state.cursorMargin + 'px',
				height: this.state.cursorMargin + 'px',
				cursor: 'se-resize',
				position: 'absolute',
				bottom: '0px',
				right: '0px'
			};
		}

		resizeHandlerStyle['zIndex'] = 1;
		return resizeHandlerStyle;
	},

	// Helper function to make the all components in parent non-highlight-able
	makeParentHighlightable: function(highlight) {
		var _this = this;
		var parentAttrName = ReactDOM.findDOMNode(this).parentNode.attributes[0].name;
		var parentAttrValue = ReactDOM.findDOMNode(this).parentNode.attributes[0].value;

		if (ReactDOM.findDOMNode(this).parentNode.attributes.length > 1) {
			parentAttrName = ReactDOM.findDOMNode(this).parentNode.attributes[1].name;
			parentAttrValue = ReactDOM.findDOMNode(this).parentNode.attributes[1].value;
		}

		// Attaches event listeners to parent div
		document.querySelector('[' + parentAttrName + '="' + parentAttrValue + '"]').style.userSelect = highlight ? 'all' : 'none';
		document.querySelector('[' + parentAttrName + '="' + parentAttrValue + '"]').style.mozUserSelect = highlight ? 'all' : 'none';
		document.querySelector('[' + parentAttrName + '="' + parentAttrValue + '"]').style.webkitUserSelect = highlight ? 'all' : 'none';
	},

	render: function() {
		var outerDivStyle = {
			backgroundColor: 'transparent',
			width: (!this.state.allowGhostResize) ? this.state.boxWidth + 'px' : 
					(this.state.fullWidth ? '100%' : this.state.originalBoxWidth),
			height: (!this.state.allowGhostResize) ? this.state.boxHeight + 'px' : this.state.originalBoxHeight,
			cursor: 'default',
			position: 'relative'
		};

		// Merge in any custom styles and overwrite existing styles (if any)
		if (this.props.style) {
			var customStyles = this.props.style;
			for (var prop in customStyles) outerDivStyle[prop] = customStyles[prop];
		}

    	var resizeHandlerStyle = this.getResizeHandlerStyle();

		// For ghostResizing
		var highlightDiv;
		if (this.state.allowGhostResize) {
			var ghostDivStyles = {
				zIndex: '1',
				display: this.state.mouseHeldDown ? 'block' : 'none',
				backgroundColor: '#000000',
				opacity: '0.3',
				width: (this.state.fullWidth) ? '100%' :this.state.boxWidth + 'px',
				height: this.state.boxHeight + 'px',
				cursor: 'default',
				position: 'absolute',
				top: '0px',
				left: '0px'
			};
			if (this.props.ghostCssStyles) {
				var css = this.props.ghostCssStyles
				for (var prop in css) ghostDivStyles[prop] = css[prop];
			}
			highlightDiv = <div className="ghostDiv" style={ghostDivStyles}></div>;
		}

		return <div className={this.props.className} style={outerDivStyle}>
			{highlightDiv}
			<div className="resize-handler" style={resizeHandlerStyle} onMouseDown={this._startDrag}></div>
			{this.props.children}
		</div>;
	}
});

module.exports = ResizableComponent;
