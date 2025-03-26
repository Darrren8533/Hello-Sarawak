const handleCheckAvailability = async (e) => {
  if (e) e.stopPropagation();

  if (!bookingData.arrivalDate || !bookingData.departureDate) {
    displayToast('error', 'Please select arrival and departure dates');
    return;
  }

  const arrivalDate = new Date(bookingData.arrivalDate);
  const departureDate = new Date(bookingData.departureDate);
  const totalGuests = bookingData.adults + bookingData.children;

  try {
    const allProperties = await fetchProduct(); // Always fetch fresh data

    const availableProperties = allProperties.filter((property) => {
      if (property.propertyguestpaxno < totalGuests) return false;

      if (property.reservations) {
        for (const reservation of property.reservations) {
          const existingCheckin = new Date(reservation.checkindatetime);
          const existingCheckout = new Date(reservation.checkoutdatetime);

          // Fix overlapping logic
          if (
            (arrivalDate < existingCheckout && departureDate > existingCheckin) // Strict overlap check
          ) {
            return false; // Property is reserved for that period
          }
        }
      }

      return true; // Property is available
    });

    if (availableProperties.length === 0) {
      displayToast('error', 'No available properties match your criteria');
    } else {
      displayToast('success', `Found ${availableProperties.length} available properties`);
    }

    setProperties(availableProperties); // Update the displayed properties
  } catch (error) {
    console.error('Error fetching properties:', error);
    displayToast('error', 'Failed to load properties');
  }
};
