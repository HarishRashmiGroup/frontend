import { useMediaQuery } from 'react-responsive';
import Calendar from './Calendar'; 
import MobileCalendar from './MobileCalendar';

const CalendarWrapper = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  return isMobile ? <MobileCalendar /> : <Calendar />;
};
export default CalendarWrapper;