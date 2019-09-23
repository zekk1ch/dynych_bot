import React from 'react';
import PropTypes from 'react-proptypes';
import Day from './Day';

class Month extends React.Component {
    get weeks() {
        let weeks = [];

        const dates = this.props.dates.map((data, i) => ({
            displayText: `${i + 1}`,
            data,
        }));

        let firstDayIndex = new Date(this.props.year, this.props.month, 1).getUTCDay();
        if (firstDayIndex === 1) {
            firstDayIndex = 7;
        } else {
            weeks.push({
                dates: dates.slice(0, 7 - firstDayIndex),
            });
        }
        for (let i = 7 - firstDayIndex; i < this.props.dates.length; i += 7) {
            weeks.push({
                dates: dates.slice(i, i + 7),
            });
        }

        return weeks;
    }

    render() {
        return (
            <table className="month">
                <tbody>
                    {this.weeks.map((week, i) => (
                        <tr key={i}>
                            {i === 0 && week.dates.length < 7 && (
                                <td colSpan={7 - week.dates.length}/>
                            )}
                            {week.dates.map((date, i) => (
                                <td key={i}>
                                    <Day {...date}/>
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
    })).isRequired,
};
