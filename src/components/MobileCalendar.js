import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CirclePlus } from 'lucide-react';
import { format, isSameDay, addDays } from 'date-fns';
import useSWR, { mutate } from 'swr';
import { useAlert } from '../context/AlertContext';
import Task from './Task';
import TaskModal from './TaskModal';


const MobileCalendar = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const { showAlert } = useAlert();

    const fetcher = async (url) => {
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
                showAlert('Needs to login!', 'warning', '')
            }else{
            showAlert(error.response.data.message, 'error','');
            }
            throw error;
        }
    };
    const initialDate = useMemo(() => {
        const monthParam = searchParams.get('month');
        const yearParam = searchParams.get('year');
        const dateParam = searchParams.get('date');
        const now = new Date();
        if (dateParam) {
            const requestedDate = new Date(dateParam);
            return isNaN(requestedDate.getTime()) ? now : requestedDate;
        }
        if (monthParam && yearParam) {
            const requestedDate = new Date(parseInt(yearParam), parseInt(monthParam), 1);
            return isNaN(requestedDate.getTime()) ? now : requestedDate;
        }
        return now;
    }, [searchParams]);

    const [selectedDate, setSelectedDate] = useState(initialDate);
    const [isMonthView, setIsMonthView] = useState(!searchParams.get('date'));

    const { data: monthTaskCounts } = useSWR(
        `http://localhost:3003/tasks/counts?month=${selectedDate.getMonth()}&year=${selectedDate.getFullYear()}`,
        // isMonthView ? `https://backend-9xmz.onrender.com/tasks/counts?month=${selectedDate.getMonth()}&year=${selectedDate.getFullYear()}` : null,
        fetcher
    );

    const { data: dayTasks } = useSWR(
        !isMonthView ? `http://localhost:3003/tasks/day/?date=${format(selectedDate, 'yyyy-MM-dd')}` : null,
        // !isMonthView ? `https://backend-9xmz.onrender.com/tasks/day/?date=${format(selectedDate, 'yyyy-MM-dd')}` : null,
        fetcher
    );
    const handleRefresh = () => {
        !isMonthView ? mutate(`https://backend-9xmz.onrender.com/tasks/day/?date=${format(selectedDate, 'yyyy-MM-dd')}`) :
            mutate(`https://backend-9xmz.onrender.com/tasks/counts?month=${selectedDate.getMonth()}&year=${selectedDate.getFullYear()}`);
    };

    useEffect(() => {
        console.log(selectedDate);
        if (isMonthView) {
            setSearchParams({
                month: (selectedDate.getMonth()).toString(),
                year: selectedDate.getFullYear().toString(),
            });
        } else {
            setSearchParams({
                date: format(selectedDate, 'yyyy-MM-dd'),
            });
        }
    }, [selectedDate, isMonthView, setSearchParams]);

    const getDaysInMonth = useMemo(() => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];

        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }

        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    }, [selectedDate]);

    const navigateMonth = (direction) => {
        const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + direction, 1);
        setSelectedDate(newDate);
    };

    const navigateDay = (direction) => {
        const newDate = addDays(selectedDate, direction);
        setSelectedDate(newDate);
    };

    const getTaskCountStyle = (counts = {}) => {
        if (!counts) return 'bg-gray-100';
        const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
        if (total === 0) return 'bg-gray-100';
        if (counts.pending > 0) return 'bg-yellow-100';
        if (counts.completed > 0) return 'bg-green-100';
        return 'bg-gray-100';
    };

    const handleDateClick = (date) => {
        if (!date) return;
        setSelectedDate(date);
        setIsMonthView(false);
    };

    const openCreateModal = (date) => {
        if (!date) return;
        setSelectedDate(date);
        setCreateModalOpen(true);
    }

    return (
        <div className="w-full h-full bg-white">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b z-10">
                <div className="flex items-center justify-between p-4">
                    <h2 className="text-lg font-semibold">
                        {isMonthView
                            ? format(selectedDate, 'MMMM yyyy')
                            : format(selectedDate, 'MMM d, yyyy')}
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => openCreateModal(selectedDate)}
                            className="p-2 rounded-full hover:bg-gray-100"
                            aria-label="Create task">
                            <CirclePlus className='w-5 h-5'></CirclePlus>
                        </button>
                        {isMonthView ? (
                            <>
                                <button
                                    onClick={() => navigateMonth(-1)}
                                    className="p-2 rounded-full hover:bg-gray-100"
                                    aria-label="Previous month"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => navigateMonth(1)}
                                    className="p-2 rounded-full hover:bg-gray-100"
                                    aria-label="Next month"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigateDay(-1)}
                                    className="p-2 rounded-full hover:bg-gray-100"
                                    aria-label="Previous day"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => navigateDay(1)}
                                    className="p-2 rounded-full hover:bg-gray-100"
                                    aria-label="Next day"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setIsMonthView(true)}
                                    className="p-2 rounded-full hover:bg-gray-100"
                                    aria-label="Switch to month view"
                                >
                                    <CalendarIcon className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {isMonthView ? (
                <MonthView
                    days={getDaysInMonth}
                    monthTaskCounts={monthTaskCounts}
                    handleDateClick={handleDateClick}
                    getTaskCountStyle={getTaskCountStyle}
                />
            ) : (
                <DayView tasks={dayTasks} handleRefresh={handleRefresh} />
            )}


            {createModalOpen && <TaskModal
                selectedDate={format(selectedDate, 'yyyy-MM-dd')}
                onClose={() => setCreateModalOpen(false)}
                handleRefresh={handleRefresh}
            ></TaskModal>}
        </div>
    );
};

const MonthView = ({ days, monthTaskCounts, handleDateClick, getTaskCountStyle }) => (
    <div className="p-4">
        <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500">
                    {day}
                </div>
            ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
            {days.map((date, i) => (
                <DayCell
                    key={i}
                    date={date}
                    monthTaskCounts={monthTaskCounts}
                    handleDateClick={handleDateClick}
                    getTaskCountStyle={getTaskCountStyle}
                />
            ))}
        </div>
        <div style={{ height: '40px' }}></div>
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
            <div className="flex justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                    <span>Pending</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span>Completed</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-gray-500"></span>
                    <span>Paused</span>
                </div>
            </div>
        </div>
    </div>
);

const DayCell = ({ date, monthTaskCounts, handleDateClick, getTaskCountStyle }) => {
    if (!date) return <div className="aspect-square invisible" />;

    const dateStr = format(date, 'yyyy-MM-dd');
    const counts = monthTaskCounts?.[dateStr];

    return (
        <button
            onClick={() => handleDateClick(date)}
            className={`
        aspect-square p-1 relative rounded-lg
        ${isSameDay(date, new Date()) ? 'ring-2 ring-blue-500' : ''}
        ${getTaskCountStyle(counts)}
      `}
        >
            <span className="absolute top-1 left-1 text-sm">{date.getDate()}</span>
            {counts && <TaskIndicators counts={counts} />}
        </button>
    );
};

const TaskIndicators = ({ counts }) => (
    <div className="absolute bottom-1 right-1 flex gap-1">
        {Object.entries(counts).map(([status, count]) =>
            count > 0 && (
                <span
                    key={status}
                    className={`
            w-2 h-2 rounded-full
            ${status === 'pending' ? 'bg-yellow-500' : ''}
            ${status === 'completed' ? 'bg-green-500' : ''}
            ${status === 'paused' ? 'bg-gray-500' : ''}
          `}
                />
            )
        )}
    </div>
);
const formatDate = (date) => {
    return format(date, 'yyyy-MM-dd');
};
const DayView = ({ tasks, handleRefresh }) => (
    <div className="p-4 space-y-2">
        {tasks?.length === 0 ? (
            <p className="text-center text-gray-500">No tasks for this day</p>
        ) : (
            tasks?.map((task) => (
                <Task
                    key={`MobileView-${task.id}`}
                    createdBy={task.createdBy}
                    description={task.description}
                    dueDate={formatDate(task.dueDate)}
                    id={task.id}
                    responsiblePersonName={task.responsiblePersonName}
                    responsiblePersonEmail={task.responsiblePersonEmail}
                    status={task.status}
                    responsiblePersonId={task.responsiblePersonId}
                    handleRefresh={handleRefresh}
                ></Task>
            ))
        )}
    </div>
);

export default MobileCalendar;