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
  yesterday.setDate(yesterday.getDate() - 1);

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

  // Helper to calculate percentage change
  function getPercentage(current: number, previous: number): number | null {
    if (previous === 0) return null;
    return +(((current - previous) / previous) * 100).toFixed(2);
  }

  // Orders and revenue for this week and last week
  const thisWeekOrdersArr = orders.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate >= thisWeekStart && orderDate <= now;
  });
  const lastWeekOrdersArr = orders.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate >= prevWeekStart && orderDate <= prevWeekEnd;
  });
  const todayOrdersArr = orders.filter(order => new Date(order.created_at) >= today && new Date(order.created_at) <= now);
  const yesterdayOrdersArr = orders.filter(order => new Date(order.created_at) >= yesterday && new Date(order.created_at) < today);

  const thisWeekOrders = thisWeekOrdersArr.length;
  const lastWeekOrders = lastWeekOrdersArr.length;
  const todayOrders = todayOrdersArr.length;
  const yesterdayOrders = yesterdayOrdersArr.length;

  const thisWeekRevenue = thisWeekOrdersArr.reduce((sum, order) => sum + (order.summary?.current_order_total || 0), 0);
  const lastWeekRevenue = lastWeekOrdersArr.reduce((sum, order) => sum + (order.summary?.current_order_total || 0), 0);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthRevenue = orders
    .filter(order => new Date(order.created_at) >= monthStart && new Date(order.created_at) <= now)
    .reduce((sum, order) => sum + (order.summary?.current_order_total || 0), 0);

  res.json({
    thisWeekCount: {
      thisWeekOrdersCount: thisWeekOrders,
      lastWeekOrdersCount: lastWeekOrders,
      percentage: getPercentage(thisWeekOrders, lastWeekOrders)
    },
    todayCount: {
      todayOrdersCount: todayOrders,
      yesterdayOrdersCount: yesterdayOrders,
      percentage: getPercentage(todayOrders, yesterdayOrders)
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
