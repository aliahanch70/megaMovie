interface ViewData {
  productId: string;
  productName: string;
  viewedAt: string;
  ipAddress: string;
}

export const getViewsByIpAddress = (views: ViewData[], ipAddress: string) => {
  // Get unique product IDs viewed by this IP
  const uniqueProductViews = new Set(
    views
      .filter(view => view.ipAddress === ipAddress)
      .map(view => view.productId)
  );
  
  return uniqueProductViews.size;
};

export const getViewsTimeline = (views: ViewData[], ipAddress: string) => {
  // Group views by date and count unique products per date
  const timelineMap = views
    .filter(view => view.ipAddress === ipAddress)
    .reduce((acc, view) => {
      const date = new Date(view.viewedAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = new Set();
      }
      acc[date].add(view.productId);
      return acc;
    }, {} as Record<string, Set<string>>);

  // Convert Sets to counts
  const timeline = Object.entries(timelineMap).reduce((acc, [date, productIds]) => {
    acc[date] = productIds.size;
    return acc;
  }, {} as Record<string, number>);

  return {
    labels: Object.keys(timeline),
    data: Object.values(timeline),
  };
};

export const getTotalUniqueVisitors = (views: ViewData[]) => {
  const uniqueIPs = new Set(views.map(view => view.ipAddress));
  return uniqueIPs.size;
};

export const getUniqueVisitorsTimeline = (views: ViewData[]) => {
  const timelineMap = views.reduce((acc, view) => {
    const date = new Date(view.viewedAt).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = new Set();
    }
    acc[date].add(view.ipAddress);
    return acc;
  }, {} as Record<string, Set<string>>);

  const timeline = Object.entries(timelineMap).reduce((acc, [date, ips]) => {
    acc[date] = ips.size;
    return acc;
  }, {} as Record<string, number>);

  return {
    labels: Object.keys(timeline),
    data: Object.values(timeline),
  };
};
