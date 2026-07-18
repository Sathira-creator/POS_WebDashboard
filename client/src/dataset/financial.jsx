export const dateAxisFormatter = (value, context) =>
  value.toLocaleDateString(undefined, {
    month:
      // eslint-disable-next-line no-nested-ternary
      context.location === 'tick'
        ? undefined
        : context.location === 'tooltip'
          ? 'long'
          : 'short',
    day: 'numeric',
  });

export const amountFormatter = (value) =>
  value === null
    ? ''
    : new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        // 'minimumFractionDigits: 2' ensures you always see '.00'
        minimumFractionDigits: 2, 
      })
      .format(value)
      .replace('LKR', '$'); // Swaps the formal 'LKR' code for the 'Rs.' symbol

export const salesData = [
  { date: new Date('2026-05-01'), amount: 145000 },
  { date: new Date('2026-05-02'), amount: 132000 },
  { date: new Date('2026-05-03'), amount: 158000 },
  { date: new Date('2026-05-04'), amount: 120000 },
  { date: new Date('2026-05-05'), amount: 165000 },
  { date: new Date('2026-05-06'), amount: 140000 },
  { date: new Date('2026-05-07'), amount: 155000 },
  { date: new Date('2026-05-08'), amount: 170000 },
  { date: new Date('2026-05-09'), amount: 148000 },
  { date: new Date('2026-05-10'), amount: 135000 },
  { date: new Date('2026-05-11'), amount: 190000 },
  { date: new Date('2026-05-12'), amount: 145250 }, // Matches the value in your image tooltip
  { date: new Date('2026-05-13'), amount: 160000 },
  { date: new Date('2026-05-14'), amount: 125000 },
  { date: new Date('2026-05-15'), amount: 110000 },
  { date: new Date('2026-05-16'), amount: 130000 },
  { date: new Date('2026-05-17'), amount: 145000 },
  { date: new Date('2026-05-18'), amount: 155000 },
  { date: new Date('2026-05-19'), amount: 168000 },
  { date: new Date('2026-05-20'), amount: 175000 },
];

export const ordersData = [
  { date: new Date('2026-05-01'), amount: 42 },
  { date: new Date('2026-05-02'), amount: 38 },
  { date: new Date('2026-05-03'), amount: 45 },
  { date: new Date('2026-05-04'), amount: 30 },
  { date: new Date('2026-05-05'), amount: 52 },
  { date: new Date('2026-05-06'), amount: 40 },
  { date: new Date('2026-05-07'), amount: 48 },
  { date: new Date('2026-05-08'), amount: 55 },
  { date: new Date('2026-05-09'), amount: 33 },
  { date: new Date('2026-05-10'), amount: 28 },
  { date: new Date('2026-05-11'), amount: 60 },
  { date: new Date('2026-05-12'), amount: 44 },
  { date: new Date('2026-05-13'), amount: 41 },
  { date: new Date('2026-05-14'), amount: 35 },
  { date: new Date('2026-05-15'), amount: 39 },
  { date: new Date('2026-05-16'), amount: 47 },
  { date: new Date('2026-05-17'), amount: 50 },
  { date: new Date('2026-05-18'), amount: 42 },
  { date: new Date('2026-05-19'), amount: 46 },
  { date: new Date('2026-05-20'), amount: 58 },
];

export const aovData = [
  { date: new Date('2026-05-01'), amount: 920.50 },
  { date: new Date('2026-05-02'), amount: 880.00 },
  { date: new Date('2026-05-03'), amount: 945.25 },
  { date: new Date('2026-05-04'), amount: 907.00 }, // Matching your UI value
  { date: new Date('2026-05-05'), amount: 890.10 },
  { date: new Date('2026-05-06'), amount: 915.00 },
  { date: new Date('2026-05-07'), amount: 930.40 },
  { date: new Date('2026-05-08'), amount: 960.00 },
  { date: new Date('2026-05-09'), amount: 875.50 },
  { date: new Date('2026-05-10'), amount: 850.00 },
  { date: new Date('2026-05-11'), amount: 980.20 },
  { date: new Date('2026-05-12'), amount: 905.75 },
  { date: new Date('2026-05-13'), amount: 922.00 },
  { date: new Date('2026-05-14'), amount: 895.30 },
  { date: new Date('2026-05-15'), amount: 910.00 },
  { date: new Date('2026-05-16'), amount: 935.60 },
  { date: new Date('2026-05-17'), amount: 940.00 },
  { date: new Date('2026-05-18'), amount: 900.50 },
  { date: new Date('2026-05-19'), amount: 918.40 },
  { date: new Date('2026-05-20'), amount: 955.00 },
];