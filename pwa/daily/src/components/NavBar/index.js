import React from 'react';
import PropTypes from 'react-proptypes';
import Slider from './Slider';
import Item from './Item';

class NavBar extends React.Component {
    handleSliderOffsetChange = (offset) => {
        const currentView = Math.floor((offset + this.sliderWidth / 2) * this.viewAmount / 100);

        this.props.selectView(currentView);
    };
    createItemClickHandler = (i) => {
        return (e) => {
            this.props.selectView(i);
        };
    };

    get viewAmount() {
        return this.props.titles.length;
    }
    get sliderWidth() {
        return 100 / this.viewAmount;
    }
    get sliderOffset() {
        return this.props.currentView / this.viewAmount * 100;
    }

    render() {
        return (
            <div className="navbar">
                <Slider
                    width={this.sliderWidth}
                    offset={this.sliderOffset}
                    handleOffsetChange={this.handleSliderOffsetChange}
                />
                {this.props.titles.map((title, i) => (
                    <Item
                        key={title}
                        text={title}
                        isSelected={i === this.props.currentView}
                        handleClick={this.createItemClickHandler(i)}
                    />
                ))}
            </div>
        );
    }
}

export default NavBar;

NavBar.propTypes = {
    titles: PropTypes.arrayOf(PropTypes.string).isRequired,
    currentView: PropTypes.number.isRequired,
    selectView: PropTypes.func.isRequired,
};
