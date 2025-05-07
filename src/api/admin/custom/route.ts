import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { getOrdersListWorkflow } from "@medusajs/medusa/core-flows";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["*", "total", "created_at", "summary.*",],
    filters: {

    }
  });
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Calculate week boundaries (Monday as first day of week)
  // If you want Sunday as first day, set weekStart = 0
  const weekStart = 0; // 0 = Sunday, 1 = Monday
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - ((today.getDay() + 7 - weekStart) % 7));
  thisWeekStart.setHours(0, 0, 0, 0);
  const prevWeekStart = new Date(thisWeekStart);
  prevWeekStart.setDate(thisWeekStart.getDate() - 7);
  const prevWeekEnd = new Date(thisWeekStart);
  prevWeekEnd.setMilliseconds(-1); // End of last week

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Helper to format date to ISO string (for DB)
  const toISO = (d: Date) => d.toISOString();

  // Example for this week
  const { data: thisWeekOrders } = await query.graph({
    entity: "order",
    fields: ["*", "total", "created_at", "summary.*"],
    filters: {
      created_at: {
        $gte: toISO(thisWeekStart),
        $lte: toISO(now),
      },
    },
  });

  // Example for last week
  const { data: lastWeekOrders } = await query.graph({
    entity: "order",
    fields: ["*", "total", "created_at", "summary.*"],
    filters: {
      created_at: {
        $gte: toISO(prevWeekStart),
        $lte: toISO(prevWeekEnd),
      },
    },
  });

  // Example for today
  const { data: todayOrders } = await query.graph({
    entity: "order",
    fields: ["*", "total", "created_at", "summary.*"],
    filters: {
      created_at: {
        $gte: toISO(today),
        $lte: toISO(now),
      },
    },
  });

  // Example for yesterday
  const { data: yesterdayOrders } = await query.graph({
    entity: "order",
    fields: ["*", "total", "created_at", "summary.*"],
    filters: {
      created_at: {
        $gte: toISO(yesterday),
        $lte: toISO(today),
      },
    },
  });

  // Example for this month
  const { data: thisMonthOrders } = await query.graph({
    entity: "order",
    fields: ["*", "total", "created_at", "summary.*"],
    filters: {
      created_at: {
        $gte: toISO(monthStart),
        $lte: toISO(now)
      },
    },
  });

  // Helper to calculate percentage change
  function getPercentage(current: number, previous: number): number | null {
    if (previous === 0) return null;
    return +(((current - previous) / previous) * 100).toFixed(2);
  }

  const thisWeekOrdersCount = thisWeekOrders.length;
  const lastWeekOrdersCount = lastWeekOrders.length;
  const todayOrdersCount = todayOrders.length;
  const yesterdayOrdersCount = yesterdayOrders.length;

  const thisWeekRevenue = thisWeekOrders.reduce((sum, order) => sum + (order.summary?.current_order_total || 0), 0);
  const lastWeekRevenue = lastWeekOrders.reduce((sum, order) => sum + (order.summary?.current_order_total || 0), 0);

  const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => sum + (order.summary?.current_order_total || 0), 0);

  res.json({
    thisWeekCount: {
      thisWeekOrdersCount: thisWeekOrdersCount,
      lastWeekOrdersCount: lastWeekOrdersCount,
      percentage: getPercentage(thisWeekOrdersCount, lastWeekOrdersCount)
    },
    todayCount: {
      todayOrdersCount: todayOrdersCount,
      yesterdayOrdersCount: yesterdayOrdersCount,
      percentage: getPercentage(todayOrdersCount, yesterdayOrdersCount)
    },
    thisWeekRevenue: {
      thisWeekRevenue: thisWeekRevenue,
      lastWeekRevenue: lastWeekRevenue,
      percentage: getPercentage(thisWeekRevenue, lastWeekRevenue)
    },
    thisMonthRevenue: {
      amount: thisMonthRevenue
    }
  });
}
