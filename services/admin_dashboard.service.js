import Booking from "../models/Booking.js";
import Category from "../models/Category.js";
import Event from "../models/Event.js";

export const getTotalRevenueService = async () => {
  const bookings = await Booking.aggregate([
    {
      $lookup: {
        from: "events",
        let: { id: "$event", ticketType: "$ticketType" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$id"],
              },
            },
          },
          { $unwind: "$ticketTypes" },
          {
            $match: {
              $expr: {
                $eq: ["$ticketTypes.type", "$$ticketType"],
              },
            },
          },
          {
            $project: {
              _id: 0,
              price: "$ticketTypes.price",
              date: 1,
            },
          },
        ],
        as: "events",
      },
    },
    { $unwind: "$events" },
    {
      $addFields: {
        totalAmount: {
          $multiply: ["$events.price", "$quantity"],
        },
        isActive: { $gt: ["$events.date", new Date()] },
      },
    },
    {
      $facet: {
        total: [
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$totalAmount" },
              totalTicketSold: { $sum: "$quantity" },
            },
          },
        ],

        activeEvents: [
          {
            $match: { isActive: true },
          },
          {
            $group: {
              _id: "$event",
            },
          },
          {
            $count: "count",
          },
        ],
      },
    },
    {
      $project: {
        total: { $arrayElemAt: ["$total", 0] },
        activeEvents: { $arrayElemAt: ["$activeEvents", 0] },
      },
    },
  ]);

  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMOnth = new Date(now.getFullYear(), now.getMonth(), 1);

  const currentMonth = await Booking.aggregate([
    {
      $match: {
        $and: [
          { createdAt: { $gt: startOfCurrentMonth } },
          { createdAt: { $lt: endOfCurrentMonth } },
        ],
        paymentStatus: "success",
        bookingStatus: "success",
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalAmount" },
        totalTicketSold: { $sum: "$quantity" },
      },
    },
  ]);

  const lastMonth = await Booking.aggregate([
    {
      $match: {
        $and: [
          { createdAt: { $gt: startOfLastMonth } },
          { createdAt: { $lt: endOfLastMOnth } },
        ],
        paymentStatus: "success",
        bookingStatus: "success",
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalAmount" },
        totalTicketSold: { $sum: "$quantity" },
      },
    },
  ]);

  const currentMonthEvents = await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfCurrentMonth, $lt: endOfCurrentMonth },
        paymentStatus: "success",
        bookingStatus: "success",
      },
    },
    {
      $group: {
        _id: "$event",
      },
    },
    {
      $count: "count",
    },
  ]);

  const lastMonthEvents = await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfLastMonth, $lt: endOfLastMOnth },
        paymentStatus: "success",
        bookingStatus: "success",
      },
    },
    {
      $group: {
        _id: "$event",
      },
    },
    {
      $count: "count",
    },
  ]);

  const currentMonthRevenue = currentMonth?.[0]?.totalRevenue || 0;
  const lastMonthRevenue = lastMonth?.[0]?.totalRevenue || 0;
  const currentMonthTicketSold = currentMonth?.[0]?.totalTicketSold || 0;
  const lastMonthTicketSold = lastMonth?.[0]?.totalTicketSold || 0;
  const currentActiveMonthGrowth = currentMonthEvents?.[0]?.count || 0;
  const lastActiveMonthGrowth = lastMonthEvents?.[0]?.count || 0;

  const revenueGrowth = calculateGrowth(currentMonthRevenue, lastMonthRevenue);
  const ticketSoldGrowth = calculateGrowth(
    currentMonthTicketSold,
    lastMonthTicketSold,
  );
  const ticketEventGrowth = calculateGrowth(
    currentActiveMonthGrowth,
    lastActiveMonthGrowth,
  );

  return { bookings, revenueGrowth, ticketSoldGrowth, ticketEventGrowth };
};

export const getMetricsDataService = async ({ startOfWeek, endOfWeek }) => {
  const result = await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfWeek, $lte: endOfWeek },
        paymentStatus: "success",
        bookingStatus: "success",
      },
    },
    {
      $group: {
        _id: null,
        totalTickets: { $sum: "$quantity" },
        vipTickets: {
          $sum: {
            $cond: [{ $eq: ["$ticketType", "VIP"] }, "$quantity", 0],
          },
        },
        silverTickets: {
          $sum: {
            $cond: [{ $eq: ["$ticketType", "Silver"] }, "$quantity", 0],
          },
        },
        goldTickets: {
          $sum: {
            $cond: [{ $eq: ["$ticketType", "Gold"] }, "$quantity", 0],
          },
        },
      },
    },
  ]);

  const data = result[0] || {};

  const totalTicket = data.totalTickets || 0;
  const totalVipTicket = data.vipTickets || 0;
  const totalSilverTicket = data.silverTickets || 0;
  const totalGoldTicket = data.goldTickets || 0;
  const totalVipSalesByWeek =
    totalTicket > 0 ? (totalVipTicket / totalTicket) * 100 : 0;
  const totalSilverSalesByWeek =
    totalTicket > 0 ? (totalSilverTicket / totalTicket) * 100 : 0;
  const totalGoldSalesByWeek =
    totalTicket > 0 ? (totalGoldTicket / totalTicket) * 100 : 0;

  const eventCategoriesCount = await Category.aggregate([
    {
      $lookup: {
        from: "events",
        let: { categoryId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$category", "$$categoryId"],
              },
            },
          },
          {
            $count: "total",
          },
        ],
        as: "events",
      },
    },
    {
      $project: {
        name: 1,
        totalEvents: {
          $ifNull: [{ $arrayElemAt: ["$events.total", 0] }, 0],
        },
      },
    },
  ]);

  return {
    totalVipSalesByWeek,
    totalSilverSalesByWeek,
    totalGoldSalesByWeek,
    eventCategoriesCount,
  };
};

export const getUpcomingEventsService = async () => {
  const now = new Date();

  const eventsWithStatus = await Event.aggregate([
    {
      $addFields: {
        isSoldOut: {
          $allElementsTrue: {
            $map: {
              input: "$ticketTypes",
              as: "ticket",
              in: {
                $eq: ["$$ticket.availableSeats", 0],
              },
            },
          },
        },
      },
    },
    {
      $addFields: {
        status: {
          $switch: {
            branches: [
              {
                case: "$isSoldOut",
                then: "Sold Out",
              },
              {
                case: {
                  $gt: ["$date", now],
                },
                then: "Upcoming",
              },
            ],
            default: "Completed",
          },
        },
      },
    },
    {
      $addFields: {
        totalTickets: {
          $sum: "$ticketTypes.totalSeats",
        },
      },
    },
    {
      $addFields: {
        availableTickets: {
          $sum: "$ticketTypes.availableSeats",
        },
      },
    },
    {
      $addFields: {
        totalSoldTickets: {
          $subtract: ["$totalTickets", "$availableTickets"],
        },
      },
    },
    {
      $addFields: {
        totalRevenue: {
          $sum: {
            $map: {
              input: "$ticketTypes",
              as: "ticket",
              in: {
                $multiply: [
                  {
                    $subtract: [
                      "$$ticket.totalSeats",
                      "$$ticket.availableSeats",
                    ],
                  },
                  "$$ticket.price",
                ],
              },
            },
          },
        },
      },
    },
    {
      $project: {
        title: 1,
        date: 1,
        status: 1,
        totalTickets: 1,
        availableTickets: 1,
        totalSoldTickets: 1,
        totalRevenue: 1,
      },
    },
  ]);

  return eventsWithStatus;
};

function calculateGrowth(current, last) {
  let growth = 0;
  let type = "no-change";

  if (last === 0) {
    if (current > 0) {
      growth = 100;
      type = "increase";
    } else {
      growth = 0;
    }
  } else {
    growth = ((current - last) / last) * 100;

    if (growth > 0) type = "increase";
    else if (growth < 0) type = "decrease";
  }

  return {
    growth: growth,
    type,
  };
}
