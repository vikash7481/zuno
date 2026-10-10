import { reportService } from '../services/reportService.js';

export const getOverview = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const overview = await reportService.getFinancialOverview({ startDate, endDate });
    res.json({ success: true, overview });
  } catch (error) {
    next(error);
  }
};

export const exportOrdersCSV = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const csvData = await reportService.exportOrdersCSV({ startDate, endDate });

    res.header('Content-Type', 'text/csv');
    res.attachment(`zuno_orders_report_${new Date().toISOString().slice(0, 10)}.csv`);
    return res.send(csvData);
  } catch (error) {
    next(error);
  }
};
