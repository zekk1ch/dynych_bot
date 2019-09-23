import React from 'react';
import PropTypes from 'react-proptypes';
import Slidable from '../Slidable';
import Month from './Month';

class MonthView extends React.Component {
    state = {
        currentMonth: 0,
    };

    setMonth = (i) => {
        this.setState({
            currentMonth: i,
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
                        month: currMonth,
                        dates: Array(this.getNumOfDaysInMonth(currYear, currMonth + 1)).fill(null),
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

        return months;
    }

    render() {
        return (
            <div className="view">
                <div className="content">
                    <Slidable currentIndex={this.state.currentMonth} setIndex={this.setMonth}>
                        {this.months.map((month, i) => (
                            <Month key={i} {...month}/>
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
};
