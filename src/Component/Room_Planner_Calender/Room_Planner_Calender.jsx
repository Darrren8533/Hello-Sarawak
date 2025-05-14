import React, { useState } from 'react';
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import { createViewMonthGrid, createViewWeek } from "@schedule-x/calendar";
import { createEventsServicePlugin } from '@schedule-x/events-service';
import "@schedule-x/theme-default/dist/index.css";
import './Room_Planner_Calender.css';

function RoomPlannerCalendar() {
  const eventsService = useState(() => createEventsServicePlugin())[0];

  const calendar = useCalendarApp({
    views: [createViewWeek(), createViewMonthGrid()],
    events: [
      {
        id: '1',
        start: '2025-03-16',
        end: '2025-03-16',
      },
    ],
    plugins: [eventsService]
  });

  return (
    <div>
      <ScheduleXCalendar calendarApp={calendar} />
    </div>
  );
}

export default RoomPlannerCalendar;
