import React, { useState, useEffect } from 'react';
import { fetchReservation, updateReservationStatus, acceptBooking } from '../../../Api/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PaginatedTable from '../PaginatedTable/PaginatedTable';
import ActionDropdown from '../ActionDropdown/ActionDropdown';
import Status from '../Status/Status';
import Modal from '../Modal/Modal';
import { FaEye, FaCheck, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { IoMdClose } from "react-icons/io";
import Loader from '../Loader/Loader';
import Toast from '../Toast/Toast';
import './Room_Planner_Calender.css';

function RoomPlannerCalendar() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'week'
  const [currentWeek, setCurrentWeek] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateInputValue, setDateInputValue] = useState('');
  const [datePickerMonth, setDatePickerMonth] = useState(new Date());
  const [showViewModeDropdown, setShowViewModeDropdown] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null); // Track which day is selected
  const [showPendingBox, setShowPendingBox] = useState(false); // State for pending reservations box
  const [pendingReservations, setPendingReservations] = useState([]); // State to store pending reservations
  const [currentUser, setCurrentUser] = useState({
        username: '',
        userid: '',
        userGroup: ''
    });
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [rejectedReservationID, setRejectedReservationID] = useState(null);
  const queryClient = useQueryClient();
  
  // Fetch reservations with React Query
  const { data: reservationsData = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: async () => {
      try {
        const reservationData = await fetchReservation();
        if (Array.isArray(reservationData)) {
          // console.log('Calendar Reservations Data:', reservationData);
          return reservationData.map(reservation => {
            const reservationblocktime = new Date(reservation.reservationblocktime).getTime();
            const currentDateTime = Date.now() + 8 * 60 * 60 * 1000;

            if (reservation.reservationstatus === 'Pending' && currentDateTime > reservationblocktime) {
              return { ...reservation, reservationstatus: 'expired' };
            }
            return reservation;
          });
        } else {
          console.error("Invalid data format received:", reservationData);
          return [];
        }
      } catch (error) {
        console.error('Failed to fetch reservation details:', error);
        throw error;
      }
    },
    staleTime: 30 * 60 * 1000,
    refetchInterval: 1000,
  });

  // Add mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ reservationId, newStatus, userid }) => 
        updateReservationStatus(reservationId, newStatus, userid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });

  const acceptBookingMutation = useMutation({
    mutationFn: (reservationId) => acceptBooking(reservationId),
  });

  // Generate calendar days when month changes or selectedDay changes
  useEffect(() => {
    generateCalendarDays();
  }, [currentMonth, reservationsData, selectedDay]);

  // Generate week view days when currentMonth changes or selectedDay changes
  useEffect(() => {
    generateWeekDays();
  }, [currentMonth, viewMode, reservationsData, selectedDay]);
  
  // Initialize date input value on component mount
  useEffect(() => {
    // Set initial date input value to today's date
    const today = new Date();
    
    setDateInputValue(today.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    }));
  }, []);

  useEffect(() => {
        const username = localStorage.getItem('username');
        const userid = localStorage.getItem('userid');
        const userGroup = localStorage.getItem('userGroup');
        
        setCurrentUser({
            username,
            userid,
            userGroup
        });
        
        console.log('Current user loaded:', { username, userid, userGroup });
    }, []);
  
  // Extract and update pending reservations
  useEffect(() => {
    if (Array.isArray(reservationsData) && reservationsData.length > 0) {
      const pendingItems = reservationsData.filter(reservation => 
        reservation.reservationstatus === 'Pending'
      ).map(reservation => {
        // Format the dates for display
        const checkInDate = new Date(reservation.checkindatetime);
        const formattedDate = checkInDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        
        return {
          ...reservation,
          formattedDate
        };
      });
      
      setPendingReservations(pendingItems);
    } else {
      setPendingReservations([]);
    }
  }, [reservationsData]);

  const isPropertyOwner = (reservation) => {
        if (!currentUser.username || !reservation) {
            console.log('Missing data:', { currentUser, reservation });
            return false;
        }
    
        const propertyOwnerUsername = reservation.property_owner_username;
        if (!propertyOwnerUsername) {
            console.log('Property owner username missing in reservation:', reservation);
            return false;
        }
    
        const isOwner = propertyOwnerUsername.toLowerCase() === currentUser.username.toLowerCase();
        console.log('Ownership Check:', { 
            currentUsername: currentUser.username, 
            propertyOwnerUsername, 
            userGroup: currentUser.userGroup, 
            isOwner 
        });
        return isOwner;
    };
  
  // Add click outside handler to close date picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      const datePickerElements = document.querySelectorAll('.date-picker, .date-picker *');
      let clickedInside = false;
      
      datePickerElements.forEach(element => {
        if (element.contains(event.target)) {
          clickedInside = true;
        }
      });
      
      if (!clickedInside && showDatePicker) {
        setShowDatePicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  // Add an effect to scroll to today/selected date when date picker opens
  useEffect(() => {
    if (showDatePicker) {
      // Use setTimeout to wait for the date picker to render
      setTimeout(() => {
        const todayElement = document.querySelector('.date-picker-day.today');
        const selectedElement = document.querySelector('.date-picker-day.selected');
        
        // Try to scroll to selected date first, then today if no selection
        if (selectedElement) {
          selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (todayElement) {
          todayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [showDatePicker]);

  // Add click outside handler to close pending box
  useEffect(() => {
    const handleClickOutside = (event) => {
      const pendingBoxElements = document.querySelectorAll('.pending-message-box, .pending-message-box *, .notification-button, .notification-button *');
      let clickedInside = false;
      
      pendingBoxElements.forEach(element => {
        if (element.contains(event.target)) {
          clickedInside = true;
        }
      });
      
      if (!clickedInside && showPendingBox) {
        setShowPendingBox(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPendingBox]);

  // Generate calendar days for the current month view
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get first day of month
    const firstDay = new Date(year, month, 1);
    // Get last day of month
    const lastDay = new Date(year, month + 1, 0);
    
    // Calculate days needed from previous month to start the grid
    const daysFromPrevMonth = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Adjust for Monday start
    
    // Calculate start date (could be from previous month)
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - daysFromPrevMonth);
    
    const days = [];
    const currentDate = new Date(startDate);
    
    // Format date consistently (YYYY-MM-DD with leading zeros)
    const formatDateString = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    // Always generate 42 days (6 weeks × 7 days) for consistency
    for (let i = 0; i < 42; i++) {
      const formattedDate = formatDateString(currentDate);
      
      // Get reservations for this day
      const dayReservations = Array.isArray(reservationsData) 
        ? reservationsData.filter(reservation => {
            if (!reservation.checkindatetime || !reservation.checkoutdatetime) return false;
            
            const checkInDate = new Date(reservation.checkindatetime);
            const checkOutDate = new Date(reservation.checkoutdatetime);
            const checkInFormatted = formatDateString(checkInDate);
            const checkOutFormatted = formatDateString(checkOutDate);
            
            return formattedDate >= checkInFormatted && formattedDate <= checkOutFormatted;
          })
        : [];
      
      // Check if this date has any reservations
      const hasReservations = dayReservations.length > 0;
      
      // Get reservation status counts
      const statusCounts = getReservationStatusCounts(dayReservations);
      
      // Use original date format - no more date-1 adjustment
      const displayDate = currentDate.getDate();
      
      // Use original month check
      const isCurrentMonth = currentDate.getMonth() === month;
      
      // Use isToday helper function
      const todayFlag = isToday(currentDate);
      
      days.push({
        date: new Date(currentDate),
        formatted: formattedDate,
        isCurrentMonth: isCurrentMonth,
        hasReservations: hasReservations,
        isToday: todayFlag,
        displayDate: displayDate,
        reservations: dayReservations,
        statusCounts: statusCounts
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    setCalendarDays(days);
  };

  // Helper function to count reservations by status
  const getReservationStatusCounts = (reservations) => {
    if (!Array.isArray(reservations) || reservations.length === 0) return {};
    
    const counts = {
      Pending: 0,
      Accepted: 0,
      Rejected: 0,
      Canceled: 0,
      Paid: 0,
      expired: 0,
      Pickup: 0
    };
    
    reservations.forEach(reservation => {
      const status = reservation.reservationstatus || 'Pending';
      
      // Check for "Pickup" which might be stored differently
      if (status.toLowerCase().includes('pick') || status.toLowerCase().includes('section')) {
        counts.Pickup++;
      } else if (counts[status] !== undefined) {
        counts[status]++;
      }
    });
    
    return counts;
  };

  // Generate week view days
  const generateWeekDays = () => {
    if (viewMode !== 'week') return;
    
    // Get current date from the month
    const currentDate = new Date(currentMonth);
    
    // Find the Monday of the current week
    const dayOfWeek = currentDate.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for Monday start
    currentDate.setDate(currentDate.getDate() - diff);
    
    const weekDays = [];
    
    // Format date consistently (reuse the same function)
    const formatDateString = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    // Generate 7 days for the week
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(currentDate);
      dayDate.setDate(currentDate.getDate() + i);
      
      const formattedDate = formatDateString(dayDate);
      
      // Get reservations for this day to display in the week view
      const dayReservations = Array.isArray(reservationsData) 
        ? reservationsData.filter(reservation => {
            if (!reservation.checkindatetime || !reservation.checkoutdatetime) return false;
            
            const checkInDate = new Date(reservation.checkindatetime);
            const checkOutDate = new Date(reservation.checkoutdatetime);
            const checkInFormatted = formatDateString(checkInDate);
            const checkOutFormatted = formatDateString(checkOutDate);
            
            return formattedDate >= checkInFormatted && formattedDate <= checkOutFormatted;
          })
        : [];
      
      // Check if this date has any reservations
      const hasReservations = dayReservations.length > 0;
      
      // Get reservation status counts
      const statusCounts = getReservationStatusCounts(dayReservations);
      
      // Use original date format
      const displayDate = dayDate.getDate();
      
      // Using isToday helper
      const todayFlag = isToday(dayDate);
      
      weekDays.push({
        date: dayDate,
        formatted: formattedDate,
        isToday: todayFlag,
        hasReservations: hasReservations,
        displayDate: displayDate,
        reservations: dayReservations,
        statusCounts: statusCounts
      });
    }
    
    setCurrentWeek(weekDays);
  };
  
  // Check if a date is today or the selected day
  const isToday = (date) => {
    // If there's a selected day, check if the date matches it
    if (selectedDay) {
      return date.getDate() === selectedDay.getDate() &&
             date.getMonth() === selectedDay.getMonth() &&
             date.getFullYear() === selectedDay.getFullYear();
    }
    
    // Otherwise check against the actual today
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Navigate to previous month/week
  const goToPrevious = () => {
    setCurrentMonth(prevDate => {
      const newDate = new Date(prevDate);
      if (viewMode === 'month') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setDate(newDate.getDate() - 7);
      }
      return newDate;
    });
  };

  // Navigate to next month/week
  const goToNext = () => {
    setCurrentMonth(prevDate => {
      const newDate = new Date(prevDate);
      if (viewMode === 'month') {
        newDate.setMonth(newDate.getMonth() + 1);
      } else {
        newDate.setDate(newDate.getDate() + 7);
      }
      return newDate;
    });
  };

  // Navigate to today
  const goToToday = () => {
    // Set current month to today's date
    setCurrentMonth(new Date());
    
    // Clear the selected day to revert to actual today highlighting
    setSelectedDay(null);
  };

  // Toggle between month and week view
  const toggleViewMode = (mode) => {
    if (mode !== viewMode) {
      setViewMode(mode);
    }
    // Close the dropdown after selection
    setShowViewModeDropdown(false);
  };

  // Toggle view mode dropdown
  const toggleViewModeDropdown = () => {
    setShowViewModeDropdown(!showViewModeDropdown);
  };

  // Handle click outside to close view mode dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      const viewModeElements = document.querySelectorAll('.view-mode-dropdown, .view-mode-dropdown *');
      let clickedInside = false;
      
      viewModeElements.forEach(element => {
        if (element.contains(event.target)) {
          clickedInside = true;
        }
      });
      
      if (!clickedInside && showViewModeDropdown) {
        setShowViewModeDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showViewModeDropdown]);

  // Handle date click to show overlay
  const handleDateClick = (clickedDate) => {
    // Format the clicked date properly (YYYY-MM-DD format with leading zeros)
    const year = clickedDate.getFullYear();
    const month = String(clickedDate.getMonth() + 1).padStart(2, '0');
    const day = String(clickedDate.getDate()).padStart(2, '0');
    const formattedClickedDate = `${year}-${month}-${day}`;
    
    // Set the selected date for the overlay
    setSelectedDate(formattedClickedDate);
    setShowOverlay(true);
    
    // Update the selected day to move the purple dot
    setSelectedDay(new Date(clickedDate));

    // Close pending reservations message box
    setShowPendingBox(false);
  };

  // Close overlay
  const closeOverlay = () => {
    setShowOverlay(false);
  };

  // Get reservations for the selected date
  const getReservationsForSelectedDate = () => {
    if (!selectedDate || !Array.isArray(reservationsData)) return [];
    
    return reservationsData.filter(reservation => {
      if (!reservation.checkindatetime || !reservation.checkoutdatetime) return false;
      
      const checkInDate = new Date(reservation.checkindatetime);
      const checkOutDate = new Date(reservation.checkoutdatetime);
      
      // Format all dates to YYYY-MM-DD format for comparison
      // No need to split since selectedDate is already properly formatted
      const formattedSelectedDate = selectedDate;
      
      // Format check-in and check-out dates with proper timezone handling
      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const formattedCheckInDate = formatDate(checkInDate);
      const formattedCheckOutDate = formatDate(checkOutDate);
      
      // Check if selected date is between check-in and check-out dates (inclusive)
      return formattedSelectedDate >= formattedCheckInDate && formattedSelectedDate <= formattedCheckOutDate;
    });
  };

  const hasOverlappingReservation = (reservation) => {
    if (!Array.isArray(reservationsData)) return false;
    
    const newCheckIn = new Date(reservation.checkindatetime);
    const newCheckOut = new Date(reservation.checkoutdatetime);
    
    return reservationsData.some(existingReservation => {
        // Skip the current reservation
        if (existingReservation.reservationid === reservation.reservationid) {
            return false;
        }
        
        // Only check for overlaps with Accepted reservations
        if (existingReservation.reservationstatus !== 'Accepted') {
            return false;
        }
        
        const existingCheckIn = new Date(existingReservation.checkindatetime);
        const existingCheckOut = new Date(existingReservation.checkoutdatetime);
        
        // Check for overlap
        return (newCheckIn < existingCheckOut && newCheckOut > existingCheckIn);
    });
  };

  const displayToast = (type, message) => {
    setToastType(type);
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const handleAction = async (action, reservation) => {
    if (reservation.reservationstatus === 'expired') {
        displayToast('error', 'Action cannot be performed. This reservation has expired.');
        return;
    }

    if (action === 'view') {
        const essentialFields = {
            reservationid: reservation.reservationid || 'N/A',
            propertyaddress: reservation.propertyaddress || 'N/A',
            checkindatetime: reservation.checkindatetime || 'N/A',
            checkoutdatetime: reservation.checkoutdatetime || 'N/A',
            reservationblocktime: reservation.reservationblocktime || 'N/A',
            request: reservation.request || 'N/A',
            totalprice: reservation.totalprice || 'N/A',
            rcid: reservation.rcid || 'N/A',
            reservationstatus: reservation.reservationstatus || 'N/A',
            userid: reservation.userid || 'N/A',
            images: reservation.propertyimage || [],
        };
        setSelectedReservation(essentialFields);
    } else if (action === 'accept') {
        // Check for overlapping reservations before accepting
        if (hasOverlappingReservation(reservation)) {
            displayToast('error', 'Cannot accept reservation: There is an overlapping accepted reservation for these dates.');
            return;
        }

        try {
            const newStatus = 'Accepted';
            
            await updateStatusMutation.mutateAsync({ 
                reservationId: reservation.reservationid, 
                newStatus,
                userid: currentUser.userid
            });
            
            await acceptBookingMutation.mutateAsync(reservation.reservationid);
    
            displayToast('success', 'Reservation Accepted Successfully');
        } catch (error) {
            console.error('Failed to accept reservation or send email', error);
            displayToast('error', 'Failed to accept reservation');
        }
    } else if (action === 'reject') {
        const rejectedID = {
            reservationid: reservation.reservationid || 'N/A',
        };
    
        setRejectedReservationID(rejectedID);
    
        try {
            const newStatus = 'Rejected';
            
            await updateStatusMutation.mutateAsync({ 
                reservationId: reservation.reservationid, 
                newStatus,
                userid: currentUser.userid
            });
    
            setShowMessageBox(true);
            displayToast('success', 'Reservation Rejected Successfully');
        } catch (error) {
            console.error('Failed to update reservation status', error);
            displayToast('error', 'Failed to reject reservation');
        }
    }
  };

  // Reservation dropdown items
   const reservationDropdownItems = (reservation) => {
        if (reservation.reservationstatus === 'Pending' && isPropertyOwner(reservation)) {
            return [
                { label: 'View Details', icon: <FaEye />, action: 'view' },
                { label: 'Accept', icon: <FaCheck />, action: 'accept' },
                { label: 'Reject', icon: <FaTimes />, action: 'reject' },
            ];
        }
        return [{ label: 'View Details', icon: <FaEye />, action: 'view' }];
    };

  // Display labels for reservation details
  const displayLabels = {
    reservationid: "RID",
    propertyaddress: "Property Name",
    checkindatetime: "Check-In Date Time",
    checkoutdatetime: "Check-Out Date Time",
    reservationblocktime: "Block Time",
    request: "Request",
    totalprice: "Total Price",
    rcid: "RCID",
    reservationstatus: "Status",
    userid: "UID",
    images: "Images",
  };

  // Table columns for reservations
  const columns = [
    { header: 'RID', accessor: 'reservationid' },
    {
      header: 'Image',
      accessor: 'propertyimage',
      render: (reservation) =>
        reservation.propertyimage && reservation.propertyimage.length > 0 ? (
          <img
            src={`data:image/jpeg;base64,${reservation.propertyimage[0]}`}
            alt={`Property ${reservation.propertyaddress}`}
            style={{ width: 80, height: 80 }}
          />
        ) : (
          <span>No Image</span>
        ),
    },
    { header: 'Property Name', accessor: 'propertyaddress' },
    { header: 'Total Price', accessor: 'totalprice' },
    {
      header: 'Status',
      accessor: 'reservationstatus',
      render: (reservation) => (
        <Status value={reservation.reservationstatus} />
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (reservation) => (
        <ActionDropdown
          items={reservationDropdownItems(reservation)}
          onAction={(action) => handleAction(action, reservation)}
        />
      ),
    },
  ];

  // Group calendar days into 6 weeks
  const calendarWeeks = () => {
    const weeks = [];
    
    // Generate 6 weeks with 7 days each
    for (let i = 0; i < 6; i++) {
      const weekStart = i * 7;
      const weekEnd = weekStart + 7;
      const week = calendarDays.slice(weekStart, weekEnd);
      weeks.push(week);
    }
    
    return weeks;
  };

  // Format month and year for display
  const formatMonthYear = (date) => {
    const options = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Format date for display (MM/DD/YYYY)
  const formatDate = (date) => {
    // Use original date format (no adjustment)
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get title for week view
  const getWeekViewTitle = () => {
    if (!currentWeek || currentWeek.length === 0) {
      return '';
    }
    
    // Get first and last day of the week
    const firstDay = currentWeek[0].date;
    const lastDay = currentWeek[currentWeek.length - 1].date;
    
    // Check if week spans across two months
    if (firstDay.getMonth() !== lastDay.getMonth()) {
      // Format like "May - June 2025"
      const firstMonth = firstDay.toLocaleDateString('en-US', { month: 'long' });
      const lastMonth = lastDay.toLocaleDateString('en-US', { month: 'long' });
      const year = lastDay.getFullYear();
      
      return `${firstMonth} – ${lastMonth} ${year}`;
    } else {
      // If same month, use the same format as month view
      return formatMonthYear(firstDay);
    }
  };

  // Generate hours for the week view
  const generateHours = () => {
    const hours = [];
    for (let i = 1; i <= 24; i++) {
      hours.push(i <= 12 ? `${i} AM` : `${i - 12} PM`);
    }
    return hours;
  };

  // Toggle date picker dropdown
  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
    
    // When opening date picker, initialize with current month
    if (!showDatePicker) {
      const today = new Date();
      
      // Set the date picker to show the current month containing today
      setDatePickerMonth(new Date(today));
      
      // Initialize the input value to today's date
      setDateInputValue(today.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      }));
    }
  };

  // Handle date selection from the date picker
  const handleDateSelection = (date) => {
    const selectedDate = new Date(date);
    setCurrentMonth(selectedDate);
    
    // Set the selected day to move the purple dot
    setSelectedDay(selectedDate);
    
    // Set input value with original date (no adjustment)
    setDateInputValue(selectedDate.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    }));
    
    setShowDatePicker(false);
  };

  // Handle date input change
  const handleDateInputChange = (e) => {
    setDateInputValue(e.target.value);
  };

  // Handle date input keydown (enter to confirm)
  const handleDateInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      const parsedDate = new Date(e.target.value);
      if (!isNaN(parsedDate.getTime())) {
        setCurrentMonth(parsedDate);
        setShowDatePicker(false);
      }
    }
  };
  
  // Navigate date picker to previous month
  const goToPrevDatePickerMonth = () => {
    setDatePickerMonth(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };
  
  // Navigate date picker to next month
  const goToNextDatePickerMonth = () => {
    setDatePickerMonth(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };
  
  // Generate date picker calendar days
  const generateDatePickerDays = () => {
    const year = datePickerMonth.getFullYear();
    const month = datePickerMonth.getMonth();
    
    // Get first day of month
    const firstDay = new Date(year, month, 1);
    // Get last day of month
    const lastDay = new Date(year, month + 1, 0);
    
    // Calculate days needed from previous month
    let daysFromPrevMonth = firstDay.getDay() - 1; // Adjust for Monday start
    if (daysFromPrevMonth < 0) daysFromPrevMonth = 6; // Sunday becomes 6
    
    // Calculate start date (could be from previous month)
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - daysFromPrevMonth);
    
    const days = [];
    const currentDate = new Date(startDate);
    
    // Get the currently selected date (if valid from input)
    const selectedDate = new Date(dateInputValue);
    const isSelectedDateValid = !isNaN(selectedDate.getTime());
    
    // Get today's date for comparison
    const today = new Date();
    
    // Generate 6 weeks of days for consistency
    for (let i = 0; i < 42; i++) {
      // Use original date values
      const displayDate = currentDate.getDate();
      const isCurrentMonth = currentDate.getMonth() === month;
      
      // Check if this is today
      const todayFlag = isToday(currentDate);
      
      // Check if this is the selected date
      // If input is empty or invalid, treat today as selected
      const isSelected = isSelectedDateValid ? (
        currentDate.getDate() === selectedDate.getDate() &&
        currentDate.getMonth() === selectedDate.getMonth() &&
        currentDate.getFullYear() === selectedDate.getFullYear()
      ) : todayFlag;
      
      days.push({
        date: new Date(currentDate),
        dayOfMonth: displayDate,
        isCurrentMonth,
        isToday: todayFlag,
        isSelected
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };
  
  // Group date picker days into weeks
  const datePickerWeeks = () => {
    const days = generateDatePickerDays();
    const weeks = [];
    
    for (let i = 0; i < 6; i++) {
      const weekStart = i * 7;
      const weekEnd = weekStart + 7;
      const week = days.slice(weekStart, weekEnd);
      weeks.push(week);
    }
    
    return weeks;
  };

  const handleViewReservation = (dateString) => {
    const reservationDate = new Date(dateString);
    handleDateClick(reservationDate);
  };
  
  return (
    <div className="scheduler-container">
      {showToast && <Toast type={toastType} message={toastMessage} />}
      {/* Calendar top controls */}
      <div className="scheduler-controls">
        <div className="left-controls">
          <button className="today-button" onClick={goToToday}>
            Today
          </button>
          <div className="nav-buttons">
            <button className="scheduler-nav-button" onClick={goToPrevious}>
              <FaChevronLeft />
            </button>
            <button className="scheduler-nav-button" onClick={goToNext}>
              <FaChevronRight />
            </button>
          </div>
          <h2 className="scheduler-title">
            {viewMode === 'month' 
              ? formatMonthYear(currentMonth) 
              : getWeekViewTitle()
            }
          </h2>
        </div>
        
        <div className="right-controls">
          <div className="pending-notification">
            <button 
              className="notification-button" 
              onClick={() => setShowPendingBox(!showPendingBox)}
            >
              Pending Reservations
              {pendingReservations.length > 0 && (
                <span className="notification-badge">{pendingReservations.length}</span>
              )}
            </button>
          </div>
          
          <div className={`view-mode-dropdown ${showViewModeDropdown ? 'active' : ''}`}>
            <button 
              className="view-mode-button" 
              onClick={toggleViewModeDropdown}
            >
              {viewMode === 'month' ? 'Month' : 'Week'}
            </button>
            {showViewModeDropdown && (
              <div className="view-mode-options">
                <div 
                  className={`view-mode-option ${viewMode === 'week' ? 'active' : ''}`}
                  onClick={() => toggleViewMode('week')}
                >
                  Week
                </div>
                <div 
                  className={`view-mode-option ${viewMode === 'month' ? 'active' : ''}`}
                  onClick={() => toggleViewMode('month')}
                >
                  Month
                </div>
              </div>
            )}
          </div>
          
          <div className="date-picker">
            <span className="date-label">Date</span>
            <div className="date-picker-input-container">
              <input 
                type="text" 
                className="date-input" 
                value={dateInputValue} 
                onChange={handleDateInputChange}
                onKeyDown={handleDateInputKeyDown}
                onClick={toggleDatePicker}
                placeholder=""
              />
              <button className="date-dropdown-button" onClick={toggleDatePicker}>
                <span className="date-dropdown-icon">▼</span>
              </button>
              
              {showDatePicker && (
                <div className="date-picker-dropdown">
                  <div className="date-picker-header">
                    <button className="date-picker-nav-button" onClick={goToPrevDatePickerMonth}>
                      &lt;
                    </button>
                    <div className="date-picker-month-title">
                      {datePickerMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                    <button className="date-picker-nav-button" onClick={goToNextDatePickerMonth}>
                      &gt;
                    </button>
                  </div>
                  
                  <div className="date-picker-calendar">
                    <div className="date-picker-weekdays">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                        <div key={index} className="date-picker-weekday">{day}</div>
                      ))}
                    </div>
                    
                    <div className="date-picker-days">
                      {datePickerWeeks().map((week, weekIndex) => (
                        <div key={weekIndex} className="date-picker-week">
                          {week.map((day, dayIndex) => (
                            <div
                              key={dayIndex}
                              className={`date-picker-day 
                                ${!day.isCurrentMonth ? 'other-month' : ''} 
                                ${day.isToday ? 'today' : ''}
                                ${day.isSelected ? 'selected' : ''}`}
                              onClick={() => handleDateSelection(day.date)}
                            >
                              {day.dayOfMonth}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Month View */}
      {viewMode === 'month' && (
        <div className="scheduler-calendar">
          {/* Day headers */}
          <div className="scheduler-days-header">
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
              <div key={day} className="scheduler-day-name">{day}</div>
            ))}
          </div>
          
          {/* Calendar cells */}
          <div className="scheduler-grid">
            {calendarWeeks().map((week, weekIndex) => (
              <div key={`week-${weekIndex}`} className="scheduler-week">
                {week.map(day => (
                  <div 
                    key={day.formatted} 
                    className={`scheduler-cell ${day.isCurrentMonth ? '' : 'other-month'} ${day.isToday ? 'today' : ''} ${day.hasReservations ? 'has-reservations' : ''}`}
                    onClick={() => handleDateClick(day.date)}
                  >
                    <div className="day-content">
                      <span className="cell-date">{day.displayDate}</span>
                      
                      {/* Reservation status indicators */}
                      {day.hasReservations && (
                        <div className="reservation-status-indicators">
                          {day.statusCounts.Pending > 0 && (
                            <div className="status-dot legend-dot-status-pending" title={`${day.statusCounts.Pending} Pending`}>
                              {day.statusCounts.Pending > 1 && <span className="count-badge">×{day.statusCounts.Pending}</span>}
                            </div>
                          )}
                          {day.statusCounts.Accepted > 0 && (
                            <div className="status-dot legend-dot-status-accepted" title={`${day.statusCounts.Accepted} Accepted`}>
                              {day.statusCounts.Accepted > 1 && <span className="count-badge">×{day.statusCounts.Accepted}</span>}
                            </div>
                          )}
                          {day.statusCounts.Rejected > 0 && (
                            <div className="status-dot legend-dot-status-rejected" title={`${day.statusCounts.Rejected} Rejected`}>
                              {day.statusCounts.Rejected > 1 && <span className="count-badge">×{day.statusCounts.Rejected}</span>}
                            </div>
                          )}
                          {day.statusCounts.Pickup > 0 && (
                            <div className="status-dot legend-dot-status-pickup" title={`${day.statusCounts.Pickup} Pick Up`}>
                              {day.statusCounts.Pickup > 1 && <span className="count-badge">×{day.statusCounts.Pickup}</span>}
                            </div>
                          )}
                          {(day.statusCounts.Paid + day.statusCounts.Canceled + day.statusCounts.expired > 0) && (
                            <div className="status-dot legend-dot-status-other" title="Other statuses">
                              {(day.statusCounts.Paid + day.statusCounts.Canceled + day.statusCounts.expired) > 1 && 
                                <span className="count-badge">×{day.statusCounts.Paid + day.statusCounts.Canceled + day.statusCounts.expired}</span>}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Week View */}
      {viewMode === 'week' && (
        <div className="week-view">
          {/* Week header with days */}
          <div className="week-header">
            <div className="time-column-header"></div>
            {currentWeek.map(day => (
              <div key={day.formatted} className={`day-column-header ${day.isToday ? 'today' : ''}`} onClick={() => handleDateClick(day.formatted, day.date)}>
                <div className="day-name">
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][day.date.getDay()]}
                </div>
                <div className={`day-number ${day.isToday ? 'today-circle' : ''}`}>
                  {day.displayDate}
                </div>
                
                {/* Week view reservation status indicators */}
                {day.hasReservations && (
                  <div className="week-status-indicators">
                    {day.statusCounts.Pending > 0 && (
                      <div className="week-status-dot legend-dot-status-pending" title={`${day.statusCounts.Pending} Pending`}></div>
                    )}
                    {day.statusCounts.Accepted > 0 && (
                      <div className="week-status-dot legend-dot-status-accepted" title={`${day.statusCounts.Accepted} Accepted`}></div>
                    )}
                    {day.statusCounts.Rejected > 0 && (
                      <div className="week-status-dot legend-dot-status-rejected" title={`${day.statusCounts.Rejected} Rejected`}></div>
                    )}
                    {day.statusCounts.Pickup > 0 && (
                      <div className="week-status-dot legend-dot-status-pickup" title={`${day.statusCounts.Pickup} Pick Up`}></div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Week grid with time slots */}
          <div className="week-grid">
            {/* Time labels */}
            <div className="time-labels">
              {generateHours().map((hour, index) => (
                <div key={index} className="time-label">
                  {hour}
                </div>
              ))}
            </div>
            
            {/* Day columns */}
            <div className="day-columns">
              {currentWeek.map(day => (
                <div 
                  key={day.formatted} 
                  className={`day-column ${day.isToday ? 'today' : ''}`}
                  onClick={() => handleDateClick(day.formatted, day.date)}
                >
                  {/* Time slots */}
                  {generateHours().map((hour, index) => (
                    <div key={index} className="time-slot">
                      {/* Reservation indicators would go here */}
                      {day.reservations.filter(res => {
                        // Check if reservation falls within this hour
                        const resDate = new Date(res.checkindatetime);
                        return resDate.getHours() === index;
                      }).map(res => (
                        <div 
                          key={res.reservationid} 
                          className="reservation-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction('view', res);
                          }}
                        >
                          {res.propertyaddress}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Overlay for displaying reservations on selected date */}
      {showOverlay && (
        <div className="calendar-overlay">
          <div className="calendar-overlay-content">
            <div className="calendar-overlay-header">
              <h2>Reservations for {new Date(selectedDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</h2>
              <button className="close-button" onClick={closeOverlay}>
                <IoMdClose />
              </button>
            </div>
            
            {reservationsLoading ? (
              <div className="loader-box">
                <Loader />
              </div>
            ) : (
              <>
                {getReservationsForSelectedDate().length > 0 ? (
                  <PaginatedTable
                    data={getReservationsForSelectedDate()}
                    columns={columns}
                    rowKey="reservationid"
                    enableCheckbox={false}
                  />
                ) : (
                  <p className="no-reservations-message">No reservations found for this date.</p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <Modal
        isOpen={!!selectedReservation}
        title={'Reservation Details'}
        data={selectedReservation || {}}
        labels={displayLabels}
        onClose={() => setSelectedReservation(null)}
      />
      
      {/* Pending Reservations Message Box */}
      {showPendingBox && (
        <div className="pending-message-overlay">
          <div className="pending-message-box">
            <div className="pending-message-header">
              <h3>Pending Reservations</h3>
              <button className="pending-close-button" onClick={() => setShowPendingBox(false)}>
                <IoMdClose />
              </button>
            </div>
      
            <div className="pending-reservations-list">
              {pendingReservations.length > 0 ? (
                Object.entries(
                  pendingReservations.reduce((acc, reservation) => {
                    const date = reservation.formattedDate;
                    if (!acc[date]) acc[date] = [];
                    acc[date].push(reservation);
                    return acc;
                  }, {})
                ).map(([date, reservationsForDate]) => (
                  <div key={date} className="pending-reservation-item">
                    <div className="pending-property-info">
                      <div className="pending-date">{date}</div>
                      <div className="pending-property-name">Reservations: x{reservationsForDate.length}</div>
                    </div>
                    <div className="pending-actions">
                      <button
                        className="pending-view-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewReservation(date); 
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-pending-message">No pending reservations</div>
              )}
            </div>
          </div>
        </div>
      )}

      
      {/* Legend for status colors */}
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-dot legend-dot-status-pending"></div>
          <span className="legend-label">Pending</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot legend-dot-status-accepted"></div>
          <span className="legend-label">Accepted</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot legend-dot-status-rejected"></div>
          <span className="legend-label">Rejected</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot legend-dot-status-pickup"></div>
          <span className="legend-label">Pick Up Section</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot legend-dot-status-other"></div>
          <span className="legend-label">Others</span>
        </div>
      </div>
    </div>
  );
}

export default RoomPlannerCalendar;
