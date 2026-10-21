import React from 'react';
import { 
  RiBriefcaseLine, 
  RiHistoryLine, 
  RiCalendarLine, 
  RiBuilding2Line 
} from 'react-icons/ri';
import StatCard from './StatCard';

const StatsSection = ({ stats }) => {
  return (
    <div className="rounded-xl bg-transparent h-[45%] flex flex-col overflow-hidden shadow-sm">
      
      <div className="grid grid-cols-2 gap-4 flex-1">
        <StatCard 
          icon={<RiBriefcaseLine />}
          count={stats.opportunities}
          label="Opportunities"
          bgColor="bg-primary/10"
          iconColor="text-red"
        />
        
        <StatCard 
          icon={<RiHistoryLine />}
          count={stats.applications}
          label="Applications"
          bgColor="bg-green-100"
          iconColor="text-green-600"
        />
        
        <StatCard 
          icon={<RiCalendarLine />}
          count={stats.events}
          label="Upcoming Events"
          bgColor="bg-yellow-100"
          iconColor="text-yellow-600"
        />
        
        <StatCard 
          icon={<RiBuilding2Line />}
          count={stats.companies}
          label="Companies"
          bgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
      </div>
    </div>
  );
};

export default StatsSection;