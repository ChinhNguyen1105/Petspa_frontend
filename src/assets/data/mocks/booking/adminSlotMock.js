export const adminSlotMock = {
  success: true,
  message: "Get admin slot view successfully",

  data: [
    {
      bookingDate: "2026-06-02",
      startTime: "08:00:00",
      endTime: "08:30:00",

      totalStaff: 5,
      busyStaffCount: 1,
      availableStaffCount: 4,

      status: "PARTIALLY_BOOKED",

      bookings: [
        {
          bookingId: 101,
          staffId: 1,
          staffName: "Nguyễn Văn A",
          customerName: "Trần Thị B",
          serviceName: "Tắm chó",
          startTime: "08:00:00",
          endTime: "08:30:00",
        },
      ],
    },

    {
      bookingDate: "2026-06-02",
      startTime: "08:30:00",
      endTime: "09:00:00",

      totalStaff: 5,
      busyStaffCount: 0,
      availableStaffCount: 5,

      status: "FREE",

      bookings: [],
    },

    {
      bookingDate: "2026-06-02",
      startTime: "09:00:00",
      endTime: "09:30:00",

      totalStaff: 5,
      busyStaffCount: 5,
      availableStaffCount: 0,

      status: "FULL",

      bookings: [
        {
          bookingId: 102,
          staffId: 1,
          staffName: "Nguyễn Văn A",
          customerName: "Lê Văn C",
          serviceName: "Cắt tỉa lông",
          startTime: "09:00:00",
          endTime: "09:30:00",
        },
        {
          bookingId: 103,
          staffId: 2,
          staffName: "Trần Minh B",
          customerName: "Phạm Thị D",
          serviceName: "Tắm chó",
          startTime: "09:00:00",
          endTime: "09:30:00",
        },
        {
          bookingId: 104,
          staffId: 3,
          staffName: "Hoàng Văn E",
          customerName: "Nguyễn Văn F",
          serviceName: "Cắt móng",
          startTime: "09:00:00",
          endTime: "09:30:00",
        },
        {
          bookingId: 105,
          staffId: 4,
          staffName: "Phạm Văn G",
          customerName: "Trần Văn H",
          serviceName: "Gội đầu",
          startTime: "09:00:00",
          endTime: "09:30:00",
        },
        {
          bookingId: 106,
          staffId: 5,
          staffName: "Lê Thị I",
          customerName: "Nguyễn Thị K",
          serviceName: "Spa thú cưng",
          startTime: "09:00:00",
          endTime: "09:30:00",
        },
      ],
    },

    {
      bookingDate: "2026-06-02",
      startTime: "09:30:00",
      endTime: "10:00:00",

      totalStaff: 5,
      busyStaffCount: 2,
      availableStaffCount: 3,

      status: "PARTIALLY_BOOKED",

      bookings: [
        {
          bookingId: 107,
          staffId: 1,
          staffName: "Nguyễn Văn A",
          customerName: "Trần Thị L",
          serviceName: "Tắm chó",
          startTime: "09:30:00",
          endTime: "10:00:00",
        },
        {
          bookingId: 108,
          staffId: 2,
          staffName: "Trần Minh B",
          customerName: "Phạm Thị M",
          serviceName: "Cắt lông",
          startTime: "09:30:00",
          endTime: "10:00:00",
        },
      ],
    },

    {
      bookingDate: "2026-06-02",
      startTime: "10:00:00",
      endTime: "10:30:00",

      totalStaff: 5,
      busyStaffCount: 3,
      availableStaffCount: 2,

      status: "PARTIALLY_BOOKED",

      bookings: [
        {
          bookingId: 109,
          staffId: 3,
          staffName: "Hoàng Văn E",
          customerName: "Nguyễn Văn N",
          serviceName: "Tắm chó",
          startTime: "10:00:00",
          endTime: "10:30:00",
        },
        {
          bookingId: 110,
          staffId: 4,
          staffName: "Phạm Văn G",
          customerName: "Trần Văn O",
          serviceName: "Cắt móng",
          startTime: "10:00:00",
          endTime: "10:30:00",
        },
        {
          bookingId: 111,
          staffId: 5,
          staffName: "Lê Thị I",
          customerName: "Nguyễn Thị P",
          serviceName: "Spa thú cưng",
          startTime: "10:00:00",
          endTime: "10:30:00",
        },
      ],
    },

    {
      bookingDate: "2026-06-02",
      startTime: "10:30:00",
      endTime: "11:00:00",

      totalStaff: 5,
      busyStaffCount: 0,
      availableStaffCount: 5,

      status: "FREE",

      bookings: [],
    },

    {
      bookingDate: "2026-06-02",
      startTime: "11:00:00",
      endTime: "11:30:00",

      totalStaff: 5,
      busyStaffCount: 1,
      availableStaffCount: 4,

      status: "PARTIALLY_BOOKED",

      bookings: [
        {
          bookingId: 112,
          staffId: 2,
          staffName: "Trần Minh B",
          customerName: "Trần Thị Q",
          serviceName: "Tắm chó",
          startTime: "11:00:00",
          endTime: "11:30:00",
        },
      ],
    },

    {
      bookingDate: "2026-06-02",
      startTime: "11:30:00",
      endTime: "12:00:00",

      totalStaff: 5,
      busyStaffCount: 2,
      availableStaffCount: 3,

      status: "PARTIALLY_BOOKED",

      bookings: [
        {
          bookingId: 113,
          staffId: 1,
          staffName: "Nguyễn Văn A",
          customerName: "Phạm Thị R",
          serviceName: "Cắt móng",
          startTime: "11:30:00",
          endTime: "12:00:00",
        },
        {
          bookingId: 114,
          staffId: 3,
          staffName: "Hoàng Văn E",
          customerName: "Lê Văn S",
          serviceName: "Tắm chó",
          startTime: "11:30:00",
          endTime: "12:00:00",
        },
      ],
    },
  ],
};