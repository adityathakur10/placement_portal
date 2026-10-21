import React from 'react';
import ProcessStatus from './ProcessStatus';

const HiringTimeline = ({ 
  workflowData, 
  isExpanded, 
  onToggleExpand,
  jobId
}) => {
  if (!workflowData || workflowData.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        No hiring process information available
      </div>
    );
  }

  // Sort workflow data by start date
  const sortedWorkflow = [...workflowData].sort(
    (a, b) => new Date(a.startDateTime) - new Date(b.startDateTime)
  );

  // Filter processes based on expansion state
  const filteredProcesses = sortedWorkflow.filter((process, index, array) => {
    if (isExpanded) return true;
    
    // When collapsed, show only the current or nearest upcoming process
    const now = new Date();
    
    // Current processes
    const currentProcesses = array.filter(p => 
      new Date(p.startDateTime) <= now && 
      new Date(p.endDateTime) >= now
    );
    
    if (currentProcesses.length > 0) {
      return process.id === currentProcesses[0].id;
    }
    
    // Next upcoming process
    const upcomingProcesses = array.filter(p => new Date(p.startDateTime) > now)
      .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
      
    if (upcomingProcesses.length > 0) {
      return process.id === upcomingProcesses[0].id;
    }
    
    // Most recent past process
    const pastProcesses = array.filter(p => new Date(p.endDateTime) < now)
      .sort((a, b) => new Date(b.endDateTime) - new Date(a.endDateTime));
      
    if (pastProcesses.length > 0) {
      return process.id === pastProcesses[0].id;
    }
    
    return index === 0; // Fallback to first process
  });

  return (
    <div className="mt-6 relative">
      {/* Header with expand/collapse control */}
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-medium text-sm text-gray-500">Hiring Process</h4>
        <button 
          onClick={onToggleExpand}
          className="btn btn-xs btn-ghost"
        >
          {isExpanded ? 'Collapse' : 'View All Rounds'}
          {isExpanded ? 
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg> :
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          }
        </button>
      </div>

      {/* Timeline with color-coded sideline */}
      <div className="space-y-3">
        {filteredProcesses.map((process, index, filteredArray) => {
          // Determine status
          const now = new Date();
          const startDate = new Date(process.startDateTime);
          const endDate = new Date(process.endDateTime);
          
          let status = "upcoming"; // default
          if (now >= startDate && now <= endDate) {
            status = "current";
          } else if (now > endDate) {
            status = "past";
          }
          
          const processStatus = ProcessStatus({ status });
          
          // Calculate connector line styling
          const isFirst = index === 0;
          const isLast = index === filteredArray.length - 1;
          const lineTopClass = isFirst ? "top-4" : "top-0";
          const lineBottomClass = isLast ? "bottom-12" : "bottom-0";
          
          return (
            <div key={process.id} className="relative">
              {/* Timeline connector line with color coding */}
              <div className={`absolute left-4 ${lineTopClass} ${lineBottomClass} w-0.5 ${processStatus.colors}`}></div>
              
              <div className="flex items-start relative pl-10">
                {/* Timeline node indicator */}
                <div className={`absolute left-0 w-8 h-8 rounded-full ${processStatus.colors} flex items-center justify-center text-white font-medium z-10`}>
                  {index + 1}
                </div>
                
                {/* Process card */}
                <div className={`flex-1 ${processStatus.bgColors} p-3 rounded-lg border border-${status === 'current' ? 'green' : status === 'upcoming' ? 'yellow' : 'gray'}-200`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        {process.title || process.type?.replace('-', ' ').toUpperCase() || "Round"}
                      </div>
                      <div className="text-sm text-muted flex flex-wrap gap-2 items-center">
                        <span className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                          {new Date(process.startDateTime).toLocaleDateString()}
                        </span>
                        <span className="text-xs font-medium" title="Start and end times">
                          {new Date(process.startDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          {' - '}
                          {new Date(process.endDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        {/* Duration indicator */}
                        <span className="text-xs opacity-75">
                          ({Math.round((new Date(process.endDateTime) - new Date(process.startDateTime)) / (60 * 60 * 1000))} hrs)
                        </span>
                        {process.venue && (
                          <span className="badge badge-sm badge-ghost">{process.venue}</span>
                        )}
                        {processStatus.badge}
                      </div>
                    </div>
                    <div className="badge badge-outline">
                      {process.type?.replace("-", " ").toUpperCase() || "Round"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show counts and status summary when collapsed */}
      {!isExpanded && workflowData.length > 1 && (
        <div className="mt-2 text-center text-sm text-gray-500">
          {workflowData.length - 1} more rounds not shown
          <div className="flex justify-center gap-2 mt-1">
            <span className="inline-flex items-center">
              <span className="w-2 h-2 rounded-full bg-gray-300 mr-1"></span> Completed
            </span>
            <span className="inline-flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span> In Progress
            </span>
            <span className="inline-flex items-center">
              <span className="w-2 h-2 rounded-full bg-yellow-400 mr-1"></span> Upcoming
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HiringTimeline;