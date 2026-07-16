import * as React from 'react';
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const DateRangePicker = () => {
  const {value1, setValue1} = useAppContext(dayjs('2022-04-17'));
  const {value2, setValue2} = useAppContext(dayjs('2022-04-17'));

  

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      
      <div className="flex flex-col gap-5 pt-2">
        <DatePicker
          label="Controlled picker"
          value={value1}
          onChange={(newValue) => setValue1(newValue)}
        />

        <DatePicker
          label="Controlled picker"
          value={value2}
          onChange={(newValue) => setValue2(newValue)}
        />
      </div>


      
    </LocalizationProvider>
  )
}

export default DateRangePicker