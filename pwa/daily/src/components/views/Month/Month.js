import React from 'react';
import PropTypes from 'react-proptypes';
import Day from './Day';

class Month extends React.Component {
    isDateInFuture = (date) => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        if (this.props.year > year) {
            return true;
        } else if (this.props.year === year) {
            if (this.props.month > month) {
                return true;
            } else if (this.props.month === month) {
                if (date > today.getDate()) {
                    return true;
                }
            }
        }

        return false;
    };

    get weeks() {
        let weeks = [];

        let firstDayIndex = new Date(this.props.year, this.props.month, 1).getUTCDay();
        if (firstDayIndex === 1) {
            firstDayIndex = 7;
        } else {
            weeks.push({
                dates: this.props.dates.slice(0, 7 - firstDayIndex),
            });
        }
        for (let i = 7 - firstDayIndex; i < this.props.dates.length; i += 7) {
            weeks.push({
                dates: this.props.dates.slice(i, i + 7),
            });
        }

        return weeks;
    }
    get monthName() {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        return monthNames[this.props.month];
    }
    get dayNames() {
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    }

    render() {
        return (
            <table className="month">
                <thead>
                    <tr>
                        <th colSpan={7}>
                            <p className="month-name">{this.monthName}</p>
                        </th>
                    </tr>
                    <tr>
                        {this.dayNames.map((dayName, i) => (
                            <th key={i}>
                                <p className="month-day">{dayName}</p>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {this.weeks.map((week, i) => (
                        <tr key={i}>
                            {i === 0 && week.dates.length < 7 && (
                                <td colSpan={7 - week.dates.length}/>
                            )}
                            {week.dates.map((data, i) => (
                                <td key={i}>
                                    <Day
                                        displayText={`${i + 1}`}
                                        isInFuture={this.isDateInFuture(i + 1)}
                                        checks={data ? data.checks : []}
                                        handleClick={this.props.handleDateClick}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }
}

export default Month;

Month.propTypes = {
    year: PropTypes.number.isRequired,
    month: PropTypes.number.isRequired,
    dates: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number,
        checks: PropTypes.arrayOf(PropTypes.oneOf([null, true, false])).isRequired,
    })).isRequired,
    handleDateClick: PropTypes.func.isRequired,
};
