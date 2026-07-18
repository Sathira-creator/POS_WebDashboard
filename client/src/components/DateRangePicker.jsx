import * as React from 'react';
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const DateRangePicker = () => {
  const {startDate, setStartDate, endDate, setEndDate} = useAppContext();
  

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      
      <div className="flex flex-col gap-5 pt-2">
        <DatePicker
          label="Controlled picker"
          value={startDate}
          onChange={(newValue) => setStartDate(newValue)}
        />

        <DatePicker
          label="Controlled picker"
          value={endDate}
          onChange={(newValue) => setEndDate(newValue)}
        />
      </div>


      
    </LocalizationProvider>
  )
}

export default DateRangePicker