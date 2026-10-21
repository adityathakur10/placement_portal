import React from 'react';

const Calendar = ({ date, setDate }) => {
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null); // Empty cells for days before the 1st
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  
  const nextMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
  };
  
  const prevMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
  };
  
  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };
  
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
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
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
            const isSelectedDay = currentDate.toDateString() === date.toDateString();
            const isTodayDay = isToday(dayNum);

            return (
              <button
                key={i}
                onClick={() => setDate(currentDate)}
                className={`
                  h-6 w-6 mx-auto flex items-center justify-center rounded-full text-xs
                  transition-colors duration-200
                  ${isTodayDay ? "bg-red text-white hover:bg-red/90" : "hover:bg-muted"}
                  ${isSelectedDay && !isTodayDay ? "border border-red" : ""}
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