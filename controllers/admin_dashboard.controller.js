import {
  getMetricsDataService,
  getTotalRevenueService,
  getUpcomingEventsService,
} from "../services/admin_dashboard.service.js";

export const getTotalRevenue = async (req, res, next) => {
  try {
    const { bookings, revenueGrowth, ticketSoldGrowth, ticketEventGrowth } =
      await getTotalRevenueService();
    res.status(200).json({
      message: "success",
      totalRevenue: bookings?.[0]?.total?.totalRevenue,
      revenue: revenueGrowth,
      ticketSoldGrowth,
      ticketEventGrowth,
      totalTicketSold: bookings?.[0]?.total?.totalTicketSold,
      activeEvents: bookings?.[0]?.activeEvents?.count,
    });
  } catch (error) {
    next(error);
  }
};

export const getMetricsData = async (req, res, next) => {
  try {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date();

    const {
      totalVipSalesByWeek,
      totalSilverSalesByWeek,
      totalGoldSalesByWeek,
      eventCategoriesCount,
    } = await getMetricsDataService({ startOfWeek, endOfWeek });

    res.status(200).json({
      success: true,
      totalVipSalesByWeek,
      totalSilverSalesByWeek,
      totalGoldSalesByWeek,
      eventCategoriesCount,
    });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingEvents = async (req, res, next) => {
  try {
    const eventsWithStatus = await getUpcomingEventsService();

    res.status(200).json({ message: "success", data: eventsWithStatus });
  } catch (error) {
    next(error);
  }
};
