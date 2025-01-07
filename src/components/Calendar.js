import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Fullscreen, Shrink } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import useSWR, { mutate } from 'swr';
import axios from 'axios';
import Task from './Task';
import TaskModal from './TaskModal';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../context/AlertContext';

const Calendar = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const fetcher = async (url) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      throw new Error('No token found');
    }

    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem('token');
        navigate('/login');
        showAlert('Needs to login!','warning','')
      }
      throw error;
    }
  };

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isExpanded, setIsExpanded] = useState(false);
  const [isScrollable, setIsScrollable] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);

  const { data: tasks = [], error, isLoading } = useSWR(
    `https://backend-9xmz.onrender.com/tasks?month=${currentDate.getMonth()}&year=${currentDate.getFullYear()}`,
    // `http://localhost:3003/tasks?month=${currentDate.getMonth()}&year=${currentDate.getFullYear()}`,
    fetcher,
    {
      refreshInterval: 5000,
      onError: (error) => {
        if (error.message !== 'No token found') {
          showAlert('Failed to load tasks. Please try again.', 'error', '');
        }
      }
    }
  );
  const handleRefresh = () => {
    mutate(`https://backend-9xmz.onrender.com/tasks?month=${currentDate.getMonth()}&year=${currentDate.getFullYear()}`);
    // mutate(`http://localhost:3003/tasks?month=${currentDate.getMonth()}&year=${currentDate.getFullYear()}`);
  };
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = [];
    const startPadding = firstDay.getDay();
    const endPadding = 6 - lastDay.getDay();

    const prevMonth = new Date(year, month, 0);
    for (let i = startPadding - 1; i >= 0; i--) {
      daysInMonth.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      daysInMonth.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    for (let i = 1; i <= endPadding; i++) {
      daysInMonth.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return daysInMonth;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const formatDate = (date) => {
    return format(date, 'yyyy-MM-dd');
  };

  const getTasksForDate = (date) => {
    const formattedDate = formatDate(date);
    return tasks.filter((task) => formattedDate === formatDate(parseISO(task.dueDate)));
  };

  const handleDayClick = (date) => {
    setSelectedDate((formatDate(date)));
    setIsModalOpen(true);
  };

  return (
    <div className="w-full max-w-8xl mx-auto flex flex-col h-screen">
      <div className="sticky top-0 bg-white z-10 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-xl font-semibold">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => { setIsExpanded(!isExpanded); setIsScrollable(true); }}
              className="p-2 rounded hover:bg-gray-100 flex items-center gap-1"
            >
              {isExpanded ? (
                <>
                  <Minimize2 className="w-5 h-5" />
                  <span className="text-sm min-w-20">Compact</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-5 h-5" />
                  <span className="text-sm min-w-20">Expand</span>
                </>
              )}
            </button>
            <button
              onClick={() => setIsScrollable(!isScrollable)}
              className="p-2 rounded hover:bg-gray-100 flex items-center gap-1"
            >
              {isScrollable ? (
                <>
                  <Fullscreen className="w-5 h-5" />
                  <span className="text-sm min-w-20">Full View</span>
                </>
              ) : (
                <>
                  <Shrink className="w-5 h-5" />
                  <span className="text-sm min-w-20">Scroll View</span>
                </>
              )}
            </button>
            <button onClick={() => navigateMonth(-1)} className="p-2 rounded hover:bg-gray-100">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => navigateMonth(1)} className="p-2 rounded hover:bg-gray-100">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 px-4 pb-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center font-medium p-2">
              {day}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-2">
        <div className="grid grid-cols-7 gap-0">
          {isLoading ? (
            <div className="col-span-7 text-center text-gray-500">Loading tasks...</div>
          ) : error ? (
            <div className="col-span-7 text-center text-red-500">Failed to load tasks</div>
          ) : (
            getDaysInMonth(currentDate).map((dayInfo, index) => (
              <div
                key={index}
                style={{
                  pointerEvents: dayInfo.isCurrentMonth ? 'auto' : 'none',
                }}
                className={`${isScrollable ? isExpanded ? 'h-96' : 'h-48' : ''
                  } border rounded flex flex-col transition-all duration-300 pointer ${dayInfo.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                  }`}
              >
                <div
                  onClick={() => handleDayClick(dayInfo.date)} style={{ cursor: 'pointer' }} className={`p-2 ${dayInfo.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`} >
                  {dayInfo.date.getDate()}
                </div>
                <div className="flex-1 p-0 overflow-y-auto">
                  <div className="space-y-1">
                    {getTasksForDate(dayInfo.date).map((task) => (
                      <Task
                        key={task.id}
                        createdBy={task.createdBy}
                        description={task.description}
                        dueDate={formatDate(task.dueDate)}
                        id={task.id}
                        responsiblePersonName={task.responsiblePersonName}
                        responsiblePersonEmail={task.responsiblePersonEmail}
                        status={task.status}
                        responsiblePersonId={task.responsiblePersonId}
                        handleRefresh={handleRefresh}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Task Modal component */}
      {isModalOpen && (
        <TaskModal
          selectedDate={selectedDate}
          onClose={() => setIsModalOpen(false)}
          handleRefresh={handleRefresh}
        />
      )}
      <div style={{ width: '100%', height: '30px' }}></div>
    </div>
  );
};

export default Calendar;
