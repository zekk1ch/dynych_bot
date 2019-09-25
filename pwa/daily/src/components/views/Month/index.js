import React from 'react';
import PropTypes from 'react-proptypes';
import Slidable from '../Slidable';
import Controls from '../Controls';
import Month from './Month';

class MonthView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentMonth: this.months.length - 1,
        };
    }

    setMonth = (i) => {
        this.setState({
            currentMonth: i,
        });
    };
    resetMonth = () => {
        this.setState({
            currentMonth: this.months.length - 1,
        });
    };

    getNumOfDaysInMonth = (year, month) => {
        return new Date(year, month, 0).getDate();
    };
    get months() {
        let months = [];

        this.props.dates.forEach((data, i, arr) => {
            const isFirstDate = i === 0;
            const isLastDate = i === arr.length - 1;
            let monthIndex = isFirstDate ? 0 : months.length - 1;
            const prevYear = isFirstDate ? null : months[monthIndex].year;
            const prevMonth = isFirstDate ? null : months[monthIndex].month;
            const dateObj = new Date(data.id);
            const year = dateObj.getFullYear();
            const month = dateObj.getMonth();

            if (year > prevYear || month !== prevMonth) {
                let stopYear, stopMonth, currYear, currMonth;

                if (isLastDate) {
                    const today = new Date();
                    stopYear = today.getFullYear();
                    stopMonth = today.getMonth();
                } else {
                    stopYear = year;
                    stopMonth = month;
                }
                if (prevYear !== null && prevMonth !== null) {
                    currYear = prevYear;
                    currMonth = prevMonth + 1;
                    if (currMonth >= 12) {
                        currMonth = 0;
                        currYear++;
                    }
                } else {
                    currYear = year;
                    currMonth = month;
                }

                while (currYear < stopYear || currMonth <= stopMonth) {
                    months.push({
                        year: currYear,
                        dates: Array(this.getNumOfDaysInMonth(currYear, currMonth + 1)).fill(null),
                        month: currMonth,
                    });

                    if (currYear === year && currMonth === month) {
                        monthIndex = months.length - 1;
                    }

                    currMonth++;
                    if (currMonth >= 12) {
                        currMonth = 0;
                        currYear++;
                    }
                }
            }

            months[monthIndex].dates[dateObj.getDate() - 1] = data;
        });

        if (!months.length) {
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth();

            months.push({
                year,
                month,
                dates: Array(this.getNumOfDaysInMonth(year, month + 1)).fill(null),
            });
        }

        return months;
    }

    render() {
        return (
            <div className="view">
                <div className="content">
                    <Controls
                        reset={this.resetMonth}
                        isResetHidden={this.state.currentMonth === this.months.length - 1}
                    />
                    <Slidable currentIndex={this.state.currentMonth} setIndex={this.setMonth}>
                        {this.months.map((month, i) => (
                            <Month
                                key={i}
                                handleDateClick={this.props.handleDateClick}
                                {...month}
                            />
                        ))}
                    </Slidable>
                </div>
            </div>
        );
    }
}

export default MonthView;

MonthView.propTypes = {
    dates: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number,
    })).isRequired,
    handleDateClick: PropTypes.func.isRequired,
};
