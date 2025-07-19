import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, subMonths, addMonths, startOfWeek, endOfWeek } from 'date-fns';
import { useCrm } from '../../context/CrmContext';

const CalendarPage = () => {
  const { events, addEvent, deleteEvent } = useCrm();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '12:00',
  });

  // Calculate the full grid for the calendar (including previous/next month days)
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (newEvent.title.trim()) {
      try {
        await addEvent({
          title: newEvent.title,
          dateTime: new Date(`${newEvent.date}T${newEvent.time}`).toISOString(),
        });
        setNewEvent({
          title: '',
          date: format(new Date(), 'yyyy-MM-dd'),
          time: '12:00',
        });
        setShowAddEvent(false);
      } catch (err) {
        alert('Failed to add event. ' + (err?.response?.data?.error || err.message));
      }
    }
  };

  const getEventsForDay = (day) => {
    return events.filter((event) => {
      const eventDate = new Date(event.dateTime);
      return (
        eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear()
      );
    });
  };

  return (
    <div className="calendar-page">
      <div className="calendar-header-row">
        <h1 className="calendar-title">Calendar</h1>
        <button className="button button-primary calendar-add-btn" onClick={() => setShowAddEvent(true)}>
          Add Event
        </button>
      </div>

      {showAddEvent && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-container custom-modal-narrow">
            <button className="custom-modal-close-x" onClick={() => setShowAddEvent(false)} aria-label="Close modal">×</button>
            <div className="custom-modal-title">Add New Event</div>
            <form className="custom-modal-form" onSubmit={handleAddEvent}>
              <div className="custom-modal-fields redesigned-modal-grid">
                <div className="custom-modal-field">
                  <label htmlFor="title">Title</label>
                  <input type="text" id="title" name="title" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} required />
                </div>
                <div className="custom-modal-field">
                  <label htmlFor="date">Date</label>
                  <input type="date" id="date" name="date" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} required />
                </div>
                <div className="custom-modal-field">
                  <label htmlFor="time">Time</label>
                  <input type="time" id="time" name="time" value={newEvent.time} onChange={e => setNewEvent({ ...newEvent, time: e.target.value })} required />
                </div>
              </div>
              <div className="custom-modal-actions">
                <button type="button" className="custom-modal-btn cancel" onClick={() => setShowAddEvent(false)}>Cancel</button>
                <button type="submit" className="custom-modal-btn primary">Add Event</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card calendar-card">
        <div className="calendar-toolbar">
          <button className="calendar-nav-btn" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>&lt;</button>
          <span className="calendar-month-label">{format(currentDate, 'MMMM yyyy')}</span>
          <button className="calendar-nav-btn" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>&gt;</button>
        </div>
        <div className="calendar-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="calendar-day-header">{day}</div>
          ))}
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            return (
              <div
                key={day.toString()}
                className={`calendar-day-cell${!isSameMonth(day, currentDate) ? ' other-month' : ''}${isToday(day) ? ' today' : ''}`}
              >
                <span className="calendar-day-number">{format(day, 'd')}</span>
                <div className="calendar-day-events">
                  {dayEvents.map((event) => (
                    <div key={event.id} className="calendar-event-badge">
                      <span className="calendar-event-time">{format(new Date(event.dateTime), 'HH:mm')}</span>
                      <span className="calendar-event-title">{event.title}</span>
                      <button
                        className="calendar-event-delete"
                        title="Delete event"
                        onClick={async () => {
                          try {
                            await deleteEvent(event.id);
                          } catch (err) {
                            alert('Failed to delete event. ' + (err?.response?.data?.error || err.message));
                          }
                        }}
                      >×</button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage; 