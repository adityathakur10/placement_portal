import React from 'react';

const Calendar = ({ date, setDate }) => {
  // Get first day of month and days in month
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();

  // Create calendar days array
  let days = [];
  let day = 1;

  for (let i = 0; i < 42; i++) {
    if (i < startingDay || day > daysInMonth) {
      days.push(null);
    } else {
      days.push(day);
      day++;
    }
  }

  return (
    <div className="calendar h-full flex flex-col">
      <div className="calendar-header bg-dark text-white py-2 text-center flex-shrink-0">
        {date.toLocaleString("default", {
          month: "long",
          year: "numeric",
        })}
      </div>
      <div className="bg-dark text-white rounded-b-xl h-[calc(100%-2.5rem)] p-2">
        <div className="grid grid-cols-7 gap-1 h-full">
          {/* Day Headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-red text-center text-xs font-medium h-6 flex items-center justify-center"
            >
              {day.slice(0, 1)}
            </div>
          ))}

          {/* Calendar Days */}
          {days.map((dayNum, i) => {
            if (!dayNum) {
              return (
                <div
                  key={i}
                  className="h-6 flex items-center justify-center text-xs"
                />
              );
            }

            const currentDate = new Date(
              date.getFullYear(),
              date.getMonth(),
              dayNum
            );
            const isToday =
              currentDate.toDateString() === new Date().toDateString();
            const isSelected = currentDate.toDateString() === date.toDateString();

            return (
              <button
                key={i}
                onClick={() => setDate(currentDate)}
                className={`
                  h-6 w-6 mx-auto flex items-center justify-center rounded-full text-xs
                  transition-colors duration-200
                  ${isToday ? "bg-red text-white hover:bg-red/90" : "hover:bg-muted"}
                  ${isSelected && !isToday ? "border border-red" : ""}
                `}
              >
                {dayNum}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;