import React from 'react';

export default class SpinningImg extends React.Component {

    /////////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////////
    render() {

        return (

            <img height={this.props.height}
                 width={this.props.width}
                 src={this.props.src}
                 className={this.props.class}
                 style={{"transform" : "rotateY(" + this.state.angle + "deg)"}}>

            </img>
        );
    }

    /////////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////////
    componentDidMount() {

        var _this = this;

        var angle = this.props.angle;

        angle = 0.0;

        function update() {

            angle += 5;

            angle =  angle % 360;

            _this.setState({
                angle: angle
            });
        }

        this.timerId = setInterval(function() {
            update();
        }, parseInt(100));
    }

    /////////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////////
    componentWillMount() {

        this.setState({
            angle: 0.0
        });
    }

    /////////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////////
    componentWillUnmount() {

        window.clearInterval(this.timerId);
    }
}

SpinningImg.defaultProps = {
    angle: 0.0
}






